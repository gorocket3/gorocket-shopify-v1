/*
 *
 * 그리드 출력 형식 정의 - 추후 별도의 js 로 만들기
 *
 * */
function openProduct(prd_no) {
    var url = "/head/product/prd01/" + prd_no;
    var product = window.open(url, "_blank", "toolbar=no,scrollbars=yes,resizable=yes,status=yes,top=500,left=500,width=1024,height=900");
}

function openPopupGift(gift_no) {
    let url = `/head/promotion/prm06/${gift_no}`;
    window.open(url, "_blank", "resizable=yes,scrollbars=yes", 1000, 700);
}

function openHeadProduct(prd_no) {
    var url = "/head/product/prd01/" + prd_no;
    var product = window.open(url, "_blank", "toolbar=no,scrollbars=yes,resizable=yes,status=yes,top=500,left=500,width=1024,height=900");
}

function stockHistoryPop(url, param) {
    const directUrl = `/head/stock/stk01/${url}?goods_opt=${param}`;
    window.open(directUrl, "_blank", "toolbar=no,scrollbars=yes,resizable=yes,status=yes,top=500,left=500,width=800,height=768");
}

function openOrder(ord_no, ord_opt_no) {
    var url = "/head/order/ord01/" + ord_no;
    var order = window.open(url, "_blank", "toolbar=no,scrollbars=yes,resizable=yes,status=yes,top=500,left=500,width=1200,height=900");
}

function openHeadOrder(ord_no, ord_opt_no) {
    var url = "/head/order/ord01/" + ord_no + "/" + ord_opt_no;
    var order = window.open(url, "_blank", "toolbar=no,scrollbars=yes,resizable=yes,status=yes,top=500,left=500,width=1200,height=900");
}

function openHeadOrderOpt(ord_opt_no) {
    var url = "/head/order/ord01/ord_no/" + ord_opt_no;
    var order = window.open(url, "_blank", "toolbar=no,scrollbars=yes,resizable=yes,status=yes,top=500,left=500,width=1200,height=900");
}

function openStock(goods_no, goods_opt) {
    var url = "/head/stock/stk01/" + goods_no + "/" + goods_opt;
    var stock = window.open(url, "_blank", "toolbar=no,scrollbars=yes,resizable=yes,status=yes,top=500,left=500,width=800,height=768");
}

function openHeadStock(goods_no, goods_opt) {
    var url = "/head/stock/stk01/" + goods_no + "?goods_opt=" + goods_opt;
    var stock = window.open(url, "_blank", "toolbar=no,scrollbars=yes,resizable=yes,status=yes,top=500,left=500,width=1024,height=768");
}

function openDaySales(sales_no) {
    var url = "head/sales/sal02/" + sales_no;
    var sales = window.open(url, "_blank", "toolbar=no,scrollbars=yes,resizable=yes,status=yes,top=500,left=500,width=1024,height=900");
}

function openSmsSend(phone = "", name = "") {
    var url = "/head/api/sms/send?phone=" + phone + "&name=" + name;
    window.open(url, "_blank", "toolbar=no,scrollbars=yes,resizable=yes,status=yes,top=500,left=500,width=800,height=768");
}

function openSmsList(phone = "", name = "") {
    var url = "/head/api/sms/list?phone=" + phone + "&name=" + name;
    window.open(url, "_blank", "toolbar=no,scrollbars=yes,resizable=yes,status=yes,top=500,left=500,width=800,height=768");
}

function openSchDetail(idx = "") {
    const url = `/head/promotion/prm32/show/${idx}`;
    window.open(url, "_blank", "toolbar=no,scrollbars=yes,resizable=yes,status=yes,top=500,left=500,width=800,height=400");
}

function openSchPop(kwd) {
    const url = `https://bizest.fjallraven.co.kr/app/product/search?q=${kwd}`;
    window.open(url, "_blank", "toolbar=no,scrollbars=yes,resizable=yes,status=yes,top=500,left=500,width=1200,height=800");
}

function openSitePop(surl, goods_no) {
    const url = `bizest.fjallraven.co.kr/app/product/detail/${goods_no}/0`;
    window.open(url, "_blank", "toolbar=no,scrollbars=yes,resizable=yes,status=yes,top=500,left=500,width=1200,height=800");
}

