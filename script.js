var canvas;
var ctx;
var boundingClientRect;
var offsetX;
var offsetY;
var canvasWidth;
var canvasHeight;

var points = [];
var dragOk = false;
var startX;
var startY;
const POINT_RADIUS = 5.5;
const NUMBER_VERTICES = 4;

var modal;
var btn;
var span;

window.onload = function() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    boundingClientRect=canvas.getBoundingClientRect();
    offsetX=boundingClientRect.left;
    offsetY=boundingClientRect.top;
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;

    canvas.addEventListener("click", drawPoint, false);
    canvas.addEventListener("mousedown", startDrag, false);
    canvas.addEventListener("mouseup", endDrag, false);
    canvas.addEventListener("mousemove",dragging, false);

    document.getElementById("resetButton").onclick = resetCanvas;
    document.getElementById("aboutButton").onclick = openModal;
    
    modal = document.getElementById('aboutModal');    
    document.getElementsByClassName("closeModal")[0].onclick = closeModal;
    window.onclick = closeModalWindow;
}

function closeModalWindow (){
    if (event.target == modal) {
        modal.style.display = "none";
      }
}

function closeModal() {
    /**
     * open 'about' modal
     */
    modal.style.display = "none";
}

function openModal () {
    /**
     * open 'about' modal
     */
    modal.style.display = "block";
}

function resetCanvas() {
    /**
     * Reset canvas to original state
     */
    points = [];
    clear();

    for(i = 0; i < NUMBER_VERTICES; i++) {
        document.getElementById("point"+i+"X").value = "";
        document.getElementById("point"+i+"Y").value = "";
    }
    document.getElementById("totalArea").value = "";

}

//draw the red points whenever the user clicks on the canvas
function drawPoint(event) {
    /**
     * draw the red vertices at clicked places
     * @param {event}
     */

    if (points.length >= NUMBER_VERTICES -1) {
        return;
    }

    positionX = event.pageX - boundingClientRect.left;
    positionY = event.pageY - boundingClientRect.top;

    points.push({x: positionX, y:positionY, dragging: false});

    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(positionX, positionY, 5.5, 0, 2*Math.PI);
    ctx.fill();

    if (points.length >= NUMBER_VERTICES -1) {
        updatingShapes();
        updatingData();
    }
}

function drawParalellogram() {
    /**
     * draw the blue paralellogram
     */
    positionX = points[0].x - (points[1].x - points[2].x);
    positionY = points[0].y - (points[1].y - points[2].y);

    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    ctx.lineTo(positionX, positionY);
    ctx.lineTo(points[2].x, points[2].y);
    ctx.lineTo(points[1].x, points[1].y);

    ctx.closePath();
    ctx.fill();    
}

function calcParalellogramArea() {
    /**
     * using Shoelace formula to calculate the paralellogram area
     * @returns The paralellogram area
     */
    var paralellogramArea = 0
    for (i = 0; i < points.length - 1; i++) {
        paralellogramArea += points[i].x * points[i + 1].y - points[i + 1].x * points[i].y
    }
    paralellogramArea += points[points.length - 1].x * points[0].y - points[0].x * points[points.length - 1].y;
    return Math.abs(paralellogramArea) / 2;
}

function drawCircle() {
    /**
     * draw the yellow circle
     */
    centerX = (points[0].x + points[1].x + points[2].x + points[3].x) / 4;
    centerY = (points[0].y + points[1].y + points[2].y + points[3].y) / 4;

    paralellogramArea = calcParalellogramArea();

    radius = Math.sqrt(paralellogramArea / Math.PI);

    ctx.strokeStyle="yellow";

    ctx.fillStyle = undefined;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2*Math.PI);
    ctx.stroke();

}

function startDrag(e){
    /**
     * check if some vertice was clicked and start drag sequence
     * @param {event}
     */
    e.preventDefault();
    e.stopPropagation();

    let mouseX=parseInt(e.clientX-offsetX);
    let mouseY=parseInt(e.clientY-offsetY);

    dragOk=false;
    for(let i = 0; i < points.length - 1; i++){
        let point=points[i];
        let distanceX=point.x-mouseX;
        let distanceY=point.y-mouseY;
        if(distanceX*distanceX+distanceY*distanceY<POINT_RADIUS*POINT_RADIUS){ //checking if inside point
            dragOk=true;
            point.dragging=true;
        }
    }
    // save the current mouse position
    startX=mouseX;
    startY=mouseY;
}

// handle mouseup events
function endDrag(e){
    e.preventDefault();
    e.stopPropagation();

    dragOk = false;
    for(let i=0;i<points.length - 1;i++){
        points[i].dragging=false;
    }
}

function dragging(e){
    /**
     * drag the vertice if drag mode is on
     * @param {event}
     */
    if (dragOk){

        e.preventDefault();
        e.stopPropagation();

        let mouseX=parseInt(e.clientX-offsetX);
        let mouseY=parseInt(e.clientY-offsetY);

        let distanceX=mouseX-startX;
        let distanceY=mouseY-startY;

        for(let i = 0; i < points.length - 1; i++){ 
            let point=points[i];
            if(point.dragging){
                point.x += distanceX;
                point.y += distanceY;
            }
        }

        draw();

        startX=mouseX;
        startY=mouseY;

    }
}

function draw() {
    /**
     * Draws the objects and updates data
     */
    clear();
    for(let i = 0;i<points.length - 1;i++){
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(points[i].x, points[i].y, POINT_RADIUS, 0, 2*Math.PI);
        ctx.fill();
    }

    if (points.length >= NUMBER_VERTICES -1) {
        updatingShapes();
        updatingData();
    }
}

function updatingShapes(){
    /**
     * redraw the paralellogram and the circle on the canvas
     */
    let lastPosition = {};
    lastPosition.x = points[0].x - (points[1].x - points[2].x);
    lastPosition.y = points[0].y - (points[1].y - points[2].y);
    points[3] = lastPosition;
    drawParalellogram();
    drawCircle();
}

function updatingData () {
    /**
     * updates the information about the vertices and the area
     */
    for(let i = 0; i < points.length; i++) {
        document.getElementById("point"+i+"X").value = parseInt(points[i].x);
        document.getElementById("point"+i+"Y").value = parseInt(points[i].y);
    }
    document.getElementById("totalArea").value = calcParalellogramArea();
}

function clear() {
    /**
     * clean the canvas
     */
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
}
