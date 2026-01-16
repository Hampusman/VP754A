import time
import csv
import datetime
import asyncio
import yaml
from fastapi import FastAPI, APIRouter, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager
from pathlib import Path
from src.core.power_supply import PowerSupply
from src.core.power_analyzer import PowerAnalyzer
from src.core.arduino import Arduino
from src.utils.config import APIConfig, PowerSupplyConfig, PowerAnalyzerConfig, ArduinoConfig
from src.utils.utils import regression


class VoltageRequest(BaseModel):
    setpoint: float


class CurrentRequest(BaseModel):
    setpoint: float


class CalibrationRequest(BaseModel):
    saveFile: bool


class APIServer:
    def __init__(self):
        config_path = Path(__file__).parent.parent / 'config/config.yaml'
        api_config = APIConfig.from_yaml(config_path)
        psu_config = PowerSupplyConfig.from_yaml(config_path)
        pwa_config = PowerAnalyzerConfig.from_yaml(config_path)
        arduino_config = ArduinoConfig.from_yaml(config_path)
        self._calibration_path = Path(__file__).parent.parent / api_config.calibration_path
        with open(self._calibration_path) as stream:
            calibration = yaml.safe_load(stream)
        self._psu_upper = PowerSupply(psu_config.ip[0], psu_config.port, psu_config.buffer_size, psu_config.timeout,
                                      psu_config.max_voltage,
                                      psu_config.max_current, psu_config.max_power)
        self._psu_lower = PowerSupply(psu_config.ip[1], psu_config.port, psu_config.buffer_size, psu_config.timeout,
                                      psu_config.max_voltage,
                                      psu_config.max_current, psu_config.max_power)
        self._pwa = PowerAnalyzer(pwa_config.ip, pwa_config.port, pwa_config.buffer_size, pwa_config.timeout,
                                  pwa_config.sampling_frequency)
        self._arduino = Arduino(arduino_config.ip, arduino_config.port, arduino_config.buffer_size,
                                arduino_config.timeout, arduino_config.sampling_frequency, calibration)
        self._router = APIRouter()
        self._sample_frequency = api_config.sample_frequency
        self._calibration_current_start = api_config.calibration_current_start
        self._calibration_current_step = api_config.calibration_current_step
        self._calibration_current_max = api_config.calibration_current_max
        self._calibration_samples = api_config.samples
        self._measurement_path = api_config.measurement_path if api_config.measurement_path is not None else Path(
            __file__).parent.parent / 'measurements'
        self._latest_snapshot = {'time': 0.0, 'pwa': {}, 'arduino': {}}
        self._clients = set()

        @asynccontextmanager
        async def lifespan(app: FastAPI):
            asyncio.create_task(self._task_snapshot())
            yield
            self._psu_upper.shutdown()
            self._psu_lower.shutdown()
            self._pwa.shutdown()
            self._arduino.shutdown()

        self._app = FastAPI(title='Backend API', lifespan=lifespan)
        self._app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_credentials=True, allow_methods=['*'],
                                 allow_headers=['*'], expose_headers=['*'])
        self._register_routes()
        self._app.include_router(self._router)

    def _register_routes(self):

        @self._router.post('/api/psu/upper/state')
        def upper_get_psu_state():
            return {'is_on': self._psu_upper.on}

        @self._router.post('/api/psu/upper/toggle')
        def upper_toggle_psu():
            new_state = self._psu_upper.on_off()
            return {"is_on": new_state}

        @self._router.get('/api/psu/upper/get/voltage')
        def upper_get_voltage():
            return {'voltage': self._psu_upper.voltage}

        @self._router.post('/api/psu/upper/set/voltage', response_model=VoltageRequest)
        def upper_set_voltage(voltage: VoltageRequest):
            self._psu_upper.voltage = voltage.setpoint
            new_voltage = self._psu_upper.voltage
            return {'setpoint': new_voltage}

        @self._router.get('/api/psu/upper/get/current')
        def upper_get_current():
            return {'current': self._psu_upper.current}

        @self._router.post('/api/psu/upper/set/current', response_model=CurrentRequest)
        def upper_set_current(current: CurrentRequest):
            self._psu_upper.current = current.setpoint
            new_current = self._psu_upper.current
            return {'setpoint': new_current}

        @self._router.post('/api/psu/lower/state')
        def lower_get_psu_state():
            return {'is_on': self._psu_lower.on}

        @self._router.post('/api/psu/lower/toggle')
        def lower_toggle_psu():
            new_state = self._psu_lower.on_off()
            return {"is_on": new_state}

        @self._router.get('/api/psu/lower/get/voltage')
        def lower_get_voltage():
            return {'voltage': self._psu_lower.voltage}

        @self._router.post('/api/psu/lower/set/voltage', response_model=VoltageRequest)
        def lower_set_voltage(voltage: VoltageRequest):
            self._psu_lower.voltage = voltage.setpoint
            new_voltage = self._psu_lower.voltage
            return {'setpoint': new_voltage}

        @self._router.get('/api/psu/lower/get/current')
        def lower_get_current():
            return {'current': self._psu_lower.current}

        @self._router.post('/api/psu/lower/set/current', response_model=CurrentRequest)
        def lower_set_current(current: CurrentRequest):
            self._psu_lower.current = current.setpoint
            new_current = self._psu_lower.current
            return {'setpoint': new_current}

        @self._router.get('/api/data')
        def get_snapshot():
            return self._latest_snapshot

        @self._router.post('/api/calibrate')
        def get_calibration(save_file: CalibrationRequest):
            self._calibrate_sensor(save_file.saveFile)
            return {'done': True}

        @self._router.websocket('/websocket/snapshot')
        async def websocket_snapshot(websocket: WebSocket):
            await websocket.accept()
            try:
                await websocket.receive_text()
            except WebSocketDisconnect:
                pass
            finally:
                self._clients.discard(websocket)

    async def _task_snapshot(self) -> None:
        while True:
            await asyncio.sleep(1 / self._sample_frequency)
            self._latest_snapshot['time'] = time.time()
            self._latest_snapshot['arduino'] = self._arduino.read
            self._latest_snapshot['pwa'] = self._pwa.read
            dead = []
            for websocket in list(self._clients):
                try:
                    await websocket.send_json(
                        {'time': self._latest_snapshot['time'],
                         'pwa': self._latest_snapshot['pwa'],
                         'arduino': self._latest_snapshot['arduino']})
                except Exception:
                    dead.append(websocket)
            for websocket in dead:
                self._clients.discard(websocket)

    def _calibrate_sensor(self, save_file: bool) -> None:
        arduino_measurements = []
        pwa_measurements = []
        currents = [i for i in range(self._calibration_current_start, self._calibration_current_max + 10,
                                     self._calibration_current_step)]
        self._psu_upper.voltage = 1
        self._psu_upper.current = 0
        self._psu_upper.on_off()
        for current in currents:
            arduino_data = []
            pwa_data = []
            self._psu_upper.current = current
            time.sleep(0.5)
            while self._pwa.read['channel1']['current'] > 1000:
                time.sleep(0.5)
            while True:
                if len(arduino_data) >= self._calibration_samples:
                    break
                arduino_read = self._arduino.read['channels']['channel1']['voltage']
                while True:
                    pwa_read = self._pwa.read['channel1']['current']
                    if pwa_read < 1000:
                        break
                arduino_data.append(arduino_read)
                pwa_data.append(pwa_read)
                time.sleep(0.01)
            pwa_measurements.append(pwa_data)
            arduino_measurements.append(arduino_data)
        self._psu_upper.voltage = 0
        self._psu_upper.current = 0
        self._psu_upper.on_off()
        k, m = regression(pwa_measurements, arduino_measurements)
        data = dict(k=float(k), m=float(m))
        with open(self._calibration_path, 'w', encoding='utf-8') as stream:
            yaml.safe_dump(data, stream, sort_keys=False)
        self._arduino.k = k
        self._arduino.m = m
        print('Samples per current:')
        for arduino_measurement in arduino_measurements:
            print(len(arduino_measurement))
        if save_file:
            self._write_to_file(currents, pwa_measurements, arduino_measurements)

    def _write_to_file(self, currents: list, pwa_measurements: list, arduino_measurements: list):
        name = datetime.datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
        path = self._measurement_path / f'measurements_{name}.csv'
        path.parent.mkdir(parents=True, exist_ok=True)
        with path.open('a', newline='', encoding='utf-8') as stream:
            writer = csv.writer(stream)
            writer.writerow(['Currents:', 'Power analyzer current:', 'Arduino voltage:'])
            for i, current in enumerate(currents):
                for pwa_measurement, arduino_measurement in zip(pwa_measurements[i], arduino_measurements[i]):
                    writer.writerow([current, pwa_measurement, arduino_measurement])

    @property
    def app(self):
        return self._app
