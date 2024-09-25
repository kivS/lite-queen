import { ClipboardCopyIcon } from "lucide-react"
import { ToastAction } from "./ui/toast"

export default function ToastActionWithCopyToClipboard({text}){
    return (
        <ToastAction altText="Copy" onClick={() => {
            console.log(text)
            if (navigator.clipboard) {
                navigator.clipboard.writeText(text)
            }
        }} >
            <ClipboardCopyIcon title="Copy" className='size-4' />
        </ToastAction>
    )
}