
let audioElement = document.getElementById('audio');
let youtubePlayer;
let selectedDevice;

document.getElementById('connect').addEventListener('click', async () => {
    try {
        selectedDevice = await navigator.bluetooth.requestDevice({
            filters: [{ services: ['battery_service'] }],
            optionalServices: ['a2dp_source']
        });

        const server = await selectedDevice.gatt.connect();
        console.log('Connected to GATT Server');
    } catch (error) {
        console.log('Error:', error);
    }
});

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
    if (selectedDevice) {
        // Implement audio synchronization logic here
        console.log('Audio is playing');
    }
});
