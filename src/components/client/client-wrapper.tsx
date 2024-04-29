"use client"
import { useIsClient } from "@uidotdev/usehooks";

export default function ClientWrapper({children}:{children:React.ReactElement}){
    const is = useIsClient()
    return is == true ? children : null
}