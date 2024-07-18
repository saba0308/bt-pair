let availableDevices = [];
let connectedDevices = [];
let audioElement = document.getElementById('audio');
let youtubePlayer;

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

        // Store connected device details
        connectedDevices.push({
            device: device,
            server: server
        });

        // Remove from available devices list
        availableDevices.splice(index, 1);

        // Update UI lists
        updateDeviceList();
        updateConnectedDeviceList();

        // Display connected device details
        displayConnectedDevices(device, server);

        // Play audio on the connected Bluetooth device
        playAudioOnBluetoothDevice();
    } catch (error) {
        console.log('Error:', error);
        alert('Could not connect to Bluetooth device: ' + error.message);
    }
}

function updateConnectedDeviceList() {
    const connectedDeviceList = document.getElementById('connectedDevices');
    connectedDeviceList.innerHTML = '';
    connectedDevices.forEach((connectedDevice, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = connectedDevice.device.name || `Device ${index + 1}`;
        connectedDeviceList.appendChild(listItem);
    });
}

function displayConnectedDevices(device, server) {
    const serviceListElement = document.getElementById('connectedDeviceServices');
    serviceListElement.innerHTML = '';

    server.getPrimaryServices().then(services => {
        services.forEach(service => {
            const serviceItem = document.createElement('li');
            serviceItem.textContent = `Service UUID: ${service.uuid}`;

            const characteristicList = document.createElement('ul');
            service.getCharacteristics().then(characteristics => {
                characteristics.forEach(characteristic => {
                    const characteristicItem = document.createElement('li');
                    characteristicItem.textContent = `Characteristic UUID: ${characteristic.uuid}`;
                    characteristicList.appendChild(characteristicItem);
                });
            });

            serviceItem.appendChild(characteristicList);
            serviceListElement.appendChild(serviceItem);
        });
    });
}

async function playAudioOnBluetoothDevice() {
    if (connectedDevices.length > 0) {
        const device = connectedDevices[0].device; // Assuming only one device is connected
        const stream = audioElement.captureStream();
        const audioTrack = stream.getAudioTracks()[0];

        // Replace with actual service and characteristic UUIDs for audio transmission
        const serviceUUID = 'your_audio_service_uuid';
        const characteristicUUID = 'your_audio_characteristic_uuid';

        try {
            const server = connectedDevices[0].server;
            const service = await server.getPrimaryService(serviceUUID);
            const characteristic = await service.getCharacteristic(characteristicUUID);

            await characteristic.writeValue(audioTrack);
            console.log('Audio sent to Bluetooth device');
        } catch (error) {
            console.error('Error sending audio to Bluetooth device:', error);
            alert('Error sending audio to Bluetooth device: ' + error.message);
        }
    }
}

document.getElementById('audioSource').addEventListener('change', (event) => {
    const source = event.target.value;
    if (source === 'local') {
        document.getElementById('audioFile').style.display = 'block';
        document.getElementById('youtubeInput').style.display = 'none';
        document.getElementById('youtubePlayer').style.display = 'none';
        audioElement.style.display = 'block';
    } else if (source === 'youtube') {
        document.getElementById('audioFile').style.display = 'none';
        document.getElementById('youtubeInput').style.display = 'block';
        document.getElementById('youtubePlayer').style.display = 'block';
        audioElement.style.display = 'none';
    }
});

document.getElementById('audioFile').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const url = URL.createObjectURL(file);
        audioElement.src = url;
        audioElement.play();

        // Play audio on the connected Bluetooth device after connecting
        playAudioOnBluetoothDevice();
    }
});

document.getElementById('loadYoutube').addEventListener('click', () => {
    const url = document.getElementById('youtubeUrl').value;
    if (url) {
        loadYouTubeVideo(url);
    }
});

function loadYouTubeVideo(url) {
    if (youtubePlayer) {
        youtubePlayer.destroy();
    }
    youtubePlayer = new YT.Player('youtubePlayer', {
        height: '360',
        width: '640',
        videoId: extractYouTubeVideoID(url),
        events: {
            'onReady': onPlayerReady
        }
    });
}

function extractYouTubeVideoID(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^" &?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

function onPlayerReady(event) {
    event.target.playVideo();

    // Play audio on the connected Bluetooth device after loading YouTube video
    playAudioOnBluetoothDevice();
}

audioElement.addEventListener('play', () => {
    // Play audio on the connected Bluetooth device after local audio playback starts
    playAudioOnBluetoothDevice();
});
