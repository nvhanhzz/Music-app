const imgInput = document.querySelector(".img-inp"); // preview image
const blah = document.querySelector("#blah"); // preview image// solve image upload preview
if (imgInput) {
    imgInput.addEventListener("change", (e) => {
        const [file] = e.target.files;
        if (file) {
            blah.src = URL.createObjectURL(file);
            blah.style.display = "block";
        }
    });
    if (blah && blah.getAttribute("src") !== "") {
        blah.style.display = "block";
    }
}
// end solve image upload preview


// solve alert notification
document.addEventListener('DOMContentLoaded', function () {
    const alert = document.querySelector('.notfAlert');
    if (alert) {
        setTimeout(function () {
            alert.style.display = 'none';
        }, 5000);

        const closeAlertBtn = document.querySelector('.close-alert-btn');
        if (closeAlertBtn) {
            closeAlertBtn.addEventListener('click', function () {
                alert.style.display = 'none';
            });
        }
    }
});
// end solve alert notification

// add song to favorite list
const loveButtons = document.querySelectorAll(".love-button");
if (loveButtons) {
    loveButtons.forEach(loveButton => {
        loveButton.addEventListener("click", () => {
            const songId = loveButton.getAttribute("songId");
            const currentUser = document.querySelector("div[currentUser]");
            if (currentUser) {
                fetch('/user/addFavoriteSong', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        songId: songId
                    })
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok ' + response.statusText);
                        }
                        return response.json();
                    })
                    .then(data => {
                        loveButton.classList.toggle("loved");
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
            }
        });
    })
}
// end add song to favorite list

// solve search
const searchForm = document.querySelector(".search-form");
if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = document.querySelector(".search-input");
        const baseUrl = window.location.origin; // Lấy phần gốc của URL (protocol + hostname + port nếu có)

        if (input.value) {
            const keyword = input.value.trim();
            window.location.href = `${baseUrl}/search/result?keyword=${encodeURIComponent(keyword)}`;
        }
    });
}
// end solve search

// solve suggest search
if (searchForm) {
    const input = searchForm.querySelector(".search-input");
    if (input) {
        input.addEventListener("keyup", () => {
            const keyword = input.value;
            if (keyword) {
                const url = `/search/suggest/?keyword=${encodeURIComponent(keyword)}`;
                fetch(url)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok ' + response.statusText);
                        }
                        return response.json();
                    })
                    .then(data => {
                        document.querySelector(".inner-suggest").classList.remove("d-none");
                        const songs = data.songs;
                        const suggestList = songs.map(song => {
                            return `
                                        <a class="inner-item" href="/songs/detail/${song.slug}">
                                            <div class="inner-image"> <img src=${song.avatar} /></div>
                                            <div class="inner-info">
                                                <div class="inner-title">${song.title}</div>
                                                <div class="inner-singer"> <i class="fa-solid fa-microphone-lines"> </i><span>${song.singerId.fullName}</span></div>
                                            </div>
                                        </a>
                                    `;
                        });

                        document.querySelector(".inner-suggest .inner-list").innerHTML = suggestList.join("");
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
            } else {
                document.querySelector(".inner-suggest").classList.add("d-none");
            }
        })
    }
}
// end solve suggest search