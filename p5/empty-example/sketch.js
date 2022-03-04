

//constants for gradient
const Y_AXIS = 1;
const X_AXIS = 2;


let totalTime = 0.0;

//Window size

//Pool table dimensions: 140 x 252 (cm)
const X_SIZE = 756;
const Y_SIZE = 200;

//Physics settings
const gravity = 9.82 * 0; //Scalar
const wall_elasticity = 0.5

//New Classes
class rigidObject{
  constructor(mass, position, velocity, color){
    this.position = position;   //(p5.Vector)
    this.velocity = velocity;   //(p5.Vector)

    this.acceleration = createVector(0,0)
    this.color = color;
    this.mass = mass; // Scalar 
    this.elasticity = 0.5;
    this.rotation = 0;
    this.rotationalVelocity = 0;
  }

  /*
  impulseResponce(collistionPoint,collistionObject){
    var r_ap = collistionPoint.copy();
    r_ap.sub(this.position);

    var r_bp = collistionPoint.copy();
    r_bp.sub(collistionObject.position);
    
    var PointVelocity_A = this.velocity.copy();
    //PointVelocity_A.add(cross())
    
    if(1){//dynamic object collision
      //impulse = -(1+this.elasticity)
    } 
  }
  */
  
  UpdatePosition(){
    let moveDist = this.velocity.copy()
    moveDist.mult(deltaTime/1000)
    this.position.add(moveDist)
  }
  
  UpdateVelocity(){

    //Acceleration calc
    const gravity_vector = new createVector(0, gravity)
    let velChange = gravity_vector.copy().mult(deltaTime/1000)
    velChange.add(this.acceleration.mult(deltaTime/1000))
    this.acceleration.set(0,0)
    this.velocity.add(velChange)
    this.velocity.mult(1)
  }
}

class rigidSpherical extends rigidObject{
  constructor(mass, pos, vel, color, radius){
    super(mass, pos, vel, color);
    this.radius = radius;
    this.inv_Momevt_of_inertia = radius*radius*mass*0.5;

    this.isCollideWall = false;
    this.isCollideBall = false;
  }
  


  RenderMe() {
    push()

    //Choose color
    if(this.isCollideBall) fill(color(255, 100, 100))
    else if(this.isCollideWall) fill(color(100, 255, 100))
    else fill(this.color)

    this.isCollideWall = false, this.isCollideBall = false;
    
    
    translate(this.position.x,this.position.y);
    //Todo, q
    circle(0,0, this.radius * 2)
    line(0,0, this.velocity.x, this.velocity.y)
    pop()
  }
}

function DetectCollisions(theObjects) {
 for (var i = 0; i < theObjects.length;i++) {
  
  let obj = theObjects[i];
  
  WallCollision(obj);

  
  
  for (var j = i+1; j < theObjects.length; j++) {
    
    SphereCollision(obj, theObjects[j])
  }
 }
}

function WallCollision(obj)
{
  //@TODO, gör att hastigheten ändras beroende på absolutbelopp
  if(obj.position.y + obj.radius > Y_SIZE)
  {
    //console.log("Collision at " + theObjects[i].position.y)
    if(obj.velocity.y >= 0) obj.velocity.mult(1, -1 * wall_elasticity);
    obj.isCollideWall = true;
  }
  if(obj.position.y - obj.radius < 0)
  {
    //console.log("Collision at " + theObjects[i].position.y)
    if(obj.velocity.y <= 0) obj.velocity.mult(1, -1 * wall_elasticity);
    obj.isCollideWall = true;
  }
  if(obj.position.x + obj.radius > X_SIZE)
  {
    if(obj.velocity.x >= 0) obj.velocity.mult(-1 * wall_elasticity, 1)
    obj.isCollideWall = true;
  }
  if(obj.position.x - obj.radius < 0)
  {
    if(obj.velocity.x <= 0) obj.velocity.mult(-1 * wall_elasticity, 1)
    obj.isCollideWall = true;
  }
}

function SphereCollision(objA, objB)
{
  var posA = objA.position.copy();
  var posB = objB.position.copy();
  
  let differenceVector = p5.Vector.sub(posA, posB)
  
  //Check distance
  var targetDistance = objA.radius + objB.radius  //Distance for collision to occur
  //var currentDistance = posA.dist(posB);
  var currentDistance = differenceVector.mag();
  
  if(currentDistance <= targetDistance){
    
    var normalVector = differenceVector.normalize()
    //console.log("DiffVec?: " + differenceVector.x + " and: " + differenceVector.y);
    //console.log("Normal?: " + differenceVector.x + " and: " + differenceVector.y);
    //console.log("speed " + speed);
    //p5.Vector(lol);
    var relativeVelocity = p5.Vector.sub(objB.velocity, objA.velocity)
    //var speed = p5.Vector.dot(normalVector, relativeVelocity);
    let speed = relativeVelocity.x * normalVector.x + relativeVelocity.y * normalVector.y;
    
    let impulse = 2 * speed / (objA.mass + objB.mass)

    objA.isCollideBall = true;
    objB.isCollideBall = true;
    if(speed >= 0) {
      objA.velocity.add(impulse * objB.mass * normalVector.x, impulse * objB.mass * normalVector.y)
      objB.velocity.sub(impulse * objA.mass * normalVector.x, impulse * objA.mass * normalVector.y)
    }
  }
}

