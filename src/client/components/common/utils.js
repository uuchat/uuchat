function String2int(str){
    if (str !== 0) {
        return parseInt(str.substr(0, 1), 16) % 16;
    } else {
        return str;
    }

}

export function cutStr(str, len){
    var str_length = 0,
        str_cut = '',
        str_len = str.length,
        a = '';

    for (var i = 0; i < str_len; i++) {
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

export default String2int;