import { install, uninstall } from "@github/hotkey";
import { useEffect, useState } from "react";

// 여기서 shortcut 을 인자로 받게 하자 ... 아니면 object 쓰던가 ... 
// 두번째 인자나 첫번째 인자로 무엇을 위한 단축키 인지 받게 할까 ?? 
export function useHotkey(shortcut = null) {
    const [element, setElement] = useState(null);


    useEffect(() => {

        if (shortcut) {
            element && install(element, shortcut)
        } else {
            element && install(element, shortcutMappingObj.showCommandPalette)
            // element && install(element, shortcutMappingObj[shortcut])
        }

        return (() => {

            uninstall(element);
            // element && uninstall(element)
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [element])




    return setElement
}


export const shortcutMappingObj = {
    showCommandPalette: "Control+P",
};



// useEffect(() => {

//     return (() => {
//         console.log("totally gone")
//         uninstall(element);
//     })
//     // eslint-disable-next-line react-hooks/exhaustive-deps
// }, [])

// for those case 


// 이거 기능도 hooks 로 빼야할듯 .... 
// useEffect(() => {
//     let button = document.createElement("button");

//     button.setAttribute(
//         "data-hotkey",
//         shortcutMappingObj.showCommandPalette
//     );
//     button.addEventListener("click", handleOnClick);
//     setIncreaseNumShortcut(button)
//     // install(button, "t t");
//     // works same ...
//     // button.remove();

//     return () => {
//         button.removeEventListener("click", handleOnClick);
//         button.remove();
//     };
// }, []);



export function fireDeterminedAction(el: HTMLElement): void {
    if (isFormField(el)) {
        el.focus()
    } else {
        el.click()
    }
}



export function isFormField(element: Node): boolean {
    if (!(element instanceof HTMLElement)) {
        return false
    }

    const name = element.nodeName.toLowerCase()
    const type = (element.getAttribute('type') || '').toLowerCase()
    return (
        name === 'select' ||
        name === 'textarea' ||
        (name === 'input' && type !== 'submit' && type !== 'reset' && type !== 'checkbox' && type !== 'radio') ||
        element.isContentEditable
    )
}