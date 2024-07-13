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