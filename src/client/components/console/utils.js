/**
 * Created by jianzhiqiang on 2017/6/17.
 */


const sortFilterByProps = (a, b, props) => {
    if (a[props] > b[props]) {
        return -1;
    } else if (a[props] < b[props]) {
        return 1;
    } else {
        return 0;
    }
}

export { sortFilterByProps };