import {round} from './round.mjs';
import {Frame} from './plane_modules/frame.js';
import {Point, Origin} from './plane_modules/point.js';

//let frame = new Frame()

class Plane{
    constructor(ctx, x1, y1, x2, y2){
        
        this.ctx = ctx;
        this.canvas = this.ctx.canvas;
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;

        this.width = this.x2 - this.x1;
        this.height = this.y2 - this.y1;

        this.unit = {
            x_px: 50,
            y_px: 50,
            max: 400,
            min: 200
        }

        this.step = {
            x_major: 1,
            x_minor: null,
            y_major: 0,
            y_minor: null
        }



        this.pallete = {
            white: "white",
            orange: "orange",
            lightblue: "lightblue",
            purple: "purple"
        }

        this.colors = {
            frame: this.pallete.white,
            major_gridlines: this.white,
            minor_gridlines: this.white,
            origin: this.pallete.purple,
            point: this.pallete.orange,
            line: this.pallete.lightblue

        }

        this.sizes = {
            frameLineWidth: 5,
            point_radius: 5,
            origin_radius: 7,
        }

      


        // objects
        this.frame = new Frame(this.ctx, this.x1, this.y1, this.x2, this.y2, this.sizes.frameLineWidth, this.colors.frame);

        this.origin = new Origin(this.sizes.origin_radius, this.colors.origin);

        this.m = {
            x_max:0,
            x_min: 0,
            y_min: 0,
            y_max:0,
        }

        this.mouse = {
            x:{px:null, unit:null},
            y:{px:null, unit:null}
        }

        this.zoom = {
            velocity: 0, // out is positive velocity, in is negative velocity
            max_speed: 10,
            acceleration: 0.5,
            is_braking: false
        }

        this.calculate_m();

        this.points = []

        let point = new Point(2, 1, 5, 'limegreen');
        let point2 = new Point(-3, -4, 5, 'limegreen');
        

        this.points.push(point);
        this.points.push(point2);
        console.log(this.origin)

        for(let i = 0; i < 10; i++){
            let x_pos = Math.random()*10-5;
            let y_pos = Math.random()*10-5;

            let point = new Point(x_pos, y_pos, 5, 'limegreen');
            this.points.push(point);

        }

        // interactivity

        this.mousemove = [this.mm_update_mouse_object];
        this.keydown = [this.kd_zoom_out, this.kd_zoom_in];
        this.keyup = [this.ku_zoom_brake];
    

        this.listeners = []

        this.add_all_listeners();

        
    }

    // convert

    convert_pxX_to_unit = (px)=>{
        let horizontal_visual_center_with_offset = this.x1 + this.width/2 + this.origin.offset.x_px;
        let px_difference = px - horizontal_visual_center_with_offset;
        let position_in_units = px_difference/this.unit.x_px;
        position_in_units = round(position_in_units);

        return position_in_units;

    }

    convert_unitX_to_px = (unit)=>{

        let horizontal_visual_center_with_offset = this.x1 + this.width/2 + this.origin.offset.x_px;
        let unit_value_in_pixels = unit*this.unit.x_px;
        let px_location = unit_value_in_pixels + horizontal_visual_center_with_offset;

        return px_location;
    }

    convert_pxY_to_unit = (px) =>{
        let vertical_visual_center_with_offset = this.y1 + this.height/2 + this.origin.offset.y_px;
        let px_difference = -px + vertical_visual_center_with_offset;
        let position_in_units = px_difference/this.unit.y_px;
        position_in_units = round(position_in_units);

        return position_in_units;

    }

    convert_unitY_to_px = (unit)=>{

        let vertical_visual_center_with_offset = this.y1 + this.height/2 + this.origin.offset.y_px;
        let unit_value_in_pixels = unit*this.unit.y_px;
        let px_location = -1*unit_value_in_pixels + vertical_visual_center_with_offset;
        
        return px_location;
    }


    // convert_unit_coordinate_pair_to_px = ()=>{

    // }

    // convert_px_coordinate_pair_to_unit = ()=>{

    // }

    // convert_unit_coordinate_pair_to_px = ()=>{

    // }

    // get_point_coords_in_px = ()=>{

    // }


    update = ()=>{
        this.zoom_update();
        this.calculate_m();
    }

        calculate_m = ()=>{
            // this.m = {
            //     x_max:0,
            //     x_min: 0,
            //     y_min: 0,
            //     y_max:0,
            // }

            let horizontal_visual_center_with_offset = this.x1 + this.width/2 + this.origin.offset.x_px;
            let vertical_visual_center_with_offset = this.y1 + this.height/2 + this.origin.offset.y_px;
             
            this.m.x_max = (this.x2 - horizontal_visual_center_with_offset)/this.unit.x_px;
            this.m.x_min = (this.x1 - horizontal_visual_center_with_offset)/this.unit.x_px;
            this.m.y_max = (vertical_visual_center_with_offset - this.y1)/this.unit.y_px;
            this.m.y_min = (vertical_visual_center_with_offset - this.y2)/this.unit.y_px;        
        }

