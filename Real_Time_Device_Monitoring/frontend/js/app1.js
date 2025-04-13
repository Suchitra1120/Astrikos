// Chart configuration
const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
        duration: 500
    },
    scales: {
        y: {
            beginAtZero: true
        },
        x: {
            display: false
        }
    },
    plugins: {
        legend: {
            display: false
        }
    }
};

// Initialize charts
const pump1Chart = new Chart(document.getElementById('pump1-chart').getContext('2d'), {
    type: 'line',
    data: {
        labels: Array(50).fill(''),
        datasets: [{
            label: 'Pressure',
            data: Array(50).fill(null),
            borderColor: '#3498db',
            backgroundColor: 'rgba(52, 152, 219, 0.2)',
            borderWidth: 2,
            tension: 0.4,
            fill: true
        }]
    },
    options: chartOptions
});

const pump2Chart = new Chart(document.getElementById('pump2-chart').getContext('2d'), {
    type: 'line',
    data: {
        labels: Array(50).fill(''),
        datasets: [{
            label: 'Flow Rate',
            data: Array(50).fill(null),
            borderColor: '#e74c3c',
            backgroundColor: 'rgba(231, 76, 60, 0.2)',
            borderWidth: 2,
            tension: 0.4,
            fill: true
        }]
    },
    options: chartOptions
});

const pump3Chart = new Chart(document.getElementById('pump3-chart').getContext('2d'), {
    type: 'line',
    data: {
        labels: Array(50).fill(''),
        datasets: [{
            label: 'Temperature',
            data: Array(50).fill(null),
            borderColor: '#2ecc71',
            backgroundColor: 'rgba(46, 204, 113, 0.2)',
            borderWidth: 2,
            tension: 0.4,
            fill: true
        }]
    },
    options: chartOptions
});

// Store historical data for time slider
const historicalData = {
    pump1: [],
    pump2: [],
    pump3: []
};

// Maximum number of historical data points to store
const MAX_HISTORY = 100;

// Update device status indicator
function updateDeviceStatus(deviceId, status) {
    const statusElement = document.getElementById(`${deviceId}-status`);
    if (status === 1) {
        statusElement.className = 'status-indicator status-normal';
    } else if (status === 2) {
        statusElement.className = 'status-indicator status-anomaly';
    } else {
        statusElement.className = 'status-indicator';
    }
}

// Update chart with new data
function updateChart(chart, newValue) {
    chart.data.datasets[0].data.push(newValue);
    chart.data.datasets[0].data.shift();
    chart.update();
}




window.deviceStates = {
    pump1: 1,
    pump2: 1,
    pump3: 1
};

