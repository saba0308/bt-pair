let connectedDevices = [];

document.getElementById('connect').addEventListener('click', async () => {
    try {
        const device = await navigator.bluetooth.requestDevice({
            filters: [{ services: ['battery_service'] }],
            optionalServices: ['device_information']
        });

        const server = await device.gatt.connect();
        console.log('Connected to GATT Server');

        connectedDevices.push(device);
        updateDeviceList();
    } catch (error) {
        if (error.name === 'NotFoundError') {
            console.log('User cancelled the request');
            alert('You need to select a Bluetooth device to connect.');
        } else {
            console.log('Error:', error);
            alert('Could not connect to Bluetooth device: ' + error.message);
        }
    }
});

function updateDeviceList() {
    const deviceList = document.getElementById('devices');
    deviceList.innerHTML = '';
    connectedDevices.forEach(device => {
        const listItem = document.createElement('li');
        listItem.textContent = device.name || `Device ${connectedDevices.indexOf(device) + 1}`;
        deviceList.appendChild(listItem);
    });
}
