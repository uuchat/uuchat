import FileSaver from 'file-saver';

export const saveCSV = (data, options) => {
    data = data || [];
    options = options || {};

    const delimiter = options.delimiter || ';';

    let filename = options.filename || 'list.csv';
    if (filename.indexOf('.csv') === -1) filename += '.csv';

    let headers = options.headers || [];
    if (!headers.length && data.length) {
        headers = Object.keys(data[0]);
    }

    let str = headers.join(delimiter);

    var hll = headers.length - 1;

    data.forEach(item => {
        str += '\n';

        headers.forEach((key, index) => {
            if (index === hll) {
                str += item[key];
            } else {
                str += item[key] + delimiter;
            }
        });

    });

    let exportContent = "\uFEFF";

    let blob = new Blob([exportContent + str], {
        type: "text/plain;charset=utf-8"
    });

    FileSaver.saveAs(blob, filename);
};