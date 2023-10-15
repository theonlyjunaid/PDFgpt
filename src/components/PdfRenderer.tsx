
"use client"
import React,{useState} from 'react'
import { useToast } from './ui/use-toast'

const PdfRenderer = () => {
    const { toast } = useToast()

    const [numPages, setNumPages] = useState<number>()
    const [currPage, setCurrPage] = useState<number>(1)
    const [scale, setScale] = useState<number>(1)
    const [rotation, setRotation] = useState<number>(0)
    const [renderedScale, setRenderedScale] = useState<
      number | null
    >(null)
  return (
    <div className='w-full bg-white rounded-md shadow flex flex-col items-center'>
      <div className='h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2'>
        <div className='flex items-center gap-1.5'>
top bar
            </div>
            </div>
    </div>
  )
}

export default PdfRenderer