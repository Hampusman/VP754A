import socket
from abc import ABC, abstractmethod


class Instrument(ABC):
    def __init__(self, ip: str, port: int, buffer_size: int, timeout: float):
        self._ip = ip
        self._port = port
        self._buffer_size = buffer_size
        self._timeout = timeout
        self._socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self._socket.connect((self._ip, self._port))
        self._socket.settimeout(self._timeout)

    def _send_command(self, command: str) -> None:
        command = command + '\n'
        self._socket.sendall(command.encode('UTF-8'))

    def _send_and_receive_command(self, command: str) -> str:
        command = command + '\n'
        self._socket.sendall(command.encode('UTF-8'))
        return self._socket.recv(self._buffer_size).decode('UTF-8').rstrip()

    def ping(self) -> str:
        return self._send_and_receive_command('*IDN?')

    @abstractmethod
    def shutdown(self): pass
