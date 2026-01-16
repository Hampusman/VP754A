import threading
import time
from src.core.instrument import Instrument


class Arduino(Instrument):
    def __init__(self, ip: str, port: int, buffer_size: int, timeout: float, sampling_frequency: float,
                 calibration: dict[str, float | None]):
        super().__init__(ip, port, buffer_size, timeout)
        self._sampling_frequency = sampling_frequency
        self._latest_value = {}
        if (calibration['k'] or calibration['m']) is None:
            self._k = ''
            self._m = ''
        else:
            self._k = calibration['k']
            self._m = calibration['m']
        self._stop = threading.Event()
        self._worker = threading.Thread(target=self._update_values, daemon=True)
        self._worker.start()

    def _subscribe(self) -> None:
        self._send_command('subscribe')

    def _unsubscribe(self) -> None:
        self._send_command('unsubscribe')

    def _read_line(self) -> str:
        line = []
        while True:
            message = self._socket.recv(1)
            if message == b'\n':
                return ''.join(line)
            else:
                line.append(message.decode('utf-8'))

    def _update_values(self) -> None:
        self._subscribe()
        while not self._stop.is_set():
            try:
                value = self._read_line()
                value = value.split(',')
                voltage_channel1 = int(value[0]) / 1023 * 3.3
                voltage_channel2 = int(value[1]) / 1023 * 3.3
                current_channel1 = ''
                current_channel2 = ''
                if (self._k and self._m) != '':
                    current_channel1 = (voltage_channel1 - self._m) / self._k
                    current_channel2 = (voltage_channel2 - self._m) / self._k
                value = {'channels':
                             {'channel1': {'voltage': voltage_channel1,
                                           'current': current_channel1},
                              'channel2': {'voltage': voltage_channel2,
                                           'current': current_channel2}, },
                         'calibration': {'k': self._k, 'm': self._m}}
                self._latest_value = value
            except Exception as e:
                print('Error: ', e)
                continue
            time.sleep(1 / self._sampling_frequency)
        self._unsubscribe()

    @property
    def read(self) -> dict[str, dict[str, float]]:
        return self._latest_value

    @property
    def k(self) -> float | str:
        return self._k

    @k.setter
    def k(self, k: float) -> None:
        self._k = k

    @property
    def m(self) -> float | str:
        return self._m

    @m.setter
    def m(self, m: float) -> None:
        self._m = m

    def shutdown(self) -> None:
        self._stop.set()
        self._worker.join(timeout=self._timeout)
        self._socket.close()
