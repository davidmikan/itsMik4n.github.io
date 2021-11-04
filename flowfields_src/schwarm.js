import Vector2 from "./vec2.js"

var canvas = document.getElementById("canvas"),
    ctx = canvas.getContext("2d"),
    objects = [],
    colors = ["7c7c7c","5e5e5e","424242","202020"]
canvas.style.backgroundColor = "rgb(250,250,250)"
ctx.translate(0.5, 0.5)
ctx.imageSmoothingEnabled = true

var mousePos = new Vector2(0,0)

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

// addEventListener("resize", () => {init()})
addEventListener("mousemove", (e) => {
    mousePos.x = e.clientX
    mousePos.y = e.clientY
})
function canvasresize() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    console.log("canvas size: " + canvas.width + "x" + canvas.height);
}

class TailParticle {
    constructor(x,y,width=5,color="black",opacity=1) {
        this.width = width
        this.opacity = opacity
        this.c = color
        this.lt = 0
        this.last = new Vector2(x,y)
        this.tail = new Vector2(x,y)
    }

    draw() {
        ctx.beginPath()
        ctx.moveTo(this.last.x, this.last.y)
        ctx.lineTo(this.last.x+this.tail.x, this.last.y+this.tail.y)
        ctx.strokeStyle = this.c
        ctx.lineWidth = this.width
        ctx.globalAlpha = this.opacity
        ctx.stroke()
    }

    update() {
        this.last = this.tail
        this.tail.add(stepvec)
        this.draw()
    }
}

class SinWave {
    constructor(x, y, stepv, amp=20, freq=1/10, color="black", blobcolor="black") {
        this.lt = 0
        this.pos = new Vector2(x,y)
        this.cen = this.pos.copy()
        this.trail = []
        this.c = color
        this.amp = amp
        this.freq = freq
        this.stepv = stepv

        this.blob = new SinWaveCircle(0,0,3,blobcolor,1)
        this.lW = 2.5
    }

    draw() {
        // ctx.beginPath()
        // ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2 * Math.PI)
        // ctx.fillStyle = this.c;
        // ctx.fill()

        // ctx.beginPath()
        // ctx.moveTo(this.lastpos.x, this.lastpos.y)
        // ctx.lineTo(this.pos.x, this.pos.y)
        // ctx.lineWidth = 1
        // ctx.globalAlpha = this.ttl / 100
        // ctx.strokeStyle = this.c
        // ctx.stroke()

        ctx.strokeStyle = this.c
        ctx.lineWidth = this.lW
        ctx.beginPath()
        ctx.moveTo(this.trail[0].x, this.trail[0].y)
        for (let i = 0; i < this.trail.length; i++) {
            const point = this.trail[i];
            ctx.lineTo(point.x, point.y)
            ctx.globalAlpha = i / 80
            ctx.stroke()
            ctx.beginPath()
            ctx.moveTo(point.x, point.y)
        }
        this.blob.draw()

        // ctx.stroke()


        // this.trail.forEach(obj => {
        //     obj.update()
        // })
    }

    update() {
        // this.trail.push(new SinWaveCircle(this.pos.x, this.pos.y, this.r, this.c, 1, 0.01))
        this.trail.push(this.pos.copy())
        this.trail = this.trail.slice(-50)

        this.blob.pos.set(this.pos)

        
        let tomouse = mousePos.copy().sub(this.cen)
        if (tomouse.getMag() >= 5) {
            let pushtotar = tomouse.copy().mul(0.07).add(tomouse.unitize().mul(4))
            this.cen.add(pushtotar)
        } else {
        }
        this.lt++
        
        this.pos.x = Math.sin(this.lt * this.freq) * this.amp * 2
        this.pos.y = Math.cos(this.lt * this.freq) * this.amp * 2
        this.pos.add(this.cen)
        

        this.draw()
    }
}

class SinWaveCircle {
    constructor(x, y, r, c="white", o=1) {
        this.pos = new Vector2(x,y)
        this.r = r
        this.c = c
        this.o = o
    }
    draw() {
        ctx.beginPath()
        ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2 * Math.PI)
        ctx.globalAlpha = this.o
        ctx.fillStyle = this.c
        ctx.fill()
    }
}

function init() {
    canvasresize()
    objects = []
    
    // for (let i = 0; i < 80; i++) {
    //     objects.push(new TailParticle(0,randInt(100,200),Math.random()*3,randomChoice(colors),1))
    // }
    let dir = new Vector2(0,0)
    for (let i = 0; i < 100; i++) {
        objects.push(new SinWave(randInt(380,420), randInt(380,420), dir, randInt(20,40), 1/randInt(20,30), "#" + randomChoice(colors)))
    }
    var s = new SinWave(250, 250, dir, 25, 1/15, "rgb(255,10,10)", "rgb(255,20,20)")
    s.lW = 2.5
    s.blob.r = 3
    objects.push(s)
    // ctx.globalAlpha = 1
}

function animate() {
    requestAnimationFrame(animate)
    ctx.clearRect(0,0,canvas.width,canvas.height)

    objects.forEach(obj => {
        obj.update()
    })
}

init()
animate()