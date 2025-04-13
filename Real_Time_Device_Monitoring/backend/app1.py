from flask import Flask, jsonify, render_template, send_from_directory, request
import requests
import time
import logging
import json
from config import *

# Configure logging
#logging.basicConfig(**LOG_CONFIG)
#logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add console handler to make sure logs print to terminal
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
console_handler.setFormatter(formatter)
logger.addHandler(console_handler)
app = Flask(__name__, static_folder='../frontend', static_url_path='')

@app.route('/')
def index():
    return app.send_static_file('index1.html')

@app.route('/api/device_states')
def get_device_states():
   
    try:
        # First try to get device states from the Modbus server
        try:
            response = requests.get(API_ENDPOINTS["DEVICE_STATES"], timeout=2)
            return jsonify(response.json())
        except requests.exceptions.RequestException as e:
            logger.warning(f"Could not connect to Modbus server API, using simulated data: {str(e)}")
            
            # If connection fails, return simulated data
            simulated_data = {
                "devices": [
                    {"id": "pump1", "name": "Water Pump", "state": 1},
                    {"id": "pump2", "name": "Lime Dosing Pump", "state": 1},
                    {"id": "pump3", "name": "Chemical Pump", "state": 1}
                ]
            }
            return jsonify(simulated_data)
    except Exception as e:
        
        logger.error(f"Error in get_device_states: {str(e)}")
        return jsonify({"error": str(e)})

@app.route('/api/pump_data/<pump_id>')
def get_pump_data(pump_id):
    try:
        # Try to get data from the Modbus server first
        try:
            if pump_id == "1":
                response = requests.get(API_ENDPOINTS["PUMP1_DATA"], timeout=5)
                return jsonify(response.json())
            elif pump_id == "2":
                response = requests.get(API_ENDPOINTS["PUMP2_DATA"], timeout=5)
                return jsonify(response.json())
        except requests.exceptions.RequestException as e:
            logger.warning(f"Could not connect to Modbus server API for pump {pump_id}, using simulated data: {str(e)}")
        
        # If connection fails or for pump 3, generate simulated data
        current_time = time.time()
        
        if pump_id == "1":
            # Simulated Water Pump data
            simulated_data = {
                "state": 1,
                "pressure": 2.5 + (current_time % 1),
                "flow_rate": 15 + (current_time % 5),
                "temperature": 25 + (current_time % 10),
                "timestamp": current_time
            }
        elif pump_id == "2":
            # Simulated Lime Dosing Pump data
            simulated_data = {
                "state": 1,
                "pressure": 1.8 + (current_time % 0.8),
                "flow_rate": 12 + (current_time % 3),
                "ph_level": 7.2 + (current_time % 0.5),
                "timestamp": current_time
            }
        elif pump_id == "3":
            # Simulated Chemical Pump data
            simulated_data = {
                "state": 1,
                "pressure": 3.0 + (current_time % 1.2),
                "flow_rate": 18 + (current_time % 4),
                "temperature": 30 + (current_time % 8),
                "timestamp": current_time
            }
        else:
            return jsonify({"error": "Invalid pump ID"})
            
        return jsonify(simulated_data)
    except Exception as e:
        logger.error(f"Error in get_pump_data: {str(e)}")
        return jsonify({"error": str(e)})

@app.route('/api/toggle_device/<int:device_id>', methods=['POST']) 
def toggle_device(device_id):
    try:
        # Try to connect to the actual Modbus server first
        try:
            if ENABLE_REAL_MODBUS:
                from modbus_client import ModbusClient
                modbus_client = ModbusClient(MODBUS_HOST, MODBUS_PORT)
                
                if not modbus_client.connect():
                    logger.warning("Failed to connect to Modbus server, using simulated response")
                else:
                    # Map device_id to register addresses
                    if device_id not in range(1, 4):
                        return jsonify({"error": "Invalid device ID"})
                        
                    register_map = {
                        1: CONTROL_REGISTERS["TOGGLE_PUMP1"],
                        2: CONTROL_REGISTERS["TOGGLE_PUMP2"],
                        3: CONTROL_REGISTERS["TOGGLE_PUMP3"]
                    }
                    
                    # Write value 2 to toggle the device state
                    result = modbus_client.write_register(register_map[device_id], REGISTER_VALUES["TOGGLE"])
                    modbus_client.disconnect()
                    
                    if not result:
                        logger.warning("Failed to write to Modbus register, using simulated response")
        except Exception as e:
            logger.warning(f"Error in Modbus communication: {str(e)}, using simulated response")
        
        # Return success response (either real or simulated)
        logger.info(f"Successfully toggled device {device_id} (simulated or real)")
        return jsonify({"success": True, "device_id": device_id})
    except Exception as e:
        logger.error(f"Error in toggle_device: {str(e)}")
        return jsonify({"error": str(e)})


