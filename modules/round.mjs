// const round_decimals = (number,decimal_place) =>{
//     power_of_ten = 
//     rounded_number = Math.round(number)
// 
// const find_e_index = (number_string)=>{
//     let index = 0;
//     let e_index;
    
//     let array = Array.from(number_string)
//     //let index = 0;
    
//     array.forEach((char, index)=>{
//         if(char == 'e'){
//             e_index = index;
//         }
//     })

//     return e_index
// }

// const round_tiny = (num, decimal_places = 3)=>{
// let rounded;
// let numString;
// let numString_no_e;
// let e_string;
// let e_index
// if(Math.abs(num) < 1e-6){
//     numString = num.toString()
//     e_index = find_e_index(numString);
//     e_string = numString.substring(e_index, numString.length)
//     numString_no_e = numString.substring(0,e_index);
//     numString_no_e = Math.round(Number(numString_no_e)*(10**decimal_places))/(10**decimal_places)
//     rounded = Number(numString_no_e + e_string);
//     return(rounded)
// }
// else{console.log('number too large for round tiny')}


// }

// const round_huge = (num, decimal_places = 3)=>{
//     let rounded;
//     let numString;
//     let numString_no_e;
//     let e_string;
//     let e_index
//     if(Math.abs(num) > 1e20){
//         numString = num.toString()
//         e_index = find_e_index(numString);
//         e_string = numString.substring(e_index, numString.length)
//         numString_no_e = numString.substring(0,e_index);
//         numString_no_e = Math.round(Number(numString_no_e)*(10**decimal_places))/(10**decimal_places)
//         rounded = Number(numString_no_e + e_string);
//         return(rounded)
//     }
//     else{console.log('number too large for round tiny')}
    
    
//     }

// const round = (number, decimal_places = 6) => {
//     let is_negative = false;
//     let size = null;
//     let rounded;
    
    
//     if(number < 0){is_negative = true; number = Math.abs(number)};


//     switch(true){
//         case (number < 1e-6):
//             rounded = round_tiny(number, decimal_places)
//         break;
//         case (number > 1e20):
//             rounded = round_huge(number, decimal_places)
//         break;
//         default:
//             //console.log('normal round')
//             rounded = Number(Math.round(number + "e" + decimal_places) + "e-" + decimal_places);
//     }

//     if(is_negative){rounded *= -1};
//     return rounded;

   

//     //rounded = Number(Math.round(number + "e" + decimalPlaces).toFixed() + "e-" + decimalPlaces);


   
    
   

//     return ;



// }

//export{round};
//let num = round(2e11)
//console.log(num)
// let interval = -2e-7;

// for(let i = 0; i < 7; i++){
//     let rounded = round(i*interval,10)
//     console.log('not rounded: ', i*interval)
//     console.log('rounded: ', rounded)
// }


// the goal of this module is to round any number tiny or huge to x decimals of percision to avoid the double floating point addition problems that happen sometime

//import Big from "big.js";


// rounds numbers less than 1e-6

const get_e_index = (number_string)=>{
    let array = ( Array.from(number_string));
    //console.log(array);
    let e_index;
    array.forEach((char,index)=>{
        if(char == 'e'){
            e_index = index;
        }
    })
    return(e_index);
    
}


// num < 1e-6
const round_tiny_numbers = (number, sig_figs = 3)=>{
    let number_string = number.toString();
    let e_index = get_e_index(number_string);
    let e_string = number_string.substring(e_index, number_string.length);
    let base_string = number_string.substring(0, e_index);
    let base_num = Number(base_string);
    let rounded_tiny_number = Number(Math.round(base_num*(10**sig_figs))/(10**sig_figs) + e_string)
    return rounded_tiny_number;
    

    //return 0;
    

}


// 1e-6 < num < 1
const round_small_numbers = (number, sig_figs = 3)=>{
    let e = Math.floor(Math.log10(number))
    let rounded_small_number = Math.round(number * (10**(-e+sig_figs)))/10**(-e+sig_figs);
    return rounded_small_number;
} 

// 1 < num
const round_bigger_than_1 = (number, sig_figs = 3) =>{
    let e = Math.floor(Math.log10(number))
    //let rounded_number = Math.floor(Math.floor(number/Math.pow(10,sig_figs-e))*Math.pow(10,sig_figs-e));
    let rounded_number = Math.round(number*Math.pow(10,sig_figs-e))/Math.pow(10, sig_figs-e);
    rounded_number = Number(rounded_number.toPrecision(sig_figs+1))
    return rounded_number;
}


const round = (number, decimal_places = 3)=>{

    let is_negative = false;
    if(number < 0){
        is_negative = true;
        number = Math.abs(number);
    }

    if(Math.abs(number) < 1e-6){
        number = round_tiny_numbers(number, decimal_places)
    }
    else if(Math.abs(number) < 1){

        number = round_small_numbers(number, decimal_places)
       
    }
    else if (Math.abs(number)>=1){
       // console.log('big ol boy')
        number = round_bigger_than_1(number, decimal_places);
    }

    if(is_negative){
        number *= -1;
    }
    
    return number
}



const show_range = ()=>{
    for(let i = -20; i < 25; i++){
        let basenum = 1.23456789*(10**i) //+ 1*(10**i);
        let rounded = round(basenum);
        //console.log('normal  -  ', basenum);
        console.log(i,'  -  ', rounded);
    }
}

//round_tiny_numbers(2.0045e-8);

//let x = round_small_numbers(2*10**-5);
//console.log(x);

//show_range();

//export {round};


// for (let j = -20, j < 25, j++){
//     

// }

// let rounded = round(.0001)
// console.log(rounded)


//export{round}

// let rounded = round(.0001)
// console.log(rounded)

export {round}