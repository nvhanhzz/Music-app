const url = new URL(window.location.href);
const activeButtons = document.querySelectorAll(".btn-active"); // 3 button filter
const searchForm = document.querySelector("#form-search"); // form search
const pageButtons = document.querySelectorAll(".pagination-button"); // list pagination buttons
const sortSelect = document.querySelector('.sort'); // sort select
const clearSortButton = document.querySelector('button[clear]'); // clear button
const checkAll = document.querySelector('input[name="checkall"]'); // input checkbox check all
const checkItems = document.querySelectorAll('input[name="checkitem"]'); // input checkbox 1 product
// const formChangeListProduct = document.querySelector('#change-product-form'); // form change list product
const statusButtons = document.querySelectorAll("button[update-status]"); // list status button
const changeStatusForm = document.querySelector(".change-status-form"); // form change status of 1 item
// const inputChangeListProduct = document.querySelector('input[name="inputChangeListProduct"]'); // input text change list product
// const selectChangeProduct = document.querySelector('.select-change-product'); // select change product
// const deleteButtons = document.querySelectorAll('button[delete-button]'); // list delete button
// const deleteProductForm = document.querySelector('.delete-product-form'); // delete form
// const positionInput = document.querySelector('input[name="inputProductPosition"]'); // input position of product
// const positionProducts = document.querySelectorAll('.position-product'); // list poition
// const updateButtons = document.querySelectorAll('button[update-button]'); // list update button
// const detailButtons = document.querySelectorAll('button[detail-button]'); // list detail button

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

// if (formChangeListProduct) {
//     formChangeListProduct.addEventListener("submit", (event) => {
//         event.preventDefault();
//         const listIdChange = Array.from(checkItems)
//             .filter(item => item.checked)
//             .map(item => item.getAttribute("val"));
//         inputChangeListProduct.value = listIdChange.join(", ");
//         const changeCase = selectChangeProduct.value.toLowerCase().replace(/\s/g, '_');;
//         // console.log(changeCase);

//         if (changeCase === 'change_position') {
//             const listPosition = Array.from(checkItems)
//                 .filter(item => item.checked)
//                 .map(item => item.parentNode.parentNode.querySelector('.position-product').value)

//             positionInput.value = listPosition.join(', ');
//             console.log(positionInput.value);
//         }

//         const oldAction = formChangeListProduct.getAttribute("action");
//         const formChangeListProductPath = `${oldAction}/${changeCase}?_method=PATCH`;

//         formChangeListProduct.setAttribute("action", formChangeListProductPath);
//         if (changeCase != "") {
//             const confirmed = confirm("Are you sure you want to change products?");
//             if (confirmed) {
//                 formChangeListProduct.submit();
//             }
//         }
//     });
// }
// end solve change multiple

// solve change status
for (let btn of statusButtons) {
    btn.addEventListener("click", () => {
        const status = btn.getAttribute("val") === "active" ? "inactive" : "active";
        const itemId = btn.getAttribute("itemId");
        const oldAction = changeStatusForm.getAttribute("action");
        const changStatusPath = `${oldAction}/${status}/${itemId}?_method=PATCH`;
        changeStatusForm.setAttribute("action", changStatusPath);
        console.log(changeStatusForm);
        changeStatusForm.submit();
    })
}
// solve change status

// // solve delete 1 product
// deleteButtons.forEach(item => {
//     item.addEventListener("click", () => {
//         const confirmed = confirm("Are you sure you want to delete ?");
//         if (confirmed) {
//             const oldAction = deleteProductForm.getAttribute("action");
//             const id = item.getAttribute("item_id");
//             const action = `${oldAction}/${id}?_method=DELETE`;
//             deleteProductForm.setAttribute("action", action);
//             deleteProductForm.submit();
//         }
//     });
// });

// // solve update 1 product
// updateButtons.forEach(item => {
//     item.addEventListener("click", () => {
//         window.location.href = item.getAttribute("linkTo");
//     })
// })

// // solve see product detail
// detailButtons.forEach(item => {
//     item.addEventListener("click", () => {
//         window.location.href = item.getAttribute("linkTo");
//     })
// })