let all_objects = new Array();

function setup() {

  /*
  let circlePos = new createVector(100, 100)
  let circleVel = new createVector(20, 10)
  let circleColor = color(255, 204, 170)

  all_objects.push(new rigidSpherical(1.0, circlePos, circleVel, circleColor, 20.0))
  */

  let circlePos1 = new createVector(100, 100)
  let circleVel1 = new createVector(250, 0)
  let circleColor1 = color(255, 204, 170)

  all_objects.push(new rigidSpherical(1.0, circlePos1, circleVel1, circleColor1, 10.0))

  let circlePos2 = new createVector(300, 100)
  let circleVel2 = new createVector(0, 0)
  let circleColor2 = color(255, 204, 170)

  all_objects.push(new rigidSpherical(1.0, circlePos2, circleVel2, circleColor2, 10.0))

  let circlePos3 = new createVector(321, 100)
  let circleVel3 = new createVector(0, 0)
  let circleColor3 = color(255, 204, 170)

  all_objects.push(new rigidSpherical(1.0, circlePos3, circleVel3, circleColor3, 10.0))

  let circlePos4 = new createVector(342, 100)
  let circleVel4 = new createVector(0, 0)
  let circleColor4 = color(255, 204, 170)

  all_objects.push(new rigidSpherical(1.0, circlePos4, circleVel4, circleColor4, 10.0))
  
  let window = createCanvas(X_SIZE, Y_SIZE);
  window.parent("simulation_window")


}

function mousePressed() {
  if(mouseButton === RIGHT)
  {
    
    let circleVel = new createVector(50, -10)
    let circleColor = color(255, 255, 170)
    let circlePos = new createVector(mouseX, mouseY)
    all_objects.push(new rigidSpherical(1.0, circlePos, circleVel, circleColor, 15.0))
  }
}

var dragObject = null;
var hasObject = false;

var frames = 0;
var totalEnergy = 0;

function draw() {
  
  totalTime += deltaTime/1000;
  //console.log(totalTime)
  
  //Physics loop
  all_objects.forEach(element => element.UpdatePosition())
  all_objects.forEach(element => element.UpdateVelocity())
  
  
  //Collision Detection
  DetectCollisions(all_objects);
  
  // Background
  setGradient(0, 0, X_SIZE, Y_SIZE, Y_AXIS);
  
  //Render loop
  all_objects.forEach(element => element.RenderMe())
  
  //Mouse features
  
  console.log(dragObject)
  let mouseVector = createVector(mouseX, mouseY)
  if(mouseIsPressed) {
    drawCursor()
    
    if(dragObject == null)
    {
      
      for(var i = 0; i < all_objects.length; i++) {
        let distance = p5.Vector.sub(mouseVector, all_objects[i].position).mag()
        
        if(distance < all_objects[i].radius)
        {
          all_objects[i].isCollideWall = true;
          dragObject = all_objects[i];
          //break;
        }
      }
    }
      
  }
  else
  {
    dragObject = null;
  }


  //Drag Object
  if(dragObject != null)
  {
    let v1 = p5.Vector.sub(mouseVector, dragObject.position)
    dragObject.acceleration.set(v1.mult(10))
    line(dragObject.position.x, dragObject.position.y, mouseX, mouseY)
  }
  

  frames++;
  //Display energy
  if(frames % 5 == 0)
  {
    totalEnergy = 0;
    all_objects.forEach(element => totalEnergy += (1/2)*element.mass*element.velocity.mag()*element.velocity.mag())
  }
    
    
  let energyDisplay = 0;
  if(totalEnergy > 1000) energyDisplay = Math.round(totalEnergy/1000) + " K"
  else energyDisplay = Math.round(totalEnergy)

  text('total energy: ' + energyDisplay, 10, 30)

}


function drawCursor() {
    push()
      fill(color(100,100,150))
      circle(mouseX, mouseY, 20)
    pop()
  
}

function setGradient(x, y, w, h, axis) {
  noFill();

  c1 = color(68, 124, 82);
  c2 = color(58, 88, 66);

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
