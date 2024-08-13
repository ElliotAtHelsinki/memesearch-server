import { Context } from '@/src/types'
import { Arg, Ctx, Field, Int, ObjectType, Query, Resolver } from 'type-graphql'

@ObjectType()
class Meme {
  @Field(() => String)
  text: string

  @Field(() => String)
  image: string
}

@Resolver(Meme)
export class MemeResolver {
  @Query(() => [Meme])
  async search(
    @Arg('image', () => String, { nullable: true }) image: string,
    @Arg('limit', () => Int, { nullable: true }) limit: number = 1,
    @Ctx() { weaviate }: Context
  ): Promise<Meme[]> {
    console.log(await weaviate.collections.listAll())
    const memeCollection = weaviate.collections.get('Meme')
    const searchFileBuffer = Buffer.from(image, 'base64')
    const response = await memeCollection.query.nearImage(searchFileBuffer, {
      limit,
      returnProperties: ['image', 'text']
    })
    return response.objects.map(o => ({ image: o.properties.image as string, text: o.properties.text as string }))
  }
}
