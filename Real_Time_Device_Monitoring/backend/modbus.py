from pymodbus.client.tcp import ModbusTcpClient
import logging

logger = logging.getLogger(__name__)

class ModbusClient:
    def __init__(self, host, port=502):
        self.host = host
        self.port = port
        self.client = None
        
    def connect(self):
        """Connect to the Modbus server"""
        try:
            self.client = ModbusTcpClient(self.host, port=self.port)
            return self.client.connect()
        except Exception as e:
            logger.error(f"Error connecting to Modbus server: {e}")
            return False
            
    def disconnect(self):
        """Disconnect from the Modbus server"""
        if self.client:
            self.client.close()
            
    def read_register(self, address):
        """Read a holding register value
        
        Args:
            address: Modbus register address (e.g., 40021)
            
        Returns:
            The register value or None if an error occurs
        """
        try:
            if not self.client or not self.client.is_socket_open():
                if not self.connect():
                    return None
                    
            # Convert from Modbus address (e.g., 40021) to 0-based address
            register = address - 40001
            result = self.client.read_holding_registers(address=register, count=1)
            
            if hasattr(result, 'registers'):
                return result.registers[0]
            else:
                logger.error(f"Error reading register {address}: {result}")
                return None
        except Exception as e:
            logger.error(f"Error reading register {address}: {e}")
            return None
            
    def write_register(self, address, value):
        """Write a value to a holding register
        
        Args:
            address: Modbus register address (e.g., 40061)
            value: Value to write to the register
            
        Returns:
            True if successful, False otherwise
        """
        try:
            if not self.client or not self.client.is_socket_open():
                if not self.connect():
                    return False
                    
            # Convert from Modbus address (e.g., 40061) to 0-based address
            register = address - 40001
            result = self.client.write_register(address=register, value=value)
            
            if hasattr(result, 'function_code'):
                return True
            else:
                logger.error(f"Error writing to register {address}: {result}")
                return False
        except Exception as e:
            logger.error(f"Error writing to register {address}: {e}")
            return False
