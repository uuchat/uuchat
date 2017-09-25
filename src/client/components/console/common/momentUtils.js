import moment from 'moment';

export const formatDate = (date, formatStr = 'YYYY-MM-DD HH:mm') => moment(date).format(formatStr);

export const fromNow = (date) => moment(date).fromNow();