const sharp = require('sharp')
const fs = require('fs')

const mkdirAsync = async path => {
    return new Promise((resolve, reject) => fs.mkdir(path, (err) => {
        if(err) {
            reject(err)
        }
        resolve()
    }))
}

const accessAsync = async path => {
    return new Promise((resolve, reject) => fs.access(path, (err) => {
        if(err) {
            reject(err)
        }
        resolve()
    }))
}

const removeDirAsync = async path => {
    return new Promise((resolve, reject) => fs.rmdir(path, { recursive: true }, (err) => {
            if (err) {
                reject(err);
            }
            resolve()
        })
    )
}


class CropMapToTiles {
    imgProps = {
        resizeFlag: false,
        path: './assets/workMap.png'
    }

    constructor(path = '', depthZoom = 0) {
        this.imgProps.depthZoom = depthZoom
        this.imgProps.resized = false
        if (path) {
            this.img = sharp(path)
        }
        else {
            this.img = sharp({
                create: {
                    width: 256,
                    height: 256,
                    channels: 4,
                    background: { r: 74, g: 85, b: 104 }
                }
            })
                .png()
        }



        this.img
            .metadata()
            .then(metadata => this.maxTileHandler(metadata.width, metadata.height))
            .then(() => {
                if (!this.imgProps.resizeFlag) {
                    this.resizeHandler(this.imgProps.width, this.imgProps.height, {
                        kernel: 'cubic',
                        fit: 'contain',
                        background: {r: 74, g: 85, b: 104}
                    })
                }
            })
            .then(() => {
                for (let zoom = 0; zoom < depthZoom; zoom++) {
                    accessAsync(`./assets/${zoom}`)
                        .then(() => {
                            removeDirAsync(`./assets/${zoom}`)
                                .then(() => {
                                    mkdirAsync(`./assets/${zoom}`)
                                        .then(() => this.cropHandler(zoom))
                                        .catch(err => console.log(err))
                                })
                        })
                        .catch(() => {
                            mkdirAsync(`./assets/${zoom}`)
                                .then(() => this.cropHandler(zoom))
                                .catch(err => console.log(err))
                        })
                }
            })






    }

    // maximum tile determinant
    maxTileHandler = (width, height) => {
        // let widthTemp = width
        // let heightTemp = height
        let defined = width % height == 0 || height % width == 0
        let pow = 0
        while (!defined) {
            defined = width % height == 0 || height % width == 0
            if (defined) {
                break
            }
            width = Math.ceil(width / Math.pow(2, pow)) * Math.pow(2, pow)
            height = Math.ceil(height / Math.pow(2, pow)) * Math.pow(2, pow)
            pow++
        }
        this.imgProps.width = width
        this.imgProps.height = height
        this.imgProps.maxTile = width >= height ? height : width

        console.log(this.imgProps.maxTile)

    }


    resizeHandler = (requiredWidth, requiredHeight, resizeOptions) => {
        this.imgProps.resizeFlag = true
        this.img
            .resize(requiredWidth, requiredHeight, resizeOptions)
            .toFile(this.imgProps.path)
                .then(() => {
                    this.img = sharp(this.imgProps.path)
                    console.log('Image saved!')
                })
                .catch(err => console.log(err))

    }

    cropHandler = zoom => {
        let currentTile = this.imgProps.maxTile / Math.pow(2, zoom)
        for (let x = 0; x < this.imgProps.width / currentTile; x++) {
            for (let y = 0; y < this.imgProps.height / currentTile; y++) {
                this.img
                    .extract({
                        width: currentTile,
                        height: currentTile,
                        left: currentTile * x,
                        top: currentTile * y
                    })
                    .toFile(`./assets/${zoom}/${x}-${y}.png`)
                    .then(() => console.log(`${x}-${y} tile saved`))
            }
        }
    }


    // resizeAndCropImg = currentZoom => {
    //     this.img.
    //         metadata()
    //         .then(metadata => {
    //             this.imgProps.width = Math.ceil(metadata.width / 64) * 64
    //             this.imgProps.height = Math.ceil(metadata.height / 64) * 64
    //         })
    //         .then(() => {
    //             if (!this.imgProps.resized) {
    //                 this.img.resize(this.imgProps.width, this.imgProps.height, {
    //                     kernel: 'cubic',
    //                     fit: 'contain',
    //                     background: { r: 74, g: 85, b: 104 }
    //                 })
    //                 this.imgProps.resized = true
    //                 console.log('Image resized!')
    //                 this.saveImg(this.imgProps.path)
    //                 this.img = sharp(this.imgProps.path)
    //             }
    //         })
    //         .then(() => {
    //                 let currentWidthHeight = 1024 / Math.pow(2, currentZoom)
    //                 for (let x = 0; x < this.imgProps.width / currentWidthHeight; x++) {
    //                     for (let y = 0; y < this.imgProps.height / currentWidthHeight; y++) {
    //                         this.img
    //                             .extract({
    //                                 width: currentWidthHeight,
    //                                 height: currentWidthHeight,
    //                                 left: currentWidthHeight * x,
    //                                 top: currentWidthHeight * y
    //                             })
    //                             .toFile(`./assets/${currentZoom}/${x}-${y}.png`)
    //                             .then(() => console.log(`${x}-${y} tile saved`))
    //                     }
    //                 }
    //         })
    //         .catch(err => console.log(err))
    // }

    // cropImg = path => {
    //     this.img
    //         .metadata()
    //         .then(metadata => {
    //
    //         })
    // }

}


const test = new CropMapToTiles('./assets/map.png', 3)


// Resizing img for

