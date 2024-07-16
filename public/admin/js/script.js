const url = new URL(window.location.href);
const activeButtons = document.querySelectorAll(".btn-active"); // 3 button filter
const searchForm = document.querySelector("#form-search"); // form search
const pageButtons = document.querySelectorAll(".pagination-button"); // list pagination buttons
const sortSelect = document.querySelector('.sort'); // sort select
const clearSortButton = document.querySelector('button[clear]'); // clear button
const checkAll = document.querySelector('input[name="checkall"]'); // input checkbox check all
const checkItems = document.querySelectorAll('input[name="checkitem"]'); // input checkbox 1 product
const formChangeMultiple = document.querySelector('#change-multiple-form'); // form change list multiple
const inputChangeMultiple = document.querySelector('input[name="inputChangeMultiple"]'); // input text change list multiple
const positionInput = document.querySelector('input[name="inputChangePosition"]'); // input change position
const selectChangeMultiple = document.querySelector('.select-change-multiple'); // select change multiple
const statusButtons = document.querySelectorAll("button[update-status]"); // list status button
const changeStatusForm = document.querySelector(".change-status-form"); // form change status of 1 item
const featuredButtons = document.querySelectorAll("button[update-featured]"); // list featured button
const changeFeaturedForm = document.querySelector(".change-featured-form"); // form change featured of 1 item
const deleteButtons = document.querySelectorAll('button[delete-button]'); // list delete button
const deleteForm = document.querySelector('.delete-form'); // delete form

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

// solve filter
if (activeButtons) {
    for (let btn of activeButtons) {
        btn.addEventListener("click", () => {
            url.searchParams.delete("page"); // back to page 1
            const btnStt = btn.getAttribute("status");
            if (btnStt) {
                url.searchParams.set("status", btnStt);
                window.location.href = url.href;
            } else {
                url.searchParams.delete("status");
                window.location.href = url.href;
            }
        })
    }
}
// end solve filter

// solve search
if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = document.querySelector(".form-control");
        if (input.value) {
            url.searchParams.set("keyword", input.value.trim());
            window.location.href = url.href;
        } else {
            url.searchParams.delete("keyword");
            window.location.href = url.href;
        }
    })
}
// end solve search

// solve pagination
if (pageButtons) {
    for (let btn of pageButtons) {
        btn.addEventListener("click", () => {
            const pageNum = btn.getAttribute("pagenum");
            url.searchParams.set("page", pageNum);
            window.location.href = url.href;
        })
    }
}
// end solve pagination

// solve sort
if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
        const [sortKey, sortValue] = e.target.value.split("-");
        if (sortKey && sortValue) {
            url.searchParams.set("sortKey", sortKey);
            url.searchParams.set("sortValue", sortValue);
            window.location.href = url.href;
        }
    })
}

if (clearSortButton) {
    clearSortButton.addEventListener("click", () => {
        url.searchParams.delete("sortKey");
        url.searchParams.delete("sortValue");
        window.location.href = url.href;
    })
}
// end solve sort

// solve change multiple
if (checkAll) {
    checkAll.addEventListener("click", () => {
        if (checkAll.checked) {
            checkItems.forEach(item => {
                item.checked = true;
            })
        } else {
            checkItems.forEach(item => {
                item.checked = false;
            })
        }
    });
}

if (checkItems) {
    checkItems.forEach(item => {
        item.addEventListener("click", () => {
            const numChange = Array.from(checkItems).reduce((accumulator, currentValue) => {
                return currentValue.checked ? accumulator + 1 : accumulator;
            }, 0);

            if (numChange === checkItems.length) {
                checkAll.checked = true;
            } else {
                checkAll.checked = false;
            }
        });
    });
}

if (formChangeMultiple) {
    formChangeMultiple.addEventListener("submit", (event) => {
        event.preventDefault();
        const listIdChange = Array.from(checkItems)
            .filter(item => item.checked)
            .map(item => item.getAttribute("val"));
        inputChangeMultiple.value = listIdChange.join(", ");
        const changeCase = selectChangeMultiple.value.toLowerCase().replace(/\s/g, '_');;

        if (changeCase === 'change_position') {
            const listPosition = Array.from(checkItems)
                .filter(item => item.checked)
                .map(item => item.parentNode.parentNode.querySelector('.position').value)

            positionInput.value = listPosition.join(', ');
        }

        const oldAction = formChangeMultiple.getAttribute("action");
        const formChangeMultiplePath = `${oldAction}/${changeCase}?_method=PATCH`;
        if (changeCase != "" && listIdChange.length > 0) {
            const confirmed = confirm("Are you sure you want to change products?");
            if (confirmed) {
                formChangeMultiple.setAttribute("action", formChangeMultiplePath);
                formChangeMultiple.submit();
            }
        }
    });
}
// end solve change multiple

// solve change status
for (let btn of statusButtons) {
    btn.addEventListener("click", () => {
        const status = btn.getAttribute("val") === "active" ? "inactive" : "active";
        const itemId = btn.getAttribute("itemId");
        const oldAction = changeStatusForm.getAttribute("action");
        const changStatusPath = `${oldAction}/${status}/${itemId}?_method=PATCH`;
        changeStatusForm.setAttribute("action", changStatusPath);
        changeStatusForm.submit();
    })
}
// end solve change status

// solve change featured
for (let btn of featuredButtons) {
    btn.addEventListener("click", () => {
        const featured = btn.getAttribute("val") === "true" ? "false" : "true";
        const itemId = btn.getAttribute("itemId");
        const oldAction = changeFeaturedForm.getAttribute("action");
        const changeFeaturedPath = `${oldAction}/${featured}/${itemId}?_method=PATCH`;
        changeFeaturedForm.setAttribute("action", changeFeaturedPath);
        changeFeaturedForm.submit();
    })
}
// end solve change featured

// solve delete 1 item
deleteButtons.forEach(item => {
    item.addEventListener("click", () => {
        const confirmed = confirm("Bạn có chắc chắn muốn xóa?");
        if (confirmed) {
            const oldAction = deleteForm.getAttribute("action");
            const id = item.getAttribute("item_id");
            const action = `${oldAction}/${id}?_method=DELETE`;
            deleteForm.setAttribute("action", action);
            deleteForm.submit();
        }
    });
});
// end solve delete 1 item