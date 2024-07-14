const songData = JSON.parse(document.querySelector("div[song-data]").getAttribute("song-data"));
const currentUser = document.querySelector("div[currentUser]");

// config aplayer
const aplayer = document.getElementById('aplayer');
const ap = new APlayer({
    container: aplayer,
    audio: [{
        name: songData.title,
        artist: songData.singerId.fullName,
        url: songData.audio,
        cover: songData.avatar
    }],
    autoplay: true,
    volume: 0.7
});

// end config aplayer

// like
const likeButton = document.querySelector(".like-button");
if (likeButton) {
    likeButton.addEventListener("click", () => {
        if (currentUser) {
            fetch('/songs/like', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    songId: songData._id
                })
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok ' + response.statusText);
                    }
                    return response.json();
                })
                .then(data => {
                    const song = data.song;
                    const likeCount = document.querySelector("span[like-count]");

                    likeButton.classList.toggle("liked");
                    likeCount.textContent = `${song.like.length} thích`;
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        }
    });
}
// end like

// increase listen count
let listenedTime = 0;
let lastUpdateTime = 0;
let apiCalled = false;

ap.on("timeupdate", () => {
    const currentTime = ap.audio.currentTime;
    if (lastUpdateTime) {
        listenedTime += currentTime - lastUpdateTime;
    }
    lastUpdateTime = currentTime;

    if (listenedTime >= 10 && !apiCalled) {
        apiCalled = true;
        fetch('/songs/increaseListenCount', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                songId: songData._id
            })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                const listenCount = data.listenCount;
                const listenCountSpan = document.querySelector("span[listen-count]");
                if (listenCountSpan) {
                    listenCountSpan.textContent = `${listenCount} lượt nghe`;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                // Reset apiCalled to false if there was an error, so we can retry
                apiCalled = false;
            });
    }
});

ap.on('pause', () => {
    lastUpdateTime = 0;
});

ap.on('play', () => {
    lastUpdateTime = ap.audio.currentTime;
});

ap.on('ended', () => {
    listenedTime = 0;
    lastUpdateTime = 0;
    apiCalled = false;
});

ap.on('seeked', () => {
    lastUpdateTime = ap.audio.currentTime;
});
// end increase listen count