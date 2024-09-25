"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Database, PlusCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandSeparator
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { AddDatabaseModal } from "./add-database-modal"
import useSWR from "swr"
import { ROOT_URL, fetcher } from "@/lib/utils"
import { useRouter, useSearchParams } from 'next/navigation'


export function DatabaseSwitcher({open, setOpen, setAddDbModalOpen}) {
    const router = useRouter()
    const searchParams = useSearchParams()


    const current_db_id = searchParams.get('db_id')

    const { data, error, isLoading } = useSWR(`${ROOT_URL}/api/get-loaded-databases`, fetcher)

    
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-48  sm:w-80 justify-between mr-4"
                >
                    <Database width={24} height={24} className="h-4 w-4 shrink-0 opacity-50" />
                    <div className="truncate p-1">
                        {data
                            ? data.databases[current_db_id]?.db_alias
                            : "Loading..."}
                    </div>
                    <ChevronsUpDown width={24} height={24}  className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 mx-2">
                <Command>
                    <CommandInput placeholder="Search database..." className="text-base" />
                    <CommandEmpty>No database found.</CommandEmpty>
                    <CommandGroup>
                        {data && Object.entries(data?.databases).map(([id, db]) => (
                            <CommandItem
                                key={id}
                                onSelect={(selectedDatabase) => {
                                    setOpen(false)
                                    router.push(`/db?db_id=${id}`)
                                }}
                                className=""
                            >
                                <Check width={24} height={24}
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        current_db_id === id ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                <span className="truncate">
                                    {db.db_alias}
                                </span>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup>
                        <CommandItem onSelect={(e) => {
                            console.log('open')
                            setAddDbModalOpen(true)
                        }
                        }>
                            <Button variant="ghost" className="">
                                <PlusCircle width={24} height={24}  className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                Add database
                            </Button >
                        </CommandItem>
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
