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

export const formatDate = (date, formatStr = 'YYYY-MM-DD hh:mm') => {
    const dateObj = new Date(date);

    let str = formatStr;

    str = str.replace(/yyyy|YYYY/, dateObj.getFullYear());
    str = str.replace(/MM/, (dateObj.getMonth() + 1) > 9 ? (dateObj.getMonth() + 1).toString() : '0' + (dateObj.getMonth() + 1));
    str = str.replace(/dd|DD/, dateObj.getDate() > 9 ? dateObj.getDate().toString() : '0' + dateObj.getDate());
    str = str.replace(/hh|HH/, dateObj.getHours() > 9 ? dateObj.getHours().toString() : '0' + dateObj.getHours());
    str = str.replace(/mm/, dateObj.getMinutes() > 9 ? dateObj.getMinutes().toString() : '0' + dateObj.getMinutes());
    str = str.replace(/ss|SS/, dateObj.getSeconds() > 9 ? dateObj.getSeconds().toString() : '0' + dateObj.getSeconds());

    return str;
};

export const fetchAsync = async (url, option) => await(option ? await fetch(url, option) : await fetch(url)).json();

export const getHashPath = () => {
    // We can't use window.location.hash here because it's not
    // consistent across browsers - Firefox will pre-decode it!
    const href = window.location.href;
    const hashIndex = href.indexOf("#");
    return hashIndex === -1 ? "" : href.substring(hashIndex + 1);
};

export const escapeHTML = (str) => {
    str = str || '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
};

export const unEscapeHTML = (str) => {
    str = str || '';
    return str.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&apos;/g, "'");
};