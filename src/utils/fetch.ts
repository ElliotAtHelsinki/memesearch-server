import * as cheerio from 'cheerio'
import * as fs from 'fs'
import * as path from 'path'
import { pipeline } from 'stream'
import { fileURLToPath } from 'url'
import { promisify } from 'util'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const baseURL = 'https://knowyourmeme.com/categories/meme/page/'

const memesDir = path.join(__dirname, '../memes')
if (!fs.existsSync(memesDir)) {
  fs.mkdirSync(memesDir)
}

async function downloadImage(imageURL: string, folder: string, filename: string): Promise<void> {
  try {
    const res: any = await fetch(imageURL)
    if (!res.ok) throw new Error(`Failed to fetch ${imageURL}: ${res.statusText}`)

    const fileStream = fs.createWriteStream(path.join(folder, filename))
    const streamPipeline = promisify(pipeline)

    await streamPipeline(res.body, fileStream)
  } catch (error: any) {
    console.error(`Failed to download ${filename}: ${error.message}`)
  }
}

async function scrapePage(pageNumber: number): Promise<void> {
  const url = `${baseURL}${pageNumber}`
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Failed to fetch page ${pageNumber}: ${res.statusText}`)

    const html = await res.text()
    const $ = cheerio.load(html)
    const memeEntries = $('table.entry_list img')

    memeEntries.each(async (i, meme) => {
      let imageURL = $(meme).attr('data-src') || $(meme).attr('src')
      if (imageURL) {
        const fullImageURL = imageURL.replace('https://i.kym-cdn.com/entries/icons/medium/', 'https://i.kym-cdn.com/entries/icons/original/')

        const filename = path.basename(new URL(fullImageURL).pathname)

        try {
          await downloadImage(fullImageURL, memesDir, filename)
          console.log(`Downloaded ${filename} from ${fullImageURL}`)
        } catch (error: any) {
          console.error(`Failed to download ${filename}: ${error.message}`)
        }
      }
    })
  } catch (error: any) {
    console.error(`Failed to retrieve page ${pageNumber}: ${error.message}`)
  }
}

for (let page = 1;page <= 465;page++) {
  console.log(`Scraping page ${page}`)
  await scrapePage(page)
  await new Promise(resolve => setTimeout(resolve, 1000))
}
console.log('Scraping completed!')
