function sortnumber(n1, n2) {
    if (n1 === null && n2 === null) {
        return 0;
    }
    if (n1 === null) {
        return -1;
    }
    if (n2 === null) {
        return 1;
    }
    return n1 - n2;
}

function unComma(txt) {
    if (txt && txt.replace) return txt.replace(/,/gi, "") * 1;

    return 0;
}

function Comma(numstr) {
    var numstr = String(numstr);
    var re0 = /(\d+)(\d{3})($|\..*)/;
    if (re0.test(numstr)) return numstr.replace(re0, function (str, p1, p2, p3) {
        return Comma(p1) + "," + p2 + p3;
    }); else return numstr;
}

function com(obj) {
    obj.value = numberFormat(unComma(obj.value));
}
