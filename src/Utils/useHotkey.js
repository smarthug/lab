import { install, uninstall } from "@github/hotkey";
import { useEffect, useState } from "react";

// 여기서 shortcut 을 인자로 받게 하자 ... 아니면 object 쓰던가 ... 
export function useHotkey(shortcut = null) {
    const [element, setElement] = useState(null);

    useEffect(() => {

        return (() => {
            uninstall(element);
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        console.log("immutable dom???")
        // element&&install(element, "t e")
        element && shortcut && install(element, shortcut)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [element])

    // 더 추가해도 , set element 를 확장한 무언가를 하자 
    // 내가 setState 를 쓴이유는 setState 는 같은게 들어오면 , 반응을 아예안하니까 썼다 ... 
    function setHotkey(element) {

    }



    return setElement
}