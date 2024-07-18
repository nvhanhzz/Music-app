const sort = (query, Sort) => {
    const sortKey = query.sortKey;
    const sortValue = query.sortValue;

    let res = {};
    if (sortKey && sortValue && Object.values(Sort).includes(sortKey) && ['asc', 'desc'].includes(sortValue)) {
        res[sortKey] = sortValue;
    } else {
        res = { position: "desc" };
    }

    return res;
}

export default sort;