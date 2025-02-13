/**
 * GridCustomSettingEditor
 * Grid Header 개인설정 조회 시, 생성하는 인스턴스입니다.
 * 개인설정버튼에 팝오버를 생성하고, 저장/초기화 기능을 수행합니다.
 * @param button_id
 * @param idx
 * @param grid_callback
 * @param pid
 */

class GridCustomSettingEditor {
    constructor(button_id, idx, grid_callback, pid) {
        this.custom_button = $('#' + button_id);
        this.grid_callback = grid_callback;
        this.pid = pid;

        $(this.custom_button).after(`
                <div id="setting-grid-layer-${idx}" class="hide">
                    <div class="p-2">
                        <p class="fs-14 font-weight-bold mb-3"><i class="fas fa-cog mr-1"></i> 컬럼 순서 설정</p>
                        <div class="flex" style="height:35px;">
                            <button type="button" class="btn btn-outline-secondary h-100 mr-2 btn-reset-grid-${idx}" data-idx="${idx}" style="width: 100px;">초기화</button>
                            <button type="button" class="btn btn-primary h-100 btn-save-grid-${idx}" data-idx="${idx}" style="width: 100px;">저장</button>
                        </div>
                    </div>
                </div>
            `);
        $(this.custom_button).data('toggle', 'popover');
        $(this.custom_button).popover({
            container: 'body',
            placement: 'left',
            html: true,
            sanitize: false,
            content: $('#setting-grid-layer-' + idx).html(),
        });

        const resetCustom = (event) => this.resetCustom(event, this.custom_button);
        const saveCustom = (event) => this.saveCustom(event, this.custom_button);

        $(this.custom_button).on('shown.bs.popover', function () {
            $(".btn-reset-grid-" + idx).on("click", resetCustom);
            $(".btn-save-grid-" + idx).on("click", saveCustom);
        });
    }

    async resetCustom(event, button) {
        if (!confirm("초기화하시겠습니까?")) return;

        let res = await axios({ method: 'delete', url: '/head/cmm01/init', data: { pid: this.pid } });
        if (res.data.code === 200) {
            // $(button).popover('hide');
            window.location.reload();
        } else {
            console.error(res);
        }
    }

    saveCustom(event, button) {
        const grid = this.grid_callback();
        let column_datalist = grid?.gridOptions.api.getColumnDefs() || [];
        let new_column_datalist = [];

        column_datalist.forEach((value) => {
            let value_children = value['children'];
            let newchildren = [];

            if (value['children'] !== undefined) {
                value_children.forEach((val) => {
                    newchildren.push({
                        'field': val['field'], 'hide': val['hide'], 'pinned': val['pinned'], 'width': val['width']
                    });
                });
            }

            new_column_datalist.push({
                'field': value['field'],
                'hide': value['hide'],
                'pinned': value['pinned'],
                'width': value['width'],
                'children': newchildren
            });
        });

        let data = {
            'pid': this.pid, 'indiv_columns': JSON.stringify(new_column_datalist)
        }

        axios({
            method: 'post', url: '/head/cmm01/save', data: data,
        }).then((res) => {
            $(event.target).html('<i class="fas fa-check mr-2"></i>저장');
            setTimeout(() => {
                $(button).popover('hide');
            }, 300);
        }).catch((error) => {
            console.log(error);
        });
    }
}
