screenshots Represents:- Real-time Monitoring: Continuously polls device data and updates the dashboard every 2 seconds

i)Screenshot 2025-04-14 003049.png--starting UI 
A real-time monitoring system that tracks and visualizes data from three industrial pumps (Water Pump, Lime Dosing Pump, and Sand Filter). 
The dashboard features interactive charts displaying pressure, flow rate, and temperature metrics with color-coded status indicators and device control functionality.

ii)Screenshot 2025-04-14 003129.png --when water_pump button is turned-off (represents red-color)

iii)Screenshot 2025-04-14 003206.png --when reset button is turned-on


# Industrial Device Monitoring Dashboard:-

# Project Overview:

The Industrial Device Monitoring Dashboard is a comprehensive real-time monitoring system designed to track and visualize data from three industrial pumps: Water Pump, Lime Dosing Pump, and Sand Filter. This web-based application provides real-time data visualization, historical data playback, device state control, and data export functionality through a clean, intuitive interface.
The system communicates with industrial equipment using the Modbus TCP/IP protocol, allowing for both monitoring and control of connected devices.

Interactive Charts: Visual representation of pressure, flow rate, and temperature trends

Device State Control: Toggle devices between normal (green) and anomaly (red) states

Historical Data Playback: View and analyze data from the past 24 hours using an interactive slider

Data Export: Export device data in both JSON and CSV formats


# Technology Stack:-

-Frontend: HTML5, CSS3, JavaScript, Chart.js

-Backend: Python, Flask

-Communication Protocol: Modbus TCP/IP

-Data Visualization: Chart.js

# Installation and Setup:-

# Prerequisites:

---Python 3.7+

---Modbus TCP/IP server (running on IP 172.16.50.79, port 502)

---Modern web browser

# Backend Setup (steps to run code):-

step 1)Navigate to the backend directory:

cd backend

step 2) Create and activate a virtual environment:

python -m venv venv

source venv/bin/activate

On Windows: venv\Scripts\activate

macOS/Linux: source venv/bin/activate

step 3)Install required packages:

pip install -r requirements.txt

step 4) Start the Flask application:

python app.py

The server will start on http://localhost:5001

# Configuration

The config.py file contains important settings:

i) Modbus server IP and port (172.16.50.79:502)

ii) Device register addresses

iii) Control register addresses

iv) API endpoints

v) Update intervals

Modify these settings as needed for your specific environment.

# Usage Guide
# Dashboard Overview: 
The dashboard displays three device cards, each representing a different pump:

1) Water Pump:

-Displays pressure, flow rate, and temperature

-Blue chart showing pressure trends

2) Lime Dosing Pump:

-Displays pressure, flow rate, and pH level

-Red chart showing flow rate trends

3) Sand Filter:

-Displays pressure, flow rate, and temperature

-Green chart showing temperature trends

# Device Control
-Toggle Pump State: Click the "Toggle Pump State" button to change a device's state between normal (green) and anomaly (red)

-Reset All Devices: Click the "Reset All Devices" button to reset all devices to their default state

# Historical Data
Use the time slider under "Historical Data Playback" to view data from any point in the past 24 hours. The charts and values will update to reflect the historical state.

# Data Export
Click either the "JSON" or "CSV" button to export the current device data in the selected format.
