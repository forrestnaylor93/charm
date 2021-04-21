class Point{
    constructor( x = 0, y = 0, size = 5, color = "yellow"){
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.is_mouse_on = false;
    }

}

class Origin extends Point{
    constructor(size = 5, color = 'white'){
        super(0, 0, size, color)
        this.offset = {
            x_px: 0,
            y_px: 0
        }
    }

}



export {Point, Origin}