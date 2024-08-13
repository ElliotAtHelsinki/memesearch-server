import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import weaviate, { dataType, vectorizer, WeaviateClient } from 'weaviate-client'

const client: WeaviateClient = await weaviate.connectToLocal()

const collections = await client.collections.listAll()
if (!collections.find(c => c.name == 'Meme')) {
  await client.collections.create({
    name: 'Meme',
    vectorizers: vectorizer.multi2VecClip({
      imageFields: ['image'],
      textFields: ['text'],
    }),
    properties: [
      {
        name: 'image',
        dataType: dataType.BLOB
      },
      {
        name: 'text',
        dataType: dataType.TEXT
      }
    ]
  })
}

const memeCollection = client.collections.get('Meme')
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const memesDir = path.join(__dirname, '../../memes')

const imgFiles = fs.readdirSync(memesDir)
for (let i = 0; i < imgFiles.length; i++) {
  const contentsBase64 = await fs.promises.readFile(`${memesDir}/${imgFiles[i]}`, { encoding: 'base64' });
  console.log(await memeCollection.data.insert({ image: contentsBase64, text: imgFiles[i] }))
}
