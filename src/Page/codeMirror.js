import React, { useState, useRef, useEffect } from "react";
// import MDRenderer from "../../../Extensions/Core/markdown/component";
// import MDWrapper from '../../../Components/partial/markdown'
// import IssueMD from './issueMd'

import {
    Button,
    TextField,
    TextareaAutosize,
    CircularProgress,
    Tabs,
    Tab,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

// import { fetchWithoutHooks } from "../../../Utils/axios";
// import { usersAPI } from "../../../Urls";
import { useParams, useHistory } from "react-router-dom";

// import FlexContainer from '../../../Components/Flex/container'
// import FlexItem from '../../../Components/Flex/item'

// import MirrorMark from 'MirrorMark'
// import MirrorMark from './mirrormark.package'
// import * as MirrorMark from "MirrorMark/dist/js/mirrormark.package.js"
import CodeMirror from "codemirror"
// import MirrorMark from './mirrormark'
// console.log(Testest)

// import 'MirrorMark/dist/css/mirrormark.css'
// import './mirrormark.css'
import './mirrormark.package.css'
// import 'MirrorMark/dist/css/demo.css'
import './demo.css'



const useStyles = makeStyles(theme => ({
    test: {
        // margin: theme.spacing(4),
        color: "red",

        // "& div.test a:before": {
        //     content: "zzzzzz"
        // },
        "& div": {
            color: "blue",
            // content:"thefuck"
        },




        [theme.breakpoints.down("sm")]: {
            margin: theme.spacing(1),
        },
    },
}));

export default function Main({ type, namespace_slug, name }) {
    // const matches = useMediaQuery(theme => theme.breakpoints.down("sm"));
    const classes = useStyles();







    // markdown-it 로직 사용해서 parse , 
    // function InitMirrorMark() {

    //     window.CodeMirror = CodeMirror


    //     var converter = new Markdown.Converter();
    //     Markdown.Extra.init(converter);

    //     CodeMirror.defineOption("preview", false, function (cm, val, old) {
    //         if (old == CodeMirror.Init) old = false;
    //         if (!old == !val) return;
    //         if (val) {
    //             setPreview(cm);
    //         } else {
    //             setNormal(cm);
    //         }
    //     });

    //     function setPreview(cm) {
    //         var wrap = cm.getWrapperElement();
    //         wrap.className += " CodeMirror-has-preview";

    //         refreshPreview(wrap, cm);
    //     }

    //     function refreshPreview(wrap, cm) {
    //         var previewNodes = wrap.getElementsByClassName("CodeMirror-preview");
    //         var previewNode;
    //         if (previewNodes.length == 0) {
    //             var previewNode = document.createElement('div');
    //             previewNode.className = "CodeMirror-preview";
    //             wrap.appendChild(previewNode);
    //         } else {
    //             previewNode = previewNodes[0];
    //         }
    //         previewNode.innerHTML = converter.makeHtml(cm.getValue());
    //     }

    //     function setNormal(cm) {
    //         var wrap = cm.getWrapperElement();
    //         wrap.className = wrap.className.replace(/\s*CodeMirror-has-preview\b/, "");
    //         cm.refresh();
    //     }
    // }



    useEffect(() => {


        // InitMirrorMark();

        window.CodeMirror = CodeMirror

        // console.log(CodeMirror);
        // // import("MirrorMark/src/js/mirrormark").then(v=>console.log(window.mirrorMark))
        import("MirrorMark/src/js/mirrormark").then(v => {
            console.log(v)

            let textarea1 = window.mirrorMark(document.getElementById("textarea1"), { showToolbar: true });
            textarea1.render();




            let div = document.createElement("div")
            div.textContent = "format_italic"
            div.classList.add("material-icons");
            document.querySelector(".italicize").childNodes[0].appendChild(div);


            div = document.createElement("div")
            div.textContent = "format_bold"
            div.classList.add("material-icons")
            document.querySelector(".bold").childNodes[0].appendChild(div);

            div = document.createElement("div")
            div.textContent = "format_quote"
            div.classList.add("material-icons");
            document.querySelector(".blockquote").childNodes[0].appendChild(div);

            div = document.createElement("div")
            div.textContent = "strikethrough_s"
            div.classList.add("material-icons");
            document.querySelector(".strikethrough").childNodes[0].appendChild(div);

            div = document.createElement("div")
            div.textContent = "link"
            div.classList.add("material-icons");
            document.querySelector(".link").childNodes[0].appendChild(div);

            div = document.createElement("div")
            div.textContent = "image"
            div.classList.add("material-icons");
            document.querySelector(".image").childNodes[0].appendChild(div);

            div = document.createElement("div")
            div.textContent = "format_list_bulleted"
            div.classList.add("material-icons");
            document.querySelector(".unorderedList").childNodes[0].appendChild(div);

            div = document.createElement("div")
            div.textContent = "format_list_numbered"
            div.classList.add("material-icons");
            document.querySelector(".orderedList").childNodes[0].appendChild(div);

            div = document.createElement("div")
            div.textContent = "open_in_full"
            div.classList.add("material-icons");
            document.querySelector(".fullScreen").childNodes[0].appendChild(div);

            div = document.createElement("div")
            div.textContent = "preview"
            div.classList.add("material-icons");
            document.querySelector(".preview").childNodes[0].appendChild(div);





        })
        // window.mirrorMark


        // let textarea1 = MirrorMark(document.getElementById("textarea1"), { showToolbar: true });
        // textarea1.render();

        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className={"editor"} style={{
            width: "100%",
            height: "100%",
            backgroundColor:"white"
            
        }}>

            <textarea style={{ width: "100%", margin: 0, }} id="textarea1">

                # This is a main heading
                ## This is a sub heading
                ### This is a sub sub heading
            </textarea>
        </div>

    );
}
