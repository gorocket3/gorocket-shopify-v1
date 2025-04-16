function numberWithCommas(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

function formatNumber(params) {
    // this puts commas into the number eg 1000 goes to 1,000,
    // i pulled this from stack overflow, i have no idea how it works
    if (params.value !== undefined && params.value != "") {
        //console.log( params.data.종목코드 + ' - ' + Number(params.value) );
        if (!isNaN(Number(params.value))) {
            if (params.colDef.precision > 0) {
                return Number(params.value).toFixed(params.colDef.precision);
            } else {
                return Math.floor(params.value)
                    .toString()
                    .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
            }
        } else {
            return params.value;
        }
    } else {
        return params.value;
    }
}

function formatDate(date) {
    return date.replace('T', ' ').replace(/\.\d+Z$/, '');
}

// 셀 입력중, 키보드방향키로 셀 이동 (suppressKeyboardEvent)
function setArrowKeyboardEvent(e) {
    let key = e.event.key;

    if (e.editing) {
        if (key == 'ArrowDown') {
            if (e.api.getDisplayedRowCount() > e.node.rowIndex + 1) {
                e.api.setFocusedCell(e.node.rowIndex + 1, e.column);
            } else {
                e.api.stopEditing();
                e.api.setFocusedCell(e.node.rowIndex, e.column);
            }
        } else if (key == 'ArrowUp') {
            if (e.api.getDisplayedRowCount() > e.node.rowIndex + 1) {
                e.api.setFocusedCell(e.node.rowIndex + 1, e.column);
            } else {
                e.api.stopEditing();
                e.api.setFocusedCell(e.node.rowIndex, e.column);
            }
        } else if (key == 'ArrowLeft') {
            if (e.event.target.selectionStart < 1) {
                e.api.stopEditing();
            }
        } else if (key == 'ArrowRight') {
            if (e.event.target.value !== undefined) {
                if (e.event.target.selectionStart >= e.event.target.value.length) {
                    e.api.stopEditing();
                }
            }
        }
    }
};

function HDGrid(gridDiv, columns, optionMixin = {}) {
    this.id = gridDiv.id.replace("div-", "");
    this.gridDiv = gridDiv;
    this.gridTotal = this.id + '-total';
    this.gridCurrent = this.id + '-current';
    this.is_agg = false;

    const getCustomColumns = (columns) => {
        const applied_columns = columns.map((column) => {
            if (!!column.editable) {
                column.headerClass = column.hasOwnProperty("headerClass") ? `${column.headerClass} ag-header-cell-editable` : 'ag-header-cell-editable';
            }
            if (column.hasOwnProperty("children")) {
                column.children = getCustomColumns(column.children);
            }
            return column;
        });
        return applied_columns;
    };

    this.gridOptions = {
        columnDefs: getCustomColumns(columns),
        defaultColDef: {
            suppressMenu: true, // set every column width
            flex: 1, // make every column editable
            resizable: true,
            // suppressSizeToFit: false,
            autoHeight: true,
            sortable: true,
            suppressKeyboardEvent: setArrowKeyboardEvent,
        },
        enableRangeSelection: true,
        columnTypes: {
            numberType: {
                //filter: 'agNumberColumnFilter',
                comparator: sortnumber, valueFormatter: formatNumber, cellClass: 'hd-grid-right',
            }, percentType: {

                //filter: 'agNumberColumnFilter',
                comparator: sortnumber,
                valueFormatter: formatNumber,
                cellClass: [ 'hd-grid-right', 'hd-grid-percent' ],
                precision: 2,
            },

            percentColorType: {
                //filter: 'agNumberColumnFilter',
                comparator: sortnumber,
                valueFormatter: formatNumber,
                cellClass: 'hd-grid-right',
                cellStyle: params => {
                    if (params.value > 0) {
                        return { color: 'red' };
                    } else if (params.value < 0) {
                        return { color: 'blue' };
                    } else {
                    }
                },
                precision: 2,
            },

            currencyType: {
                //filter: 'agNumberColumnFilter',
                comparator: sortnumber, valueFormatter: formatNumber, cellClass: 'hd-grid-right',
            },

            currencyColorType: {
                //filter: 'agNumberColumnFilter',
                comparator: sortnumber,
                valueFormatter: formatNumber,
                cellClass: 'hd-grid-right',
                cellStyle: params => {
                    if (params.value > 0) {
                        return { color: 'red' };
                    } else if (params.value < 0) {
                        return { color: 'blue' };
                    } else {
                    }
                },
            },

            currencyMinusColorType: {
                //filter: 'agNumberColumnFilter',
                comparator: sortnumber,
                valueFormatter: formatNumber,
                cellClass: 'hd-grid-right',
                cellStyle: params => {
                    if (params.value < 0) {
                        return { color: 'blue' };
                    } else {
                    }
                },
            },


            DayType: {
                //filter: 'agNumberColumnFilter',
                width: 120, cellClass: 'hd-grid-code',
            },
            DateTimeType: {
                //filter: 'agNumberColumnFilter',
                width: 130, cellClass: 'hd-grid-code',
            },
            CustomDateTimeType: {
                width: 135, cellClass: 'hd-grid-code',
                cellRenderer: function (params) {
                    return formatDate(params.value || '');
                }
            },

            NumType: {
                width: 50, maxWidth: 100, valueGetter: 'node.id', cellRenderer: 'loadingRenderer'
            }, GoodsStateType: {
                cellStyle: StyleGoodsState
            }, GoodsStateTypeLH50: {
                cellStyle: StyleGoodsStateLH50
            }, StyleGoodsTypeNM: {
                cellStyle: StyleGoodsTypeNM
            }, GoodsNameType: {
                width: 200, cellRenderer: function (params) {
                    if (params.value !== undefined) {
                        return '<a href="#" onclick="return openProduct(\'' + params.data.goods_no + '\');">' + params.value + '</a>';
                    }
                }
            }, HeadGoodsNameType: {
                width: 200, cellRenderer: function (params) {
                    if (params.value !== undefined) {
                        if (params.data.goods_no == null) return '존재하지 않는 상품입니다.';
                        return '<a href="#" onclick="return openHeadProduct(\'' + params.data.goods_no + '\');">' + params.value + '</a>';
                    }
                }
            }, StoreGoodsNameType: {
                width: 200, cellRenderer: function (params) {
                    if (params.value !== undefined) {
                        if (params.data.goods_no == null) return '존재하지 않는 상품입니다.';
                        return '<a href="#" onclick="return openStoreProduct(\'' + params.data.goods_no + '\');">' + params.value + '</a>';
                    }
                }
            }, HeadCouponType: {
                width: 200, cellRenderer: function (params) {
                    if (params.value !== undefined) {
                        return `<a href="#" onclick="return openCouponDetail('edit','${params.data.coupon_no}');">${params.value}</a>`;
                    }
                }
            }, GoodsImageType: {
                cellStyle: { 'text-align': 'center' }, cellRenderer: function (params) {
                    if (params.value !== undefined && params.value !== "" && params.value !== null) {
                        let front_url = params.colDef.surl;
                        let img = params.data ? params.data.img : params.value;
                        if (front_url == undefined) {
                            return '<a href="javascript:void(0);" onClick="return openSitePop(\'' + front_url + '\',\'' + params.data.goods_no + '\');"><img src="' + img + '" class="img" alt="" onerror="this.src=\'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==\'"/></a>';
                        } else {
                            return '<img src="' + img + '" class="img" alt="" onerror="this.src=\'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==\'"/></a>';
                        }
                    }
                }
            }, OrderNoType: {
                width: 170, cellRenderer: function (params) {
                    if (params.value !== undefined) {
                        return '<a href="#" onclick="return openOrder(\'' + params.value + '\',\'' + params.data.ord_opt_no + '\');">' + params.value + '</a>';
                    }
                }
            }, HeadOrderNoType: {
                width: 170, cellRenderer: function (params) {
                    if (params.value) {
                        return '<a href="#" onclick="return openHeadOrder(\'' + params.data.ord_no + '\',\'' + params.data.ord_opt_no + '\');">' + params.value + '</a>';
                    }
                }
            }, HeadOrdOptNoType: {
                width: 170, cellRenderer: function (params) {
                    if (params.value) {
                        return '<a href="#" onclick="return openHeadOrderOpt(\'' + params.data.ord_opt_no + '\');">' + params.value + '</a>';
                    }
                }
            }, HeadUserType: {
                cellRenderer: function (params) {
                    if (params.value !== undefined) {
                        if (params.data.user_id != "") return '<a href="#" onclick="return openUserEdit(\'' + params.data.user_id + '\');">' + params.value + '</a>'; else return params.value;
                    }
                }
            },

            ShopUserType: {
                cellRenderer: function (params) {
                    if (params.value !== undefined) {
                        if (params.data.user_id != "") return '<a href="#" onclick="return openUserEditShop(\'' + params.data.user_id + '\');">' + params.value + '</a>'; else return params.value;
                    }
                }
            },

            SearchType: {
                cellRenderer: function (params) {
                    if (params.value !== undefined) {
                        return '<a href="#" onclick="return openSchPop(\'' + params.data.kwd + '\');">' + params.value + '</a>';
                    }
                }
            }, SearchDetailType: {
                cellRenderer: function (params) {
                    if (params.value !== undefined) {
                        return '<a href="#" onclick="return openSchDetail(\'' + params.data.idx + '\');">' + params.value + '</a>';
                    }
                }
            }, PercentBarType: {
                cellRenderer: function (params) {
                    if (params.value !== undefined) {
                        var value = params.value;
                        var eDivPercentBar = document.createElement('div');
                        eDivPercentBar.className = 'div-percent-bar';
                        eDivPercentBar.style.width = value + '%';

                        if (value < 20) {
                            eDivPercentBar.style.backgroundColor = 'red';
                        } else if (value < 60) {
                            eDivPercentBar.style.backgroundColor = '#ff9900';
                        } else {
                            eDivPercentBar.style.backgroundColor = '#00A000';
                        }

                        var eValue = document.createElement('div');
                        eValue.className = 'div-percent-value';
                        eValue.innerHTML = value + '%';

                        var eOuterDiv = document.createElement('div');
                        eOuterDiv.className = 'div-outer-div';
                        eOuterDiv.appendChild(eDivPercentBar);
                        eOuterDiv.appendChild(eValue);
                        return eOuterDiv;
                    }
                }
            }, StoreNameType: {
                width: 200, cellRenderer: function (params) {
                    if (params.value !== undefined) {
                        return '<a href="javascript:void(0);" onclick="return openStore(\'' + params.data.store_cd + '\');">' + params.value + '</a>';
                    }
                }
            },

            ShopNameType: {
                width: 200, cellRenderer: function (params) {
                    if (params.value !== undefined) {
                        return '<a href="javascript:void(0);" onclick="return openStoreShop(\'' + params.data.store_cd + '\');">' + params.value + '</a>';
                    }
                }
            },

            StoreOrderNoType: {
                width: 140, cellClass: 'hd-grid-code', cellRenderer: function (params) {
                    if (params.value) {
                        return '<a href="javascript:void(0);" onclick="return openStoreOrder(\'' + params.data.ord_no + '\',\'' + params.data.ord_opt_no + '\');">' + params.value + '</a>';
                    }
                }
            },

            ShopOrderNoType: {
                width: 170, cellRenderer: function (params) {
                    if (params.value) {
                        return '<a href="javascript:void(0);" onclick="return openShopOrder(\'' + params.data.ord_no + '\',\'' + params.data.ord_opt_no + '\');">' + params.value + '</a>';
                    }
                }
            },
        },

        components: {
            loadingRenderer: function (params) {
                if (params.value !== undefined) {
                    return params.node.rowIndex + 1;
                }
            }
        },

        // overlayNoRowsTemplate:
        //     '<span style="padding: 10px; border: 2px solid #444; background: lightgoldenrodyellow;">Loading the next page...</span>',

        //enableCellTextSelection: true,

        // getRows:function(params){
        //     console.log('getRows ', params);
        // },
        rowData: [], rowSelection: 'multiple', suppressRowClickSelection: true, //rowDeselection: true,
        rowBuffer: 0, //onBodyScroll:onscroll,
        suppressColumnVirtualisation: true, suppressLastEmptyLineOnPaste: true, // fix: copy and paste error from excel

        // 첫글자 영문입력 막기 - 엔터키로 edit하도록 유도 // 임시주석처리 (2022-11-23 최유현)
        // suppressKeyboardEvent: (params) => {
        //     const key = params.event.key;
        //     const allowSome = ['Enter', 'ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown', 'Tab', 'Escape', 'Delete'];
        //     const allowClipBoard = ['c', 'v'];
        //     const isCtrlKeyPressed = params.event.ctrlKey;
        //     if ( allowSome.includes(key) || (isCtrlKeyPressed && allowClipBoard.includes(key)) ) {
        //         return false;
        //     } else {
        //         return true;
        //     }
        // },

        onColumnVisible: function (params) {
            params.api.resetRowHeights();
        },

        debug: false,

        // rowBuffer: 0,
        // suppressRowClickSelection: true,
        // // tell grid we want virtual row model type
        // //rowModelType: 'infinite',
        // // how big each page in our page cache will be, default is 100
        // paginationPageSize: 100,
        // // how many extra blank rows to display to the user at the end of the dataset,
        // // which sets the vertical scroll and then allows the grid to request viewing more rows of data.
        // // default is 1, ie show 1 row.
        // cacheOverflowSize: 2,
        // // how many server side requests to send at a time. if user is scrolling lots, then the requests
        // // are throttled down
        // maxConcurrentDatasourceRequests: 1,
        // // how many rows to initially show in the grid. having 1 shows a blank row, so it looks like
        // // the grid is loading from the users perspective (as we have a spinner in the first col)
        // infiniteInitialRowCount: 100,
        // // how many pages to store in cache. default is undefined, which allows an infinite sized cache,
        // // pages are never purged. this should be set for large data to stop your browser from getting
        // // full of data
        // maxBlocksInCache: 10,

        // debug: true,

        excelStyles: [ {
            id: 'cell', // font: { size: 11 },
        }, {
            id: 'header', // font: { size: 11 },
            alignment: {
                vertical: 'Center', horizontal: 'Center',
            }, interior: {
                color: '#f2f2f2', pattern: 'Solid',
            }, borders: {
                borderBottom: {
                    color: '#333', lineStyle: 'Continuous', weight: 2,
                }, borderRight: {
                    color: '#aaa', lineStyle: 'Continuous', weight: 1,
                },
            },
        }, {
            id: 'hd-grid-right', numberFormat: {
                format: '#,##0',
            },
        }, {
            id: 'hd-grid-percent', numberFormat: {
                format: '#,##0.00',
            },
        }, // {
            //     id: 'hd-grid-string',
            // 	dataType: 'String',
            // 	numberFormat: {
            // 		format: '@',
            // 	},
            // },
        ],
    };

    Object.keys(optionMixin).forEach((key) => {
        if (key === "defaultColDef") {
            this.gridOptions[key] = { suppressKeyboardEvent: this.gridOptions[key].suppressKeyboardEvent, ...optionMixin[key] };
        } else {
            this.gridOptions[key] = optionMixin[key];
        }
    });

    let grid = new agGrid.Grid(gridDiv, this.gridOptions);

    // this.gridOptions.api.sizeColumnsToFit();
    //const remInPixel = parseFloat(getComputedStyle(document.documentElement).fontSize);

    let _gridOptions = this.gridOptions;

    this.gridOptions.columnApi.getAllColumns().forEach(function (column) {
        //console.log('column :' + column.colId);
        //console.log(column.colDef.width);
        if (column.colDef.width === undefined) {
            // const hn = column.colDef.headerName;
            // const hnWidth = hn.length*2*remInPixel;
            //console.log(hn + ' - ' + hnWidth);
            _gridOptions.columnApi.autoSizeColumn(column.colId, false);
        } else {
            //console.log(column.colId);
            //console.log(column.colDef.width);
            column.colDef.suppressSizeToFit = true;
            _gridOptions.columnApi.setColumnWidth(column.colId, column.colDef.width + 1);
        }
        //allColumnIds.push(column.colId);
    });

    this.gridOptions.api.setRowData([]);

    this.loading = false;
}

HDGrid.prototype.Request = function (url, data = '', page = -1, callback, http_method = 'get') {
    if (this.loading === false) {
        this.loading = true;

        this.requst_data = data || '';
        //var page_size = gridOptions.paginationPageSize;
        this.request_url = url;
        this.total = 0;
        this.callback = callback;

        if (page === -1) {
            this.page = page;
        } else if (page === 1) {

            this.page = 1;
            this.scrolltop = 0;
            let _gx = this;

            this.gridOptions.onBodyScroll = function (params) {
                if (params.direction === "vertical" && params.top > _gx.scrolltop) {

                    // if (_gx.loading === false && params.top > _gx.gridDiv.scrollHeight) {
                    if (_gx.loading === false && params.top > 0) {

                        var rowtotal = _gx.gridOptions.api.getDisplayedRowCount();
                        // console.log('getLastDisplayedRow : ' + gridOptions.api.getLastDisplayedRow());
                        // console.log('rowTotalHeight : ' + rowtotal * 25);
                        // console.log('params.top : ' + params.top);

                        if (_gx.gridOptions.api.getLastDisplayedRow() > 0 && _gx.gridOptions.api.getLastDisplayedRow() == rowtotal - 1) {
                            //console.log(params);
                            //console.log('getLastDisplayedRow :' + _gx.gridOptions.api.getLastDisplayedRow());
                            //console.log('rowtotal :' + rowtotal);
                            var rollup_callback = (data) => $("#grid_expand").length > 0 ? setAllRowGroupExpanded($("#grid_expand").is(":checked")) : '';
                            _gx._Request(this.rollup ? rollup_callback : undefined, http_method);
                        }
                        // var rowtotal = gridOptions.api.getDisplayedRowCount();
                        // var rowHeight = 25;
                        // var rowTotalHeight = rowtotal * gridOptions.rowHeight;
                        // if(rowtotal > 0 && params.top > rowTotalHeight && (rowtotal - 1) == gridOptions.api.getLastDisplayedRow()){
                        //     console.log('params.top :' + params.top);
                        //     console.log('rowTotalHeight :' + rowTotalHeight);
                        //     console.log('top : ' + params.top);
                        //     console.log('eGridDiv : ' + eGridDiv.scrollHeight);
                        //     console.log(gridOptions.api.getDisplayedRowCount());
                        //     console.log(gridOptions.api.getFirstDisplayedRow());
                        //     console.log(gridOptions.api.getLastDisplayedRow());
                        //     _isloading = true;
                        //     Search(0);
                        // }
                    }
                    _gx.scrolltop = params.top;
                }
            };
        }
        //console.log('page : ' + _page);
        this._Request(callback, http_method);
    }
};

HDGrid.prototype._Request = function (callback, http_method) {
    this.loading = true;
    if (this.page > 1) {
        this.ShowLoadingLayer();
        //gx.gridOptions.api.showNoRowsOverlay();
    } else {
        this.gridOptions.api.showLoadingOverlay();
    }

    let _gx = this;
    this.requst_data += '&page=' + this.page + '&total=' + _gx.total;
    let params_object = {};
    if (http_method === 'post') {
        let params_data = this.requst_data;
        params_data.split('&').forEach(data => {
            const val = data.split('=')[1];

            if (val.split(',').length > 1) {
                params_object[data.split('=')[0]] = val.split(',');
            } else {
                params_object[data.split('=')[0]] = val;
            }
        });
    }

    const init = {
        method: http_method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    if (http_method === 'post') {
        init.body = JSON.stringify(params_object);
    } else {
        this.request_url += '?' + this.requst_data;
    }

    fetch(this.request_url, init)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            res = data;

            if (_gx.page === -1) {

                _total = res.total || 0;
                _gx.total = _total;
                _gx.gridOptions.api.setRowData(res.data);

                $("#" + _gx.gridTotal).text(numberWithCommas(_total));

                if (_gx.IsAggregation() === true) {
                    _gx.CalAggregation();
                }

            } else {

                if (_gx.page === 1) {
                    _total = res.total || 0;
                    _gx.total = _total;
                    if (!_gx.callback) _gx.gridOptions.api.setRowData(res.data);
                    _gx.page = parseInt(res.current_page || 1) + 1;
                    const rows = numberWithCommas(_gx.gridOptions.rollup ? _gx.getRowCountForLevel(_gx.gridOptions.rollupCountLevel || -1) : _gx.gridOptions.api.getDisplayedRowCount());
                    $("#" + _gx.gridTotal).text(numberWithCommas(_total));
                    $("#" + _gx.gridCurrent).text(numberWithCommas(res.to || 0));

                } else {
                    if (res.data.length === 0) {
                        _gx.gridOptions.onBodyScroll = null;
                    } else {
                        if (!_gx.callback) _gx.gridOptions.api.applyTransaction({ add: res.data });
                        _gx.page = parseInt(res.current_page || 1) + 1;
                        const rows = numberWithCommas(_gx.gridOptions.rollup ? _gx.getRowCountForLevel(_gx.gridOptions.rollupCountLevel || -1) : _gx.gridOptions.api.getDisplayedRowCount());
                        $("#" + _gx.gridTotal).text(numberWithCommas(_gx.total));
                        $("#" + _gx.gridCurrent).text(numberWithCommas(res.to || 0));
                    }
                }
            }
            if (_gx.callback) _gx.callback(data);
        }).catch(error => {
            console.error(error.message);
            // alert('조회 시 오류가 발생했습니다.\n다시 시도해 주세요.');
        }).finally(() => {
            _gx.loading = false;
            _gx.HideLoadingLayer();
            _gx.gridOptions.api.hideOverlay();
        });
};