/**
 *
 * @param {*} data
 *  row별 구분은 ,로 합니다.
 *  column별 구분은 |로 합니다.
 *      ex)user_id|no|ord_no,user_id|no|ord_no
 * @param {*} point_kinds
 */
function openAddPoint(data = "", point_kinds = 1, open_window = "") {
    var url = "/head/api/point?data=" + data + "&point_kinds=" + point_kinds + "&open_window=" + open_window;
    window.open(url, "_blank", "toolbar=no,scrollbars=yes,resizable=yes,status=yes,top=500,left=500,width=800,height=768");
}

/**
 * 해당 메서드는 mem01화면을 팝업 형식으로 띄워줍니다.
 * 회원을 선택 후 회원선택 버튼을 눌렀을 경우
 * opener에 usersCallback 메서드가 있으면
 * 해당 메서드에 선택된 회원의 정보를 전달합니다.
 */
function openUserSelect() {
    var url = "/head/member/mem01/pop";
    window.open(url, "_blank", "toolbar=no,scrollbars=yes,resizable=yes,status=yes,top=500,left=500,width=800,height=900");
}

function openUserEdit(id = "") {
    var url = "/head/member/mem01/show/edit/" + id;
    window.open(url, "_blank", "toolbar=no,scrollbars=yes,resizable=yes,status=yes,top=500,left=500,width=800,height=768");
}

/**
 * [쿠폰지급 버튼]
 * user_ids와 coupon_nos의 구분은 ,로 해주세요
 *
 * @param {*} user_ids
 *   ex)test1,test2,test3
 *
 * @param {*} coupon_nos
 *   ex)1635,1634,1633,1632
 */
function openCoupon(user_ids = "", coupon_nos = "") {
    const url = `/head/promotion/prm10/gift?user_ids=${user_ids}&coupon_nos=${coupon_nos}`;
    window.open(url, "_blank", "toolbar=no,scrollbars=yes,resizable=yes,status=yes,top=500,left=500,width=1200,height=800");
}

/**
 * 해당 메서드는 prm10화면을 팝업 형식으로 띄워줍니다.
 * 쿠폰을 선택 후 쿠폰선택 버튼을 눌렀을 경우
 * opener에 couponSelectedCallback 메서드가 있으면
 * 해당 메서드에 선택된 쿠폰의 정보를 전달합니다.
 */
function openCouponSelect() {
    const url = `/head/promotion/prm10/pop`;
    window.open(url, "_blank", "toolbar=no,scrollbars=yes,resizable=yes,status=yes,top=500,left=500,width=1200,height=800");
}

function openCouponDetail(type = "add", no = "") {
    var url = `/head/promotion/prm10/show/${type}/${no}`;
    window.open(url, "_blank", "toolbar=no,scrollbars=yes,resizable=yes,status=yes,top=500,left=500,width=800,height=768");
}

/** GNB layer 오픈/닫힘 */
function openGNB(element) {
    $("#gnb").toggleClass('d-none');
    $(element).toggleClass('act');

    if ($(element).hasClass('act')) $("#gnb_search_keyword").focus();
}

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

function StyleGoodsType(params) {
    var state = {
        P: "#F90000", S: "#009999", O: "#0000FF"
    };
    if (params.value !== undefined) {
        if (state[params.data.goods_type]) {
            var color = state[params.data.goods_type];
            return {
                color: color, "text-align": "center"
            };
        }
    }
}

function StyleGoodsTypeNM(params) {
    var state = {
        위탁: "#ff0000", 매입: "#669900", 해외: "#0000FF"
    };
    if (params.value !== undefined) {
        if (state[params.value]) {
            var color = state[params.value];
            return {
                color: color, "text-align": "center", // "line-height": "40px"
            };
        }
    }
}

function StyleGoodsState(params) {
    var state = {
        판매중지: "#808080",
        등록대기중: "#669900",
        판매대기중: "#000000",
        임시저장: "#000000",
        판매중: "#0000ff",
        "품절[수동]": "#ff0000",
        품절: "#AAAAAA",
        휴지통: "#AAAAAA"
    };
    if (params.value !== undefined) {
        if (state[params.value]) {
            var color = state[params.value];
            return {
                color: color, "text-align": "center"
            };
        }
    }
}