// Modify fetchDeviceStates to respect manual changes
async function fetchDeviceStates() {
    try {
        const response = await fetch('/api/device_states');
        const data = await response.json();
        
        document.getElementById('connection-status').textContent = 'Connected';
        
        if (data.devices) {
            data.devices.forEach(device => {
                if (device.id === 'pump1' || device.name === 'Water Pump') {
                    // Only update if not manually set
                    if (!window.deviceStates.pump1_manual) {
                        window.deviceStates.pump1 = device.state;
                        updateDeviceStatus('pump1', device.state);
                    }
                } else if (device.id === 'pump2' || device.name === 'Lime Dosing Pump') {
                    if (!window.deviceStates.pump2_manual) {
                        window.deviceStates.pump2 = device.state;
                        updateDeviceStatus('pump2', device.state);
                    }
                } else if (device.id === 'pump3' || device.name === 'Sand Filter') {
                    if (!window.deviceStates.pump3_manual) {
                        window.deviceStates.pump3 = device.state;
                        updateDeviceStatus('pump3', device.state);
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error fetching device states:', error);
        document.getElementById('connection-status').textContent = 'Disconnected';
        
        // Set default status when disconnected (but respect manual changes)
        if (!window.deviceStates.pump1_manual) updateDeviceStatus('pump1', 1);
        if (!window.deviceStates.pump2_manual) updateDeviceStatus('pump2', 1);
        if (!window.deviceStates.pump3_manual) updateDeviceStatus('pump3', 1);
    }
}

async function toggleDevice(deviceId) {
    try {
        const pumpKey = `pump${deviceId}`;
        const currentState = window.deviceStates[pumpKey];
        const newState = currentState === 1 ? 2 : 1;
        
        // Update UI and set manual flag
        window.deviceStates[pumpKey] = newState;
        window.deviceStates[`${pumpKey}_manual`] = true;
        updateDeviceStatus(pumpKey, newState);
        
        // Send request to server
        const response = await fetch(`/api/toggle_device/${deviceId}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'}
        });
        
        const data = await response.json();
        
        if (data.error) {
            console.error(`Error toggling device ${deviceId}:`, data.error);
        } else {
            console.log(`Successfully toggled device ${deviceId}`);
        }
    } catch (error) {
        console.error(`Error toggling device ${deviceId}:`, error);
    }
}

// Reset all devices
async function resetDevices() {
    try {
        // First, send reset command to server
        const response = await fetch('/api/reset_devices', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'}
        });
        
        // Immediately reset the UI to match the second image
        
        // Reset status indicators to gray
        for (let i = 1; i <= 3; i++) {
            const statusElement = document.getElementById(`pump${i}-status`);
            statusElement.className = 'status-indicator'; // Remove all classes, set to gray
            
            // Reset device states
            window.deviceStates[`pump${i}`] = 0; // 0 = unknown/gray
            window.deviceStates[`pump${i}_paused`] = false;
            
            // Remove anomaly styling
            const cardElement = document.getElementById(`pump${i}-card`);
            if (cardElement) {
                cardElement.classList.remove('device-anomaly');
            }
            
            // Clear data values to "--" as shown in the second image
            if (i === 1) { // Water Pump
                document.getElementById('pump1-pressure').textContent = '--';
                document.getElementById('pump1-flow').textContent = '--';
                document.getElementById('pump1-temp').textContent = '--';
                
                // Reset chart to empty
                pump1Chart.data.datasets[0].data = Array(50).fill(null);
                pump1Chart.update();
            } else if (i === 2) { // Lime Dosing Pump
                document.getElementById('pump2-pressure').textContent = '--';
                document.getElementById('pump2-flow').textContent = '--';
                document.getElementById('pump2-ph').textContent = '--';
                
                // Reset chart to empty
                pump2Chart.data.datasets[0].data = Array(50).fill(null);
                pump2Chart.update();
            } else if (i === 3) { // Sand Filter
                document.getElementById('pump3-pressure').textContent = '--';
                document.getElementById('pump3-flow').textContent = '--';
                document.getElementById('pump3-temp').textContent = '--';
                
                // Reset chart to empty
                pump3Chart.data.datasets[0].data = Array(50).fill(null);
                pump3Chart.update();
            }
        }
        
        // Update connection status to "Connecting..." as shown in the second image
        document.getElementById('connection-status').textContent = 'Connecting...';
        
        // Update last updated time to "--" as shown in the second image
        document.getElementById('last-updated').textContent = '--';
        
        // Process server response
        const data = await response.json();
        
        if (data.error) {
            console.error('Error resetting devices:', data.error);
        } else {
            console.log('Successfully reset all devices');
            
            // After a short delay, attempt to reconnect and fetch new data
            setTimeout(() => {
                fetchDeviceStates();
                fetchPumpData();
            }, 2000);
        }
    } catch (error) {
        console.error('Error resetting devices:', error);
    }
}



// Fetch pump data
async function fetchPumpData() {
    try {
        // Fetch Pump 1 data
        const pump1Response = await fetch('/api/pump_data/1');
        const pump1Data = await pump1Response.json();
        
        if (pump1Data && !pump1Data.error) {
            document.getElementById('pump1-pressure').textContent = `${pump1Data.pressure.toFixed(2)} bar`;
            document.getElementById('pump1-flow').textContent = `${pump1Data.flow_rate.toFixed(2)} L/min`;
            document.getElementById('pump1-temp').textContent = `${pump1Data.temperature.toFixed(1)} °C`;
            
            // Update chart
            updateChart(pump1Chart, pump1Data.pressure);
            
            // Store historical data
            historicalData.pump1.push({
                timestamp: Date.now(),
                ...pump1Data
            });
            if (historicalData.pump1.length > MAX_HISTORY) {
                historicalData.pump1.shift();
            }
        }
        
        // Fetch Pump 2 data
        const pump2Response = await fetch('/api/pump_data/2');
        const pump2Data = await pump2Response.json();
        
        if (pump2Data && !pump2Data.error) {
            document.getElementById('pump2-pressure').textContent = `${pump2Data.pressure.toFixed(2)} bar`;
            document.getElementById('pump2-flow').textContent = `${pump2Data.flow_rate.toFixed(2)} L/min`;
            
            // Check if pH level exists
            if (pump2Data.ph_level !== undefined) {
                document.getElementById('pump2-ph').textContent = `${pump2Data.ph_level.toFixed(1)}`;
            } else {
                document.getElementById('pump2-ph').textContent = 'N/A';
            }
            
            // Update chart
            updateChart(pump2Chart, pump2Data.flow_rate);
            
            // Store historical data
            historicalData.pump2.push({
                timestamp: Date.now(),
                ...pump2Data
            });
            if (historicalData.pump2.length > MAX_HISTORY) {
                historicalData.pump2.shift();
            }
        }
        
        // Fetch Pump 3 data
        const pump3Response = await fetch('/api/pump_data/3');
        const pump3Data = await pump3Response.json();
        
        if (pump3Data && !pump3Data.error) {
            document.getElementById('pump3-pressure').textContent = `${pump3Data.pressure.toFixed(2)} bar`;
            document.getElementById('pump3-flow').textContent = `${pump3Data.flow_rate.toFixed(2)} L/min`;
            document.getElementById('pump3-temp').textContent = `${pump3Data.temperature.toFixed(1)} °C`;
            
            // Update chart
            updateChart(pump3Chart, pump3Data.temperature);
            
            // Store historical data
            historicalData.pump3.push({
                timestamp: Date.now(),
                ...pump3Data
            });
            if (historicalData.pump3.length > MAX_HISTORY) {
                historicalData.pump3.shift();
            }
        }
        
        // Update last updated time
        const now = new Date();
        document.getElementById('last-updated').textContent = now.toLocaleTimeString();
        
    } catch (error) {
        console.error('Error fetching pump data:', error);
        document.getElementById('connection-status').textContent = 'Disconnected';
        
        // Generate simulated data when disconnected
        generateSimulatedData();
    }
}

// Generate simulated data when disconnected
function generateSimulatedData() {
    const now = new Date();
    const timestamp = now.getTime();
    
    // Simulated data for Pump 1
    const pump1Data = {
        pressure: 2.5 + (Math.sin(timestamp / 10000) * 0.5),
        flow_rate: 15 + (Math.cos(timestamp / 8000) * 2),
        temperature: 25 + (Math.sin(timestamp / 15000) * 5)
    };
    
    document.getElementById('pump1-pressure').textContent = `${pump1Data.pressure.toFixed(2)} bar`;
    document.getElementById('pump1-flow').textContent = `${pump1Data.flow_rate.toFixed(2)} L/min`;
    document.getElementById('pump1-temp').textContent = `${pump1Data.temperature.toFixed(1)} °C`;
    updateChart(pump1Chart, pump1Data.pressure);
    
    // Simulated data for Pump 2
    const pump2Data = {
        pressure: 1.8 + (Math.cos(timestamp / 12000) * 0.3),
        flow_rate: 12 + (Math.sin(timestamp / 9000) * 1.5),
        ph_level: 7.2 + (Math.cos(timestamp / 20000) * 0.3)
    };
    
    document.getElementById('pump2-pressure').textContent = `${pump2Data.pressure.toFixed(2)} bar`;
    document.getElementById('pump2-flow').textContent = `${pump2Data.flow_rate.toFixed(2)} L/min`;
    document.getElementById('pump2-ph').textContent = `${pump2Data.ph_level.toFixed(1)}`;
    updateChart(pump2Chart, pump2Data.flow_rate);
    
    // Simulated data for Pump 3
    const pump3Data = {
        pressure: 3.0 + (Math.sin(timestamp / 11000) * 0.6),
        flow_rate: 18 + (Math.cos(timestamp / 7500) * 2.5),
        temperature: 30 + (Math.sin(timestamp / 13000) * 4)
    };
    
    document.getElementById('pump3-pressure').textContent = `${pump3Data.pressure.toFixed(2)} bar`;
    document.getElementById('pump3-flow').textContent = `${pump3Data.flow_rate.toFixed(2)} L/min`;
    document.getElementById('pump3-temp').textContent = `${pump3Data.temperature.toFixed(1)} °C`;
    updateChart(pump3Chart, pump3Data.temperature);
    
    // Update last updated time
    document.getElementById('last-updated').textContent = `${now.toLocaleTimeString()} (Simulated)`;
}



// Export data
function exportData(format) {
    window.open(`/api/export/${format}`, '_blank');
}

// Time slider functionality
function handleTimeSlider() {
    const slider = document.getElementById('time-slider');
    const sliderValue = parseInt(slider.value);
    
    // If slider is at 100, show current data
    if (sliderValue === 100) {
        fetchPumpData();
        return;
    }
    
    // Calculate index based on slider value
    const pump1Length = historicalData.pump1.length;
    const pump2Length = historicalData.pump2.length;
    const pump3Length = historicalData.pump3.length;
    
    if (pump1Length === 0 || pump2Length === 0 || pump3Length === 0) {
        return; // Not enough historical data
    }
    
    const pump1Index = Math.floor((sliderValue / 100) * (pump1Length - 1));
    const pump2Index = Math.floor((sliderValue / 100) * (pump2Length - 1));
    const pump3Index = Math.floor((sliderValue / 100) * (pump3Length - 1));
    
    // Get historical data at the calculated indices
    const pump1Data = historicalData.pump1[pump1Index];
    const pump2Data = historicalData.pump2[pump2Index];
    const pump3Data = historicalData.pump3[pump3Index];
    
    // Update UI with historical data
    if (pump1Data) {
        document.getElementById('pump1-pressure').textContent = `${pump1Data.pressure.toFixed(2)} bar`;
        document.getElementById('pump1-flow').textContent = `${pump1Data.flow_rate.toFixed(2)} L/min`;
        document.getElementById('pump1-temp').textContent = `${pump1Data.temperature.toFixed(1)} °C`;
        updateDeviceStatus('pump1', pump1Data.state);
    }
    
    if (pump2Data) {
        document.getElementById('pump2-pressure').textContent = `${pump2Data.pressure.toFixed(2)} bar`;
        document.getElementById('pump2-flow').textContent = `${pump2Data.flow_rate.toFixed(2)} L/min`;
        if (pump2Data.ph_level !== undefined) {
            document.getElementById('pump2-ph').textContent = `${pump2Data.ph_level.toFixed(1)}`;
        }
        updateDeviceStatus('pump2', pump2Data.state);
    }
    
    if (pump3Data) {
        document.getElementById('pump3-pressure').textContent = `${pump3Data.pressure.toFixed(2)} bar`;
        document.getElementById('pump3-flow').textContent = `${pump3Data.flow_rate.toFixed(2)} L/min`;
        document.getElementById('pump3-temp').textContent = `${pump3Data.temperature.toFixed(1)} °C`;
        updateDeviceStatus('pump3', pump3Data.state);
    }
    
    // Update last updated time with the timestamp from historical data
    if (pump1Data && pump1Data.timestamp) {
        const historicalTime = new Date(pump1Data.timestamp);
        document.getElementById('last-updated').textContent = 
            `${historicalTime.toLocaleTimeString()} (Historical)`;
    }
}

// Initialize the application
function initApp() {
    // Set up event listeners for buttons
    document.getElementById('toggle-pump1').addEventListener('click', () => toggleDevice(1));
    document.getElementById('toggle-pump2').addEventListener('click', () => toggleDevice(2));
    document.getElementById('toggle-pump3').addEventListener('click', () => toggleDevice(3));
    
    document.getElementById('reset-all').addEventListener('click', resetDevices);
    
    // Export buttons
    const jsonButton = document.getElementById('export-json');
    if (jsonButton) {
        jsonButton.addEventListener('click', () => exportData('json'));
    }
    
    const csvButton = document.getElementById('export-csv');
    if (csvButton) {
        csvButton.addEventListener('click', () => exportData('csv'));
    }
    
    // Time slider
    const timeSlider = document.getElementById('time-slider');
    if (timeSlider) {
        timeSlider.addEventListener('input', handleTimeSlider);
    }
    
    // Initial data fetch
    fetchDeviceStates();
    fetchPumpData();
    
    // Set up polling interval (every 2 seconds) when slider is at current time
    setInterval(() => {
        const slider = document.getElementById('time-slider');
        if (!slider || parseInt(slider.value) === 100) {
            fetchDeviceStates();
            fetchPumpData();
        }
    }, 2000);
}

// Call the initialization function when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);
