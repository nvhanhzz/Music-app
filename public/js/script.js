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
            fetch(`/search/suggest/keyword=${keyword}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok ' + response.statusText);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log(data);
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        })
    }
}
// end solve suggest search