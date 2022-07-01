const sharp = require('sharp')
const fs = require('fs')

const mkdirAsync = async path => {
    return new Promise(((resolve, reject) => fs.mkdir(path, (err) => {
        if(err) {
            reject(err)
        }
        resolve()
    })))
}

const accessAsync = async path => {
    return new Promise(((resolve, reject) => fs.access(path, (err) => {
        if(err) {
            reject(err)
        }
        resolve()
    })))
}


class CropMapToTiles {
    imgProps = {
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


        for (let zoom = 0; zoom < depthZoom; zoom++) {
            accessAsync(`./assets/tiles/0`)
                .then(() => {
                    this.resizeAndCropImg(zoom)
                })
                .catch(() => {
                    mkdirAsync(`./assets/tiles/${zoom}`)
                        .then(() => this.resizeAndCropImg(zoom))
                        .catch(err => console.log(err))
                })
        }



    }


    resizeAndCropImg = currentZoom => {
        this.img.
            metadata()
            .then(metadata => {
                this.imgProps.width = Math.ceil(metadata.width / 1024) * 1024
                this.imgProps.height = Math.ceil(metadata.height / 1024) * 1024
            })
            .then(() => {
                if (!this.imgProps.resized) {
                    this.img.resize(this.imgProps.width, this.imgProps.height, {
                        kernel: 'cubic',
                        fit: 'contain',
                        background: { r: 74, g: 85, b: 104 }
                    })
                    this.imgProps.resized = true
                    console.log('Image resized!')
                    this.saveImg(this.imgProps.path)
                    this.img = sharp(this.imgProps.path)
                }
            })
            .then(() => {
                    let currentWidthHeight = 1024 / Math.pow(2, currentZoom)
                    for (let x = 0; x < this.imgProps.width / currentWidthHeight; x++) {
                        for (let y = 0; y < this.imgProps.height / currentWidthHeight; y++) {
                            this.img
                                .extract({
                                    width: currentWidthHeight,
                                    height: currentWidthHeight,
                                    left: currentWidthHeight * x,
                                    top: currentWidthHeight * y
                                })
                                .toFile(`./assets/tiles/${currentZoom}/${x+1}-${y+1}.png`)
                                .then(() => console.log(`${x+1}-${y+1} tile saved`))
                        }
                    }
            })
            .catch(err => console.log(err))
    }

    saveImg = path => {
        this.img
            .toFile(path)
            .then(() => console.log('Image saved!'))
            .catch(err => console.log(err))
    }

    cropImg = path => {
        this.img
            .metadata()
            .then(metadata => {

            })
    }

}


const test = new CropMapToTiles('./assets/map.png', 3)


// Resizing img for

