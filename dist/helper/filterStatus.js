"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const filterStatus = (query) => {
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
            status.class = "active";
            filterStatus[0].class = "";
        }
    }
    return filterStatus;
};
exports.default = filterStatus;