function StyleGoodsStateLH50(params) {
    var state = {
        판매중지: "#808080",
        등록대기중: "#669900",
        판매대기중: "#000000",
        임시저장: "#000000",
        판매중: "#0000ff",
        "품절[수동]": "#ff0000",
        품절: "#AAAAAA",
        휴지통: "#AAAAAA"
    };
    if (params.value !== undefined) {
        if (state[params.value]) {
            var color = state[params.value];
            return {
                color: color, "text-align": "center", // "line-height": "40px"
            };
        }
    }
}

function StyleOrdKind(params) {
    var state = {
        정상: "#0000ff", 출고가능: "#0000ff", 출고보류: "#669900", "출고보류(예약)": "#669900"
    };
    if (state[params.value]) {
        var color = state[params.value];
        return {
            color: color, "text-align": "center"
        };
    }
}

function StyleOrdState(params) {
    var state = {
        입금예정: "#669900",
        입금완료: "#ff0000",
        출고요청: "#0000ff",
        출고처리중: "#0000ff",
        출고완료: "#0000ff",
        주문취소: "#0000ff",
        결제오류: "#ff0000",
        구매확정: "#0000ff",
        환불완료: "#ff0000",
        교환완료: "#ff0000",
    };

    var state_bd = {
        입금예정: "", 입금완료: "", 출고요청: "", 출고처리중: "900", 출고완료: "900", 주문취소: "", 결제오류: "", 구매확정: "", 환불완료: "900", 교환완료: "900",
    };

    var color = state[params.value];
    var bold = state_bd[params.value];
    return {
        color: color, fontWeight: bold, "text-align": "center"
    };
}

function StylePayState(params) {
    const state = {
        "예정": "#ff2222", "입금": "#222222",
    }

    return {
        "color": state[params.value] || "inherit", "text-align": "center",
    };
}

function StyleClmState(params) {
    if (params.value != "") {
        return {
            color: "#FF0000", "font-weight": "bold", "text-align": "center"
        };
    }
}

var _styleOrdNoCnt = 0;
var _styleColorIndex = -1;

function StyleOrdNo(params) {
    if (params.value !== undefined) {
        var colors = {
            0: "#ffff00", 1: "#C5FF9D"
        };
        var rowIndex = params.node.rowIndex;
        if (rowIndex > 0 && params.data.ord_no_bg_color === undefined) {
            var rowNode = params.api.getDisplayedRowAtIndex(rowIndex - 1);
            if (params.value == rowNode.data.ord_no) {
                _styleColorIndex = _styleOrdNoCnt % 2;
                params.data["ord_no_bg_color"] = colors[_styleColorIndex];
                rowNode.data["ord_no_bg_color"] = colors[_styleColorIndex];
                setTimeout(function () {
                    params.api.redrawRows({ rowNodes: [ rowNode ] });
                }, 0);
            } else {
                if (_styleColorIndex >= 0) {
                    _styleOrdNoCnt++;
                    _styleColorIndex = -1;
                }
            }
        }
        if (params.data.ord_no_bg_color !== undefined || params.data.ord_no_bg_color != "") {
            return {
                "background-color": params.data.ord_no_bg_color
            };
        }
    }
}

const StyleEditCell = {
    background: "#ffff99", "border-right": "1px solid #e0e7e7"
};

function unComma(txt) {
    if (txt && txt.replace) return txt.replace(/,/gi, "") * 1;

    return 0;
}

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
    if (re0.test(numstr)) return numstr.replace(re0, function (str, p1, p2, p3) {
        return Comma(p1) + "," + p2 + p3;
    }); else return numstr;
}

function com(obj) {
    obj.value = numberFormat(unComma(obj.value));
}

//타입이 숫자고 ,로 자리수 표현을 하지 않을 경우
function onlynum(obj) {
    let val = obj.value;

    if (isNaN(val * 1)) {
        obj.value = 0;
        return;
    }
}

//타입이 숫자고 ,로 자리수 표현을 할경우
function currency(obj) {
    let val = unComma(obj.value);

    if (isNaN(val)) {
        obj.value = 0;
        return;
    }

    com(obj);
}

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


