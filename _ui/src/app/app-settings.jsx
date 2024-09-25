'use client'

import Link from "next/link"
import { CardTitle, CardDescription, CardHeader, CardContent, CardFooter, Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useId, useRef, useState } from "react"
import { AppearanceSettings, LocalOpenAiSettings } from "@/lib/data"
import { useToast } from "@/components/ui/use-toast"
import { updatePageTitle } from "@/lib/utils"

const routes = {
    appearence: {
        title: 'Appearence',
        route: <Appearence />
    },
    Ai: {
        title: 'AI',
        route: <Ai />
    },
    // general: {
    //     title: 'General',
    //     route: <General />
    // },
}

export default function AppSettings() {

    const [selectedRoute, setSelectedRoute] = useState(Object.entries(routes)[0][0])

    return (
        <>
            <div key="1" className="flex flex-col">
                <main className="flex flex-1 flex-col gap-4 md:gap-8 md:p-10">
             
                    <div className="grid md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr] items-start gap-6 max-w-6xl w-full mx-auto">
                        <nav className="text-sm  overflow-x-scroll  text-gray-500 flex justify-center m-4 md:m-0 md:justify-normal md:grid gap-4 dark:text-gray-400">
                            {Object.entries(routes).map(([id, route]) => (
                                <Link 
                                    key={id} 
                                    href="#" 
                                    className={`${
                                        selectedRoute === id ? 'font-semibold text-gray-900 dark:text-gray-50' : ''
                                    }`}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        setSelectedRoute(id)
                                     }}
                                >{route.title}</Link>
                            ))}

                        </nav>

                        {routes[selectedRoute]?.route}
                       
                    </div>
                </main>
            </div>
        </>
    )

}

function Appearence(){

    const currentLabel = AppearanceSettings.getWindowLabel()
    
    const [windowLabelText, setWindowLabelText] = useState(currentLabel)

    const { toast } = useToast()

    return (
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Window Label</CardTitle>
                    <CardDescription>
                        Used to help distinguish between environments. Add a label and refresh the page to see the label on the browser window.
                        </CardDescription>
                </CardHeader>
                <CardContent>
                    <form id="windowLabelForm" onSubmit={(e) =>{
                        e.preventDefault()

                        try {
                            AppearanceSettings.setWindowLabel(windowLabelText)
                           
                        } catch (error) {
                            console.log("Failed to set window label: ", error)
                            return
                        }

                        toast({
                            duration: 2000,
                            title: "Window label updated!",
                        })
                    }}>
                        <Input
                            value={windowLabelText}
                            onChange={(e) => setWindowLabelText(e.target.value)}
                            placeholder="Production"
                        />
                    </form>
                </CardContent>
                <CardFooter className="border-t p-4 justify-end">
                    <Button variant="outline" form="windowLabelForm" type="submit">Save</Button>
                </CardFooter>
            </Card>

        </div>
    )
}


function Ai() {
    const key = LocalOpenAiSettings.getApiKey()
    const [apiKey, setApiKey] = useState(key) 
    
    const { toast } = useToast()


    const formId = useId()

    return (
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>OpenAI - API Key</CardTitle>
                    <CardDescription>Used to chat directly with sqlite in natural language.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form id={formId} onSubmit={(e)=>{

                        e.preventDefault()

                        try {
                            LocalOpenAiSettings.setApiKey(apiKey)
                        } catch (error) {
                            console.log("Failed to set API Key: ", error)
                            return
                        }

                        toast({
                            duration: 2000,
                            title: "API Key updated!",
                        })
                    }}
                    >
                        <Input 
                            value={apiKey} 
                            onChange={(e) => setApiKey(e.target.value)}                             
                            placeholder="API KEY" 
                        />
                    </form>
                </CardContent>
                <CardFooter className="border-t p-4 justify-end">
                    <Button type="submit" variant="outline" form={formId}>Save</Button>
                </CardFooter>
            </Card>
        
        </div>
    )
}

// function General(){
//     return (
//         <div className="grid gap-6">
//             <Card>
//                 <CardHeader>
//                     <CardTitle>Project Name</CardTitle>
//                     <CardDescription>Used to identify your project in the dashboard.</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                     <form>
//                         <Input placeholder="Project Name" />
//                     </form>
//                 </CardContent>
//                 <CardFooter className="border-t p-4">
//                     <Button>Save</Button>
//                 </CardFooter>
//             </Card>
//             <Card>
//                 <CardHeader>
//                     <CardTitle>Root Directory</CardTitle>
//                     <CardDescription>The directory within your project, in which your code is located.</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                     <form className="flex flex-col gap-4">
//                         <Input defaultValue="/web" placeholder="Project Name" />
//                         <div className="flex items-center space-x-2">
//                             <Checkbox defaultChecked id="include" />
//                             <label
//                                 className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
//                                 htmlFor="include"
//                             >
//                                 Include files from outside of the Root Directory
//                             </label>
//                         </div>
//                     </form>
//                 </CardContent>
//                 <CardFooter className="border-t p-6">
//                     <Button>Save</Button>
//                 </CardFooter>
//             </Card>
//         </div>
//     )
// }

