import { db } from '@/db'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import React from 'react'
import { redirect} from 'next/navigation'
import Dashboard from '@/components/Dashboard'

const Page = async () => {
    const {getUser} = getKindeServerSession()
    const user = getUser()
 
    if(!user||!user.id) redirect("/auth-callback?origin=dashboard") 
    const dbUser = await db.user.findFirst({
        where:{
            id:user.id
        }
    })
console.log(dbUser)

    if(!dbUser) redirect("/auth-calback?origin=dashboard")
  return (
 <Dashboard/>
  )
}

export default Page