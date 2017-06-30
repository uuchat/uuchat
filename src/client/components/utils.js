/**
 * Created by lwc on 2017/6/17.
 */


function String2int(str){
    if(str !== 0){
        return parseInt(str.substr(0, 1), 16) % 16;
    }else{
        return str;
    }

}

export function getStringLength(str){
    var realLength = 0, len = str.length, charCode = -1;
    for (var i = 0; i < len; i++) {
        charCode = str.charCodeAt(i);
        if (charCode >= 0 && charCode <= 128) realLength += 1;
        else realLength += 2;
    }
    return realLength;
}
export function cutStr(str, star, len){
    var str_length = star,
        str_len = 0,
        str_cut = '';

    str_len = str.length;

    for (var i = star; i < str_len; i++) {
        var a = str.charAt(i);
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