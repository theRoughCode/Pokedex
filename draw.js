window.onload = function () {
    // Definitions
    const canvas = document.getElementById("paint-canvas");
    const context = canvas.getContext("2d");
  
    // Specifications
    let mouseX = 0;
    let mouseY = 0;
    context.strokeStyle = 'black'; // initial brush color
    context.lineWidth = 1; // initial brush width
    let isDrawing = false;

    // Handle Colors
    const colors = document.getElementsByClassName('colors')[0];
  
    colors.addEventListener('click', function(event) {
      context.strokeStyle = event.target.value || 'black';
    });
  
    // Handle Brushes
    const brushes = document.getElementsByClassName('brushes')[0];
  
    brushes.addEventListener('click', function(event) {
      context.lineWidth = event.target.value || 1;
    });
  
    // Mouse Down Event
    canvas.addEventListener('mousedown', function(event) {
      setMouseCoordinates(event);
      isDrawing = true;
  
      // Start Drawing
      context.beginPath();
      context.moveTo(mouseX, mouseY);
    });
  
    // Mouse Move Event
    canvas.addEventListener('mousemove', function(event) {
      setMouseCoordinates(event);
  
      if(isDrawing){
        context.lineTo(mouseX, mouseY);
        context.stroke();
      }
    });
  
    // Mouse Up Event
    canvas.addEventListener('mouseup', function(event) {
      setMouseCoordinates(event);
      isDrawing = false;
    });
  
    // Handle Mouse Coordinates
    function setMouseCoordinates(event) {
      const boundings = canvas.getBoundingClientRect();
      mouseX = event.clientX - boundings.left;
      mouseY = event.clientY - boundings.top;
    }
  
    // Handle Clear Button
    var clearButton = document.getElementById('clear');
  
    clearButton.addEventListener('click', function() {
      context.clearRect(0, 0, canvas.width, canvas.height);
    });
  
    // Handle Save Button
    var saveButton = document.getElementById('save');
  
    saveButton.addEventListener('click', function() {
      var imageName = prompt('Please enter image name');
      var canvasDataURL = canvas.toDataURL();
      var a = document.createElement('a');
      a.href = canvasDataURL;
      a.download = imageName || 'drawing';
      a.click();
    });
  };
  