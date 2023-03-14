import * as THREE from 'three';
import './style.css'
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import * as objects from './objects.js';

let camera, scene, renderer, canvas, sizes, controls, clock, sunDirectionalLight, sunMesh;
var UNITSIZE = 200;
export const FPS = 1/60

const canDie = true

export var current_scene_list = []
var ROADNUM = 100;
export var ROADWIDTH = 60;
export var ROADLENGTH = 1500;

const SunMaxY = 500
var SunRotTime = 30
var SunCurrent = 0

var Sun1 = 0xfcd14d
var Sun2 = 0xe36f1e
var Moon1 = 0x90c0df
var Moon2 = 0xffffff
var color1 = Sun1
var color2 = Sun2

var backgroundSun1 = 0x87CEEB
var backgroundSun2 = 0xe79414
var backgroundMoon1 = 0x526079
var backgroundMoon2 = 0x001F38
var backgroundColor1 = backgroundSun1
var backgroundColor2 = backgroundSun2

var current_score = 0

var gameover_screen = document.getElementById("gameover-screen");
var score_span = document.getElementById("score");

function incrementScore() {
  current_score += 1
  document.getElementById("counter").innerHTML = current_score
}

function showGameoverScreen() {
  if(canDie){
    gameover_screen.style.display = "flex";
    score_span.textContent = current_score;
  }
}

// Add event listener to retry button
document.getElementById("retry-button").addEventListener("click", function() {
  // Reset score and hide gameover screen
  event_controller.ResetScene()
  current_score = 0;
  gameover_screen.style.display = "none";
});

export function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function init() {
  //Sizes to fit the game onto the entire website
  sizes = {
    width: window.innerWidth,
    height: window.innerHeight
  }

  // Scene whenveer create object have to add it to this
  scene = new THREE.Scene();

  // Camera
  camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 1, ROADNUM * ROADWIDTH * + 31 * ROADWIDTH);
  camera.position.y = UNITSIZE * .2;
  scene.add(camera);


  // Get the canvas element
  canvas = document.querySelector(".webgl");

  // Create the WebGL renderer with antialiasing and shadow mapping enabled
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(sizes.width, sizes.height);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  
}

class Scene {
  constructor(){ 
  }

  initializeSkyBox() {
    var urls = [
      'skybox/sky_pos_x.png',
      'skybox/sky_neg_x.png',
      'skybox/sky_pos_y.png',
      'skybox/sky_neg_y.png',
      'skybox/sky_neg_z.png',
      'skybox/sky_pos_z.png'
    ];
  
    var textureCube = new THREE.CubeTextureLoader().load(urls);
    var skyBox = new THREE.Mesh(
      new THREE.BoxGeometry( ROADLENGTH + 30 * ROADWIDTH, 2000, 30 * ROADWIDTH + ROADNUM * ROADWIDTH ), 
      new THREE.MeshBasicMaterial({ map: textureCube })
    );
    skyBox.position.set(0, 0, -ROADNUM * ROADWIDTH / 2);
    scene.add(skyBox);
  }

  FPSControls(moveSpeed = 500, LookSpeed = 0.4) {
  
    controls = new FirstPersonControls(camera, canvas);
    controls.movementSpeed = moveSpeed;
    controls.lookSpeed = LookSpeed;
    controls.lookVertical = false; // Temporary solution; play on flat surfaces only
    controls.noFly = true;
  
    clock = new THREE.Clock();
  
  }

  initializeScene(){
    var lane = new objects.Lane(scene, 0, 0) // first safe spot
    current_scene_list.push(lane)

    for (let i = 1; i < ROADNUM; i++) {
      var lane = new objects.Lane(scene, i)
      current_scene_list.push(lane)
    }

    // Create a directional light
    sunDirectionalLight = new THREE.PointLight(0xffffff, 1);
    sunDirectionalLight.position.set(0, 500, -ROADWIDTH * ROADNUM*(3/4));

    // Set shadow properties for the light
    sunDirectionalLight.castShadow = true;
    sunDirectionalLight.shadow.mapSize.width = 2048;
    sunDirectionalLight.shadow.mapSize.height = 2048;
    sunDirectionalLight.shadow.camera.near = 0.5;
    sunDirectionalLight.shadow.camera.far = ROADWIDTH * ROADNUM + ROADWIDTH * 5;

    // Create a sun mesh
    const sunGeometry = new THREE.SphereGeometry(50, 64, 64);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);

