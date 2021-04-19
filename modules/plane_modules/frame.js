class Frame{
    constructor(ctx, x1 = 0, y1 = 0, x2 = 100, y2 = 100, lineWidth = 4, color = 'white'){

        //
        this.ctx = ctx;
        this.canvas = ctx.canvas;

        // properties
        this.x1 = x1,
        this.y1 = y1,
        this.x2 = x2,
        this.y2 = y2,

        // appearance
        this.lineWidth = lineWidth;
        this.color = color;

        this.width = this.x2 - this.x1;
        this.height = this.y2 - this.y1;
    }

    draw = ()=>{
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.strokeRect(this.x1, this.y1, this.width, this.height)
    }
}

export {Frame}