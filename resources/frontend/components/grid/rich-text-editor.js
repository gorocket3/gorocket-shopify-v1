import { Jodit } from 'jodit';
import 'jodit/es5/jodit.min.css';

export default class GridContentEditor {
    constructor() {
        this.editorApp;
        this.container;
        this.params;
        this.richText;
        this.startCallback;
        this.endCallback;
    }

    init(params) {
        this.params = params;
        this.richText = params.value;
        this.startCallback = params.startCallback;
        this.endCallback = params.endCallback;

        this.container = document.createElement('div');
        this.container.setAttribute('id', 'jodit-editor');
        this.container.setAttribute('class', 'grid-content-editor');
    }

    getValue() {
        if (this.endCallback) this.endCallback(this.params);

        const rawHtml = this.editorApp.value;

        let trimmedHtml = rawHtml
            .replace(/&nbsp;/g, '\u00A0')
            .replace(/&#39;/g, '\'')
            .replace(/&quot;/g, '\"');

        return trimmedHtml;
    }

    getGui() {
        return this.container;
    }

    afterGuiAttached() {
        const el = document.querySelector('.ag-popup-editor');
        if (el && el.querySelector('.grid-content-editor')) {
            el.style.minWidth = '330px';
            el.style.top = '50%';
            el.style.left = '50%';
            el.style.transform = 'translate(-50%, -50%)';
        }

        this.editorApp = Jodit.make('#jodit-editor', {
            height: 400,
            readonly: false,
            enter: 'br',
            i18n: 'en',
            toolbar: true,
            toolbarButtonSize: 'middle',
            buttons: [
                'paragraph', '|',
                'bold', 'italic', 'underline', 'strikethrough', 'brush', '|',
                'ul', 'ol', '|',
                'link', 'table', 'image', '|',
                'undo', 'redo'
            ],
            extraButtons: [],
            colorPickerDefaultTab: 'color',
            imageDefaultWidth: 300,
            cleanHTML: {
                cleanOnPaste: false,
                fillEmptyParagraph: false,
            },
            disablePlugins: [ 'paste', 'clean-html', 'stat' ],
            allowTags: [ '*' ],
            allowAttributes: [ '*' ],
            placeholder: this.params.placeholder || '',
            useSplitMode: true,
            autofocus: true,
            cursorAfterAutofocus: 'end',
            saveSelectionOnBlur: true,
            useDefaultInputRules: false,
            useDefaultLineBreaks: false,
            removeEmptyElements: false,
            iframe: false,
            toolbarSticky: false,
            showCharsCounter: false,
            showWordsCounter: false,
            showXPathInStatusbar: false,
            toolbarAdaptive: false,
        });

        this.editorApp.setEditorValue(this.richText);
        this.editorApp.focus();
        this.editorApp.events.on('keydown', (event) => this.onEditorKeyDown(event));

        if (this.startCallback) this.startCallback(this.params);
    }

    destroy() {
        if (this.editorApp) {
            this.editorApp.destruct();
            this.editorApp = null;
        }
    }

    isPopup() {
        return true;
    }

    onEditorKeyDown(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            this.params.stopEditing();
            return false;
        }
    }

}
