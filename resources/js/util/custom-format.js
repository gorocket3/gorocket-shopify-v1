export function formatISOStringToReadableDate(isoString, { day = true, year = true, time = false } = {}) {
    const date = new Date(isoString);
    const options = { timeZone: 'UTC' };

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
