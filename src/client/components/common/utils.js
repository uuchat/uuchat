function String2int(str){
    if (str !== 0) {
        return parseInt(str.substr(0, 1), 16) % 16;
    } else {
        return str;
    }
}

export function cutStr(str, len){
    let str_length = 0;
    let str_cut = '';
    let str_len = str.length;
    let a = '';

    for (let i = 0; i < str_len; i++) {
        a = str.charAt(i);
        str_length++;
        if (escape(a).length > 4) {
            str_length++;
        }
        str_cut = str_cut.concat(a);
        if (str_length >= len) {
            return str_cut;
        }
    }
    if (str_length < len) {
        return str;
    }
}

export function Base64DecodeUnicode(str) {
    try {
        return decodeURIComponent(atob(str).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    } catch (e) {
        return '';
    }
}


export default String2int;