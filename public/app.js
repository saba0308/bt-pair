let audioElement = document.getElementById('audio');
let youtubePlayer;
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
        console.log('Error:', error);
        alert('Could not connect to Bluetooth device: ' + error.message);
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
