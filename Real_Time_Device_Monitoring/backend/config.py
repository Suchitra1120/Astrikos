# config.py

# Modbus server configuration
MODBUS_HOST = "172.16.50.79"  # IP address of the Modbus server
MODBUS_PORT = 502  # Default Modbus TCP port

# API configuration
API_BASE_URL = f"http://{MODBUS_HOST}:5001"  # Base URL for REST API endpoints

# Device register addresses
DEVICE_REGISTERS = {
    "PUMP1_STATE": 40021,
    "PUMP2_STATE": 40031,
    "PUMP3_STATE": 40041,
}

# Control register addresses
CONTROL_REGISTERS = {
    "TOGGLE_PUMP1": 40061,
    "TOGGLE_PUMP2": 40071,
    "TOGGLE_PUMP3": 40081,
    "RESET_ALL": 40051,
}

# Register values
REGISTER_VALUES = {
    "NORMAL": 1,
    "ANOMALY": 2,
    "TOGGLE": 2,
}

# API endpoints
API_ENDPOINTS = {
    "PUMP1_DATA": f"{API_BASE_URL}/pump_data",
    "PUMP2_DATA": f"{API_BASE_URL}/pump_normal",
    "DEVICE_STATES": f"{API_BASE_URL}/device_states_all",
    "LOGS": f"{API_BASE_URL}/logs",
    "HELP": f"{API_BASE_URL}/help",
}

# Update interval for real-time data (in milliseconds)
UPDATE_INTERVAL = 2000  # 2 seconds

# Chart configuration
CHART_CONFIG = {
    "MAX_DATA_POINTS": 50,  # Maximum number of data points to display on charts
    "ANIMATION_DURATION": 500,  # Chart animation duration in milliseconds
}

# Export options
EXPORT_FORMATS = ["CSV", "JSON"]

# Styling
COLORS = {
    "NORMAL": "#2ecc71",  # Green for normal state
    "ANOMALY": "#e74c3c",  # Red for anomaly state
    "CHART_BORDER": "#3498db",  # Blue for chart borders
    "CHART_BACKGROUND": "rgba(52, 152, 219, 0.2)",  # Light blue for chart background
}

# Logging configuration
import logging

LOG_CONFIG = {
    "level": logging.INFO,
    "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    "filename": "app.log",
}

# Flask configuration
FLASK_CONFIG = {
    "DEBUG": True,  # Set to False in production
    "HOST": "0.0.0.0",
    "PORT": 5001,
}

# Security (for demonstration purposes only, use more secure methods in production)
SECRET_KEY = "your_secret_key_here"

# Bonus feature configurations
HISTORICAL_DATA_RANGE = 24 * 60 * 60  # 24 hours in seconds
TIME_SLIDER_STEP = 60  # 1 minute steps for historical data playback
