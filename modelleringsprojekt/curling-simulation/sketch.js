

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

//Audio
const audio_on = false;

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

    this.isCollideWall = false;
    this.isCollideBall = false;

    this.lifeTime = 0.0; //Starting scale when spawned
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

    let currentScale = this.lifeTime;
    if(currentScale < 1.0)
    {
      scale(currentScale)
      this.lifeTime += (deltaTime/1000) * 10;
    }

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
      if(audio_on == true)
      {
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
}



//Sound Preload

let sound_collision;
function preload() {
  soundFormats('wav','ogg')
  sound_collision = loadSound('sounds/ball_clack1.wav')  //https://freesound.org/people/Za-Games/sounds/539854/
  //https://freesound.org/people/Atlas72/sounds/584212/
  //https://freesound.org/people/jayroo9/sounds/?page=3#sound
}

let all_objects = new Array();

function setup() {
  textFont('Helvetica')
  let window = createCanvas(X_SIZE, Y_SIZE);
  window.parent("simulation-window")
  document.addEventListener('contextmenu', event => event.preventDefault());

  NewtonsCradle();
  drawUI();
}

var UI_radius = 35;
var UI_mass = 35;

var UI_color_random = true;

function drawUI() {

  //Tab 1 title
  createElement('h2', 'Spawn ball settings').parent("UI-tab1")

  //Spawn Ball size
  createElement('h3', 'Ball radius (m)').parent("UI-tab1")
  createInput('35').parent("UI-tab1").input(setSpawnSize)

  //Spawn Ball Mass
  createElement('h3', 'Ball Mass (kg)').parent("UI-tab1")
  createInput('35').parent("UI-tab1").input(setSpawnMass)
  
  //Tab 2 title
  createElement('h2', 'Scenarios').parent("UI-tab2")

  //Remove all button
  createButton('Remove all balls').parent("UI-tab2").mousePressed(DespawnAll)
  createButton("Newton's cradle").parent("UI-tab2").mousePressed(NewtonsCradle)
  createButton('Spawn 5 random').parent("UI-tab2").mousePressed(Spawn5Random)
}

function setSpawnSize() {UI_radius = Number(this.value())}
function setSpawnMass() {UI_mass = Number(this.value())}

function DespawnAll() {
  all_objects = new Array()
}

function NewtonsCradle() {
  //Settings
  let color1 = new createVector(255, 100, 100);
  let color2 = new createVector(255, 204, 170);

  const middleBallAmount = 4;

  //Pushing Ball
  let circlePos1 = new createVector(UI_radius, Y_SIZE/2)
  let circleVel1 = new createVector(300, 0)
  let circleColor1 = new createVector(255, 100, 100)
  all_objects.push(new rigidSpherical(UI_mass, circlePos1, circleVel1, circleColor1, UI_radius))

  //Middle Balls
  const middlePos = createVector(X_SIZE/2, Y_SIZE/2);
  const middleLeftOffset = middlePos.x - UI_radius * (middleBallAmount - 1)
  const middleDistance = UI_radius * 2;

  for(let i = 0; i < middleBallAmount; i++)
  {
    let circlePos = new createVector(middleLeftOffset + middleDistance * i, middlePos.y)
    let circleVel = new createVector(0, 0)
    let circleColor = color2.copy()
    all_objects.push(new rigidSpherical(UI_mass, circlePos, circleVel, circleColor, UI_radius))
  }
}

function Spawn5Random() {
  const spawnAmount = 5;

  spawnQueueSize += spawnAmount;
}

function SpawnRandom() {

  //Spawn Velocity
  const spawnVelocity = 200;
  let circleVel = new createVector(random(-spawnVelocity, spawnVelocity), random(-spawnVelocity, spawnVelocity))

  //Spawn Color
  let circleColor = new createVector(255, 255, 255); 
  if(UI_color_random == true) circleColor = new createVector(random(255), random(255), random(255))

  //Spawn Position
  let circlePos = new createVector(random(UI_radius+0, X_SIZE-UI_radius), random(UI_radius+0, Y_SIZE-UI_radius))

  //Spawn Radius
  const radiusDiff = UI_radius*0.5;
  let circleRadius = random(UI_radius-radiusDiff, UI_radius+radiusDiff)

  let circleMass = UI_mass
  all_objects.push(new rigidSpherical(circleMass, circlePos, circleVel, circleColor, circleRadius))
}

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




var frames = 0;
function draw() {
  clear()
  
  //Time & frame updates
  totalTime += deltaTime/1000;
  frames++;
  
  //Spawn Que
  SpawnQueue()
  
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
  DragObject()
  
  //Display Info
  DisplayEnergy()
  DisplayFPS()
}

var spawnQueueSize = 0;
var lastSpawnTime = 0.0;
function SpawnQueue() {

  if(spawnQueueSize > 0)
  {
    const spawnDelay = 0.05;
    lastSpawnTime += deltaTime/1000;

    if(lastSpawnTime > spawnDelay)
    {
      lastSpawnTime -= spawnDelay;
      SpawnRandom()
      spawnQueueSize--;
    }
  }
}

var dragObject = null;
function DragObject() {
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
}

function drawCursor() {
  push()
  fill(color(100,100,150,100))
  strokeWeight(0)
  circle(mouseX, mouseY, 20)
  pop() 
}

var totalEnergy = 0;
function DisplayEnergy() {

  //Calculate the total energy
  if(frames % 5 == 0)
  {
    totalEnergy = 0;
    all_objects.forEach(element => totalEnergy += (1/2)*element.mass*element.velocity.mag()*element.velocity.mag())
  }
  
  //Round the vales
  let energyDisplay = 0;
  if(totalEnergy > 1000) energyDisplay = Math.round(totalEnergy/1000) + " K"
  else energyDisplay = Math.round(totalEnergy)
  
  //Print energy text
  push()
    textSize(16)
    textFont('Poppins')
    fill('white')
    text('total energy: ' + energyDisplay, 10, 30)
  pop()
}

var LatestFPS = []
var frameIndex = 0;
function DisplayFPS() {
  
  //Handle frame array
  const maxFrameTrackAmount = 10;
  if(frameIndex >= maxFrameTrackAmount) frameIndex = 0;
  LatestFPS[frameIndex] = 1/(deltaTime/1000);
  frameIndex++;

  //Calculate average FPS
  let averageFPS = 0.0;
  LatestFPS.forEach(element => averageFPS = averageFPS + element);
  averageFPS /= maxFrameTrackAmount;

  //Print FPS text
  push()
    textSize(16)
    textFont('Poppins')
    fill('white')
    text('Average FPS: ' + round(averageFPS), 10, 60)
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
