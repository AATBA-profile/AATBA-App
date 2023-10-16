"use client"

import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu"
import { Dispatch, useState, SetStateAction } from "react"
import { AiOutlineShareAlt } from "react-icons/ai"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@components/ui/dropdown-menu"

type Checked = DropdownMenuCheckboxItemProps["checked"]

type Props = {
    items: string[]
    shareBtn?: boolean
    btnText?: string
    cn?: string
    state?: string
    setState?: Dispatch<SetStateAction<string | undefined>>
}

const Dropdown = ({ items, shareBtn, btnText, cn, state, setState }: Props) => {
    const [showStatusBar, setShowStatusBar] = useState<Checked>(true)
    const [showActivityBar, setShowActivityBar] = useState<Checked>(false)
    const [showPanel, setShowPanel] = useState<Checked>(false)
    
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div
                    className={`${cn} flex items-center justify-center gap-2 rounded-full bg-muted-foreground/40 px-3 py-1 text-sm text-white hover:bg-muted-foreground`}
                >
                    {shareBtn ? (
                        <>
                            <span className="text-xs">Share</span>
                            <AiOutlineShareAlt />
                        </>
                    ) : (
                        <span className="text-xs">{btnText}</span>
                    )}
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
                {/* <DropdownMenuLabel>Click to Copy</DropdownMenuLabel> */}
                {/* <DropdownMenuSeparator /> */}
                {items?.map((i) => (
                    // <DropdownMenuItem value={} >{i} </DropdownMenuItem>
                    <DropdownMenuRadioGroup value={state} onValueChange={setState}>
                        <option value={i}>{i}</option>
                    </DropdownMenuRadioGroup>
                ))}

                {/* <Link href="">"defdvdvffrf"</Link>
                <Link href="">"edersfewfwff"</Link> */}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default Dropdown
