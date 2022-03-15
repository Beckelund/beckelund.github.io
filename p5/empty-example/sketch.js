

//constants for gradient
const Y_AXIS = 1;
const X_AXIS = 2;


let totalTime = 0.0;

//Window size

//Pool table dimensions: 140 x 252 (cm)
var X_SIZE = 252*4;
var Y_SIZE = 140*4;

/*
function windowResized() {
  let width = windowWidth * 0.6
  resizeCanvas(width, width/2);
  X_SIZE = width;
  Y_SIZE = width/2;
}
*/

//Physics settings
const gravity = 9.82 * 1000; //Scalar
const gravity_on = false;

//Friction
const frictionCoef = 0.03;
const friction_on = true;

//ODE-solver
const euler_on = true;

//Elasticity
const wall_elasticity = 0.75
const ball_elasticity = 0.99

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
  
  UpdatePosition(){
    if(euler_on == true)
    {
      this.PositionEuler();
    }
    else {
      //RK4
    }
  }
  
  
  PositionEuler() {
    let moveDist = this.velocity.copy().mult(deltaTime/1000)
    this.position.add(moveDist)
  }
  
  PositionRK4() {
    let k1 = new createVector(0,0)
    let k2 = new createVector(0,0)
    let k3 = new createVector(0,0)
    let k4 = new createVector(0,0)



  }

  UpdateVelocity(){

    //Current change in velocity:
    let velChange = new createVector(0, 0);

    //Gravity
    if(gravity_on == true)
    {
      const gravity_vector = new createVector(0, gravity)
      this.acceleration.add(gravity_vector.copy().mult(deltaTime/1000))
    }

    //Friction
    if(friction_on == true)
    {
      let direction = this.velocity.copy().normalize();
      let friction = direction.copy().mult(9.82).mult(frictionCoef);
      velChange.sub(friction)
    }

    //Apply Acceleration
    velChange.add(this.acceleration.mult(deltaTime/1000))
    this.velocity.add(velChange)
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

    //Settings
    const q = 0.5;  //Quota for how much darker color2 is

    //Select colors
    let color1 = color(this.color.x, this.color.y, this.color.z)
    let color2 = color(this.color.x * q, this.color.y * q, this.color.z * q)

    //Choose color
    /*
    if(this.isCollideBall) fill(color(255, 100, 100))
    else if(this.isCollideWall) fill(color(100, 255, 100))
    else fill(this.color)
    this.isCollideWall = false, this.isCollideBall = false;
    */

    translate(this.position.x, this.position.y);
    
    //Outer circle
    push()
      fill(color1)
      strokeWeight(0)
      circle(0, 0, this.radius * 2)
    pop()

    //Middle circle
    push()
      fill(color2)
      strokeWeight(0)
      stroke(color2)
      circle(0, 0, this.radius * 1.5)
    pop()

    //Inner circle
    push()
      fill(color1)
      strokeWeight(0)
      stroke(color2)
      circle(0, 0, this.radius * 1)
    pop()

    const debug = false;

    if(debug == true)
    {
      //Draw Speed Vector https://editor.p5js.org/odmundeetgen/sketches/qqmp0fVSK
      push()
        let color3 = color(this.color.x, this.color.y, this.color.z, 0)
        strokeWeight(1)
        var grad = window.drawingContext.createLinearGradient(0, 0, this.velocity.x, this.velocity.y);
        grad.addColorStop(0, color1);
        grad.addColorStop(1, color3);
        
        window.drawingContext.strokeStyle = grad;
        
        line(0,0, this.velocity.x, this.velocity.y)
      pop()

      //Write Speed Text
      push()
        let speed_text = round(this.velocity.mag())
        textSize(this.radius)
        fill(color(255, 255, 255))
        text(speed_text, -3.5,-10)
      pop()
    }
    
    pop()
  }
}

function DetectCollisions(obj) {
  for (var i = 0; i < obj.length;i++) {

    WallCollision(obj[i]);

    for (var j = i+1; j < obj.length; j++) {
      SphereCollision(obj[i], obj[j])
    }
  }
}

function WallCollision(obj)
{
  //@TODO, gör att hastigheten ändras beroende på absolutbelopp
  if(obj.position.y + obj.radius > Y_SIZE)
  {
    if(obj.velocity.y >= 0) obj.velocity.mult(1, -1 * wall_elasticity);
    obj.isCollideWall = true;
  }
  if(obj.position.y - obj.radius < 0)
  {
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
    var relativeVelocity = p5.Vector.sub(objB.velocity, objA.velocity)

    let speed = relativeVelocity.x * normalVector.x + relativeVelocity.y * normalVector.y;  //Dot product
    
    //Coefficient of restitution
    speed *= ball_elasticity

    let impulse = 2 * speed / (objA.mass + objB.mass)

    objA.isCollideBall = true;
    objB.isCollideBall = true;
    if(speed >= 0) {
      objA.velocity.add(impulse * objB.mass * normalVector.x, impulse * objB.mass * normalVector.y)
      objB.velocity.sub(impulse * objA.mass * normalVector.x, impulse * objA.mass * normalVector.y)
      
      //Play sound
      const max_volume = 0.01;
      let collide_volume = (objA.radius + objB.radius)/500;
      if(collide_volume > max_volume) collide_volume = max_volume;
      
      if(speed > 100)
      {
        console.log(round(speed) + " gives volume: " + collide_volume)
        sound_collision.setVolume(collide_volume);
        sound_collision.play();
      }
    }
  }
}


