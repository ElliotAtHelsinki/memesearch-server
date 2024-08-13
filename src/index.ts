import { __prod__ } from '@/src/constants'
import { MemeResolver } from '@/src/resolvers'
import { Context } from '@/src/types'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import cors from 'cors'
import express from 'express'
import http from 'http'
import { buildSchema } from 'type-graphql'
import weaviate, { WeaviateClient } from 'weaviate-client'

const weaviateClient: WeaviateClient = await weaviate.connectToLocal()


const app = express()

const httpServer = http.createServer(app)
const apolloServer = new ApolloServer<Context>({
  schema: await buildSchema({
    resolvers: [
      MemeResolver
    ]
  }),
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
})
await apolloServer.start()
app.use(
  '/graphql',
  cors<cors.CorsRequest>({
    origin: process.env.FRONTEND_ORIGIN,
    credentials: true
  }),
  express.json({ limit: '1GB' }),
  expressMiddleware(apolloServer, {
    context: async ({ req, res }): Promise<Context> => ({ req, res, weaviate: weaviateClient })
  })
)


app.listen(parseInt(process.env.API_PORT), () => {
  if (!__prod__) {
    console.log(`Server started on localhost:${process.env.API_PORT}.`)
  }
  else {
    console.log(`Server started at ${process.env.BACKEND_ORIGIN}.`)
  }
})

app.get('/', (_, res) => {
  res.send('Start querying at /graphql.')
})
