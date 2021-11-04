import Vector2 from "./vec2.js"
import PerlinNoise from "./perlin.js"
var Perlin = new PerlinNoise()

var mousedown = false

var canvas = document.getElementById("canvas"),
ctx = canvas.getContext("2d"),
objects = [],
running = true,
colors = ["d8f3dc","b7e4c7","95d5b2","74c69d","52b788","40916c","2d6a4f","1b4332","081c15"],
usrcolor = "rgb(250, 245, 200)",
rainbowcolors = ["f72585","b5179e","7209b7","560bad","480ca8","3a0ca3","3f37c9","4361ee","4895ef","4cc9f0"],
userainbow = true
canvas.style.backgroundColor = "rgb(25,10,40)"
ctx.translate(0.5, 0.5)
ctx.imageSmoothingEnabled = true

var field = null,
field2 = null

// controlled variables
window.FieldConfig = {
    height: 40,
    width: 50,
    zoom: 10,
    seed: 0,
    debugMode: false,
    debugCol: "red"
}
window.ParticleConfig = {
    count: 5000,
    fieldInfluence: 80,
    speed: 3,
    initialSpeed: new Vector2(-1, 0),
    color: "#ffffff",
    opacity: 0.1,
    userainbow: false
}
window.setFieldVar = function(ref, val) {
    Object.defineProperty(window.FieldConfig, ref, {value:val})
    init()
}
window.setParticleVar = function(ref, val) {
    Object.defineProperty(window.ParticleConfig, ref, {value:val})
    init()
}
window.setBg = function(val) {
    canvas.style.backgroundColor = val
}

// utilities
function randomChoice(a) {
    return a[Math.ceil(Math.random()*a.length-1)]
}
function randInt(min, max) {
    return (Math.floor(Math.random() * (max-min+1) + min))
}
function lerp(a, b, x) { 
    return a + (b - a) * x
}
function getColorByVar(v, max, arr=rainbowcolors) {
    return "#" + arr[Math.floor(v / (max / arr.length))]
}
window.togglePause = function() {
    running = !running
    if (running) animate()
    document.getElementById("pause-btn").innerHTML = running ? "Pause" : "Play"
}
window.saveImage = function() {
    if(running) window.togglePause()

    ctx.globalCompositeOperation = 'destination-over'
    ctx.beginPath()
    ctx.fillStyle = canvas.style.backgroundColor
    ctx.rect(0,0,canvas.width,canvas.height)
    ctx.closePath()
    ctx.globalCompositeOperation = 'source-over'

    var image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream")
    window.location.href=image
}

// user interaction
addEventListener("resize", () => {init()})
function canvasresize() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    console.log("canvas size: " + canvas.width + "x" + canvas.height);
}
addEventListener("mousedown", e => {
    mousedown = true
    // for (let i=0; i<50; i++) {
        //     objects.push(new FieldParticle(e.clientX+(Math.random()-0.5)*40, e.clientY+(Math.random()-0.5)*40, 1.5, field, usrcolor))
        // }
    })
addEventListener("mouseup", () => { mousedown = false })
addEventListener("mousemove", e => {
    if ((document.activeElement == canvas) && mousedown) {
        for (let i=0; i<10; i++) {
            objects.push(new FieldParticle(e.clientX+(Math.random()-0.5)*40, e.clientY+(Math.random()-0.5)*40, 1.5, field, window.ParticleConfig.speed, window.ParticleConfig.fieldInfluence, usrcolor, window.ParticleConfig.opacity))
        }
    }
})
addEventListener("keydown", e => {
    if (document.activeElement != canvas) return
    switch (e.key) {
        case "p":
            running = !running
            if (running) animate()
            break
            case "r":
                init()
            case ".":
                if (!running) animate()
            default:
                break;
    }
})
                    
// classes
class FlowVector {
    constructor(x, y, sx, sy, debugcol="white") {
        this.pos = new Vector2(x, y)
        this.vector = new Vector2(sx, sy)
        this.vector.unitize()
        this.c = debugcol
    }
                    
    draw() {
        ctx.beginPath()
        ctx.moveTo(this.pos.x, this.pos.y)
        let repv = this.vector.copy().mul(13)
        ctx.lineTo(this.pos.x+repv.x, this.pos.y+repv.y)
        ctx.strokeStyle = this.c
        ctx.lineWidth = 1
        ctx.stroke()
        
        ctx.beginPath()
        ctx.arc(this.pos.x, this.pos.y, 2, 0, 2 * Math.PI)
        ctx.fillStyle = this.c;
        ctx.fill()
    }
}

