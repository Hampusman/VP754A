from src.core.instrument import Instrument


class PowerSupply(Instrument):
    def __init__(self, ip: str, port: int, buffer_size: int, timeout: float, max_voltage: float, max_current: float,
                 max_power: float):
        super().__init__(ip, port, buffer_size, timeout)
        self._max_voltage = max_voltage
        self._max_current = max_current
        self._max_power = max_power
        self._on = False
        self._send_command('*CLS')
        self._send_command('SYST:REM:CC eth')
        self._send_command('SYST:REM:CV eth')
        self._send_command('SYST:REM:CP eth')
        self._send_command(f'SOUR:VOLT 0')
        self._send_command(f'SOUR:CUR 0')
        self._send_command(f'SOUR:POW {max_power}')

    @property
    def current(self) -> str:
        return self._send_and_receive_command('SOUR:CUR?')

    @current.setter
    def current(self, current: float) -> None:
        if 0 <= current <= self._max_current:
            self._send_command(f'SOUR:CUR {current}')

    @property
    def voltage(self) -> str:
        return self._send_and_receive_command('SOUR:VOLT?')

    @voltage.setter
    def voltage(self, voltage: float) -> None:
        if 0 <= voltage <= self._max_voltage:
            self._send_command(f'SOUR:VOLT {voltage}')

    @property
    def on(self) -> bool:
        return self._on

    def on_off(self) -> bool:
        if self._on:
            self._send_command('OUTP 0')
            self._on = False
        else:
            self._send_command('OUTP 1')
            self._on = True
        return self._on

    def shutdown(self) -> None:
        self._send_command(f'SOUR:VOLT 0')
        self._send_command(f'SOUR:CUR 0')
        self._send_command('SYST:REM:CC front')
        self._send_command('SYST:REM:CV front')
        self._send_command('SYST:REM:CP front')
        self._socket.close()
