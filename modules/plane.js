import {round} from './round.mjs';
import {Frame} from './plane_modules/frame.js';
import {Point, Origin} from './plane_modules/point.js';
import {Gridline} from './plane_modules/gridline.js';

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
            y_major: 1,
            y_minor: null
        }



        this.pallete = {
            white: "white",
            translucent_white: "rgba(255,255,255,0.5)",
            orange: "orange",
            lightblue: "lightblue",
            purple: "purple"
        }

        this.colors = {
            frame: this.pallete.white,
            major_gridlines: this.pallete.translucent_white,
            minor_gridlines: this.pallete.white,
            origin: this.pallete.purple,
            point: this.pallete.orange,
            line: this.pallete.lightblue

        }

        this.sizes = {
            frameLineWidth: 5,
            gridLineWidth: 2,
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
        
        
        
        this.grid = {
            major:{vertical:[], horizontal:[]},
            minor:{vertical:[], horizontal:[]}
        }

        this.create_grid();

       
        this.points = []

        let point = new Point(2, 1, 5, 'limegreen');
        let point2 = new Point(-3, -4, 5, 'limegreen');
        

        this.points.push(point);
        this.points.push(point2);
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
        this.grid_update();
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

            
              
        }

        grid_update = ()=>{
            
            // vertical
                    // add extra vertical grids to end if needed
                    let vertical_grid_farthest_right_position = this.grid.major.vertical[this.grid.major.vertical.length-1].position;
                    let vertical_grid_farthest_left_position = this.grid.major.vertical[0].position;
                    if(this.m.x_max - vertical_grid_farthest_right_position > this.step.x_major){
                        let new_gridline = new Gridline('vertical', vertical_grid_farthest_right_position + this.step.x_major);
                        this.grid.major.vertical.push(new_gridline)
                    }
                    if(vertical_grid_farthest_left_position - this.m.x_min > this.step.x_major){
                        let new_gridline = new Gridline('vertical', vertical_grid_farthest_left_position - this.step.x_major);
                        this.grid.major.vertical.unshift(new_gridline);
                    }

                    // get rid of extra grids if they don't fit within x_min and x_max
                    if(vertical_grid_farthest_right_position > this.m.x_max){
                        this.grid.major.vertical.pop();
                    }
                    if(vertical_grid_farthest_left_position < this.m.x_min){
                        this.grid.major.vertical.shift();
                    }
            // horizontal
                    // add extra horizontal grids if needed to end of this. gird.major.horizontal
                    let horizontal_grid_highest_position = this.grid.major.horizontal[this.grid.major.horizontal.length-1].position;
                    let horizontal_grid_lowest_position = this.grid.major.horizontal[0].position;

                    if(this.m.y_max - horizontal_grid_highest_position > this.step.y_major){
                        let new_gridline = new Gridline('horizontal', horizontal_grid_highest_position + this.step.y_major);
                        this.grid.major.horizontal.push(new_gridline);
                    }
                    if(horizontal_grid_lowest_position - this.m.y_min > this.step.y_major){
                        let new_gridline = new Gridline('horizontal', horizontal_grid_lowest_position - this.step.y_major);
                        this.grid.major.horizontal.unshift(new_gridline);
                    }

                    // get rid of extra grids if they don't within y_min and y_max
                    if(horizontal_grid_highest_position > this.m.y_max){
                        this.grid.major.horizontal.pop();
                    }
                    if(horizontal_grid_lowest_position < this.m.y_min){
                        this.grid.major.horizontal.shift();
                    }
        }

    draw = ()=>{
        this.update() // update all


        // draw grid lines
        this.draw_major_grid();
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
            
            draw_major_grid = ()=>{
                this.grid.major.vertical.forEach((gridline)=>{
                    this.draw_gridline(gridline);  
                })

                this.grid.major.horizontal.forEach((gridline)=>{
                    this.draw_gridline(gridline)
                })
            }

                draw_gridline = (gridline)=>{
                    if(gridline.type == 'vertical'){
                        let x_pos = this.convert_unitX_to_px(gridline.position);
                        this.ctx.lineWidth = this.sizes.gridLineWidth;
                        this.ctx.strokeStyle = this.colors.major_gridlines;
                        this.ctx.beginPath();
                        this.ctx.moveTo(x_pos, this.y1);
                        this.ctx.lineTo(x_pos, this.y2);
                        this.ctx.stroke();


                    }
                    if(gridline.type == 'horizontal'){
                        let y_pos = this.convert_unitY_to_px(gridline.position);
                        this.ctx.lineWidth = this.sizes.gridLineWidth;
                        this.ctx.strokeStyle = this.colors.major_gridlines;
                        this.ctx.beginPath();
                        this.ctx.moveTo(this.x1, y_pos);
                        this.ctx.lineTo(this.x2, y_pos);
                        this.ctx.stroke();
                    }
                }

    create_grid = ()=>{
        let horizontal_visual_center_with_offset = this.x1 + this.width/2 + this.origin.offset.x_px;

        // make positive value vertical grids
        for(let x = this.step.x_major; x < this.m.x_max; x += this.step.x_major){
            x = round(x);
            let gridline = new Gridline('vertical', x);
            this.grid.major.vertical.push(gridline);
          //  console.log('new grid at ', x);
        }

        // make negative value vertical grids
        for(let x = -this.step.x_major; x > this.m.x_min; x -= this.step.x_major){
            x = round(x);
            let gridline = new Gridline('vertical', x);
            this.grid.major.vertical.push(gridline);
            //console.log('new grid at ', x);
        }

        // make positive value for horizontal grids
        for(let y = this.step.y_major; y < this.m.y_max; y += this.step.y_major){
            console.log('new grid at ', y);
            y = round(y);
            let gridline = new Gridline('horizontal', y);
            this.grid.major.horizontal.push(gridline);
        }

        // make negative value for horizontal grids
        for(let y = -this.step.y_major; y > this.m.y_min; y -= this.step.y_major){
            console.log('new grid at ', y);
            y = round(y);
            let gridline = new Gridline('horizontal', y);
            this.grid.major.horizontal.push(gridline);
        }

        // sorts grids
        this.grid.major.vertical.sort((a, b) => a.position - b.position);
        this.grid.major.horizontal.sort((a, b) => a.position - b.position);
        console.log(this.grid.major.horizontal)
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