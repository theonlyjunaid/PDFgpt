import { Index, Pinecone, RecordMetadata } from '@pinecone-database/pinecone'

export const getPineconeClient = async () => {
  const client = new Pinecone({
    apiKey: "b33d6f38-01b1-4232-bc81-517d0318668d",
    environment: 'gcp-starter',
  })


  // await client.init({
  //   apiKey: process.env.PINECONE_API_KEY!,
  //   environment: 'gcp-starter',
  // })

  return client
}