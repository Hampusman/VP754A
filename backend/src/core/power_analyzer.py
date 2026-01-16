import threading
import time
from src.core.instrument import Instrument


class PowerAnalyzer(Instrument):
    def __init__(self, ip: str, port: int, buffer_size: int, timeout: float, sampling_frequency: float):
        super().__init__(ip, port, buffer_size, timeout)
        self._sampling_frequency = sampling_frequency
        self._latest_values = {}
        self._stop = threading.Event()
        self._worker = threading.Thread(target=self._update_values, args=([1, 2, 3, 4],), daemon=True)
        self._worker.start()

    def _update_values(self, channel: int | list) -> None:
        while not self._stop.is_set():
            if isinstance(channel, int):
                command = f':MEAS? Urms{channel};:MEAS? Irms{channel}'
                values = self._send_and_receive_command(command)
                values = values.split(';')
                values = {f'channel{channel}': {'voltage': float(values[0]), 'current': float(values[1])}}
                self._latest_values = values
            else:
                urms_fields = ",".join(f'Urms{ch}' for ch in channel)
                irms_fields = ",".join(f'Irms{ch}' for ch in channel)
                command = f':MEAS? {urms_fields};:MEAS? {irms_fields}'
                values = self._send_and_receive_command(command)
                parts = [p.strip() for p in values.strip().split(";") if p.strip()]
                urms_list = [x for x in parts[0].split(',') if x]
                irms_list = [x for x in parts[1].split(',') if x]
                channel_values = {}
                for ch, u, i in zip(channel, urms_list, irms_list):
                    channel_values[f'channel{ch}'] = {'voltage': float(u), 'current': float(i)}
                self._latest_values = channel_values
            time.sleep(1 / self._sampling_frequency)

    @property
    def read(self) -> dict[str, dict[str, float]]:
        copied_values = {k: v.copy() for k, v in self._latest_values.items()}
        return copied_values

    def shutdown(self):
        self._stop.set()
        self._worker.join(timeout=self._timeout)
        self._socket.close()