/**
 * @return {boolean}
 */
HDGrid.prototype.IsAggregation = function () {
    return this.is_agg;
};

HDGrid.prototype.Aggregation = function (params) {
    this.is_agg = true;
    this.agg_params = params;
};

HDGrid.prototype.CalAggregation = function () { // 2022-07-08 동적으로 컬럼 정의해도 변경되도록 수정

    var cnt = this.gridOptions.api.getDisplayedRowCount();

    if (cnt > 0) {

        let sumRow = {};
        for (let i = 0; i < this.gridOptions.api.getColumnDefs().length; i++) {
            let column = this.gridOptions.api.getColumnDefs()[i];
            if (column.aggregation === true) {
                sumRow[column.field] = 0;
            } else {
                if (column.hasOwnProperty('children')) {
                    for (let j = 0; j < column.children.length; j++) {
                        let column2 = column.children[j];
                        if (column2.hasOwnProperty('children')) {
                            for (let k = 0; k < column2.children.length; k++) {
                                let column3 = column2.children[k];
                                if (column3.aggregation === true) {
                                    sumRow[column3.field] = 0;
                                }
                            }
                        } else {
                            if (column2.aggregation === true) {
                                sumRow[column2.field] = 0;
                            }
                        }
                    }
                }
            }
        }

        const fields = Object.keys(sumRow);

        for (row = 0; row < cnt; row++) {
            const rowNode = this.gridOptions.api.getDisplayedRowAtIndex(row);
            for (let col = 0; col < fields.length; col++) {
                if (rowNode.data[fields[col]] !== undefined) {
                    sumRow[fields[col]] += Number(rowNode.data[fields[col]]);
                }
            }
        }

        let avg = "";
        let avgRow = {};

        if (this.agg_params.hasOwnProperty('avg')) {
            avg = this.agg_params.avg;
            for (col = 0; col < fields.length; col++) {
                avgRow[fields[col]] = parseInt(sumRow[fields[col]] / cnt);
            }
        }

        for (let i = 0; i < this.gridOptions.api.getColumnDefs().length; i++) {
            let column = this.gridOptions.api.getColumnDefs()[i];
            if (column.hasOwnProperty('aggSum')) {
                sumRow[column.field] = column.aggSum;
            }
            if (column.hasOwnProperty('aggAvg')) {
                avgRow[column.field] = column.aggAvg;
            }
        }

        let topRow = [];
        let bottomRow = [];

        Object.keys(this.agg_params).forEach(key => {

            switch (key) {
                case "sum":
                    if (this.agg_params.sum === "top") {
                        topRow.push(sumRow);
                    } else {
                        bottomRow.push(sumRow);
                    }
                    // code block
                    break;
                case "avg":
                    if (this.agg_params.avg === "top") {
                        topRow.push(avgRow);
                    } else {
                        bottomRow.push(avgRow);
                    }
                    // code block
                    break;
            }
        });

        if (topRow.length > 0) {
            this.gridOptions.api.setPinnedTopRowData(topRow);
        }

        if (bottomRow.length > 0) {
            this.gridOptions.api.setPinnedBottomRowData(bottomRow);
        }
    } else {
        this.gridOptions.api.setPinnedTopRowData([]);
        this.gridOptions.api.setPinnedBottomRowData([]);
    }
};

