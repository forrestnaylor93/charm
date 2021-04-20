class Gridline{
    constructor(type, position){
        this.type = type;
        this.position = position;
    }
}

class Axis extends Gridline{
    constructor(type, position = 0){
        super(type, position)
        this.label = '';
    }
}

export {Gridline, Axis};