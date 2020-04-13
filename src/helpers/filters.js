export const filterDuplicatesByKey = (list, key) => {
    const uniqueList = [];
    return list.reduce((filtered, item) => {
        if (uniqueList.indexOf(item[key]) === -1) {
            uniqueList.push(item[key]);
            filtered.push(item);
        }
        return filtered;
    }, []);
};
