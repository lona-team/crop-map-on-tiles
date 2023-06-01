import 'dotenv/config'
import sharp from 'sharp'

import { newSize, getBaseLog } from './helpers.ts'
import { createFolderIfNotExist } from './fileSystem.ts'

const toZoom = Number(process.env.TO_ZOOM) // До какого значения Zoom будет работать алгоритм
const blockStartSize = Number(process.env.BLOCK_START_SIZE) // Стандартный размер блока (!! Должен быть степенью 2-ки !!)

console.log('Img path:', process.env.IMG_PATH)

const fileName = process.env.IMG_PATH?.split('/').at(-1)

const source = sharp(process.env.IMG_PATH).png() // Исходная картинка

const { width: sourceWidth, height: sourceHeight } = await source.metadata()

console.log('Default size:', { sourceWidth, sourceHeight })

const newWidth = newSize(sourceWidth ?? 0, blockStartSize)
const newHeight = newSize(sourceHeight ?? 0, blockStartSize)

console.log('Size change to:', { newWidth, newHeight })

const bigSource = source.resize(newWidth, newHeight, {
  kernel: 'cubic',
  fit: 'contain',
  background: process.env.BG_COLOR, // Цвет фона подложки
})

for (let z = 0; z < toZoom && getBaseLog(2, blockStartSize) - z > 0; z++) {
  const zoomBlockSize = Math.pow(2, getBaseLog(2, blockStartSize) - z)

  for (let x = 0; x < newWidth; x += zoomBlockSize) {
    for (let y = 0; y < newHeight; y += zoomBlockSize) {
      const fileFolder = `./build/tiles-${fileName}/${z}`

      await createFolderIfNotExist(fileFolder.split('/').slice(0, 2).join('/'))
      await createFolderIfNotExist(fileFolder.split('/').slice(0, 3).join('/'))
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

      // Создаем тайл в стандартном разрешении
      const tile = await bigSource
        .extract({
          width: zoomBlockSize,
          height: zoomBlockSize,
          left: x,
          top: y,
        })
        .toBuffer()

      // Сохраняем тайл в разрешение указанном в переменных среды
      sharp(tile)
        .resize(Number(process.env.BLOCK_SIZE), Number(process.env.BLOCK_SIZE))
        .png({ quality: 80, compressionLevel: 9 })
        .toFile(`${fileFolder}/${x / zoomBlockSize}-${y / zoomBlockSize}.png`)
    }
  }
}
