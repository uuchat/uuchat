import moment from 'moment';

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

export const formatDate = (date, formatStr = 'YYYY-MM-DD hh:mm') => moment(date).format(formatStr);

export const fromNow = (date) => moment(date).fromNow();