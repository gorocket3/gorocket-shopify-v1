import Quill from 'quill';
import ImageResize from 'quill-image-resize';
import "quill/dist/quill.snow.css";

const BlockEmbed = Quill.import('blots/block/embed');

class RawHTMLBlot extends BlockEmbed {
    static create(value) {
        const node = super.create();
        node.innerHTML = value;
        return node;
    }

    static value(node) {
        return node.innerHTML;
    }
}

RawHTMLBlot.blotName = 'raw-html';
RawHTMLBlot.tagName = 'section';

Quill.register(RawHTMLBlot);
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
        const rawHtml = this.editorApp.getSemanticHTML();

        let trimmedHtml = rawHtml
            .replace(/(<p>(<br\s*\/?>)?<\/p>)\s*$/i, '')
            .replace(/^<section[^>]*>/, '')
            .replace(/<\/section>$/, '')
            .replace(/(<p>(<br\s*\/?>)?<\/p>)\s*$/i, '')
            .replace(/&nbsp;/g, ' ');

        return trimmedHtml;
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
        this.editorApp.insertEmbed(0, 'raw-html', this.value, 'user');
        this.editorApp.focus();
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
