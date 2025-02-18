class GridFieldEditor {
    values;
    value;
    label;
    containerWidth;

    constructor() {
    }

    init(params) {
        this.values = params.values;
        this.value = params.value;
        this.label = params.label || 'label';
        this.containerWidth = params.width || '200px';

        this.container = document.createElement('div');
        this.container.style = `width: ${this.containerWidth}; padding: 12px 7px; outline: none;`;
        this.container.tabIndex = '0';

        this.wrapper = document.createElement('div');
        this.wrapper.className = 'Polaris-ShadowBevel';
        this.wrapper.style = "display: flex; flex-direction: column; align-items: start; gap: 7px;";

        for (let i = 0; i < this.values.length; i++) {
            const val = this.values[i];

            const item = document.createElement('div');
            item.innerText = val[this.label] || '';
            item.className = `grid-badge ${val?.color || ''}`;
            item.addEventListener('click', () => {
                this.selectValue(val.id);
                params.stopEditing();
            });
            this.wrapper.appendChild(item);
        }

        this.container.appendChild(this.wrapper);

        this.selectValue(this.value);
    }

    selectValue(id) {
        this.value = id;
    }

    getGui() {
        return this.container;
    }

    afterGuiAttached() {
        this.container.focus();
    }

    getValue() {
        return this.value;
    }

    destroy() {
    }

    isPopup() {
        return true;
    }
}
