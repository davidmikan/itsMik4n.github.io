import Vector2 from "./vec2.js"

var canvas = document.getElementById("canvas"),
    ctx = canvas.getContext("2d"),
    objects = [],
    tempObjects = [],
    uIObjects = [],
    circleRadius = () => randInt(20,40),
    mouseCircleRadius = 25,
    ballCount = 20,
    dRange = 5,
    // colors = [{"name":"Flickr Pink","hex":"f72585","rgb":[247,37,133],"cmyk":[0,85,46,3],"hsb":[333,85,97],"hsl":[333,93,56],"lab":[55,79,1]},{"name":"Byzantine","hex":"b5179e","rgb":[181,23,158],"cmyk":[0,87,13,29],"hsb":[309,87,71],"hsl":[309,77,40],"lab":[43,70,-34]},{"name":"Purple","hex":"7209b7","rgb":[114,9,183],"cmyk":[38,95,0,28],"hsb":[276,95,72],"hsl":[276,91,38],"lab":[32,66,-66]},{"name":"Purple","hex":"560bad","rgb":[86,11,173],"cmyk":[50,94,0,32],"hsb":[268,94,68],"hsl":[268,88,36],"lab":[27,60,-68]},{"name":"Trypan Blue","hex":"480ca8","rgb":[72,12,168],"cmyk":[57,93,0,34],"hsb":[263,93,66],"hsl":[263,87,35],"lab":[25,58,-69]},{"name":"Trypan Blue","hex":"3a0ca3","rgb":[58,12,163],"cmyk":[64,93,0,36],"hsb":[258,93,64],"hsl":[258,86,34],"lab":[23,55,-70]},{"name":"Persian Blue","hex":"3f37c9","rgb":[63,55,201],"cmyk":[69,73,0,21],"hsb":[243,73,79],"hsl":[243,57,50],"lab":[34,48,-74]},{"name":"Ultramarine Blue","hex":"4361ee","rgb":[67,97,238],"cmyk":[72,59,0,7],"hsb":[229,72,93],"hsl":[229,83,60],"lab":[47,36,-74]},{"name":"Dodger Blue","hex":"4895ef","rgb":[72,149,239],"cmyk":[70,38,0,6],"hsb":[212,70,94],"hsl":[212,84,61],"lab":[61,5,-52]},{"name":"Vivid Sky Blue","hex":"4cc9f0","rgb":[76,201,240],"cmyk":[68,16,0,6],"hsb":[194,68,94],"hsl":[194,85,62],"lab":[76,-22,-29]}],
    colors = [{"name":"Amethyst","hex":"9b5de5","rgb":[155,93,229],"cmyk":[32,59,0,10],"hsb":[267,59,90],"hsl":[267,72,63],"lab":[52,52,-60]},{"name":"Magenta Crayola","hex":"f15bb5","rgb":[241,91,181],"cmyk":[0,62,25,5],"hsb":[324,62,95],"hsl":[324,84,65],"lab":[61,66,-18]},{"name":"Minion Yellow","hex":"fee440","rgb":[254,228,64],"cmyk":[0,10,75,0],"hsb":[52,75,100],"hsl":[52,99,62],"lab":[90,-8,78]},{"name":"Capri","hex":"00bbf9","rgb":[0,187,249],"cmyk":[100,25,0,2],"hsb":[195,100,98],"hsl":[195,100,49],"lab":[71,-18,-42]},{"name":"Sea Green Crayola","hex":"00f5d4","rgb":[0,245,212],"cmyk":[100,0,13,4],"hsb":[172,100,96],"hsl":[172,100,48],"lab":[87,-56,2]}],
    vLineStart = null,
    vLineEnd = null,
    vLineMax = 30
document.body.style.backgroundColor = "black"


// utilities
function randomChoice(a) {
    return a[Math.ceil(Math.random()*a.length-1)]
}
function randInt(min, max) {
    return (Math.floor(Math.random() * (max-min+1) + min))
}
function rgba(c, a=1) {
    return `rgba(${c[0]},${c[1]},${c[2]},${a})`
}
function magnitude(x,y) {
    return Math.hypot(x,y)
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
    objects.push(new Circle(vLineStart[0], vLineStart[1], circleRadius(), new Vector2(dx,dy), randomChoice(colors)["rgb"]))
    vLineStart = null
}

