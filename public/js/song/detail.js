const aplayer = document.getElementById('aplayer');

if (aplayer) {
    const songData = JSON.parse(aplayer.getAttribute("song-data"));
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