HDGrid.prototype.ShowLoadingLayer = function () {

    //console.log(this.gridDiv);

    if ($('#is_loading_layer').length > 0) {
        $("#is_loading_layer").remove();
    } else {
        var html = "<div id=\"is_loading_layer\" style=\"";
        html += "position:fixed;top:50%;left:50%;z-index:3000;width:200px;margin-left:-100px;";
        html += "padding:15px 20px;background:#000;border:1px solid #666;box-sizing:content-box;opacity:0.6;color:#fff;text-align:center;font-size:12px;\"";
        html += ">";
        html += "Loading the next page...";
        html += "</div>";
        $("body").append(html);
    }
};

HDGrid.prototype.HideLoadingLayer = function () {
    $("#is_loading_layer").remove();
};

HDGrid.prototype.ShowCustomLoadingLayer = function () {
    if ($('#is_custom_loading_layer').length > 0) {
        $("#is_custom_loading_layer").remove();
    } else {
        const loading_html = `
            <div id="is_custom_loading_layer" style="
                position:fixed;top:50%;left:50%;z-index:3000;width:200px;margin-left:-100px;
                padding:15px 20px;background:#1a1a1a;border:1px solid #666;box-sizing:content-box;
                color:#fff;text-align:center;font-size:14px;"
            >
                Loading open link...
            </div>
        `;
        $("body").append(loading_html);
    }
};

