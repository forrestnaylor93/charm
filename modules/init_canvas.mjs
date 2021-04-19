const init_canvas_and_ctx = (canvasId)=>{
    // get canvas from html
    const canvas = document.getElementById(canvasId);

    // set width and height to full screen
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    canvas.tabIndex = 1; // alows canvas to be focusable
    canvas.focus();
    
    //document.activeElement = canvas;
    console.log(document.activeElement)

    // get context
    const ctx = canvas.getContext('2d');

    // remove scroll
    function unloadScrollBars() {
      document.documentElement.style.overflow = 'hidden';  // firefox, chrome
      document.body.scroll = "no"; // ie only
  }

  unloadScrollBars();

// Remove listener to re-enable scroll
//window.removeEventListener('scroll', noScroll);


    return {
        canvas: canvas,
        ctx: ctx
    }

}


function resizeCanvasToDisplaySize(canvas) {
    // Lookup the size the browser is displaying the canvas in CSS pixels.
    const displayWidth  = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
   
    // Check if the canvas is not the same size.
    const needResize = canvas.width  !== displayWidth ||
                       canvas.height !== displayHeight;
   
    if (needResize) {
      // Make the canvas the same size
      canvas.width  = displayWidth;
      canvas.height = displayHeight;
    }
   
    return needResize;
  }



export{init_canvas_and_ctx, resizeCanvasToDisplaySize}