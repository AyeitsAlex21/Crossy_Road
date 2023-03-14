import * as THREE from 'three';
import './style.css'
import { ROADWIDTH, ROADLENGTH, pickRandom } from './index.js';

var row_types = [Grass, Road]
var road_objs = [Car];
var grass_objs = [RoundTree, Stump, Bush, Rock];

var FOLIAGE_DENSITY = 100

const BASE_CAR_SPEED = 300
const EXTRA_CAR_SPEED = 700
const CAR_SPAWN_RATE = 0.007

export class Lane {
    constructor(scene, index, row_type_flag=-1) {
        var typeInd = -1

        if(row_type_flag == -1)
            typeInd = Math.floor(Math.random()*row_types.length)//Math.random() < 0.2 ? 0 : 1
        else
            typeInd = row_type_flag

        this.laneObj = row_types[typeInd]()
        this.laneObj.receiveShadow = true;

        this.type = row_types[typeInd]
        this.dir = Math.random() < 0.5 ? 1 : -1; // 1 for right -1 left

        this.objsInRow = []
        this.vel = BASE_CAR_SPEED + Math.random() * EXTRA_CAR_SPEED
        this.scene = scene
        this.index = index
        this.timeInFrame = 0
        this.lastSpawn = 0;

        this.laneObj.position.z = -this.index * ROADWIDTH
        this.scene.add(this.laneObj)

        if(this.type == Grass && this.index != 0){
            for(let i = 1; i < ROADLENGTH / FOLIAGE_DENSITY; i++){
                if(Math.random() < 0.2){
                    var newFoliage = new pickRandom(grass_objs)() 
                    newFoliage.castShadow = true
                    newFoliage.receiveShadow = true

                    newFoliage.position.x = FOLIAGE_DENSITY * i - ROADLENGTH / 2
                    newFoliage.position.z = -(this.index * ROADWIDTH)

                    this.objsInRow.push(newFoliage);
                    this.scene.add(newFoliage);
                }
            }
        }
    }

    update(deltaT){
        this.timeInFrame += deltaT
        this.lastSpawn += deltaT

        if(this.type == Road){
            if(this.lastSpawn*this.vel > 150 && Math.random() < CAR_SPAWN_RATE){
                var new_car = new Car();
                new_car.castShadow = true;

                new_car.position.x = -this.dir * (ROADLENGTH / 2 + 20)
                new_car.position.z = -(this.index * ROADWIDTH)
                this.objsInRow.push(new_car)
                this.scene.add(new_car)

                if(this.dir == -1)
                    new_car.rotateZ(Math.PI)
                
                this.lastSpawn = 0
            }

            for(let i = 0; i < this.objsInRow.length; i++){
                this.objsInRow[i].position.x += this.dir * this.vel * deltaT
                if(this.objsInRow[i].position.x > ROADLENGTH / 2 + 40 || this.objsInRow[i].position.x < -ROADLENGTH / 2 - 40){
                    this.scene.remove(this.objsInRow[i]);
                    this.objsInRow.splice(i, 1)
                }
            }
        }
    }

    shift(){

        for(let i = 0; i < this.objsInRow.length; i++){
            this.objsInRow[i].position.z += ROADWIDTH
        }
        this.laneObj.position.z += ROADWIDTH
        this.index -= 1

        if(this.index < 0){
            this.destroy()
            return true
        }
    }

    destroy(){

        for(let i = 0; i < this.objsInRow.length; i++){
            this.scene.remove(this.objsInRow[i])
        }
        this.objsInRow = []

        this.scene.remove(this.laneObj)

        return true
    }
}

