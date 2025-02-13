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

function filter_pid(str) {
    const reg = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi;
    return str.replace(reg, '');
}

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

function HDGrid(gridDiv, columns, optionMixin = {}) {


    this.id = gridDiv.id.replace("div-", "");
    this.gridDiv = gridDiv;
    this.gridTotal = this.id + '-total';
    this.is_agg = false;

    //console.log(this.gridTotal);
    //columns = this.setMobile(columns);

    this.gridOptions = {
        columnDefs: columns,
        defaultColDef: {
            //장건희 추가 2022-01-17
            suppressMenu: true,
            // set every column width
            flex: 1,
            // make every column editable
            resizable: true,
            autoHeight: true,
            //suppressSizeToFit: true,
            sortable: true,
            //minWidth:70,

        },
        multiSortKey: 'ctrl',
        enableRangeSelection: true,
        columnTypes: {
            numberType: {
                //filter: 'agNumberColumnFilter',
                comparator: sortnumber,
                valueFormatter: formatNumber,
                cellClass: 'hd-grid-number',
            },
            percentType: {

                //filter: 'agNumberColumnFilter',
                comparator: sortnumber,
                valueFormatter: formatNumber,
                cellClass: 'hd-grid-number',
                precision: 2,
            },
            currencyType: {
                //filter: 'agNumberColumnFilter',
                comparator: sortnumber,
                valueFormatter: formatNumber,
                cellClass: 'hd-grid-number',
            },
            DayType: {
                //filter: 'agNumberColumnFilter',
                width: 120,
                cellClass: 'hd-grid-code',
            },
            DateTimeType: {
                //filter: 'agNumberColumnFilter',
                width: 130,
                cellClass: 'hd-grid-code',
            },

            NumType: {
                width: 50, maxWidth: 100, valueGetter: 'node.id', cellRenderer: 'loadingRenderer'
            },
        },

        components: {
            loadingRenderer: function (params) {
                if (params.value !== undefined) {
                    return params.node.rowIndex + 1;
                }
            }
        },

        overlayNoRowsTemplate: '<span></span>',

        // overlayNoRowsTemplate:
        //     '<span style="padding: 10px; border: 2px solid #444; background: lightgoldenrodyellow;">Loading the next page...</span>',

        //enableCellTextSelection: true,

        // getRows:function(params){
        //     console.log('getRows ', params);
        // },
        rowData: [],
        rowSelection: 'multiple',
        suppressRowClickSelection: true,
        //rowDeselection: true,
        rowBuffer: 0,
        //onBodyScroll:onscroll,
        suppressColumnVirtualisation: true,

        suppressLastEmptyLineOnPaste: true, // fix: copy and paste error from excel

        // 셀 입력중, 키보드 아래방향키로 셀 이동
        suppressKeyboardEvent: function (e) {
            let key = e.event.key;

            if (e.column.isCellEditable(e.node)) {
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
        },

        // 셀 멀티선택 후 팝업 오픈 기능
        getContextMenuItems: (params) => {
            const defaultItems = params.defaultItems;
            const newItems = [];

            function getLinks(ranges, type = 'window') {
                const links = [];
                for (let range of ranges) {
                    const arr = [ range.startRow.rowIndex, range.endRow.rowIndex ];
                    const from = Math.min(...arr);
                    const to = Math.max(...arr);

                    for (let column of range.columns) {
                        const colId = column.colId;
                        for (let i = from; i <= to; i++) {
                            const cellRenderer = params.api.getCellRendererInstances({
                                columns: [ colId ],
                                rowNodes: [ params.api.getModel().getRow(i) ]
                            });
                            const renderedHTML = cellRenderer && cellRenderer[0]?.getGui()?.innerHTML;
                            if (renderedHTML) {
                                const container = document.createElement('div');
                                container.innerHTML = renderedHTML;
                                const anchor = container.querySelector('a');
                                if (anchor !== null) {
                                    if (type !== 'tab' || anchor.dataset.url !== undefined) {
                                        links.push(anchor);
                                    }
                                }
                            }
                        }
                    }
                }
                return links;
            }

            if (optionMixin.multiTab === true) {
                const multiTabOpenAction = {
                    name: 'Multi Tab',
                    icon: '<i class="bx bx-windows fs-14"></i>',
                    shortcut: 'Shift+Click',
                    action: function () {
                        const ranges = params.api.getCellRanges();
                        if (ranges.length > 0) {
                            const links = getLinks(ranges, 'tab');

                            let multi_popup, tab_counter = 0;
                            if (links.length > 0) {
                                multi_popup = window.open(window.location.href, '_blank', 'popup=no');
                                tab_counter++;
                            }
                            links.forEach(function (anchor, index) {
                                setTimeout(function () {
                                    let target = tab_counter < 2 ? '_self' : '_blank';
                                    multi_popup.open(anchor.dataset.url, target);
                                    tab_counter++;
                                }, 800 * index);
                            });
                        }
                    }
                };
                newItems.push(multiTabOpenAction);
            }

            const multiWindowOpenAction = {
                name: 'Multi Window',
                icon: '<i class="bx bx-windows fs-14"></i>',
                action: function () {
                    const ranges = params.api.getCellRanges();
                    if (ranges.length > 0) {
                        const links = getLinks(ranges, 'window');

                        links.forEach(function (anchor, index) {
                            setTimeout(function () {
                                anchor.click();
                            }, 300 * index);
                        });
                    }
                }
            };
            newItems.push(multiWindowOpenAction);

            return newItems.concat(defaultItems);
        },

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

        excelStyles: [
            {
                id: 'header',
                alignment: {
                    vertical: 'Center',
                    horizontal: 'Center',
                },
                interior: {
                    color: '#f2f2f2',
                    pattern: 'Solid',
                },
                borders: {
                    borderBottom: {
                        color: '#333',
                        lineStyle: 'Continuous',
                        weight: 2,
                    },
                },
            },
            {
                id: 'hd-grid-number',
                numberFormat: {
                    format: '#,##0',
                },
            },
            // {
            //     id: 'hd-grid-string',
            // 	dataType: 'String',
            // 	numberFormat: {
            // 		format: '@',
            // 	},
            // },
        ],
    };

    Object.keys(optionMixin).forEach((key) => {
        this.gridOptions[key] = optionMixin[key];
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

    this.Init();
}

HDGrid.prototype.Init = function () {
    const is_mobile = document.body.offsetWidth <= 740;
    if (this.gridOptions.resize !== false && !is_mobile) this.SetResizer();
    if (is_mobile) {
        this.gridOptions.columnApi.applyColumnState({ defaultState: { pinned: null } });
    }
};

HDGrid.prototype.SetResizer = function () {
    const gd = this;
    const gridDiv = gd.gridDiv;
    const parentNode = gridDiv.parentNode;
    const grandParentNode = parentNode.parentNode;
    const default_height = gridDiv.style.height;

    const grid_resizer = document.createElement('div');
    grid_resizer.classList.add('grid-resizer');

    const mouseDownHandler = (ev) => {
        const y = ev.clientY;
        const prev = grid_resizer.previousElementSibling;
        const rect = prev.getBoundingClientRect();
        const div_grid_height = rect.height;

        const mouseMoveHandler = (e) => {
            const dy = e.clientY - y;
            prev.style.height = `${div_grid_height + dy}px`;
        };

        const mouseUpHandler = (e) => {
            // if (gd.gridOptions.domLayout !== 'normal') {
            //     gd.gridOptions.api.setDomLayout('normal');
            //     gd.scrolltop = 0;
            // }

            document.removeEventListener("mousemove", mouseMoveHandler);
            document.removeEventListener("mouseup", mouseUpHandler);
        };

        if (gd.gridOptions.domLayout !== 'autoHeight') {
            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mouseup', mouseUpHandler);
        }
    }

    if (this.gridOptions.resize?.drag !== false) {
        grid_resizer.style.cursor = 'ns-resize';
        grid_resizer.innerHTML = '<i class="fas fa-ellipsis-h"></i>';
        grid_resizer.addEventListener('mousedown', mouseDownHandler);
    }
    parentNode.appendChild(grid_resizer);

    const resizerClickHandler = (e) => {
        const count = $(e.target).closest(".grid-btn").data('count');
        if (count < 1) {
            gd.gridOptions.api.setDomLayout('normal');
            gridDiv.style.height = default_height;
            default_height_btn.classList.add('btn-primary');
            auto_height_btn.classList.remove('btn-primary');
        } else {
            let totalRowHeight = 0;
            gd.gridOptions.api.forEachNodeAfterFilter(function (rowNode) {
                totalRowHeight += rowNode.rowHeight + 1;
            });

            if (gd.gridDiv.clientHeight <= totalRowHeight) {
                gd.gridOptions.api.setDomLayout('autoHeight');
                gridDiv.style.height = '';
                default_height_btn.classList.remove('btn-primary');
                auto_height_btn.classList.add('btn-primary');
            }

        }
    };

    const auto_height_btn = document.createElement('div');
    auto_height_btn.classList.add(...[ 'grid-btn' ]);
    auto_height_btn.dataset.count = 1;
    auto_height_btn.innerHTML = '<i class="bx bx-chevrons-down"></i>';
    auto_height_btn.addEventListener('click', resizerClickHandler);

    const default_height_btn = document.createElement('div');
    default_height_btn.classList.add(...[ 'grid-btn', 'btn-primary' ]);
    default_height_btn.dataset.count = 0;
    default_height_btn.innerHTML = '<i class="bx bx-chevrons-up"></i>';
    default_height_btn.addEventListener('click', resizerClickHandler);

    const btn_container = document.createElement('div');
    btn_container.classList.add(...[ 'd-flex', 'position-absolute' ]);
    if (this.gridOptions.resize?.button !== false) {
        btn_container.appendChild(default_height_btn);
        btn_container.appendChild(auto_height_btn);
    }
    parentNode.appendChild(btn_container);

    const container = document.createElement('div');
    container.style.position = 'relative';
    container.appendChild(parentNode);
    grandParentNode.appendChild(container);
};

HDGrid.prototype.Request = function (url, data = '', page = -1, callback, http_method = 'get') {
    if (this.loading === false) {
        this.loading = true;

        this.requst_data = data;
        //var page_size = gridOptions.paginationPageSize;
        this.request_url = url;
        this.total = 0;

        if (page === -1) {
            this.page = page;
        } else if (page === 1) {

            this.page = 1;
            this.scrolltop = 0;
            let _gx = this;

            this.gridOptions.onBodyScroll = function (params) {

                if (params.direction === "vertical" && params.top > _gx.scrolltop) {

                    if (_gx.loading === false && params.top > _gx.gridDiv.scrollHeight) {

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
    if (http_method === 'post') {
        let params_data = this.requst_data;
        params_data.split('&').forEach(data => {
            this.requst_data[data.split('=')[0]] = encodeURI(data.split('=')[1]);
        });
    }

    $.ajax({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        type: http_method,
        url: this.request_url,
        data: this.requst_data,
        success: function (data) {
            //console.log(data);
            //const res = jQuery.parseJSON(data);
            res = data;

            //console.log(_gx);

            if (_gx.page === -1) {

                _total = res?.head?.total || 0;
                _gx.total = _total;
                _gx.gridOptions.api.setRowData(res.body);

                $("#" + _gx.gridTotal).text(numberWithCommas(_total));


                if (_gx.IsAggregation() === true) {
                    _gx.CalAggregation();
                }

            } else {

                if (_gx.page === 1) {
                    _total = res.head?.total || 0;
                    _gx.total = _total;
                    _gx.gridOptions.api.setRowData(res.body);
                    _gx.page = parseInt(res.head?.page || 1) + 1;
                    const rows = numberWithCommas(_gx.gridOptions.rollup ? _gx.getRowCountForLevel(_gx.gridOptions.rollupCountLevel || -1) : _gx.gridOptions.api.getDisplayedRowCount());
                    $("#" + _gx.gridTotal).text(rows + ' / ' + numberWithCommas(_total));

                } else {
                    if (res.body.length === 0) {
                        _gx.gridOptions.onBodyScroll = null;
                    } else {
                        //console.log('total ' + _total);
                        const ret = _gx.gridOptions.api.applyTransaction({ add: res.body });
                        _gx.page = parseInt(res.head?.page || 1) + 1;
                        const rows = numberWithCommas(_gx.gridOptions.rollup ? _gx.getRowCountForLevel(_gx.gridOptions.rollupCountLevel || -1) : _gx.gridOptions.api.getDisplayedRowCount());
                        $("#" + _gx.gridTotal).text(rows + ' / ' + numberWithCommas(_gx.total));
                    }
                }
            }
            if (callback) callback(data);
        },
        complete: function () {
            _gx.loading = false;
            _gx.HideLoadingLayer();
            _gx.gridOptions.api.hideOverlay();
        },
        error: function (xhr, status, error) {
            console.error('[' + status + ']' + xhr.responseText);
            if (xhr.status === 500) alert('조회 시 오류가 발생했습니다.\n검색조건을 확인하신 후 다시 시도해 주세요.');
        }
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

HDGrid.prototype.CalAggregation = function () {

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
                        if (column2.aggregation === true) {
                            sumRow[column2.field] = 0;
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

/** CSV & EXCEL 다운로드
 * - options.type이 'excel'일 경우, title의 확장자를 반드시 'xlsx' 형태로 작성 (그 외에는 'csv'로 작성)
 * - level은 int 형태로 작성
 */
HDGrid.prototype.Download = function (title = 'export.csv', options = {}) {

    const values = {
        fileName: title,
        sheetName: 'Sheet1',
        headerRowHeight: options.hasOwnProperty('headerHeight') ? options.headerHeight : 30,
        skipPinnedTop: options.hasOwnProperty('addPinnedTop') ? !options.addPinnedTop : true,
        skipGroups: options.hasOwnProperty('skipGroups') ? options.skipGroups : false,
        shouldRowBeSkipped: (params) => {
            return options.hasOwnProperty('level') && Number.isInteger(options.level) ? options.level !== params.node.level : false;
        },
        processRowGroupCallback: (params) => params.node.key,
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

            if ([ 'ord_no' ].includes(params.column.colId)) return val + 'ㅤ';
            else return val;
        },
        // processHeaderCallback: (params) => {
        //     return (params.column.parent.originalColumnGroup.colGroupDef.headerName ? `${params.column.parent.originalColumnGroup.colGroupDef.headerName} > ` : '') + params.columnApi.getDisplayNameForColumn(params.column, null);
        // },
        columnKeys: options.hasOwnProperty('columns') ? options.columns : undefined
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

HDGrid.prototype.getSortRows = function () {
    var rows = [];
    this.gridOptions.api.forEachNodeAfterFilterAndSort(function (node) {
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

/**
 * Grid Header 개인설정 조회
 *
 * @param gridCallback // return grid object
 * @param gridDiv
 * @param default_columns
 * @param grid_number
 * @returns {Promise<*|*[]|boolean>}
 */
async function getMyColumns(gridCallback, gridDiv, default_columns, grid_number = 1) {
    let url_path_array = String(window.location.href).split('?')[0].split('/');
    let pid = filter_pid(String(url_path_array[url_path_array.length - 1]).toLocaleUpperCase());
    pid = pid + '_' + grid_number;

    let setting_btn_id = gridDiv.id.replace('div-', '') + '-setting';
    new GridCustomSettingEditor(setting_btn_id, grid_number, gridCallback, pid);

    let res = { data: { code: 400 } };
    if (res.data.code === 200) {
        let parse_data = null;
        let res_data = [];

        if (res.data.body.indiv_columns.length > 0) {
            parse_data = JSON.parse(res.data.body.indiv_columns);
            parse_data.forEach((value) => {
                default_columns.forEach((col) => {
                    if (value['field'] === col['field']) {
                        if (value['children'].length > 0) {
                            let value_children = value['children'];
                            let col_children = col['children'];
                            let new_children = [];

                            if (value['hide'] === true) {
                                res_data.push(Object.assign(clone(col), { 'hide': true }));
                            } else {
                                Object.keys(value_children).forEach((key) => {
                                    if (value_children[key]['hide'] === true) {
                                        new_children.push(Object.assign(col_children[key], { 'hide': true }));
                                    } else if (value_children[key]['pinned'] === 'left' || value_children[key]['width'] !== null) {
                                        let properties = {};

                                        if (value_children[key]['pinned'] === 'left' && value_children[key]['width'] === undefined) {
                                            properties = { 'pinned': 'left' };
                                        } else if (value_children[key]['pinned'] === null && value_children[key]['width'] !== undefined) {
                                            properties = { 'width': value_children[key]['width'] };
                                        } else if (value_children[key]['pinned'] !== null && value_children[key]['width'] !== undefined) {
                                            properties = { 'pinned': 'left', 'width': value_children[key]['width'] };
                                        }

                                        new_children.push(Object.assign(col_children[key], properties));
                                    } else {
                                        new_children.push(col_children[key]);
                                    }
                                });

                                col['children'] = new_children;
                                res_data.push(col);
                            }
                        } else {
                            if (value['hide'] === true) {
                                res_data.push(Object.assign(clone(col), { 'hide': true }));
                            } else if (value['pinned'] === 'left' || value['width'] !== undefined) {
                                let copy_properties = {};

                                if (value['pinned'] === 'left' && value['width'] === undefined) {
                                    copy_properties = { 'pinned': 'left' };
                                } else if (value['pinned'] === null && value['width'] !== undefined) {
                                    copy_properties = { 'width': value['width'] };
                                } else if (value['pinned'] !== null && value['width'] !== undefined) {
                                    copy_properties = { 'pinned': 'left', 'width': value['width'] };
                                }

                                res_data.push(Object.assign(clone(col), copy_properties));
                            } else {
                                res_data.push(clone(col));
                            }
                        }
                    }
                });
            });
        }
        return res_data.length < 1 ? default_columns : res_data;
    }
    return false;
}
