export function formatISOStringToReadableDate(isoString, {
    day = true,
    month_numeric = false,
    year = true,
    time = false
} = {}) {
    if (!isoString) return '';

    const date = new Date(isoString);
    const options = {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    if (year) options.year = 'numeric';
    if (day) {
        options.month = month_numeric ? 'numeric' : 'long';
        options.day = 'numeric';
    }
    if (time) {
        options.hour = 'numeric';
        options.minute = 'numeric';
        options.hour12 = true;
    }

    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    return new Intl.DateTimeFormat(locale, options).format(date);
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

export function formatTitleCase(str) {
    return (str || '').replace(/\b\w/g, (match) => match.toUpperCase());
}
