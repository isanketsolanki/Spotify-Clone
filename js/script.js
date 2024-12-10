let currentSong = new Audio();
let songs = [];
let currentFolder = '';

// GitHub JSON file URL
const GITHUB_JSON_URL = "https://raw.githubusercontent.com/isanketsolanki/Spotify-Clone/main/albums.json"; // Replace <username> and <repository> with actual values.

async function fetchAlbums() {
    try {
        let response = await fetch(GITHUB_JSON_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        let data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching albums:", error);
    }
}

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

function loadSongs(album) {
    songs = album.tracks;
    currentFolder = album.folder;

    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";
    songs.forEach((song, index) => {
        songUL.innerHTML += `
            <li data-index="${index}">
                <img class="invert" src="image/music.svg" alt="music">
                <div class="info">
                    <div>${song.name}</div>
                    <div>${album.title}</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="image/play.svg" alt="play">
                </div>
            </li>`;
    });
}

function playMusic(index) {
    const track = songs[index];
    if (!track) {
        console.error("Track not found");
        return;
    }

    currentSong.src = track.file;
    currentSong.play();
    document.querySelector(".songinfo").innerHTML = track.name;
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
    document.querySelector("#play").src = "image/pause.svg";
}

async function displayAlbums() {
    const albums = await fetchAlbums();
    if (!albums) return;

    let cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = "";

    albums.forEach((album) => {
        cardContainer.innerHTML += `
            <div data-folder="${album.folder}" class="card">
                <div class="play">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="60">
                        <circle cx="50" cy="50" r="40" fill="#1fdf64"/>
                        <polygon points="40,30 40,70 70,50" fill="#111"/>
                    </svg>
                </div>
                <img class="rounded" src="${album.cover}" alt="${album.title}">
                <div class="div">
                    <h3>${album.title}</h3>
                    <p>${album.description}</p>
                </div>
            </div>`;
    });

    // Add event listeners to cards
    document.querySelectorAll(".card").forEach((card, index) => {
        card.addEventListener("click", () => {
            loadSongs(albums[index]);
            playMusic(0);
        });
    });
}

function attachEventListeners() {
    // Song list click listener
    document.querySelector(".songList").addEventListener("click", (e) => {
        const li = e.target.closest("li");
        if (!li) return;
        playMusic(li.dataset.index);
    });

    // Play/Pause button listener
    document.querySelector("#play").addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            document.querySelector("#play").src = "image/pause.svg";
        } else {
            currentSong.pause();
            document.querySelector("#play").src = "image/play.svg";
        }
    });

    // Previous button listener
    document.querySelector("#previous").addEventListener("click", () => {
        let index = songs.findIndex((song) => song.file === currentSong.src);
        if (index > 0) playMusic(index - 1);
    });

    // Next button listener
    document.querySelector("#next").addEventListener("click", () => {
        let index = songs.findIndex((song) => song.file === currentSong.src);
        if (index < songs.length - 1) playMusic(index + 1);
    });

    // Volume control listener
    document.querySelector("#volume").addEventListener("input", (e) => {
        currentSong.volume = e.target.value / 100;
    });

    // Seekbar listener
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
    });
}

async function main() {
    await displayAlbums();
    attachEventListeners();
}

main();
