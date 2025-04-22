import { Jodit } from 'jodit';
import 'jodit/es5/jodit.min.css';

export default class GridContentEditor {
    constructor() {
        this.editorApp;
        this.container;
        this.params;
        this.richText;
    }

    init(params) {
        this.params = params;
        this.richText = params.value;

        this.container = document.createElement('div');
        this.container.setAttribute('id', 'jodit-editor');
        this.container.setAttribute('class', 'grid-content-editor');
        this.container.style = "width: 100%; max-width: 700px;";
    }

    getValue() {
        const rawHtml = this.editorApp.value;

        let trimmedHtml = rawHtml
            .replace(/&nbsp;/g, ' ')
            .replace(/&#39;/g, '\'')
            .replace(/&quot;/g, '\"');

        return trimmedHtml;
    }

    getGui() {
        return this.container;
    }

    getPopupPosition() {
        return 'over'; // over(default), under
    }

    afterGuiAttached() {
        this.editorApp = Jodit.make('#jodit-editor', {
            height: 400,
            readonly: false,
            enter: 'br',
            useDefaultInputRules: false,
            useDefaultLineBreaks: false,
            removeEmptyElements: false,
            iframe: false,
            toolbarSticky: false,
            showCharsCounter: false,
            showWordsCounter: false,
            showXPathInStatusbar: false,
            toolbarAdaptive: false,
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
        });

        this.editorApp.value = this.richText;
        this.editorApp.focus();
        this.editorApp.events.on('keydown', (event) => this.onEditorKeyDown(event));
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
