import { twMerge } from "tailwind-merge";
import clsx, { ClassValue } from "clsx";

export function cn(...inputs:ClassValue[]){
    //px-2 py-2-> p-2
    return twMerge(clsx(inputs))
}