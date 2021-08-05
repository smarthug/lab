import { install, uninstall } from "@github/hotkey";
import { useEffect, useState } from "react";

// 여기서 shortcut 을 인자로 받게 하자 ... 아니면 object 쓰던가 ... 
export function useHotkey(shortcut = null) {
    const [element, setElement] = useState(null);


    useEffect(() => {

        if (shortcut) {
            element && install(element, shortcut)
        } else {
            element && install(element, shortcutMappingObj.showCommandPalette)
        }

        return (() => {
            console.log("uninstall!!")
            uninstall(element);
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