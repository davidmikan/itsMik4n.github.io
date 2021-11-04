function lerp(a, b, x) { 
    return a + (b - a) * x
}

export default class Vector2 {
    constructor(x,y) {
        this.x = x
        this.y = y
    }
    getMag() {
        return Math.hypot(this.x,this.y)
    }
    add(b) {
        this.x += b.x
        this.y += b.y
        return this
    }
    sub(b) {
        this.x -= b.x
        this.y -= b.y
        return this
    }
    mul(s) {
        this.x *= s
        this.y *= s
        return this
    }
    divide(s) {
        this.x /= s
        this.y /= s
        return this
    }
    unitize() {
        this.divide(this.getMag())
        return this
    }
    getDotP(b) {
        return this.x * b.x + this.y * b.y
    }
    getCrossP(b) {

    }
    set(b) {
        this.x = b.x
        this.y = b.y
    }
    lerp(b, x) {
        this.x = this.x + (b.x - this.x) * x
        this.y = this.y + (b.y - this.y) * x
    }
    copy() {
        return new Vector2(this.x, this.y)
    }
    equals(b) {
        return (this.x==b.x && this.y==b.y)
    }
}