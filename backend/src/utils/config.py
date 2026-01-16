import yaml
from pathlib import Path
from dataclasses import dataclass


@dataclass
class APIConfig:
    sample_frequency: float
    measurement_path: str
    calibration_path: str
    calibration_current_start: int
    calibration_current_step: int
    calibration_current_max: int
    samples: int

    @classmethod
    def from_yaml(cls, path: str | Path) -> 'APIConfig':
        data = yaml.safe_load(open(path))
        try:
            return cls(
                sample_frequency=data['api']['sample_frequency'],
                measurement_path=data['api']['measurement_path'],
                calibration_path=data['api']['calibration_path'],
                calibration_current_start=data['api']['calibration']['current_start'],
                calibration_current_step=data['api']['calibration']['current_step'],
                calibration_current_max=data['api']['calibration']['current_max'],
                samples=data['api']['calibration']['samples']
            )
        except KeyError as e:
            raise ValueError(f'Missing expected key: {e}')


@dataclass
class PowerSupplyConfig:
    ip: list[str]
    port: int
    buffer_size: int
    timeout: float
    max_voltage: float
    max_current: float
    max_power: float

    @classmethod
    def from_yaml(cls, path: str | Path) -> 'PowerSupplyConfig':
        data = yaml.safe_load(open(path))
        try:
            return cls(
                ip=data['power_supply']['ip'],
                port=data['power_supply']['port'],
                buffer_size=data['power_supply']['buffer_size'],
                timeout=data['power_supply']['timeout'],
                max_voltage=data['power_supply']['limits']['max_voltage'],
                max_current=data['power_supply']['limits']['max_current'],
                max_power=data['power_supply']['limits']['max_power']
            )
        except KeyError as e:
            raise ValueError(f'Missing expected key: {e}')


@dataclass
class PowerAnalyzerConfig:
    ip: str
    port: int
    buffer_size: int
    timeout: float
    sampling_frequency: float

    @classmethod
    def from_yaml(cls, path: str | Path) -> 'PowerAnalyzerConfig':
        data = yaml.safe_load(open(path))
        try:
            return cls(
                ip=data['power_analyzer']['ip'],
                port=data['power_analyzer']['port'],
                buffer_size=data['power_analyzer']['buffer_size'],
                timeout=data['power_analyzer']['timeout'],
                sampling_frequency=data['power_analyzer']['sampling_frequency']
            )
        except KeyError as e:
            raise ValueError(f'Missing expected key: {e}')


@dataclass
class OscilloscopeConfig:
    ip: str
    port: int
    buffer_size: int
    timeout: float

    @classmethod
    def from_yaml(cls, path: str | Path) -> 'OscilloscopeConfig':
        data = yaml.safe_load(open(path))
        try:
            return cls(
                ip=data['oscilloscope']['ip'],
                port=data['oscilloscope']['port'],
                buffer_size=data['oscilloscope']['buffer_size'],
                timeout=data['oscilloscope']['timeout']
            )
        except KeyError as e:
            raise ValueError(f'Missing expected key: {e}')


@dataclass
class ArduinoConfig:
    ip: str
    port: int
    buffer_size: int
    timeout: float
    sampling_frequency: float

    @classmethod
    def from_yaml(cls, path: str | Path) -> 'ArduinoConfig':
        data = yaml.safe_load(open(path))
        try:
            return cls(
                ip=data['arduino']['ip'],
                port=data['arduino']['port'],
                buffer_size=data['arduino']['buffer_size'],
                timeout=data['arduino']['timeout'],
                sampling_frequency=data['arduino']['sampling_frequency']
            )
        except KeyError as e:
            raise ValueError(f'Missing expected key: {e}')
