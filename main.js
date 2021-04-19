// initialize canvas for full screen
import {round} from './modules/round.mjs';
import {init_canvas_and_ctx, resizeCanvasToDisplaySize} from './modules/init_canvas.mjs';
import {Plane} from './modules/plane.js';

// get canvas and create context
const {canvas, ctx} = init_canvas_and_ctx('myCanvas');
resizeCanvasToDisplaySize(canvas);

//let frame = new Frame(ctx);
//frame.draw();
let plane = new Plane(ctx, 200, 200, 700, 700);

//plane.frame.draw();

let start;
let last_time;
let dt;

let loop = (timestamp)=>{

    if (start === undefined){start = timestamp};
    if (last_time === undefined){last_time = timestamp}
    dt = timestamp - last_time;
    last_time = timestamp;
    const elapsed = timestamp - start;

   
    
    
    ctx.clearRect(0,0, canvas.width, canvas.height);

    plane.draw();


    requestAnimationFrame(loop);


}

loop();
