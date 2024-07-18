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
}

audioElement.addEventListener('play', () => {
    if (connectedDevices.length > 0) {
        // Implement audio synchronization logic here
        console.log('Audio is playing');
    }
});
