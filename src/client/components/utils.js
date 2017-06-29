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

export default String2int;