// classes
class Circle {
    constructor(x,y,r,v=new Vector2(0,0),c=[0,0,0]) {
        this.x = x
        this.y = y
        this.r = r
        this.c = rgba(c)
        this.v = v
        this.af = 0.05
        this.cf = 0.7
        this.paused = false

        this.draw()
    }
    handleCol(b) {
        let ab = new Vector2(b.x-this.x, b.y-this.y)
        let dist = ab.getMag()
        if (dist <= this.r+b.r) {
            ab.unitize()
            console.log(ab.getMag())
            ab.mul(b.v.getMag()*-1*(1-this.cf))
            this.v.add(ab)
            return true
        }
        return false
    }
    draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI)
        ctx.shadowBlur = 30;
        ctx.shadowColor = this.c;
        ctx.fillStyle = this.c;
        ctx.fill()
        ctx.shadowBlur = 0;
    }
    update() {
        // very bad collision detection - O(n^2)
        objects.forEach(obj => {
            if (!(this===obj)) {
                this.handleCol(obj)
            }
        })
        // left and right wall
        if ((this.x + this.v.x) > (canvas.width-this.r)) {
            this.v.x *= -1 * this.cf
            this.colParticles(3)
        } else if ((this.x + this.v.x - this.r) < 0) {
            this.v.x *= -1 * this.cf
            this.colParticles(1)
        }
        // top and bottom wall
        if ((this.y + this.v.y) > (canvas.height-this.r)) {
            this.v.y *= -1 * this.cf
            this.colParticles(2)
        } else if ((this.y + this.v.y - this.r) < 0) {
            this.v.y *= -1 * this.cf
            this.colParticles(0)
        }
        // air friction
        this.v.mul(1-this.af)

        this.x += this.v.x
        this.y += this.v.y
        this.draw()
    }
    colParticles(rot) {
        for (let i = 0; i < 6; i++) {
            let v = [Math.random()*2-1, randInt(1,3)]
            for (; rot > 0; rot--) {
                v = [v[1], v[0]*-1]
            }
            tempObjects.push(new CircleParticle(this.x, this.y, 5, 30, v, this.c))
        }
    }
}
class Label {
    constructor(text,x=0,y=0,s=30,c="white") {
        this.text = text
        this.x = x
        this.y = y
        this.s = s
        this.c = c
    }
    draw() {
        ctx.font = this.s + "px Arial"
        ctx.fillStyle = this.c
        ctx.fillText(this.text(), this.x, this.y)
    }
    update() {
        this.draw()
    }
}
class VLine {
    constructor(c="black") {
        this.c = c
    }
    draw(x1,y1,x2,y2) {
        ctx.beginPath()
        ctx.moveTo(x1,y1)
        ctx.lineTo(2*x1-x2, 2*y1-y2)
        ctx.lineWidth = 3
        ctx.strokeStyle = this.c
        ctx.stroke()
    } 
    update() {
        if (vLineStart==null || vLineEnd==null) { return }
        this.draw(vLineStart[0],vLineStart[1], vLineEnd[0], vLineEnd[1])
    }
}
class MouseCircle {
    constructor(c=[0,0,0]) {
        this.x = 0
        this.y = 0
        this.r = mouseCircleRadius
        this.c = rgba(c, 0.2)
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
class CircleParticle {
    constructor(x,y,r,ltt,v=[0,0],c=[0,0,0]) {
        this.x = x
        this.y = y
        this.r = r
        this.maxLtt = ltt
        this.ltt = ltt
        this.c = c
        this.dx = v[0]
        this.dy = v[1]
        this.af = 0.01

        this.draw()
    }
    draw() {
        let c = rgba(this.c, this.ltt/this.maxLtt)
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI)
        ctx.lineWidth = 1
        // ctx.stroke()
        ctx.fillStyle = c
        ctx.shadowBlur = 5
        ctx.shadowColor = c
        ctx.fill()
        ctx.shadowBlur = 0
    }
    update() {
        // air friction
        this.dx *= 1-this.af
        this.dy *= 1-this.af

        this.x += this.dx
        this.y += this.dy
        this.draw()
        this.ltt--
    }
    isDead() {
        return (this.ltt <= 0)
    }
}

function init() {
    canvasresize()
    objects = []
    tempObjects = []
    uIObjects = []

    // addEventListener("mousedown", e => {
    //     objects.push(new Circle(e.clientX-circleRadius, e.clientY-circleRadius, circleRadius, [Math.floor(Math.random()*dxRange)-dxRange/2,0], randomChoice(colors)))
    // })
    for (let i = 0; i < ballCount; i++) {
        let radius = circleRadius()
        objects.push(new Circle(randInt(0+radius,canvas.width-radius),randInt(0+radius,canvas.height-radius),radius,new Vector2(randInt(-dRange,dRange),randInt(-dRange,dRange)),randomChoice(colors)["rgb"]))
    }
    uIObjects.push(new VLine("white"))
    uIObjects.push(new MouseCircle([255,255,255]))
    uIObjects.push(new Label(() => "entities: " + (objects.length + uIObjects.length),10,40,30))
}

function animate() {
    requestAnimationFrame(animate)
    ctx.clearRect(0,0,canvas.width,canvas.height)

    objects.forEach(obj => {
        obj.update()
    })
    for (let i = tempObjects.length-1; i >= 0; i--) {
        let obj = tempObjects[i];
        if (obj.isDead()) {
            tempObjects.splice(i, 1)
            break
        }
        obj.update()
    }
    uIObjects.forEach(obj => {
        obj.update()
    })
}

init()
animate()