export function Car() {

    function getCarFrontTexture() {
        const canvas = document.createElement("canvas")
        canvas.width = 64; // resolution
        canvas.height = 32;

        const context = canvas.getContext("2d")

        context.fillStyle = "#ffffff"
        context.fillRect(0, 0, 64, 32) // make whole canvas white

        context.fillStyle = "#666666";
        context.fillRect(8, 8, 48, 24); // make a rectangle thats grey to act as window

        return new THREE.CanvasTexture(canvas);
    }

    function getCarSideTexture() {
        const canvas = document.createElement("canvas")
        canvas.width = 128; // resolution
        canvas.height = 32;

        const context = canvas.getContext("2d")

        context.fillStyle = "#ffffff"
        context.fillRect(0, 0, 128, 32) // make whole canvas white

        context.fillStyle = "#666666";
        context.fillRect(8, 8, 48, 24); // make a rectangles to act as front and back Window
        context.fillRect(58, 8, 60, 24)

        return new THREE.CanvasTexture(canvas);
    }

    function Wheel() {
        const wheel = new THREE.Mesh(
        new THREE.BoxGeometry(12, 33, 12),
        new THREE.MeshLambertMaterial({color: 0x333333})
        )

        wheel.position.z = 6;
        return wheel;
    }

    const car = new THREE.Group() 
    // group is container which holds 3D objects so when move obj
    // move car
    const chassi_colors = [0xa52523, 0x05578C, 0xE4F202, 0xE502F2, 
        0xE502F2, 0x09BF08, 0xFDE200, 0xE5ECF1, 0x74A8CE]
    const cabin_colors = [0xffffff, 0x000000]

    const backWheel = Wheel()
    backWheel.position.x = -18;
    backWheel.castShadow = true
    car.add(backWheel) // only create onewheel becuase act as two

    const frontWheel = Wheel()
    frontWheel.position.x = 18;
    frontWheel.castShadow = true
    car.add(frontWheel)

    const main = new THREE.Mesh( // chassi
        new THREE.BoxGeometry(60, 30, 15),
        new THREE.MeshLambertMaterial({color: pickRandom(chassi_colors)})
    )
    
    main.castShadow = true
    main.position.z = 12;
    car.add(main)

    const WindsheildText = getCarFrontTexture();
    WindsheildText.center = new THREE.Vector2(0.5, 0.5); // rotate windsheild around center
    WindsheildText.rotation = Math.PI / 2;

    const TrunkWindowText = getCarFrontTexture();
    TrunkWindowText.center = new THREE.Vector2(0.5, 0.5); // rotate back around center
    TrunkWindowText.rotation = -Math.PI / 2;

    const rightWindows = getCarSideTexture();

    const leftWindows = getCarSideTexture();
    leftWindows.flipY = false;

    const cabin = new THREE.Mesh(
        new THREE.BoxGeometry(33, 24, 12),
        [ // give list of textures to put on
        new THREE.MeshLambertMaterial({map:WindsheildText}),
        new THREE.MeshLambertMaterial({map:TrunkWindowText}),
        new THREE.MeshLambertMaterial({map:leftWindows}),
        new THREE.MeshLambertMaterial({map:rightWindows}),
        new THREE. MeshLambertMaterial({color: pickRandom(cabin_colors)}),
        new THREE. MeshLambertMaterial({color: pickRandom(cabin_colors)}),
        ]
    )

    cabin.position.x = -6;
    cabin.position.z = 25.5;
    cabin.castShadow = true
    car.castShadow = true

    car.width = 60
    car.length = 30
    car.add(cabin);
    car.type = Car

    car.rotateX(-Math.PI / 2)

    return car;
}

export function RoundTree() {
    const tree = new THREE.Group() 
    const color = Math.random() < 0.02 ? 0xa0522d : 0x808000

    const top = new THREE.Mesh( // top of tree
        new THREE.SphereGeometry(20 + Math.random() * 10, 32, 32),
        new THREE.MeshLambertMaterial({color: color})
    )
    top.position.y = 50;
    top.castShadow = true
    tree.add(top)

    const base = new THREE.Mesh(
        new THREE.CylinderGeometry(3, 10, 50), // r of top, r of bot, height
        new THREE.MeshLambertMaterial({color: 0x795A00})
    )
    base.position.y = 20
    base.castShadow = true

    tree.width = 60
    tree.length = 60
    tree.add(base)
    tree.type = RoundTree

    return tree
}

export function Stump(){
    const stump = new THREE.Group();

    const radius = 10 * 3
    
    const color = pickRandom([0x5A4D41])

    const middle = new THREE.Mesh(
        new THREE.CylinderGeometry( 6, radius, 40 + Math.random() * 25, 16, 16 ), 
        new THREE.MeshPhongMaterial( { color:color, shininess: 1 } )
    )

    middle.castShadow = true
    middle.receiveShadow = true
    stump.add(middle)

    stump.width = radius * 2
    stump.length = radius * 2
    stump.type = Stump

    return stump
}

