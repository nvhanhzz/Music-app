const roleIds = document.querySelectorAll(".role-id"); // list input role id
const updatePermissionButton = document.querySelector(".update-permission-button"); // update permission button
const updatePermissionForm = document.querySelector(".update-permission-form"); // update permission form
const checkBoxPermissions = document.querySelectorAll("input[check-box-permission]"); // input checxbox update permission
const inputPermissions = document.querySelector("input[permissions]"); // input permissions

// Update permission
const permissions = [];
if (roleIds) {
    roleIds.forEach((item, index) => {
        permissions.push({
            id: item.value,
            listPermission: []
        });
    });

    if (updatePermissionButton) {
        updatePermissionButton.addEventListener("click", () => {
            checkBoxPermissions.forEach(item => {
                if (item.checked) {
                    permissions[item.value].listPermission.push(item.name);
                }
            });

            inputPermissions.value = JSON.stringify(permissions);
            updatePermissionForm.submit();
        });
    }
}
// End update permission