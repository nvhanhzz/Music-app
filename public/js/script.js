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
const loveButton = document.querySelector(".love-button");
if (loveButton) {
    loveButton.addEventListener("click", () => {
        const currentUser = document.querySelector("div[currentUser]");
        if (currentUser) {
            fetch('/user/addFavoriteSong', {
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
                    loveButton.classList.toggle("loved");
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        }
    });
}
// end add song to favorite list
