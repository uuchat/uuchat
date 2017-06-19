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

const getCustomerName = (value) => 'U-' + value.slice(0, 6).toUpperCase()

const formatDate = (date) => date.slice(0, 10) + ' ' + date.slice(11, 16)

export { sortFilterByProps, getCustomerName, formatDate };