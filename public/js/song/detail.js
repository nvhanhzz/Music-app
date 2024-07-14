const songData = JSON.parse(document.querySelector("div[song-data]").getAttribute("song-data"));
const currentUser = document.querySelector("div[currentUser]");

// config aplayer
const aplayer = document.getElementById('aplayer');

if (aplayer) {
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
}
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
                    songId: songData._id,
                    userId: currentUser.getAttribute("currentUser")
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