export const sortFilterByProps = (a, b, props) => {
    if (a[props] > b[props]) {
        return -1;
    } else if (a[props] < b[props]) {
        return 1;
    } else {
        return 0;
    }
};

export const getCustomerName = (value) => 'U-' + value.slice(0, 6).toUpperCase();

export const getMainVersion = (version) => version.match(/^(\d+\.)?(\d+)/)[0].split('.');

export const formatDate = (date, formatStr='YYYY-MM-DD hh:mm') =>{
    var dateObj = new Date(date);

    var str = formatStr;

    str = str.replace(/yyyy|YYYY/, dateObj.getFullYear());
    str = str.replace(/MM/, (dateObj.getMonth() + 1) > 9 ? (dateObj.getMonth() + 1).toString() : '0' + (dateObj.getMonth() + 1));
    str = str.replace(/dd|DD/, dateObj.getDate() > 9 ? dateObj.getDate().toString() : '0' + dateObj.getDate());
    str = str.replace(/hh|HH/, dateObj.getHours() > 9 ? dateObj.getHours().toString() : '0' + dateObj.getHours());
    str = str.replace(/mm/, dateObj.getMinutes() > 9 ? dateObj.getMinutes().toString() : '0' + dateObj.getMinutes());
    str = str.replace(/ss|SS/, dateObj.getSeconds() > 9 ? dateObj.getSeconds().toString() : '0' + dateObj.getSeconds());

    return str;
};