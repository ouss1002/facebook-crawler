function timeFromDate(date) {
	let temp = date.split("T")[1].split(".")[0];
	temp = temp.split(":");

	return temp[0] + ":" + temp[1];
}

function formatToNum(text) {
	return parseInt(text.split(' ')[0].replace(',', ''));
}

function isNum(char) {
    return char >= '0' && char <= '9';
}

function checkStringForNumber(arr) {
    for(ele of arr) {
        if(typeof ele == 'string') {
            if(isNum(ele[0])) {
                return ele;
            }
        }
    }

    return '0';
}

function normalizeLinks(list) {

    let ret = [];

    for(let link of list) {
        link = link.trim();
        ret.push(link[link.length - 1] == '/' ? link.slice(0, link.length - 1) : link);
    }

    return ret;
}

function getDirectoryFromDate(date) {
    let d = new Date(date);
    if(d.toString() == 'Invalid Date') {
        return '__NO_DATE__';
    }

    let arr = date.split('T');

    let ret = arr[0] + '_' + arr[1].split('.')[0].split(':').join(';');

    return ret;
}

function numToDay(number) {
    switch(number) {
        case 1:
            return 'Monday';
        case 2:
            return 'Tuesday';
        case 3:
            return 'Wednesday';
        case 4:
            return 'Thursday';
        case 5:
            return 'Friday';
        case 6:
            return 'Saturday';
        case 7:
            return 'Sunday';
        default:
            return '';
    }
}


module.exports = {
    timeFromDate,
    formatToNum,
    checkStringForNumber,
    normalizeLinks,
    getDirectoryFromDate,
}