import PerlinNoise from "./perlin.js"
var Perlin = new PerlinNoise()

var canvas = document.getElementById("canvas"),
    ctx = canvas.getContext("2d")
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

let size = 8,
    len = 20,
    ad = Math.random()*10000
let w = Math.floor(canvas.width/len),
    h = Math.floor(canvas.height/len)

for (let i=0; i<w; i++) {
    for (let j=0; j<h; j++) {
        let x = i*len,
        y = j*len,
        noise = Perlin.noise((i/w)*size+ad, (j/h)*size+ad, 1)
        ctx.beginPath()
        ctx.rect(x,y,len,len)
        let col = noise*255
        console.log(col)
        ctx.fillStyle = "rgb(" + col + "," + col + "," + col + ")"
        ctx.fill()
    }
}