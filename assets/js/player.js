document.addEventListener('DOMContentLoaded', () => {
    const audioPlayer = document.getElementById('audio-player');
    const playButton = document.getElementById('play-button');
    const playIcon = playButton.querySelector('span');
    const currentTimeDisplay = document.getElementById('current-time');
    const durationDisplay = document.getElementById('duration');
    const progressBar = document.getElementById('progress-bar');
    const progressContainer = progressBar.parentElement;
    const progressHandle = document.getElementById('progress-handle');
    const vttDisplay = document.getElementById('vtt-display');
    const volumeSlider = document.querySelector('input[type="range"]');
    const back10Btn = document.querySelector('button[title="Retroceder 10s"]');
    const forward30Btn = document.querySelector('button[title="Adelantar 30s"]');
    const chapterSelectContainer = document.getElementById('chapter-select-container');

    let isPlaying = false;
    let currentChapterIndex = 0;

    const chapters = [
        {
            title: "Capítulo 1",
            audio: "./assets/audio/doncaesardebazan_1.mp3",
            vtt: "./assets/vtt/doncaesardebazan_1.vtt"
        },
        {
            title: "Capítulo 2",
            audio: "./assets/audio/doncaesardebazan_2.mp3",
            vtt: "./assets/vtt/doncaesardebazan_2.vtt"
        },
        {
            title: "Capítulo 3",
            audio: "./assets/audio/doncaesardebazan_3.mp3",
            vtt: "./assets/vtt/doncaesardebazan_3.vtt"
        }
    ];

    function init() {
        createChapterSelector();
        loadChapter(0);

        playButton.addEventListener('click', togglePlay);

        back10Btn.addEventListener('click', () => skip(-10));
        forward30Btn.addEventListener('click', () => skip(30));

        volumeSlider.addEventListener('input', (e) => {
            audioPlayer.volume = e.target.value / 100;
        });

        volumeSlider.addEventListener('change', updateVolumeIcon);


        progressContainer.addEventListener('click', seek);

        audioPlayer.addEventListener('timeupdate', updateProgress);
        audioPlayer.addEventListener('loadedmetadata', () => {
            durationDisplay.textContent = formatTime(audioPlayer.duration);
            updateVolumeIcon();
        });
        audioPlayer.addEventListener('ended', () => {
            isPlaying = false;
            updatePlayButton();
        });
        audioPlayer.addEventListener('play', () => {
            isPlaying = true;
            updatePlayButton();
        });
        audioPlayer.addEventListener('pause', () => {
            isPlaying = false;
            updatePlayButton();
        });

        audioPlayer.volume = 0.5;
        volumeSlider.value = 50;
    }

    function createChapterSelector() {
        if (!chapterSelectContainer) return;

        const select = document.createElement('select');
        select.className = "bg-surface text-text font-medium px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-accent cursor-pointer";
        select.id = "chapter-select";

        chapters.forEach((chapter, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = chapter.title;
            select.appendChild(option);
        });

        select.addEventListener('change', (e) => {
            loadChapter(parseInt(e.target.value));
        });

        chapterSelectContainer.appendChild(select);
    }

    function loadChapter(index) {
        currentChapterIndex = index;
        const chapter = chapters[index];

        audioPlayer.pause();
        isPlaying = false;
        updatePlayButton();

        audioPlayer.src = chapter.audio;

        const oldTrack = audioPlayer.querySelector('track');
        if (oldTrack) oldTrack.remove();

        const track = document.createElement('track');
        track.src = chapter.vtt;
        track.default = true;
        audioPlayer.appendChild(track);

        audioPlayer.load();

        audioPlayer.textTracks[0].mode = 'hidden';

        const textTrack = audioPlayer.textTracks[0];
        if (textTrack) {
            textTrack.oncuechange = handleCueChange;
        }

        vttDisplay.textContent = "Sincronizando texto...";
        progressBar.style.width = '0%';
        progressHandle.style.left = '0%';
        currentTimeDisplay.textContent = "00:00";
    }

    function handleCueChange(e) {
        const track = e.target;
        const activeCues = track.activeCues;
        if (activeCues && activeCues.length > 0) {
            const text = activeCues[0].text;

            vttDisplay.innerHTML = text.replace(/\n/g, '<br>');
        }
    }

    function togglePlay() {
        if (audioPlayer.paused) {
            const playPromise = audioPlayer.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error("Playback failed:", error);
                    vttDisplay.textContent = "Error: No se pudo reproducir el audio";
                });
            }
        } else {
            audioPlayer.pause();
        }
    }

    function updatePlayButton() {
        if (audioPlayer.paused) {
            playIcon.textContent = 'play_arrow';
        } else {
            playIcon.textContent = 'pause';
        }
    }

    function skip(seconds) {
        audioPlayer.currentTime += seconds;
    }

    function updateProgress() {
        const current = audioPlayer.currentTime;
        const duration = audioPlayer.duration;

        if (duration) {
            const percent = (current / duration) * 100;
            progressBar.style.width = `${percent}%`;
            progressHandle.style.left = `${percent}%`;

            currentTimeDisplay.textContent = formatTime(current);
        }
    }

    function seek(e) {
        const rect = progressContainer.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        if (audioPlayer.duration) {
            audioPlayer.currentTime = pos * audioPlayer.duration;
        }
    }

    function formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return "00:00";
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    }

    function updateVolumeIcon() {
    }

    init();
});
