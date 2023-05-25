import { access, mkdir } from 'fs/promises'

export const createFolderIfNotExist = async (path: string) => {
  try {
    await access(path)
  } catch (error) {
    console.log(`Can't access folder ${path}, creating it...`)
    await mkdir(path)
  }
}