HDGrid.prototype.HideCustomLoadingLayer = function () {
    $("#is_custom_loading_layer").remove();
};

/** CSV & EXCEL 다운로드
 * - options.type이 'excel'일 경우, title의 확장자를 반드시 'xlsx' 형태로 작성 (그 외에는 'csv'로 작성)
 * - level은 int 형태로 작성
 */
HDGrid.prototype.Download = function (title = 'export.csv', options = {}) {

    const values = {
        fileName: title,
        sheetName: 'Sheet1',
        headerRowHeight: options.hasOwnProperty('headerHeight') ? options.headerHeight : null,
        skipPinnedTop: options.hasOwnProperty('addPinnedTop') ? !options.addPinnedTop : true,
        skipGroups: options.hasOwnProperty('skipGroups') ? options.skipGroups : false,
        columnGroups: true,
        shouldRowBeSkipped: (params) => {
            return options.hasOwnProperty('level') && Number.isInteger(options.level) ? options.level !== params.node.level : false;
        },
        processRowGroupCallback: (params) => params.node.key,
        processHeaderCallback: (params) => {
            const col = params.column.colDef;
            if (col.cellClass) {
                if (Array.isArray(col.cellClass)) {
                    col.cellClass.push('cell');
                } else {
                    col.cellClass = [ col.cellClass, 'cell' ];
                }
            } else {
                col.cellClass = 'cell';
            }

            return params.column.colDef.headerName;
        },
        processCellCallback: (params) => {
            let val = params.value;

            if (options.hasOwnProperty('level')) {
                if (params.column.userProvidedColDef) {
                    if (params.column.userProvidedColDef.showRowGroup) {
                        if (params.node.data) {
                            val = params.node.data[params.column.userProvidedColDef.showRowGroup];
                        } else if (params.node.childrenAfterGroup) {
                            if (params.node.childrenAfterGroup[0].childrenAfterGroup) {
                                if (params.node.childrenAfterGroup[0].childrenAfterGroup[0].childrenAfterGroup) {
                                    val = params.node.childrenAfterGroup[0].childrenAfterGroup[0].childrenAfterGroup[0]?.data?.[params.column.userProvidedColDef.showRowGroup];
                                } else {
                                    val = params.node.childrenAfterGroup[0].childrenAfterGroup[0]?.data?.[params.column.userProvidedColDef.showRowGroup];
                                }
                            } else {
                                val = params.node.childrenAfterGroup[0]?.data?.[params.column.userProvidedColDef.showRowGroup];
                            }
                        }
                    }

                    if (!isNaN(params.column.userProvidedColDef.groupDepth) && params.column.userProvidedColDef.groupDepth > options.level) {
                        val = '';
                    } else if (!isNaN(params.column.colId) && params.column.colId * 1 > options.level) {
                        val = '';
                    }
                } else if (params.node.parent.childrenAfterGroup) {
                    if (params.node.parent.childrenAfterGroup[0].data) {
                        val = params.node.parent.childrenAfterGroup[0].data?.[params.node.parent.field];
                    }
                }
            }

            if ([ 'ord_no' ].includes(params.column.colId)) return val + 'ㅤ'; else return val;
        }, // processHeaderCallback: (params) => {
        //     return (params.column.parent.originalColumnGroup.colGroupDef.headerName ? `${params.column.parent.originalColumnGroup.colGroupDef.headerName} > ` : '') + params.columnApi.getDisplayNameForColumn(params.column, null);
        // },
        columnKeys: options.hasOwnProperty('columns') ? options.columns : undefined,
        columnWidth: (params) => {
            return Math.max(params.column.actualWidth - 50, 75);
        },
    };

    if (options.type === 'excel') {
        this.gridOptions.api.exportDataAsExcel(values);
    } else {
        this.gridOptions.api.exportDataAsCsv(values);
    }
};