    // Attach the sun mesh to the directional light
    sunDirectionalLight.add(sunMesh)
    scene.add(sunMesh);
    sunDirectionalLight.add(sunMesh);

    // Add the light to the scene
    scene.add(new THREE.AmbientLight(0x505050));
    scene.add(sunDirectionalLight);
  }

  ResetScene() {
    for(let i = 0; i < current_scene_list.length; i++){
      current_scene_list[i].destroy()
    }
    current_scene_list = []

    var lane = new objects.Lane(scene, 0, 0) // first safe spot
    current_scene_list.push(lane)

    for (let i = 1; i < ROADNUM; i++) {
      var lane = new objects.Lane(scene, i)
      current_scene_list.push(lane)
    }

    // reset pos
    camera.position.x = 0
    camera.position.z = 0
    camera.position.y = UNITSIZE * .2;

    // look forward when reseting
    camera.rotation.x = -Math.PI/2
    camera.rotation.y = 0
    camera.rotation.z = 0

    // reset score
    current_score = 0
    document.getElementById("counter").innerHTML = current_score

    // reset sun and backdrop
    SunCurrent = 0
    backgroundColor1 = backgroundSun1
    backgroundColor2 = backgroundSun2
    color1 = Sun1
    color2 = Sun2

    //camera.lookAt(new THREE.Vector3(0, 0, 0));
  }

  shiftEveryLane(){
    incrementScore() // INCREMENT SCORE

    if(current_scene_list[0].shift()){
      current_scene_list.splice(0, 1)

      var lane = new objects.Lane(scene, ROADNUM);

      current_scene_list.push(lane)
    }

    for(let i = 0; i < ROADNUM; i++){
      current_scene_list[i].shift()
    }
  }

  updateSun(delta) {
    const RATIO_IN_BACKGROUND = 1.5

    SunCurrent += delta;
    const angle = (SunCurrent / SunRotTime) * Math.PI;
    const sunY = SunMaxY * Math.sin(angle);
    const sunX = (ROADLENGTH / 2) * Math.cos(angle);
    sunDirectionalLight.position.set(sunX, sunY, -ROADWIDTH * ROADNUM * (3 / 4));
  
    const startColor = new THREE.Color(color1);
    const endColor = new THREE.Color(color2);
    const t = Math.min(SunCurrent / SunRotTime, 1);
    const color = new THREE.Color().lerpColors(startColor, endColor, t);
    sunDirectionalLight.color = color;
    sunMesh.material.color = color;


    const t2 = Math.min((SunCurrent - SunRotTime) / (SunRotTime * RATIO_IN_BACKGROUND - SunRotTime), 1);
    const start_background = new THREE.Color(backgroundColor1);
    const end_background = new THREE.Color(backgroundColor2)

    if(SunCurrent > SunRotTime && color1 == Sun1){
      const lerped_col = new THREE.Color().lerpColors(
        new THREE.Color(backgroundSun2), 
        new THREE.Color(backgroundMoon1), 
        t2)
      
      renderer.setClearColor(lerped_col)
    }
    else if(SunCurrent > SunRotTime && color1 == Moon1){
      renderer.setClearColor(new THREE.Color().lerpColors(
        new THREE.Color(backgroundMoon2), 
        new THREE.Color(backgroundSun1), 
        t2));
    }
    else{
      renderer.setClearColor(new THREE.Color().lerpColors(start_background, end_background, t));
    }
  
    if (SunCurrent > SunRotTime * RATIO_IN_BACKGROUND){
      SunCurrent = 0;
      if(color1 == Sun1){
        color1 = Moon1
        color2 = Moon2

        backgroundColor1 = backgroundMoon1
        backgroundColor2 = backgroundMoon2
      }
      else{
        color1 = Sun1
        color2 = Sun2

        backgroundColor1 = backgroundSun1
        backgroundColor2 = backgroundSun2
      }
    }
  }
  
  updateFPS(){
    const HalfWayZ = -ROADWIDTH * ROADNUM / 2

    if(camera.position.x >= ROADLENGTH / 2)
      camera.position.x = ROADLENGTH / 2
    else if(camera.position.x <= -ROADLENGTH / 2)
      camera.position.x = -ROADLENGTH / 2

    if(camera.position.z < HalfWayZ){
      event_controller.shiftEveryLane();
      camera.position.z += ROADWIDTH
    }
    else if(camera.position.z >= 0)
      camera.position.z = 0

    
    // check if collided with anyting in current z posision
    var LaneInd = Math.abs(Math.floor((camera.position.z + ROADWIDTH / 2) / ROADWIDTH))

    if(current_score < ROADNUM / 2 && current_score < LaneInd){ 
      // INCREMENTING SCORE BEFORE SHIFT
      incrementScore()
    }

    for(let i = 0; i < current_scene_list[LaneInd].objsInRow.length; i++){ // CHECK CURRENT LANE
      const candidate = current_scene_list[LaneInd].objsInRow[i]

      const leftBound = candidate.position.x - 40//-candidate.width / 2
      const rightBound = candidate.position.x + 40//candidate.width / 2
      if(camera.position.x >= leftBound && camera.position.x <= rightBound){ // inside object

        if(candidate.type == objects.Car){
          showGameoverScreen()
        }

        const left_dist = Math.abs(camera.position.x - leftBound)
        const right_dist = Math.abs(camera.position.x - rightBound)
        if(left_dist < right_dist){ camera.position.x = leftBound - 5}
        else{ camera.position.x = rightBound + 5}
      }
    }

    if(LaneInd > 0){ // CHECK LANE BEHIND PLAYER
      for(let i = 0; i < current_scene_list[LaneInd - 1].objsInRow.length; i++){
        const candidate = current_scene_list[LaneInd - 1].objsInRow[i]
  
        const forwardBound = candidate.position.z - 40//-candidate.width / 2
        const behindBound = candidate.position.z + 40//candidate.width / 2
        const leftBound = candidate.position.x - 40//-candidate.width / 2
        const rightBound = candidate.position.x + 40//candidate.width / 2

        if(camera.position.z <= behindBound && camera.position.z >= forwardBound &&
            camera.position.x >= leftBound && camera.position.x <= rightBound){ // inside object
          
          if(candidate.type == objects.Car){
            showGameoverScreen()
          }

          const forward_dist = Math.abs(camera.position.z - forwardBound)
          const behind_dist = Math.abs(camera.position.z - behindBound)


          if(behind_dist < forward_dist){ camera.position.z = behindBound + 5}
          else{ camera.position.z = forwardBound - 5}
        }
      }
    }


    for(let i = 0; i < current_scene_list[LaneInd + 1].objsInRow.length; i++){ // In FRONT OF PLAYER
      const candidate = current_scene_list[LaneInd + 1].objsInRow[i]

      const forwardBound = candidate.position.z - 40//-candidate.width / 2
      const behindBound = candidate.position.z + 40//candidate.width / 2
      const leftBound = candidate.position.x - 40//-candidate.width / 2
      const rightBound = candidate.position.x + 40//candidate.width / 2

      if(camera.position.z <= behindBound && camera.position.z >= forwardBound &&
          camera.position.x >= leftBound && camera.position.x <= rightBound){ // inside object
        
        if(candidate.type == objects.Car){
          showGameoverScreen()
        }

        const forward_dist = Math.abs(camera.position.z - forwardBound)
        const behind_dist = Math.abs(camera.position.z - behindBound)


        if(behind_dist < forward_dist){ camera.position.z = behindBound + 5}
        else{ camera.position.z = forwardBound - 5}
      }
    }
  }
}


const event_controller = new Scene()

init();
event_controller.FPSControls();
event_controller.initializeScene();
//event_controller.initializeSkyBox();


// Add a listener for the pointer lock change event

// Resize window if user moves it around
window.addEventListener('resize', () => { // code runs everytime window moves
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update Camera and renderer becuase it will change with window size
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()
  renderer.setSize(sizes.width, sizes.height)
  
})

// SET FRAMES TO NORMALIZE EVERYONES PREFORMANCE
// Need to rerender canvas when user resizes window


var delta = 0
const loop = () => {
  delta += clock.getDelta();
  window.requestAnimationFrame(loop)

  if(delta > FPS){
    for(let i = 0; i < ROADNUM; i++){
      current_scene_list[i].update(delta)
    }

    event_controller.updateFPS()
    event_controller.updateSun(delta)
    controls.update(delta)
    renderer.render(scene, camera)

    delta = delta % FPS
  }
}
loop()