class FlowField {
    constructor(w, h, zoom=20, seed=0, debug=false, debugcol="red") {
        this.width = w
        this.height = h
        this.field = []

        // fill field with FlowVectors
        let vecw = canvas.width / this.width,
            vech = canvas.height / this.height
        
        seed = !seed ? Math.random() * 10000 : seed*100
        for (let i=0; i<=h; i++) {
            let row = []
            for (let j=0; j<=w; j++) {
                let x = j*vecw, 
                    y = i*vech
                let d = Perlin.noise(j/this.width*zoom+seed,i/this.height*zoom+seed,0.5)
                row.push(new FlowVector(x, y, Math.cos(d*2*Math.PI), Math.sin(d*2*Math.PI),debugcol))
            }
            this.field.push(row)
        }
        this.debug = debug
    }
    draw() {

    }
    update() {
        if (this.debug) {
            this.field.forEach(row => {row.forEach(vec => {
                vec.draw()
            })})
        }
    }
}

class FieldParticle {
    constructor(x, y, r, ffield, speed, influence, c="red", o=1) {
        this.pos = new Vector2(x, y)
        this.lastpos = this.pos.copy()
        this.dir = new Vector2(-1, 0)
        this.speed = speed
        this.influence = influence
        this.r = r
        this.ffield = ffield
        this.c = c
        this.o = o
    }
    draw() {
        // draw as circles
        // ctx.beginPath()
        // ctx.arc(this.pos.x, this.pos.y, this.r*2, 0, 2 * Math.PI)
        // // just some color experiments
        // // ctx.fillStyle = "#" + rnbow[Math.floor((this.pos.x / (canvas.width / rnbow.length)))]
        // let r = this.pos.x / (canvas.width / 255)
        // ctx.fillStyle = this.c
        // // -
        // ctx.globalAlpha = 0.4
        // ctx.fill()
        ctx.globalAlpha = 1

        // draw as line
        ctx.beginPath()
        ctx.moveTo(this.lastpos.x, this.lastpos.y)
        ctx.lineTo(this.pos.x, this.pos.y)
        ctx.lineWidth = this.r
        ctx.strokeStyle = this.c
        ctx.globalAlpha = this.o
        ctx.stroke()
        ctx.globalAlpha = 1
    }
    update() {
        this.dir.lerp(this.getFFVec(), this.speed / this.influence)
        this.pos.add(this.dir.unitize().mul(this.speed)) // this.speed determines the influence the flow field has on the fieldparticle
        // this.pos.add(this.getFFVec().vector.copy().mul(2))
        
        if (!this.pos.equals(this.lastpos)) {
        this.draw()
        this.lastpos = this.pos.copy()
        }
    }
    getFFVec() {
        let x = this.pos.x / (canvas.width / this.ffield.width),
            y =this.pos.y / (canvas.height / this.ffield.height)
        if (x>=0 && y>=0 && x<this.ffield.width && y<this.ffield.height) {
            let x_l = Math.floor(x),
                y_l = Math.floor(y)
            let v = this.ffield.field[y_l][x_l].vector,
                v1 = this.ffield.field[y_l][x_l+1].vector,
                v2 = this.ffield.field[y_l+1][x_l].vector
            return new Vector2(lerp(v.x, v1.x, x - x_l), lerp(v.y, v2.y, y-y_l))
        } else { return new Vector2(0,0) }
    }
}

// execution
function init() {
    canvasresize()
    objects = []
    
    let fc = window.FieldConfig
    field = new FlowField(fc.width, fc.height, fc.zoom, fc.seed, fc.debugMode, fc.debugCol)
    objects.push(field)
    
    for (let i = 0; i < window.ParticleConfig.count; i++) {
        let y = Math.random()*canvas.height
        let col = window.ParticleConfig.userainbow ? getColorByVar(y, canvas.height, rainbowcolors) : window.ParticleConfig.color
        objects.push(new FieldParticle(randInt(canvas.width-10,canvas.width-1), y, 1.5, field, window.ParticleConfig.speed, window.ParticleConfig.fieldInfluence, col, window.ParticleConfig.opacity))
    }

    // second field?
    // field2 = new FlowField(30, 20, true, "red")
    // objects.push(field2)
    
    // let count2 = 3000
    // for (let i = 0; i < count2; i++) {
    //     let y = Math.random()*canvas.height
    //     objects.push(new FieldParticle(canvas.width-1, y, 2.3, field2, "rgb(245,245,245)"))
    // }
}

let iterations = 0
function animate() {
    if (!running) return
    requestAnimationFrame(animate)
    iterations++
    // ctx.clearRect(0,0,canvas.width,canvas.height)
 
    // for (let i=0; i<2; i++) {
    //     objects.push(new FieldParticle(canvas.width-1, Math.random()*canvas.height, 2, field, window.ParticleConfig.speed, window.ParticleConfig.fieldInfluence, window.ParticleConfig.color, window.ParticleConfig.opacity))
    // }

    if (!iterations%30) {

    }
    objects.forEach(obj => {
        obj.update()
    })
}

init()
animate()