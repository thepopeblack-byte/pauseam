"use client";
import type {InputHTMLAttributes} from "react";
type Props=Omit<InputHTMLAttributes<HTMLInputElement>,"type"|"onChange"|"checked">&{checked:boolean;onCheckedChange:(checked:boolean)=>void};
/** Native consent control: keyboard and screen-reader semantics without a UI runtime. */
export function Checkbox({checked,onCheckedChange,...props}:Props){
 return <input {...props} data-slot="checkbox" type="checkbox" checked={checked} onChange={event=>onCheckedChange(event.currentTarget.checked)}/>;
}
