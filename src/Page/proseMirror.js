import React, { useEffect, useRef, useState } from 'react';
import { EditorState } from "prosemirror-state"
import { EditorView } from "prosemirror-view"
import { Schema, DOMParser } from "prosemirror-model"
import { schema } from "prosemirror-schema-basic"
import { addListNodes } from "prosemirror-schema-list"
import { exampleSetup } from "prosemirror-example-setup"
import { defaultMarkdownParser, defaultMarkdownSerializer} from "prosemirror-markdown"
import MarkdownIt from 'markdown-it'



import './proseMirror.css'


console.log(exampleSetup)
// Mix the nodes from prosemirror-schema-list into the basic schema to
// create a schema with list support.
const mySchema = new Schema({
    nodes: addListNodes(schema.spec.nodes, "paragraph block*", "block"),
    marks: schema.spec.marks
})




export default function ProseMirrorEditor() {

    const editorRef = useRef();

    const [markdown, setMarkdown] = useState("# test")

    useEffect(() => {

        editorRef.current = new EditorView(document.querySelector("#editor"), {
            state: EditorState.create({
                doc: DOMParser.fromSchema(mySchema).parse(document.querySelector("#content")),
                plugins: exampleSetup({ schema: mySchema })
            })
        })
    }, [])

    function Render() {
        console.log("Render");

        console.log(editorRef.current);

        var md = new MarkdownIt();
        var result = md.render(defaultMarkdownSerializer.serialize(editorRef.current.state.doc));
        // var result = md.render("# heelo");
        setMarkdown(result)

        console.log(document.querySelector("#content").value)
        console.log(editorRef.current.state.doc)
        console.log(editorRef.current.state.doc.textContent)

        console.log(defaultMarkdownSerializer.serialize(editorRef.current.state.doc));
    }

    return (
        <div>
            <div id="editor">

            </div>

            <textarea id="content">


            </textarea>

            <button onClick={Render}>Render</button>

            <div dangerouslySetInnerHTML={{__html:markdown}} id="result" />
        </div>
    )
}