/* grid selected cell delete & backspace key 클릭 시 내용 삭제 기능 관련 + 방향키 셀 이동기능 */
function getDeleteCellColumnObject() {
    return {
        suppressKeyboardEvent: params => {
            if (!params.editing) {
                let isBackspaceKey = params.event.keyCode === 8;
                let isDeleteKey = params.event.keyCode === 46;

                if (isDeleteKey || isBackspaceKey) {
                    params.api.getCellRanges().forEach(r => {
                        let colIds = r.columns.map(col => col.colId);
                        let startRowIndex = Math.min(r.startRow.rowIndex, r.endRow.rowIndex);
                        let endRowIndex = Math.max(r.startRow.rowIndex, r.endRow.rowIndex);

                        for (let i = startRowIndex; i <= endRowIndex; i++) {
                            let rowNode = params.api.getRowNode(i);
                            colIds.forEach(column => {
                                rowNode.setDataValue(column, '');
                            });
                        }
                    });

                    return true;
                }
            } else {
                let key = params.event.key;
                if (params.editing) {
                    if (key == 'ArrowDown') {
                        if (params.api.getDisplayedRowCount() > params.node.rowIndex + 1) {
                            params.api.setFocusedCell(params.node.rowIndex + 1, params.column);
                        } else {
                            params.api.stopEditing();
                            params.api.setFocusedCell(params.node.rowIndex, params.column);
                        }
                    } else if (key == 'ArrowUp') {
                        if (params.api.getDisplayedRowCount() > params.node.rowIndex + 1) {
                            params.api.setFocusedCell(params.node.rowIndex + 1, params.column);
                        } else {
                            params.api.stopEditing();
                            params.api.setFocusedCell(params.node.rowIndex, params.column);
                        }
                    } else if (key == 'ArrowLeft') {
                        if (params.event.target.selectionStart < 1) {
                            params.api.stopEditing();
                        }
                    } else if (key == 'ArrowRight') {
                        if (params.event.target.selectionStart >= params.event.target.value.length) {
                            params.api.stopEditing();
                        }
                    }
                }
            }
            return false;
        },
    }
}

/*******************************************************************************
 * 문자열 길이를 리턴한다.
 *******************************************************************************/
function getLength(str) {
    var length = 0;

    for (var i = 0; i < str.length; i++) {
        if (encodeURI(str.charAt(i)).length >= 4) length += 2; else if (encodeURI(str.charAt(i)) == "%A7") length += 2; else if (encodeURI(str.charAt(i)) != "%0D") length++;
    }

    return length;
}

/*******************************************************************************
 * 문자열 자르기
 *******************************************************************************/
function stringCut(str, max_length) {
    var count = 0;

    for (var i = 0; i < str.length; i++) {
        if (encodeURI(str.charAt(i)).length >= 4) count += 2; else if (encodeURI(str.charAt(i)) != "%0D") count++;

        if (count > max_length) {
            if (encodeURI(str.charAt(i)) == "%0A") i--;
            break;
        }
    }

    return str.substring(0, i);
}

