export function formatISOStringToReadableDate(isoString, { day = true, year = true, time = false } = {}) {
    const date = new Date(isoString);
    const options = {}; // UTC 유지 시, timeZone: 'UTC' 설정 필요

    if (year) options.year = 'numeric';
    if (day) {
        options.month = 'long';
        options.day = 'numeric';
    }
    if (time) {
        options.hour = 'numeric';
        options.minute = 'numeric';
        options.hour12 = true;
    }

    return new Intl.DateTimeFormat('en-US', options).format(date);
};

export function formatNumberWithCommas(value) {
    if (typeof value === "number") {
        return value.toLocaleString('en-US');
    } else if (typeof value === "string" && !isNaN(value)) {
        return Number(value).toLocaleString('en-US');
    } else {
        return value;
    }
}