export function Bush() {
    const bush = new THREE.Group();
    
    const trunkHeight = 10;
    const trunkRadiusTop = 3 + Math.random() * 2;
    const trunkRadiusBottom = 5 + Math.random() * 10;
    const leavesHeight = 36;
    const leavesRadius = 10 + Math.random() * 5;

    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(trunkRadiusTop, trunkRadiusBottom, 16, 16), 
        new THREE.MeshStandardMaterial({ color: 0x8b4513 })
    );
    trunk.castShadow = true
    trunk.receiveShadow = true
    trunk.position.y = trunkHeight;
  
    const leaves = new THREE.Mesh(
        new THREE.SphereGeometry(leavesRadius, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0x228b22 })
    );
    leaves.castShadow = true
    leaves.receiveShadow = true
    leaves.position.y = trunkHeight + leavesHeight / 2;
    
    bush.add(trunk);
    bush.add(leaves);

    bush.width = trunkRadiusTop * 2
    bush.length = trunkRadiusTop * 2
    bush.type = Bush
  
    return bush;
}

export function Rock() {
    const rock = new THREE.Group();

    const left_radius = 10 + Math.random() * 10
    const right_radius = 10 + Math.random() * 10

    const left_sphere_rad = left_radius - 3 + Math.random()
    const right_sphere_rad = right_radius - 3 + Math.random()
    const width = 30
    
    const color = 0x414D5A

    const middle = new THREE.Mesh(
        new THREE.CylinderGeometry( left_radius, right_radius, width, 32, 32 ), 
        new THREE.MeshPhongMaterial( { color:color, shininess: 1 } )
    )
    middle.castShadow = true
    middle.receiveShadow = true
    middle.rotateZ(Math.PI / 2)
    rock.add(middle)
    
    if(Math.random() < 0.3){
        const left = new THREE.Mesh(
            new THREE.SphereGeometry(left_sphere_rad, 16, 16),
            new THREE.MeshStandardMaterial({ color: color })
        );
        left.castShadow = true
        left.receiveShadow = true
        left.position.x = -width / 2
        rock.add(left)
    }

    if(Math.random() < 0.6){
        const right = new THREE.Mesh(
            new THREE.SphereGeometry(right_sphere_rad, 16, 16),
            new THREE.MeshStandardMaterial({ color: color })
        );
        right.castShadow = true
        right.receiveShadow = true
        right.position.x = width / 2
        rock.add(right)
    }

    rock.width = width + right_sphere_rad + left_radius
    rock.length = width * 2
    rock.type = Rock
    
    return rock;
}

export function Road() {
    const road = new THREE.Group();

    const middle = new THREE.Mesh(
        new THREE.PlaneGeometry( ROADLENGTH, ROADWIDTH ), 
        new THREE.MeshPhongMaterial( { color:0x555450, shininess: 10 } )
    )
    middle.receiveShadow = true
    road.add(middle);

    const left = new THREE.Mesh(
        new THREE.PlaneGeometry( ROADLENGTH, ROADWIDTH/ 15), 
        new THREE.MeshPhongMaterial( { color:0xffffff } )
    )
    left.position.y = (ROADWIDTH / 2) - (ROADWIDTH / 9)
    left.position.z = 0.1
    left.receiveShadow = true
    road.add(left)

    const right = new THREE.Mesh(
        new THREE.PlaneGeometry( ROADLENGTH, ROADWIDTH / 15), 
        new THREE.MeshPhongMaterial( { color:0xffffff } )
    )
    right.position.y = -(ROADWIDTH / 2) + (ROADWIDTH / 9)
    right.position.z = 0.1
    right.receiveShadow = true;

    road.receiveShadow = true;
    road.add(right)

    road.rotateX(-Math.PI / 2)
    return road;
}

export function Grass() {
    const grass = new THREE.Group();

    const middle = new THREE.Mesh(
        new THREE.PlaneGeometry( ROADLENGTH, ROADWIDTH ), 
        new THREE.MeshPhongMaterial( { color:0x45FF00, shininess: 1 } )
    )
    middle.receiveShadow = true
    middle.castShadow = true
    grass.add(middle);
    grass.receiveShadow = true
    grass.rotateX(-Math.PI / 2)

    return grass
}

export function Water() {
    const water = new THREE.Group();

    var waterShape = new THREE.PlaneGeometry( ROADLENGTH, ROADWIDTH )
    var waterMat = new THREE.ShaderMaterial({
        fog: true
    });

    water.add(new THREE.Mesh(waterShape, waterMat))
    water.rotation.x = -Math.PI * 0.5;

    return water
}