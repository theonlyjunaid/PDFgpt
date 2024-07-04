import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '@/trpc'

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: 'https://docu-convo-website.vercel.app/api/trpc',
    req,
    router: appRouter,
    createContext: () => ({}),
  })

export { handler as GET, handler as POST }