//json 예외문자 치환
function escape(str) {
    return str
        .replace(/[\\]/g, '\\\\')
        .replace(/[\"]/g, '\\\"')
        .replace(/[\']/g, '\\\'')
        .replace(/[\/]/g, '\\/')
        .replace(/[\b]/g, '\\b')
        .replace(/[\f]/g, '\\f')
        .replace(/[\n]/g, '\\n')
        .replace(/[\r]/g, '\\r')
        .replace(/[\t]/g, '\\t');
};

//글자, 숫자만 필터
function filter_pid(str) {
    return str.replace('/^[A-Za-z0-9+]*$/', '');
}

function indiv_grid_save2(pid, column_data) {

    let data = {
        'pid': pid, 'indiv_columns': escape(JSON.stringify(column_data, function (key, value) {
            if (typeof value === 'function') {
                return value.toString();
            }
            return value;
        }))
    }

    $.ajax({
        method: 'post', url: '/head/indiv-columns/save', data: data, success: function (data) {
            console.log(data);
        }, error: function (request, status, error) {
            console.log("error")
        }
    });
}

function indiv_grid_init2(pid) {

    let data = {
        'pid': pid
    }

    $.ajax({
        method: 'delete', url: '/head/indiv-columns/init', data: data, success: function (data) {
            console.log(data);
        }, error: function (request, status, error) {
            console.log("error")
        }
    });
}

function get_indiv_columns2(pid, callback) {
    $.ajax({
        method: 'get', url: `/head/indiv-columns/get?pid=${pid}`, success: function (data) {
            let parseData = null;
            if (data.body !== null) {
                parseData = JSON.parse(data.body.indiv_columns, function parser(key, value) {
                    if (typeof value == "object" && value != null) {
                        return value;
                    } else if (String(value).includes('function') > 0 || String(value).indexOf('(') === 0) {
                        return eval("(" + value + ")");
                    } else {
                        return value;
                    }
                });

                //그리드 자체 오류로 인한 null 값 제거
                parseData.forEach(d => {
                    Object.keys(d).forEach((key) => (d[key] == null) && delete d[key]);
                });
            }

            callback.call(this, parseData);
        }, error: function (request, status, error) {
            console.log("error")
        }
    });
}

function clone(o) {
    if (!isObject(o)) {
        throw 'o must be a a non-function object';
    }
    return (function inner(a, b = {}) {
        Object.keys(a).forEach(k => {
            isObject(a[k]) ? b[k] = inner(a[k]) : b[k] = a[k];
        });
        return b;
    }(o));
}

function isObject(o) {
    return o !== null && typeof o === 'object'
}

function get_indiv_columns(pid, columns, callback) {
    $.ajax({
        method: 'get', url: `/head/com01/get?pid=${pid}`, success: function (data) {
            let parseData = null;
            let resData = [];

            if (data.body.indiv_columns.length > 0) {
                parseData = JSON.parse(data.body.indiv_columns);
                parseData.forEach((value) => {
                    columns.forEach((col) => {
                        if (value['field'] === col['field']) {
                            if (value['children'].length > 0) {
                                let value_children = value['children'];
                                let col_children = col['children'];
                                let new_children = [];

                                if (value['hide'] === true) {
                                    resData.push(Object.assign(clone(col), { 'hide': true }));
                                } else {
                                    Object.keys(value_children).forEach((key) => {
                                        if (value_children[key]['hide'] === true) {
                                            new_children.push(Object.assign(col_children[key], { 'hide': true }));
                                        } else {
                                            new_children.push(col_children[key]);
                                        }
                                    });

                                    col['children'] = new_children;
                                    resData.push(col);
                                }
                            } else {
                                if (value['hide'] === true) {
                                    resData.push(Object.assign(clone(col), { 'hide': true }));
                                } else {
                                    resData.push(clone(col));
                                }
                            }
                        }

                    })
                });
            }

            if (resData.length === 0) {
                callback.call(this, columns);
            } else {
                callback.call(this, resData);
            }
        }, error: function (request, status, error) {
            console.log("error")
        }
    });
}

function indiv_grid_save(pid, gx) {
    let column_datalist = gx.gridOptions.api.getColumnDefs();
    let new_column_datalist = [];

    column_datalist.forEach((value) => {
        let value_children = value['children'];
        let newchildren = [];

        if (value['children'] !== undefined) {
            value_children.forEach((val) => {
                newchildren.push({ 'field': val['field'], 'hide': val['hide'] });
            });
        }

        new_column_datalist.push({ 'field': value['field'], 'hide': value['hide'], 'children': newchildren });
    });

    let data = {
        'pid': pid, 'indiv_columns': JSON.stringify(new_column_datalist)
    }

    $.ajax({
        method: 'post', url: '/head/com01/save', data: data, success: function (data) {
            console.log(data);
            window.location.reload();
        }, error: function (request, status, error) {
            console.log("error")
        }
    });
}

function indiv_grid_init(pid) {
    let data = {
        'pid': pid
    }

    $.ajax({
        method: 'delete', url: '/head/com01/init', data: data, success: function (data) {
            console.log(data);
            window.location.reload();
        }, error: function (request, status, error) {
            console.log("error")
        }
    });
}

/** 포커스된 셀 중 column이 1개 이하일 때는 header 제외, 2개 이상일 때는 header 포함하여 클립보드에 복사하기 */
function getCopyFocusedCellToClipboardObject(hdGridName = 'gx') {
    return {
        sendToClipboard: function (params) {
            let headers = "";
            const focused_cells = eval(hdGridName).gridOptions.api.getCellRanges();
            if (focused_cells.length < 1) return;
            if (focused_cells[0].columns.length > 1) {
                focused_cells[0].columns.forEach((cell, i) => {
                    headers += `${cell.colDef.headerName}`;
                    if (i < focused_cells[0].columns.length - 1) headers += "\t";
                });
                headers += "\r\n";
            }
            window.navigator.clipboard.writeText(headers + params.data);
        }, suppressCopyRowsToClipboard: true,
    }
}
