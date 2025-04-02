import Quill from 'quill';
import ImageResize from 'quill-image-resize';
import "quill/dist/quill.snow.css";

Quill.register('modules/ImageResize', ImageResize);

export default class GridContentEditor {
    constructor() {
        this.editorApp;
        this.container;
        this.params;
        this.value;
    }

    init(params) {
        this.params = params;
        this.value = params.value;

        this.container = document.createElement('div');
        this.container.setAttribute('id', 'gd-editor');
        this.container.style = "width: 100%; max-width: 700px;";
        this.container.addEventListener('keydown', (event) => this.onEditorKeyDown(event));
    }

    getValue() {
        return this.editorApp.getSemanticHTML();
    }

    getGui() {
        return this.container;
    }

    afterGuiAttached() {
        this.editorApp = new Quill('#gd-editor', {
            theme: 'snow',
            placeholder: this.params.placeholder || '',
            modules: {
                toolbar: [
                    [ { 'header': [ 1, 2, 3, 4, 5, 6, false ] }, 'bold', 'italic', 'underline', 'strike', { 'color': [] } ],
                    [ { 'align': [] }, { 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }, { 'direction': 'rtl' } ],
                    [ 'blockquote', 'link', 'image', 'video' ],
                    [ 'clean' ]
                ],
                ImageResize: {
                    parchment: Quill.import('parchment')
                },
                keyboard: {
                    bindings: {
                        ENTER: {
                            key: "Enter",
                            handler: function () {}
                        }
                    }
                },
            },
        });
        this.editorApp.clipboard.dangerouslyPasteHTML(0, this.value);
    }

    destroy() {
    }

    isPopup() {
        return true;
    }

    onEditorKeyDown(event) {
        if (
            (event.key === 'Enter' && event.shiftKey)
            || event.key === 'ArrowDown'
            || event.key === 'ArrowUp'
            || event.key === 'ArrowLeft'
            || event.key === 'ArrowRight'
        ) {
            event.stopPropagation();
            return false;
        }
    }

}
