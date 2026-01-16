from src.utils.config import PowerSupplyConfig
from src.core.power_supply import PowerSupply
from pathlib import Path


class Application:
    def __init__(self):
        psu_config = PowerSupplyConfig.from_yaml(Path(__file__).parent.parent / 'config/config.yaml')
        self._power_supplies = {}
        for i, ip in enumerate(psu_config.ip, 1):
            psu = PowerSupply(ip, psu_config.port, psu_config.buffer_size,
                              psu_config.timeout, psu_config.max_voltage, psu_config.max_current)
            self._power_supplies[i] = psu
        print(self._power_supplies)

    def run(self) -> None:
        pass
