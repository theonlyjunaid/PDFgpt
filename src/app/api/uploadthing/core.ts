import { createUploadthing, type FileRouter } from "uploadthing/next";
import { db } from '@/db'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { PineconeStore } from 'langchain/vectorstores/pinecone'
import { getPineconeClient } from "@/lib/pinecone";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

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
      url: `https://utfs.io/f/${file.key}`,
      uploadStatus: 'PROCESSING',
    },
  })

  try {
    const response = await fetch(`https://utfs.io/f/${file.key}`)
    const blob = await response.blob()
    const loader = new PDFLoader(blob)
    const pageLevelDocs = await loader.load()
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const chunkedDocs = await textSplitter.splitDocuments(pageLevelDocs);

    // pageLevelDocs.forEach((pageLevelDoc) => {
    //   console.log(pageLevelDoc)
    //   pageLevelDoc.metadata = {
    //     ...pageLevelDoc.metadata,
    //     fileId: createdFile.id
    //   }
    // }
    // )
    const pageAmt = pageLevelDocs.length

    //vectorize each page
    const pinecone = await getPineconeClient()
    const pineconeIndex = pinecone.Index('canopy--document-uploader')
    console.log('pineconeIndex', pineconeIndex)
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    })

    // console.log(pageLevelDocs)

    // await PineconeStore.fromDocuments(
    //   pageLevelDocs,
    //   embeddings,
    //   {
    //     pineconeIndex,
    //     maxConcurrency: 5,
    //   }
    // );
    console.log(chunkedDocs)

    await PineconeStore.fromDocuments(
      chunkedDocs,
      embeddings,
      pineconeIndex
    )



    console.log('done vectorizing each page')
    await db.file.update({
      data: {
        uploadStatus: 'SUCCESS',
      },
      where: {
        id: createdFile.id,
      },
    })
  } catch (error) {
    console.log(error)
    await db.file.update({
      where: {
        id: createdFile.id,
      },
      data: {
        uploadStatus: 'FAILED',
      },
    })
    console.log(error)

  }

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