let all_objects = new Array();

//Sound Preload

let sound_collision;
function preload() {
  soundFormats('wav','ogg')
  sound_collision = loadSound('sounds/ball_clack1.wav')  //https://freesound.org/people/Za-Games/sounds/539854/
  //https://freesound.org/people/Atlas72/sounds/584212/
  //https://freesound.org/people/jayroo9/sounds/?page=3#sound
}

function setup() {
  
  textFont('Helvetica')
  /*
  let circlePos = new createVector(100, 100)
  let circleVel = new createVector(20, 10)
  let circleColor = color(255, 204, 170)
  
  all_objects.push(new rigidSpherical(1.0, circlePos, circleVel, circleColor, 20.0))
  */
 
 let circlePos1 = new createVector(100, 100)
 let circleVel1 = new createVector(250, 0)
 let circleColor1 = new createVector(255, 100, 100)
 
 all_objects.push(new rigidSpherical(1.0, circlePos1, circleVel1, circleColor1, 10.0))
 
 let circlePos2 = new createVector(300, 100)
 let circleVel2 = new createVector(0, 0)
 let circleColor2 = new createVector(255, 204, 170)
 
 all_objects.push(new rigidSpherical(1.0, circlePos2, circleVel2, circleColor2, 10.0))
 
 let circlePos3 = new createVector(321, 100)
 let circleVel3 = new createVector(0, 0)
 let circleColor3 = new createVector(255, 204, 170)
 
 all_objects.push(new rigidSpherical(1.0, circlePos3, circleVel3, circleColor3, 10.0))
 
 let circlePos4 = new createVector(342, 100)
 let circleVel4 = new createVector(0, 0)
 let circleColor4 = new createVector(255, 204, 170)
 
 all_objects.push(new rigidSpherical(1.0, circlePos4, circleVel4, circleColor4, 10.0))
 
 
 let window = createCanvas(X_SIZE, Y_SIZE);
 window.parent("simulation-window")
 document.addEventListener('contextmenu', event => event.preventDefault());
 
 drawUI();
}

var UI_radius = 20;
var UI_mass = 20;

var UI_color_random = true;

function drawUI() {

  //Tab 1
  let rSlider = createSlider(0, 255, 100);
  rSlider.parent("UI-tab1")

  //Spawn Ball size
  let spawnSize = createInput('20')
  spawnSize.parent("UI-tab1")
  spawnSize.input(setSpawnSize)

  //Spawn Ball Mass
  let spawnMass = createInput('20')
  spawnMass.parent("UI-tab1")
  spawnMass.input(setSpawnMass)

  //Tab 2
  let despawnAll = createButton('Remove all balls')
  despawnAll.parent("UI-tab2")
  despawnAll.mousePressed(DespawnAll)
}

function setSpawnSize() {UI_radius = Number(this.value())}
function setSpawnMass() {UI_mass = Number(this.value())}

function DespawnAll() {all_objects = new Array()}

function mousePressed() {
  if(mouseButton === RIGHT)
  {
    
    let circleVel = new createVector(0, 0)

    //Color
    let circleColor = new createVector(255, 255, 255); 
    if(UI_color_random == true) circleColor = new createVector(random(255), random(255), random(255))
    let circlePos = new createVector(mouseX, mouseY)
    let circleRadius = UI_radius
    let circleMass = UI_mass
    all_objects.push(new rigidSpherical(circleMass, circlePos, circleVel, circleColor, circleRadius))
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

  DetectCollisions(all_objects);
  
  
  //Collision Detection
  
  // Background
  setGradient(0, 0, X_SIZE, Y_SIZE, Y_AXIS);
  
  //Render loop
  all_objects.forEach(element => element.RenderMe())
  
  //Mouse features
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
    dragObject.acceleration.add(v1.mult(10))
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
  
  push()
  textSize(16)
  fill('white')
  text('total energy: ' + energyDisplay, 10, 30)
  pop()
}


function drawCursor() {
  push()
  fill(color(100,100,150,100))
  strokeWeight(0)
  circle(mouseX, mouseY, 20)
  pop()
  
}


function setGradient(x, y, w, h, axis) {
  noFill();
  
  c1 = color(100, 50, 70);
  c2 = color(20, 20, 70);
  
  if (axis === Y_AXIS) {
    // Top to bottom gradient
    for (let i = y; i <= y + h; i++) {
      let inter = map(i, y, y + h, 0, 1);
      let c = lerpColor(c1, c2, inter);
      push()
      stroke(c);
      line(x, i, x + w, i);
      pop()
    }
  }
}
