export const getBaseLog = (base: number, logFrom: number) =>
  Math.log(logFrom) / Math.log(base)

export const newSize = (oldSize: number, blockSize: number) =>
  Math.ceil(oldSize / blockSize) * blockSize
