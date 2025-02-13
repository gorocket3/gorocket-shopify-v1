/**
 * GridAutoCompleteEditor
 * - Ag-Grid 에서 cell 입력 시 자동완성 및 선택을 지원하는 함수입니다.
 * - Parameters
 # url: 키워드에 따라 리스트를 비동기로 검색할 Server Api Url 입니다.
 # rowData: 자동완성에 사용할 리스트입니다. 선택할 리스트가 이미 존재할 때 사용합니다. 파라미터 중 url 과 동시에 사용하면 무시됩니다.
 # dataKey: 이 값이 있으면, 리스트 각 아이템객체에 해당항목의 field값이 key로 등록되고, 아이탬객체의 dataKey값이 value로 등록됩니다.
 # width: GridAutoCompleteEditor의 컨테이너 총 너비입니다. (default: 100px)
 # height: GridAutoCompleteEditor의 컨테이너 총 높이입니다. (default: 200px)
 * - 사용예시
    const columns = [
            {
                field: 'store_nm', headerName: '매장', editable: true,
                cellEditor: GridAutoCompleteEditor,
                cellEditorPopup: true,
                cellEditorParams: {
                    cellEditor: GridAutoCompleteEditor,
                    url: "/head/auto-complete/store",
                    // rowData: [{ id: 0, label: "테스트매장" }],
                    dataKey: "label",
                    width: "100px",
                    height: "200px",
                }
            },
    ];
    let gx = new HDGrid(gridDiv, columns);
 */

class GridAutoCompleteEditor {
    constructor() {
        this.apiUrl = '';
        this.dataKey;
        this.rows = [];
        this.value = null;
        this.params;
        this.gridApi;
        this.columnDefs;
        this.colId;
        this.cellValue;
        this.isCanceled = true;

        this.container;
        this.input;
        this.width = '100px';
        this.height = '150px';
    }

    init(params) {
        this.params = params;
        if (params.rowData && Array.isArray(params.rowData)) this.rows = params.rowData;
        if (params.url) this.apiUrl = params.url;
        if (params.dataKey) this.dataKey = params.dataKey;

        this.columnDefs = params.colDef;
        this.colId = params.column?.colId;
        this.cellValue = params.data[this.colId];

        if (params.width) this.width = params.width;
        if (params.height) this.height = params.height;

        this.container = document.createElement('div');
        this.container.setAttribute('class', 'w-100');
        this.container.tabIndex = '0';

        this.input = document.createElement('input');
        this.input.setAttribute('class', 'border-0 p-1 h-100 form-control shadow-none');
        this.input.style = 'width: ' + this.width;
        if (params.value !== undefined) this.input.value = params.value;

        this.gridDiv = document.createElement('div');
        this.gridDiv.setAttribute('id', 'div-gd-auto-complete');
        this.gridDiv.setAttribute('class', 'ag-theme-balham dark-grid');
        this.gridDiv.style = 'height: ' + this.height;

        this.pApp = new App('', { gridId: '#div-gd-auto-complete' });
        this.gx = new HDGrid(
            this.gridDiv,
            [ { field: this.colId, headerName: "선택하세요.", width: "auto" } ],
            {
                onGridReady: (e) => {
                    this.gridApi = e.api;
                    this.gridApi.sizeColumnsToFit();
                },
                onCellClicked: (e) => {
                    this.value = e.data;
                    this.isCanceled = false;
                    this.params.api.stopEditing();
                }
            }
        );
        this.searchValues().then(res => this.gx.setRows(res));

        this.container.appendChild(this.input);
        this.container.appendChild(this.gridDiv);

        this.container.addEventListener('keydown', (event) => this.onEditorKeyDown(event));
        this.container.addEventListener('keyup', (event) => this.onEditorKeyUp(event));
    }

    getValue() {
        return this.value ? this.value?.[this.colId] : null;
    }

    getGui() {
        return this.container;
    }

    isCancelAfterEnd() {
        return this.isCanceled;
    }

    afterGuiAttached() {
        this.container.focus();
        this.input.focus();
    }

    destroy() {
    }

    isPopup() {
        return true;
    }

    async searchValues(keyword = '') {
        if (this.apiUrl !== '' && keyword) {
            return this.getResponse(this.apiUrl, keyword).then(res => {
                return res.data.map(row => {
                    if (this.dataKey) row[this.colId] = row[this.dataKey];
                    return row;
                });
            }).catch(error => {
                console.error(error);
            });
        }
        if (!this.apiUrl && this.rows.length > 0) {
            return this.rows.map(row => {
                if (this.dataKey) row[this.colId] = row[this.dataKey];
                return row;
            }).filter(row => row[this.colId]?.includes(keyword));
        }
        return [];
    }

    async getResponse(url, keyword) {
        return await axios({ method: 'get', url: this.apiUrl + '?keyword=' + keyword });
    }

    onEditorKeyDown(event) {
        event.stopPropagation();
        if (event.key === 'Enter') {
            this.rowConfirmed();
            return false;
        }
        if (event.target.nodeName === 'INPUT') {
            if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                if (!event.isComposing) {
                    event.preventDefault();
                    this.navigateGrid();
                }
            }
        }
        // mac os에서 전체선택(commend+A) -> 한글 한글자 입력 -> arrowdown키 입력 시 value가 강제로 변환(\u001f)되는 오류가 있습니다.
    }

    onEditorKeyUp(event) {
        event.stopPropagation();
        if (event.key === 'Escape') {
            this.params.api.stopEditing();
            this.onFocusOriginCell();
            return false;
        }
        if (event.target.nodeName === 'INPUT') {
            this.searchValues(event.target.value).then(res => this.gx.setRows(res));
        }
    }

    rowConfirmed() {
        if (this.gridApi.getDisplayedRowAtIndex(0)) {
            if (this.gridApi.getFocusedCell() && this.gridApi.getFocusedCell().rowIndex !== undefined) {
                this.value = this.gridApi.getDisplayedRowAtIndex(this.gridApi.getFocusedCell().rowIndex).data;
            } else {
                if (this.input.value === '') {
                    this.value = null;
                } else {
                    this.value = this.gridApi.getDisplayedRowAtIndex(0).data;
                }
            }
        } else {
            this.value = null;
        }
        this.isCanceled = false;
        this.params.api.stopEditing();
        this.onFocusOriginCell();
    }

    navigateGrid() {
        if (this.gridApi.getFocusedCell() === undefined || this.gridApi.getFocusedCell()?.rowIndex == undefined) {
            this.gridApi.setFocusedCell(this.gridApi.getDisplayedRowAtIndex(0)?.rowIndex, this.colId);
            this.gridApi.getDisplayedRowAtIndex(this.gridApi.getFocusedCell().rowIndex);
        } else {
            this.gridApi.setFocusedCell(this.gridApi.getFocusedCell()?.rowIndex, this.colId);
            this.gridApi.getDisplayedRowAtIndex(this.gridApi.getFocusedCell().rowIndex);
        }
    }

    onFocusOriginCell() {
        let cell = this.params.api.getFocusedCell();
        if (cell) {
            this.params.api.setFocusedCell(cell.rowIndex, cell.column);
        }
    }
}
