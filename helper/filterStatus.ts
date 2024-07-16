const filterStatus = (query: object) => {
    const filterStatus = [
        {
            name: "Tất cả",
            status: "",
            class: "active"
        },
        {
            name: "Hoạt động",
            status: "active",
            class: ""
        },
        {
            name: "Dừng hoạt động",
            status: "inactive",
            class: ""
        }
    ];
    for (const status of filterStatus) {
        if (query["status"] && query["status"] === status.status) {
            status.class = "active"
            filterStatus[0].class = "";
        }
    }

    return filterStatus;
}

export default filterStatus;