        zoom_update = ()=>{

            // dealing with zoom braking
            if(this.zoom.velocity == 0){
                this.zoom.is_braking = false;
            }
            if(this.zoom.is_braking && this.zoom.velocity > 0){
                this.zoom.velocity -= this.zoom.acceleration*5;
                if(this.zoom.velocity < 0){
                    this.zoom.velocity = 0;
                }
            }
            if(this.zoom.is_braking && this.zoom.velocity < 0){
                this.zoom.velocity += this.zoom.acceleration*5;
                if(this.zoom.velocity > 0){
                    this.zoom.velocity = 0;
                }
            }

            // adjusting zoom
            if(this.zoom.is_braking){return}
            let zoom_ratio = 1 - .01*this.zoom.velocity;

            // adjust origin.offset.x_px
            let x_dist_px_to_mouse_before = this.mouse.x.unit * this.unit.x_px; 
            let x_dist_px_to_mouse_after = x_dist_px_to_mouse_before * zoom_ratio;
            let change_in_x_px = x_dist_px_to_mouse_after - x_dist_px_to_mouse_before;
            this.origin.offset.x_px -= change_in_x_px;
            
            // adjust origin.offset.y_px
            let y_dist_px_to_mouse_before = this.mouse.y.unit * this.unit.y_px; 
            let y_dist_px_to_mouse_after = y_dist_px_to_mouse_before * zoom_ratio;
            let change_in_y_px = y_dist_px_to_mouse_after - y_dist_px_to_mouse_before;
            this.origin.offset.y_px += change_in_y_px;
            
            this.unit.x_px *= zoom_ratio
            this.unit.y_px *= zoom_ratio

            
              
            //this.origin.offset.x_px += 

            console.log(this.zoom.velocity);
        }

    draw = ()=>{
        this.update() // update all
        this.frame.draw();

        // draw points from points list
        this.draw_array_of_points(this.points);

        // draw origin
        this.draw_point(this.origin)

    }

            draw_array_of_points = (array_of_points)=>{
                array_of_points.forEach((point)=>{
                    this.draw_point(point);
                })
            }
                draw_point = (point)=>{
                    let x_pos_in_px = this.convert_unitX_to_px(point.x);
                    let y_pos_in_px = this.convert_unitY_to_px(point.y);

                    this.ctx.fillStyle = point.color;
                    this.ctx.beginPath();
                    this.ctx.ellipse(x_pos_in_px , y_pos_in_px, point.size, point.size, 0, 0, Math.PI*2);
                    this.ctx.fill();
                }

    add_all_listeners = ()=>{
        this.mousemove.forEach((listener)=>{
            this.add_mousemove_listener(listener);
        })

        this.keydown.forEach((listener)=>{
            this.add_keydown_listener(listener);
        })

        this.keyup.forEach((listener)=>{
            this.add_keyup_listener(listener);
        })
    }

        add_mousemove_listener = (listener = ()=>{console.log('mouse move listener')})=>{
            this.canvas.addEventListener('mousemove', listener)
        }

        add_keydown_listener = (listener = ()=>{console.log('key down listener')})=>{
            this.canvas.addEventListener('keydown', listener)
        }

        add_keyup_listener = (listener = ()=>{console.log('key up listener')})=>{
            this.canvas.addEventListener('keyup', listener)
        }

        // listeners

            mm_update_mouse_object = (e)=>{
                this.mouse.x.px = e.clientX;
                this.mouse.x.unit = this.convert_pxX_to_unit(this.mouse.x.px);


                this.mouse.y.px = e.clientY;
                this.mouse.y.unit = this.convert_pxY_to_unit(this.mouse.y.px);
            }

            kd_zoom_out = (e)=>{
                if(e.key == 'q'){
                    if(Math.abs(this.zoom.velocity) >= this.zoom.max_speed ){
                        this.zoom.velocity = this.zoom.max_speed
                    }else{
                        this.zoom.velocity += this.zoom.acceleration
                        console.log(this.zoom.velocity)
                    }
                    
                }
            }

            kd_zoom_in = (e)=>{
                if(e.key == 'e'){
                    if(Math.abs(this.zoom.velocity) >= this.zoom.max_speed ){
                        this.zoom.velocity = -1*this.zoom.max_speed
                    }else{
                        this.zoom.velocity -= this.zoom.acceleration
                        console.log(this.zoom.velocity)
                    }
                    
                }
            }

            ku_zoom_brake = (e)=>{
                if(e.key == 'q' || e.key == 'e'){
                    this.zoom.is_braking = true;
                    console.log('zoom braking')
                }
            }
}

export {Plane};