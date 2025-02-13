function openPopup(win_name, url, width, height, top, left, is_center, is_resize, is_scroll) {
    var features = "";

    width = (width != "" && width > 0) ? width : 300;
    height = (height != "" && height > 0) ? height : 300;
    features += "width=" + width + ",height=" + height;

    if (window.screen) {
        if (is_center) {
            left = (screen.width - width) / 2;
            top = (screen.height - height) / 2;
            features += ",left=" + left + ",top=" + top;
        } else {
            left = (left != "" && left > 0) ? left : 0;
            top = (top != "" && top > 0) ? top : 0;
            features += ",left=" + left + ",top=" + top;
        }
    }

    if (is_resize) {
        features += ",resizable=yes";
    } else {
        features += ",resizable=no";
    }

    if (is_scroll) {
        features += ",scrollbars=yes";
    } else {
        features += ",scrollbars=no";
    }

    if (url.indexOf("about:blank") > -1) {
        url = "";
    }

    var w = window.open(url, win_name, features);
    try {
        w.focus();
    } catch (e) {
    }

    return w;
}

function toNumber(num) {
    if (Number(num)) {
        return Number(num);
    } else {
        num = String(num).replace(/,/g, '');
        if (Number(num)) {
            return Number(num);
        } else {
            return num;
        }
    }
}

function unComma(txt) {
    if (txt && txt.replace) return txt.replace(/,/gi, '') * 1

    return 0;
};

/*
	Function: Comma
		받아온 numstr에 ','를 추가하여 Return

	Parameters:
		numstr - string value

	Returns:
		콤마처리한 숫자
*/
function Comma(numstr) {
    var numstr = String(numstr);
    var re0 = /(\d+)(\d{3})($|\..*)/;
    if (re0.test(numstr))
        return numstr.replace(re0, function (str, p1, p2, p3) {
            return Comma(p1) + "," + p2 + p3;
        });
    else
        return numstr;
}

function com(obj) {
    obj.value = numberFormat(unComma(obj.value));
};

//타입이 숫자고 ,로 자리수 표현을 하지 않을 경우
function onlynum(obj) {
    let val = obj.value;

    if (isNaN(val * 1)) {
        obj.value = 0;
        return;
    }
    ;
};

//타입이 숫자고 ,로 자리수 표현을 할경우
function currency(obj) {
    let val = unComma(obj.value);

    if (isNaN(val)) {
        obj.value = 0;
        return;
    }
    ;

    com(obj);
};

/*
	Function: getRadioValue
		체크된 라디오버튼 값

	Parameters:
		obj - RadioButton object

	Returns:
		체크된 라디오버튼 값
*/
function getRadioValue(obj) {
    if (obj) {
        if (obj.length) {
            for (i = 0; i < obj.length; i++) {
                if (obj[i].checked == true) {
                    return obj[i].value;
                }
            }
        } else {
            return obj.value;
        }
    } else {
        return false;
    }
}

function setDateType(type, obj_sdate, obj_edate) {
    if (type === "0D") {
        const date = new Date();
        const sdate = $.datepicker.formatDate('yy-mm-dd', date);
        obj_sdate.val(sdate);
        obj_edate.val(sdate);
    } else if (type === "1D") {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const sdate = $.datepicker.formatDate('yy-mm-dd', yesterday);
        obj_sdate.val(sdate);
        obj_edate.val(sdate);
    } else if (type === "7D") {
        const date = new Date();
        date.setDate(date.getDate() - 7);
        const sdate = $.datepicker.formatDate('yy-mm-dd', date);
        const edate = $.datepicker.formatDate('yy-mm-dd', new Date());
        obj_sdate.val(sdate);
        obj_edate.val(edate);
    } else if (type === "14D") {
        const date = new Date();
        date.setDate(date.getDate() - 14);
        const sdate = $.datepicker.formatDate('yy-mm-dd', date);
        const edate = $.datepicker.formatDate('yy-mm-dd', new Date());
        obj_sdate.val(sdate);
        obj_edate.val(edate);
    } else if (type === "30D") {
        const date = new Date();
        const firstDay = new Date(date.getFullYear(), date.getMonth() - 1, date.getDate());
        const sdate = $.datepicker.formatDate('yy-mm-dd', firstDay);
        const edate = $.datepicker.formatDate('yy-mm-dd', new Date());
        obj_sdate.val(sdate);
        obj_edate.val(edate);
    } else if (type === "0M") {
        const date = new Date();
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        const sdate = $.datepicker.formatDate('yy-mm-dd', firstDay);
        const edate = $.datepicker.formatDate('yy-mm-dd', new Date());
        obj_sdate.val(sdate);
        obj_edate.val(edate);
    } else if (type === "1M") {
        const date = new Date();
        const firstDay = new Date(date.getFullYear(), date.getMonth() - 1, 1);
        const lastDay = new Date(date.getFullYear(), date.getMonth(), 0);
        const sdate = $.datepicker.formatDate('yy-mm-dd', firstDay);
        const edate = $.datepicker.formatDate('yy-mm-dd', lastDay);
        obj_sdate.val(sdate);
        obj_edate.val(edate);
    }
}
