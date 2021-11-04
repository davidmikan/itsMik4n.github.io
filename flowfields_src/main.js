var canvas = document.getElementById("canvas"),
    ctx = canvas.getContext("2d"),
    objects = [],
    circleRadius = () => randInt(10,30),
    mouseCircleRadius = 25,
    ballCount = 20,
    dxRange = 30,
    colors = ["#ffadad","#ffd6a5","#fdffb6","#caffbf","#9bf6ff","#a0c4ff","#bdb2ff","#ffc6ff","#fffffc"],
    vLineStart = null,
    vLineEnd = null,
    vLineMax = 30
canvas.style.backgroundColor = "#fffffc"

// utilities
function randomChoice(a) {
    return a[Math.ceil(Math.random()*a.length-1)]
}
function randInt(min, max) {
    return (Math.floor(Math.random() * (max-min+1) + min))
}

addEventListener("resize", () => {init()})
function canvasresize() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    console.log("canvas size: " + canvas.width + "x" + canvas.height);
}
addEventListener("mousedown", event => {
    initVLine(event.clientX, event.clientY)
})
addEventListener("mouseup", event => {
    endVLine(event.clientX, event.clientY)
})
addEventListener("mousemove", event => {
    vLineEnd = [event.clientX, event.clientY]
})
addEventListener("keydown", event => {
    if (event.key == " ") {
        init()
    }
})

// functions
function initVLine(x, y) {
    vLineStart = [x,y]
}
function endVLine(x, y) {
    // if (Math.hypot(x,y) > vLineMax) {
    //     let mag = x**2+y**2
    //     x = x / mag * vLineMax
    //     y = y / mag * vLineMax
    // }
    let dx = (vLineStart[0]-x) / 6
    let dy = (vLineStart[1]-y) / 6
    objects.push(new Circle(vLineStart[0], vLineStart[1], circleRadius(), [dx, dy], randomChoice(colors)))
    vLineStart = null
}

// classes
class Circle {
    constructor(x,y,r,v=[0,0],c="black") {
        this.x = x
        this.y = y
        this.r = r
        this.c = c
        this.dx = v[0]
        this.dy = v[1]
        this.g = 1.5
        this.f = 0.1
        this.af = 0.005
        this.gf = 0.04
        this.paused = false

        this.draw()
    }
    isGrounded(dy=0) {
        return ((this.y + dy) >= (canvas.height-this.r))
    }
    draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI)
        ctx.lineWidth = 3
        ctx.stroke()
        ctx.fillStyle = this.c;
        ctx.fill()
    }
    update() {
        if (this.isGrounded() && this.dy < 2) {
            // if (Math.abs(this.dy) < 0.5) {
            this.dy = 0
            // }
            // ground friction
            this.dx *= 1-this.gf
        } else if (this.isGrounded(this.dy)) {
            // bounce
            this.dy = Math.abs(this.dy) * -1 * (1-this.f)
        } else {
            // gravity
            console.log(this.isGrounded());
            this.dy += this.g
        }
        // left and right wall
        if (((this.x + this.dx) > (canvas.width-this.r)) || (this.x + this.dx - this.r) < 0) {
            this.dx *= -1
        }
        // air friction
        this.dx *= 1-this.af

        this.x += this.dx
        this.y += this.dy
        this.draw()
    }
}
class VLine {
    constructor() {
        
    }
    draw(x1,y1,x2,y2) {
        ctx.beginPath()
        ctx.moveTo(x1,y1)
        ctx.lineTo(2*x1-x2, 2*y1-y2)
        ctx.stroke()
    } 
    update() {
        if (vLineStart==null) { return }
        this.draw(vLineStart[0],vLineStart[1], vLineEnd[0], vLineEnd[1])
    }
}
class MouseCircle {
    constructor() {
        this.x = 0
        this.y = 0
        this.r = mouseCircleRadius
        this.c = "rgba(0,0,0,0.2)"
    }
    draw(x, y) {
        ctx.beginPath()
        ctx.arc(x, y, this.r, 0, 2 * Math.PI)
        ctx.lineWidth = 1.5
        ctx.stroke()
        ctx.fillStyle = this.c
        ctx.fill()
    }
    update() {
        if (vLineStart==null) { return }
        this.draw(vLineEnd[0], vLineEnd[1])
    }
}

function init() {
    canvasresize()
    objects = []

    // addEventListener("mousedown", e => {
    //     objects.push(new Circle(e.clientX-circleRadius, e.clientY-circleRadius, circleRadius, [Math.floor(Math.random()*dxRange)-dxRange/2,0], randomChoice(colors)))
    // })
    for (let i = 0; i < ballCount; i++) {
        let radius = circleRadius()
        objects.push(new Circle(randInt(0,canvas.width-radius),randInt(0,canvas.height/2),radius,[randInt(-dxRange,dxRange),0],randomChoice(colors)))
    }
    objects.push(new VLine())
    objects.push(new MouseCircle())
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