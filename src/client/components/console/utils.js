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

export const formatDate = (date) => date.slice(0, 10) + ' ' + date.slice(11, 16);

export const getMainVersion = (version) => version.match(/^(\d+\.)?(\d+)/)[0].split('.');