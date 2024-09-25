import { AlertCircle, FileWarning, Terminal } from "lucide-react"

import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert"

export default function ErrorAlert({ error }) {
    return (
        <Alert className="w-2/3">
            <AlertCircle width={24} height={24}  className="stroke-red-600 h-4 w-4" />
            <AlertTitle className="text-red-600 font-bold">Error</AlertTitle>
            <AlertDescription>
                {error}
            </AlertDescription>
        </Alert>
    )
}