HDGrid.prototype.getRows = function () {
    var rows = [];
    this.gridOptions.api.forEachNode(function (node) {
        //console.log(node);
        rows.push(node.data);
    });
    return rows;
};

HDGrid.prototype.getSelectedRows = function () {
    return this.gridOptions.api.getSelectedRows();
};

HDGrid.prototype.delSelectedRows = function () {
    const selectedRows = this.getSelectedRows();
    this.gridOptions.api.applyTransaction({ remove: selectedRows });
};

HDGrid.prototype.getSelectedNodes = function () {
    return this.gridOptions.api.getSelectedNodes();
};

HDGrid.prototype.selectAll = function () {
    return this.gridOptions.api.selectAll();
};

HDGrid.prototype.deselectAll = function () {
    return this.gridOptions.api.deselectAll();
};

HDGrid.prototype.checkAll = function (checked) {
    if (checked) {
        return gx.selectAll();
    } else {
        return gx.deselectAll();
    }
};

// ceduce - Id 에 해당하는 Node 데이터 가져오기
HDGrid.prototype.getRowNode = function (id) {
    return this.gridOptions.api.getRowNode(id);
};

HDGrid.prototype.getRowCount = function () {
    return this.gridOptions.rollup ? this.getRowCountForLevel(this.gridOptions.rollupCountLevel || -1) : this.gridOptions.api.getDisplayedRowCount();
};

