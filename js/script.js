console.log('Lets write JavaScript');
let currentSong = new Audio();
let songs;
let currFolder;
let token = "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";

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder){
    currFolder = folder;
    
    console.log({folder});

    const url = `https://api.github.com/repos/isanketsolanki/Spotify-Clone/contents/${folder}`;

    let response = await fetch(url, {
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    let data = await response.json();
    songs = data.filter(file => file.name.endsWith('.mp3')).map(file => file.name);

    // Show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `<li><img class="invert" src="image/music.svg" alt="music">
                <div class="info">
                  <div> ${song.replaceAll("%20", " ")} </div>
                  <div>Sanket</div>
                </div>
                <div class="playnow">
                  <span>Play Now</span> 
                  <img class="invert" src="image/play.svg" alt="play">
                </div> </li>`;
    }

    // Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click", element=>{
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });

    return songs;
}

const playMusic = (track, pause=false) => {
    currentSong.src = `https://raw.githubusercontent.com/isanketsolanki/Spotify-Clone/main/${currFolder}/${track}`;
    if (!pause) {
        currentSong.play();
        play.src = "image/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums() {
    
    const url = 'https://api.github.com/repos/isanketsolanki/Spotify-Clone/contents/songs';
    
    let response = await fetch(url, {
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    let data = await response.json();
    let cardContainer = document.querySelector(".cardContainer");

    for (let index = 0; index < data.length; index++) {
        const e = data[index];
        if (e.type === "dir") {
            let folder = e.name;
            // Get the metadata of the folder
            let metadataResponse = await fetch(`https://raw.githubusercontent.com/isanketsolanki/Spotify-Clone/main/songs/${folder}/info.json`);
            let metadata = await metadataResponse.json();
            cardContainer.innerHTML += `<div data-folder="${folder}" class="card">
                <div class="play">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="60">
                        <circle cx="50" cy="50" r="40" fill="#1fdf64"/>
                        <polygon points="40,30 40,70 70,50" fill="#111"/>
                    </svg>
                </div>
                <img class="rounded" src="https://raw.githubusercontent.com/isanketsolanki/Spotify-Clone/main/songs/${folder}/cover.jpg" alt="img">
                <div class="div">
                    <h3>${metadata.title}</h3>
                    <p>${metadata.description}</p>
                </div>
            </div>`;
        }
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log("Fetching Songs");
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
        });
    });
}

async function main() {
    // Display all the albums on the page
    await displayAlbums();

    // Attach an event listener to play, next and previous
    play.addEventListener("click", ()=>{
        if (currentSong.paused){
            currentSong.play();
            play.src = "image/pause.svg";
        } else {
            currentSong.pause();
            play.src = "image/play.svg";
        }
    });

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e=>{
        let percent = (e.offsetX/e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent)/100;
    });

    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "0";
    });

    // Add an event listener for close button
    document.querySelector(".close").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "-120%";
    });

    // Add an event listener to previous
    previous.addEventListener("click", () => {
        currentSong.pause();
        console.log("Previous clicked");
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        }
    });

    // Add an event listener to next
    next.addEventListener("click", () => {
        currentSong.pause();
        console.log("Next clicked");
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }
    });

    // Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/ 100");
        currentSong.volume = parseInt(e.target.value) / 100;
        if (currentSong.volume > 0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg");
        }
    });

    // Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e=>{ 
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    });
}

main();