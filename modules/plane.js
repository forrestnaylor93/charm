import {round} from './round.mjs';
import {Frame} from './plane_modules/frame.js';
import {Point, Origin} from './plane_modules/point.js';
import {Axis, Gridline} from './plane_modules/gridline.js';

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

        this.is_wheel_moving = false;

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
            purple: "purple",
            pink: "pink",
            fuchsia: "fuchsia",
            selected_shadow: 'rgba(255,255,0,0.7)'
        }

        this.colors = {
            frame: this.pallete.white,
            major_gridlines: this.pallete.translucent_white,
            minor_gridlines: this.pallete.white,
            origin: this.pallete.purple,
            point: this.pallete.orange,
            point_selected: this.pallete.selected_shadow,
            line: this.pallete.lightblue,
            y_axis: this.pallete.pink,
            x_axis: this.pallete.pink

        }

        this.sizes = {
            frameLineWidth: 5,
            gridLineWidth: 2,
            axisLineWidth: 5,
            point_radius: 7,
            point_magnification: 2, // how much larger point radius should be when magnified
            point_selected_shadow_radius: 5, // how many pixels larger should a point selected 'highlight radius be
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

        this.pan = {
            velocity: {x: 0, y: 0}, // x - positive right, negative left; y - positive up, negative down
            max_speed: 20,
            acceleration: 1.5,
            is_braking: false
        }

        this.calculate_m();
        
        
        
        this.grid = {
            major:{vertical:[], horizontal:[]},
            minor:{vertical:[], horizontal:[]}
        }

        this.y_axis = new Axis('vertical', 0);
        this.x_axis = new Axis('horizontal', 0);

        this.create_grid();

       
        this.points = []

        //let point = new Point(2, 1, 5, 'limegreen');
       // let point2 = new Point(-3, -4, 5, 'limegreen');
        

        //this.points.push(point);
        //this.points.push(point2);
        for(let i = 0; i < 5; i++){
            let x_pos = Math.random()*10-5;
            let y_pos = Math.random()*10-5;

            let point = new Point(x_pos, y_pos, this.sizes.point_radius, 'limegreen');
            this.points.push(point);

        }

        // interactivity
        

        this.mousedown = [this.md_select_object]
        this.mousemove = [this.mm_update_mouse_object, this.mm_is_mouse_on_object];
        this.keydown = [this.kd_zoom_out, this.kd_zoom_in, this.kd_pan, this.kd_center_origin];
        this.keyup = [this.ku_zoom_brake, this.ku_pan];
        this.wheel = [this.wh_zoom_out];
    

        this.listeners = []

        this.add_all_listeners();
        // this.canvas.addEventListener('mousedown', ()=>{
        //     this.points.forEach((point)=>{
        //         if(point.is_mouse_on){
        //             point.is_selected = true;
        //             point.color = 'red';
        //             console.log('clicking on point')
        //         }
        //     })
        // })

        
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
        this.pan_update();
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

        pan_update = ()=>{
            //horizontal
            this.origin.offset.x_px += this.pan.velocity.x;
            this.origin.offset.y_px -= this.pan.velocity.y;
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

        // draw axes
        this.draw_axis(this.y_axis);
        this.draw_axis(this.x_axis);
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
                    if(point.x > this.m.x_max || point.x < this.m.x_min || point.y > this.m.y_max || point.y < this.m.y_min){return}// don't draw poitns outside of frame
                    let x_pos_in_px = this.convert_unitX_to_px(point.x);
                    let y_pos_in_px = this.convert_unitY_to_px(point.y);
                    let draw_size = point.size;
                    if(point.is_mouse_on){
                        draw_size *= this.sizes.point_magnification;
                    }
                    
                    if(point.is_selected){
                        this.ctx.fillStyle = this.colors.point_selected;
                        this.ctx.beginPath();
                        this.ctx.ellipse(x_pos_in_px , y_pos_in_px, draw_size+this.sizes.point_selected_shadow_radius, draw_size+this.sizes.point_selected_shadow_radius, 0, 0, Math.PI*2);
                        this.ctx.fill();
                    }

                    this.ctx.fillStyle = point.color;
                    this.ctx.beginPath();
                    this.ctx.ellipse(x_pos_in_px , y_pos_in_px, draw_size, draw_size, 0, 0, Math.PI*2);
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

                draw_axis = (axis)=>{

                    if(axis.type == 'vertical'){
                        if(axis.position < this.m.x_min || axis.position > this.m.x_max){return} // don't draw axis if it goes out of frame
                        let x_pos = this.convert_unitX_to_px(axis.position);
                        this.ctx.lineWidth = this.sizes.axisLineWidth;
                        this.ctx.strokeStyle = this.colors.y_axis;
                        this.ctx.beginPath();
                        this.ctx.moveTo(x_pos, this.y1);
                        this.ctx.lineTo(x_pos, this.y2);
                        this.ctx.stroke();


                    }
                    if(axis.type == 'horizontal'){
                        if(axis.position < this.m.y_min || axis.position > this.m.y_max){return} // don't draw axis if it goes out of frame

                        let y_pos = this.convert_unitY_to_px(axis.position);
                        this.ctx.lineWidth = this.sizes.axisLineWidth;
                        this.ctx.strokeStyle = this.colors.x_axis;
                        this.ctx.beginPath();
                        this.ctx.moveTo(this.x1, y_pos);
                        this.ctx.lineTo(this.x2, y_pos);
                        this.ctx.stroke();
                    }
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
        for(let x = 0; x < this.m.x_max; x += this.step.x_major){
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
        for(let y = 0; y < this.m.y_max; y += this.step.y_major){
            y = round(y);
            let gridline = new Gridline('horizontal', y);
            this.grid.major.horizontal.push(gridline);
        }

        // make negative value for horizontal grids
        for(let y = -this.step.y_major; y > this.m.y_min; y -= this.step.y_major){
            y = round(y);
            let gridline = new Gridline('horizontal', y);
            this.grid.major.horizontal.push(gridline);
        }

        // sorts grids
        this.grid.major.vertical.sort((a, b) => a.position - b.position);
        this.grid.major.horizontal.sort((a, b) => a.position - b.position);
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

        this.wheel.forEach((listener)=>{
            this.add_wheel_listener(listener);
        })

        this.mousedown.forEach((listener)=>{
            this.add_mousedown_listener(listener);
        })
    }


        add_mousedown_listener = (listener = ()=>{console.log('mousedown listener')})=>{
            this.canvas.addEventListener('mousedown', listener)
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

        add_wheel_listener = (listener = ()=> {console.log('wheel listener')}) =>{
            this.canvas.addEventListener('wheel', listener)
        }

        // listeners

            mm_update_mouse_object = (e)=>{
                this.mouse.x.px = e.clientX;
                this.mouse.x.unit = this.convert_pxX_to_unit(this.mouse.x.px);


                this.mouse.y.px = e.clientY;
                this.mouse.y.unit = this.convert_pxY_to_unit(this.mouse.y.px);
            }

            mm_is_mouse_on_object = (e)=>{
                this.points.forEach((point)=>{
                    let x_diff = Math.abs(this.mouse.x.px - this.convert_unitX_to_px(point.x))
                    let y_diff = Math.abs(this.mouse.y.px - this.convert_unitY_to_px(point.y))
                    if(x_diff < point.size && y_diff < point.size){
                        point.is_mouse_on = true;
                    }else{
                        point.is_mouse_on = false;
                    }
                })
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

            kd_pan = (e)=>{

                switch(e.key){
                    case 'd':
                        this.pan.velocity.x -= this.pan.acceleration;
                        if(this.pan.velocity.x < -this.pan.max_speed){this.pan.velocity.x = -this.pan.max_speed}
                        console.log('pan left', this.pan.velocity.x)
                    break;
                    case 'a':
                        this.pan.velocity.x += this.pan.acceleration;
                        if(this.pan.velocity.x > this.pan.max_speed){this.pan.velocity.x = this.pan.max_speed}
                    break;
                    case 's':
                        this.pan.velocity.y += this.pan.acceleration;
                        if(this.pan.velocity.y > this.pan.max_speed){this.pan.velocity.y = this.pan.max_speed}
                    break;
                    case 'w':
                        this.pan.velocity.y -= this.pan.acceleration;
                        if(this.pan.velocity.y < -this.pan.max_speed){this.pan.velocity.y = -this.pan.max_speed}
                    break;
                    default:
                }
                if(e.key == 'a'){
                    
                }
            }

            kd_center_origin = (e)=>{
                if(e.key == '0'){
                    this.origin.offset.x_px = 0;
                    this.origin.offset.y_px = 0;
                }
            }

            ku_pan = (e)=>{
                switch(e.key){
                    case 'a':
                        this.pan.velocity.x = 0
                    break;
                    case 'd':
                        this.pan.velocity.x = 0
                    break;
                    case 'w':
                        this.pan.velocity.y = 0
                    break;
                    case 's':
                        this.pan.velocity.y = 0
                    break;
                    default:   
                }
            }

            wh_zoom_out = (e)=>{
                
                clearTimeout(this.is_wheel_moving)
                if(e.deltaY < 0){
                    this.zoom.velocity -= .5;      
                }
                if(e.deltaY > 0){
                    this.zoom.velocity += .5;  
                }
                if(this.zoom.velocity > 5){
                    this.zoom.velocity = 5;
                }
                if(this.zoom.velocity < -5){
                    this.zoom.velocity = -5
                }
                this.is_wheel_moving = setTimeout(()=>{this.zoom.is_braking = true }, 200);
                
            //     let zoom_ratio = 1 - .01*this.zoom.velocity*15;
            //        // adjust origin.offset.x_px
            //        let x_dist_px_to_mouse_before = this.mouse.x.unit * this.unit.x_px; 
            //        let x_dist_px_to_mouse_after = x_dist_px_to_mouse_before * zoom_ratio;
            //        let change_in_x_px = x_dist_px_to_mouse_after - x_dist_px_to_mouse_before;
            //        this.origin.offset.x_px -= change_in_x_px;
               
            //    // adjust origin.offset.y_px
            //    let y_dist_px_to_mouse_before = this.mouse.y.unit * this.unit.y_px; 
            //    let y_dist_px_to_mouse_after = y_dist_px_to_mouse_before * zoom_ratio;
            //    let change_in_y_px = y_dist_px_to_mouse_after - y_dist_px_to_mouse_before;
            //    this.origin.offset.y_px += change_in_y_px;
               
            //    this.unit.x_px *= zoom_ratio
            //    this.unit.y_px *= zoom_ratio
            //    this.zoom.velocity = 0;
            }

            md_select_object = (e)=>{
                console.log('hmmm')
                this.points.forEach((point)=>{
                    if(point.is_mouse_on){
                        if(!point.is_selected){
                            point.is_selected = true;
                        }
                        else{
                            point.is_selected = false;
                        }
                        
                       
                    }
                })
            }
}

export {Plane};