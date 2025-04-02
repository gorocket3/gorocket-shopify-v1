import { useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import { BlockStack, Button } from "@shopify/polaris";

export function HtmlViewer({ id, source }) {
    const editorRef = useRef(null);
    const quillRef = useRef(null);
    const [ showAll, setShowAll ] = useState(false);
    const [ showButton, setShowButton ] = useState(false);

    useEffect(() => {
        if (editorRef.current) {
            quillRef.current = new Quill(editorRef.current, {
                theme: 'snow',
                readOnly: true,
                modules: {
                    toolbar: false,
                },
            });

            quillRef.current.clipboard.dangerouslyPasteHTML(0, source);
        }

        return () => {}
    }, [ source ]);

    useEffect(() => {
        if (editorRef.current.scrollHeight >= 200) setShowButton(true);
    }, [ editorRef.current ])

    return (
        <BlockStack align="center" gap="200">
            <div className={`readonly-editor ${showAll ? 'show' : ''}`}>
                <div id={id} ref={editorRef}/>
            </div>
            {showButton && !showAll && <Button variant="secondary" onClick={() => setShowAll(true)}>View More</Button>}
        </BlockStack>
    );
}
