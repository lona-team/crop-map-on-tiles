import 'dotenv/config'
import sharp from 'sharp'

import { newSize, getBaseLog } from './helpers.ts'
import { createFolderIfNotExist } from './fileSystem.ts'

const toZoom = Number(process.env.TO_ZOOM)
const blockStartSize = Number(process.env.BLOCK_START_SIZE)

console.log('Img path:', process.env.IMG_PATH)

const fileName = process.env.IMG_PATH?.split('/').at(-1)

const source = sharp(process.env.IMG_PATH).png()

const { width: sourceWidth, height: sourceHeight } = await source.metadata()

console.log('Default size:', { sourceWidth, sourceHeight })

const newWidth = newSize(sourceWidth ?? 0, blockStartSize)
const newHeight = newSize(sourceHeight ?? 0, blockStartSize)

console.log('Size change to:', { newWidth, newHeight })

const bigSource = source.resize(newWidth, newHeight, {
  kernel: 'cubic',
  fit: 'contain',
  background: process.env.BG_COLOR,
})

for (let z = 0; z < toZoom && getBaseLog(2, blockStartSize) - z > 0; z++) {
  const zoomBlockSize = Math.pow(2, getBaseLog(2, blockStartSize) - z)

  for (let x = 0; x < newWidth; x += zoomBlockSize) {
    for (let y = 0; y < newHeight; y += zoomBlockSize) {
      const fileFolder = `./build/tiles-${fileName}/${z}`

      await createFolderIfNotExist(fileFolder.split('/').slice(0, 4).join('/'))

      console.log(
        'Tile creating:',
        { blockSize: zoomBlockSize },
        { x, y, zoom: z }
      )

      console.log(
        'Start extracting for',
        { blockSize: zoomBlockSize },
        { x, y, zoom: z }
      )

      const tile = await bigSource
        .extract({
          width: zoomBlockSize,
          height: zoomBlockSize,
          left: x,
          top: y,
        })
        .toBuffer()

      const tileFileName = `${fileFolder}/${x / zoomBlockSize}-${
        y / zoomBlockSize
      }.png`

      sharp(tile)
        .resize(Number(process.env.BLOCK_SIZE), Number(process.env.BLOCK_SIZE))
        .png({ quality: 80, compressionLevel: 9 })
        .toFile(tileFileName)
    }
  }
}