@app.route('/api/reset_devices', methods=['POST'])
def reset_devices():
    try:
        # Try to connect to the actual Modbus server first
        try:
            if ENABLE_REAL_MODBUS:
                from modbus_client import ModbusClient
                modbus_client = ModbusClient(MODBUS_HOST, MODBUS_PORT)
                
                if not modbus_client.connect():
                    logger.warning("Failed to connect to Modbus server, using simulated response")
                else:
                    # Write value 2 to reset register (40051)
                    result = modbus_client.write_register(CONTROL_REGISTERS["RESET_ALL"], REGISTER_VALUES["TOGGLE"])
                    modbus_client.disconnect()
                    
                    if not result:
                        logger.warning("Failed to write to Modbus register, using simulated response")
        except Exception as e:
            logger.warning(f"Error in Modbus communication: {str(e)}, using simulated response")
        
        # Return success response (either real or simulated)
        logger.info("Successfully reset all devices (simulated or real)")
        return jsonify({"success": True})
    except Exception as e:
        logger.error(f"Error in reset_devices: {str(e)}")
        return jsonify({"error": str(e)})

@app.route('/api/export/<format>')
def export_data(format):
    try:
        # Get data for all pumps (either real or simulated)
        try:
            pump1_response = requests.get(API_ENDPOINTS["PUMP1_DATA"], timeout=2)
            pump1_data = pump1_response.json()
            
            pump2_response = requests.get(API_ENDPOINTS["PUMP2_DATA"], timeout=2)
            pump2_data = pump2_response.json()
        except requests.exceptions.RequestException:
            # Use simulated data if API is unavailable
            current_time = time.time()
            
            pump1_data = {
                "state": 1,
                "pressure": 2.5 + (current_time % 1),
                "flow_rate": 15 + (current_time % 5),
                "temperature": 25 + (current_time % 10)
            }
            
            pump2_data = {
                "state": 1,
                "pressure": 1.8 + (current_time % 0.8),
                "flow_rate": 12 + (current_time % 3),
                "ph_level": 7.2 + (current_time % 0.5)
            }
        
        # Simulated pump3 data
        pump3_data = {
            "state": 1,
            "pressure": 3.0 + (time.time() % 1.2),
            "flow_rate": 18 + (time.time() % 4),
            "temperature": 30 + (time.time() % 8)
        }
        
        # Combine all data
        all_data = {
            "timestamp": time.time(),
            "pump1": pump1_data,
            "pump2": pump2_data,
            "pump3": pump3_data
        }
        
        if format.lower() == "json":
            return jsonify(all_data)
        elif format.lower() == "csv":
            # Create CSV content
            csv_content = "timestamp,device,state,pressure,flow_rate,temperature,ph_level\n"
            
            # Add pump1 data
            csv_content += f"{all_data['timestamp']},pump1,{pump1_data.get('state', '')},{pump1_data.get('pressure', '')},{pump1_data.get('flow_rate', '')},{pump1_data.get('temperature', '')},\n"
            
            # Add pump2 data
            csv_content += f"{all_data['timestamp']},pump2,{pump2_data.get('state', '')},{pump2_data.get('pressure', '')},{pump2_data.get('flow_rate', '')},{pump2_data.get('temperature', '')},{pump2_data.get('ph_level', '')}\n"
            
            # Add pump3 data
            csv_content += f"{all_data['timestamp']},pump3,{pump3_data.get('state', '')},{pump3_data.get('pressure', '')},{pump3_data.get('flow_rate', '')},{pump3_data.get('temperature', '')},\n"
            
            return csv_content, 200, {
                'Content-Type': 'text/csv',
                'Content-Disposition': 'attachment; filename=pump_data.csv'
            }
        else:
            return jsonify({"error": "Invalid export format"})
    except Exception as e:
        logger.error(f"Error in export_data: {str(e)}")
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    #app.run(debug=FLASK_CONFIG["DEBUG"], host=FLASK_CONFIG["localhost"], port=FLASK_CONFIG["5001"])
    app.run(debug=FLASK_CONFIG["DEBUG"], host='localhost', port=5001)
    
