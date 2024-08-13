import { Request, Response } from 'express'
import { WeaviateClient } from 'weaviate-client'

export interface Context {
  req: Request
  res: Response
  weaviate: WeaviateClient
}