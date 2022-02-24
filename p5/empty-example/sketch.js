//global

//constants for gradient
const Y_AXIS = 1;
const X_AXIS = 2;

const gravity = 9.82; //Scalar

let totalTime = 0.0;

//New Classes
class rigidObject{
  constructor(mass, position, velocity, color){
    this.position = position;   //(p5.Vector)
    this.velocity = velocity;   //(p5.Vector)
    
    this.color = color;
    
    this.inv_Mass = 1/mass; // Scalar 
  }
  
  impulseResponce(collistionPoint,collistionObject){
    
  }
  
  UpdatePosition(){
    let moveDist = this.velocity.copy()
    moveDist.mult(deltaTime/1000)
    this.position.add(moveDist)
  }
  
  UpdateVelocity(){
    const gravity_vector = new createVector(0, 9.82)
    let velChange = gravity_vector.copy().mult(deltaTime/1000)
    this.velocity.add(velChange)
  }
}

class rigidSpherical extends rigidObject{
  constructor(mass, pos, vel, color, radius){
    super(mass, pos, vel, color);
    this.radius = radius;
  }

  RenderMe() {
    push()
    fill(this.color)
    translate(this.position.x,this.position.y);
    //Todo, rotate
    circle(0,0, this.radius)
    pop()
  }
}

class rigidRectangular extends rigidObject{
  constructor(mass, pos, vel, color, width, height){
    super(mass, pos, vel, color);
    this.width = width;
    this.height = height;
  }

  RenderMe(){
    push()
    fill(this.color)
    translate(this.position.x,this.position.y)
    rotate(PI/3);
    rect(-this.width/2,-this.height/2,this.width/2,this.height/2)
    pop()
  }

}

function DetectCollisions(theObjects) {
 for (var i = 0; i < theObjects.length;i++) {
  for (var j = i+1; j < theObjects.length; j++) {
    //theObjects[i]
    //theObjects[j]

  }
 }
}

let all_objects = new Array();

function setup() {

  let circlePos = new createVector(100, 100)
  let circleVel = new createVector(0, -10)
  let circleColor = color(255, 204, 170)

  all_objects.push(new rigidSpherical(1.0, circlePos, circleVel, circleColor, 50.0))
  
  all_objects.push(new rigidRectangular(1.0, new createVector(200,100),  new createVector(2,-1), circleColor,100,100))
  
  createCanvas(800, 800);
}

function mousePressed() {
  let circlePos = new createVector(mouseX, mouseY)
  let circleVel = new createVector(0, -10)
  let circleColor = color(255, 204, 170)

  all_objects.push(new rigidSpherical(1.0, circlePos, circleVel, circleColor, 50.0))
}

function draw() {

  totalTime += deltaTime/1000;
  //console.log(totalTime)

  //Physics loop
  all_objects.forEach(element => element.UpdatePosition())
  all_objects.forEach(element => element.UpdateVelocity())
  
  // Background
  setGradient(0, 0, 800, 800, Y_AXIS);
  
  
  
  
  //Render loop
  all_objects.forEach(element => element.RenderMe())
  
  

  //Example Code
  let circleColor = color(255, 204, 0)
  fill(color(255, 204, 0));
  circle(50, 100, 10);
}  

function setGradient(x, y, w, h, axis) {
  noFill();

  c1 = color(204, 102, 0);
  c2 = color(0, 102, 153);

  if (axis === Y_AXIS) {
    // Top to bottom gradient
    for (let i = y; i <= y + h; i++) {
      let inter = map(i, y, y + h, 0, 1);
      let c = lerpColor(c1, c2, inter);
      stroke(c);
      line(x, i, x + w, i);
    }
  }
}
