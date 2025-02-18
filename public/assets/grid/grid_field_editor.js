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
            item.className = `grid-badge ${val?.className || 'Polaris-Badge--toneDefault'}`;
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

class GridFieldMultipleEditor {
    values;
    value;
    valueArray;
    label;
    containerWidth;

    constructor() {
        this.defaultClass = "grid-badge Polaris-Badge--toneDefault";
        this.selectedClass = "grid-badge Polaris-Badge--toneInfo border border-primary";
    }

    init(params) {
        this.values = params.values;
        this.value = params.value;
        this.valueArray = this.value.split(', ');
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
            item.className = this.defaultClass;
            item.addEventListener('click', () => {
                this.selectValue(val.id);
            });
            this.wrapper.appendChild(item);
        }

        this.container.appendChild(this.wrapper);
        this.setStyle();
    }

    selectValue(id) {
        const idx = this.valueArray.indexOf(id);
        if (idx > -1) {
            this.valueArray.splice(idx, 1);
        } else {
            this.valueArray.push(id);
        }

        this.valueArray = this.valueArray.filter(Boolean);
        this.value = this.valueArray.join(', ');

        this.setStyle();
    }

    setStyle() {
        const items = this.wrapper.children;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const val = this.values.find(v => v.id === item.innerText);

            if (this.valueArray.includes(val.id)) {
                item.className = this.selectedClass;
            } else {
                item.className = this.defaultClass;
            }
        }
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
