import { createUploadthing, type FileRouter } from "uploadthing/next";
import { db } from '@/db'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { PineconeStore } from 'langchain/vectorstores/pinecone'

const f = createUploadthing();
const middleware = async () => {
    const { getUser } = getKindeServerSession()
    const user = getUser()
  
    if (!user || !user.id) throw new Error('Unauthorized')
  
    // const subscriptionPlan = await getUserSubscriptionPlan()
  
    return { userId: user.id }
  }
  
  const onUploadComplete = async ({
    metadata,
    file,
  }: {
    metadata: Awaited<ReturnType<typeof middleware>>
    file: {
      key: string
      name: string
      url: string
    }
  }) => {
    const isFileExist = await db.file.findFirst({
        where: {
          key: file.key,
        },
      })
    
      if (isFileExist) return
    
      const createdFile = await db.file.create({
        data: {
          key: file.key,
          name: file.name,
          userId: metadata.userId,
          url: `https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`,
          uploadStatus: 'PROCESSING',
        },
      })
      
  }
  export const ourFileRouter = {
    freePlanUploader: f({ pdf: { maxFileSize: '4MB' } })
      .middleware(middleware)
      .onUploadComplete(onUploadComplete),
    // proPlanUploader: f({ pdf: { maxFileSize: '16MB' } })
    //   .middleware(middleware)
    //   .onUploadComplete(onUploadComplete),
  } satisfies FileRouter
 
export type OurFileRouter = typeof ourFileRouter;