let availableDevices = [];
let connectedDevices = [];

document.getElementById('scan').addEventListener('click', async () => {
    try {
        const devices = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: ['battery_service', 'device_information']
        });

        availableDevices.push(devices);
        updateDeviceList();
    } catch (error) {
        console.log('Error:', error);
        alert('Could not scan for Bluetooth devices: ' + error.message);
    }
});

function updateDeviceList() {
    const deviceList = document.getElementById('devices');
    deviceList.innerHTML = '';
    availableDevices.forEach((device, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = device.name || `Device ${index + 1}`;
        
        const connectButton = document.createElement('button');
        connectButton.textContent = 'Connect';
        connectButton.addEventListener('click', () => connectToDevice(device, index));
        
        listItem.appendChild(connectButton);
        deviceList.appendChild(listItem);
    });
}

async function connectToDevice(device, index) {
    try {
        const server = await device.gatt.connect();
        console.log('Connected to GATT Server');

        connectedDevices.push(device);
        availableDevices.splice(index, 1);
        updateDeviceList();
        updateConnectedDeviceList();
    } catch (error) {
        console.log('Error:', error);
        alert('Could not connect to Bluetooth device: ' + error.message);
    }
}

function updateConnectedDeviceList() {
    const connectedDeviceList = document.getElementById('connectedDevices');
    connectedDeviceList.innerHTML = '';
    connectedDevices.forEach((device, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = device.name || `Device ${index + 1}`;
        connectedDeviceList.appendChild(listItem);
    });
}