HDGrid.prototype.setRows = function (rows) {
    return this.gridOptions.api.setRowData(rows);
};


HDGrid.prototype.addRows = function (rows) {
    //console.log(rows);
    return this.gridOptions.api.applyTransaction({ add: rows });
};

HDGrid.prototype.deleteRows = function (rows) {
    //console.log(rows);
    return this.setRows([]);
};

// 롤업 시 level param row의 count 조회
HDGrid.prototype.getRowCountForLevel = function (level = 1) {
    var cnt = 0;
    this.gridOptions.api.forEachNode(function (node) {
        if (level < 0) {
            if (node.data) cnt++;
        } else {
            if (node.level === level - 1) cnt++;
        }
    });
    return cnt;
};

// 방금 작업하던 셀에 포커스
HDGrid.prototype.setFocusedWorkingCell = function () {
    let cell = this.gridOptions.api.getFocusedCell();
    if (cell) {
        this.gridOptions.api.setFocusedCell(cell.rowIndex, cell.column);
    }
}

// 컬럼 개인화
async function getMyColumns(gridCallback, gridDiv, default_columns, grid_number = 1) {
    try {
        const response = await fetch('/api/personal-column', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const res = await response.json();
        if (!res.columns) return default_columns;

        let stored = typeof res.columns === 'string'
            ? JSON.parse(res.columns?.[0] || '')
            : res.columns?.[0] || [];

        const resultColumns = stored.map((savedCol) => {
            if (!savedCol.field && Array.isArray(savedCol.children)) {
                const children = savedCol.children
                    .map(applyColumnSettings(default_columns))
                    .filter(Boolean);

                return {
                    headerName: savedCol.headerName || '',
                    children
                };
            }

            if (savedCol.field) {
                const col = applyColumnSettings(default_columns)(savedCol);
                return col || null;
            }

            return null;
        }).filter(Boolean);

        return resultColumns.length > 0 ? resultColumns : default_columns;

    } catch (error) {
        console.error('Error fetching personal column:', error);
        return default_columns;
    }
}

// 공통 설정 적용 함수
function applyColumnSettings(default_columns) {
    return function (savedCol) {
        const matched = findColumnByField(savedCol.field, default_columns);
        if (!matched) return null;

        return {
            ...matched,
            ...(savedCol.hide !== undefined && { hide: savedCol.hide }),
            ...(savedCol.pinned && { pinned: savedCol.pinned }),
            ...(savedCol.width !== undefined && { width: savedCol.width })
        };
    };
}

// field 기준 컬럼 찾기
function findColumnByField(field, columns) {
    for (const col of columns) {
        if (col.field === field) return col;

        if (Array.isArray(col.children)) {
            for (const child of col.children) {
                if (child.field === field) return child;
            }
        }
    }
    return null;
}

