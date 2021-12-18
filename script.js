import * as THREE from './three.js-master/build/three.module.js'
import {OrbitControls} from './three.js-master/examples/jsm/controls/OrbitControls.js'

/**
 * Computer Graphic Project Assignment
 * Create aplikasi grafis interaktif yang menggabungkan min. 2 object (lingkaran, tabung, dll) 
 * bisa ditransformasi geometri (translate, rotate, scale) dgn tambahan shadding, lighting, dsb
 * 
 * Ismail Azh-Zhafir Rohaga                 - 2301911136
 * Muhammad Akbar Zanucky                   - 2301934594
 * Raden Naufal Nursatria Kusumawardana     - 2301899906
 * Nicholas Reynaldo                        - 2301847404 
 */

//init variables
var scene, camera, renderer, control, n, m
var planeMesh, boxMesh, bowlMesh, pinMesh, pinHeadMesh, sun
var animation = false;

//collision detection (Not yet implemented)
var objects = [];
var collisions = [];

//Main function
var doInit = () => {
    
    scene = new THREE.Scene()

    const FOV = 60
    const WIDTH = window.innerWidth
    const HEIGHT = window.innerHeight
    const ASPECT =  WIDTH / HEIGHT

    camera = new THREE.PerspectiveCamera(FOV, ASPECT)  
    camera.position.set(0, 5, 10)
    camera.lookAt(0, 0, 0)

        
    renderer = new THREE.WebGLRenderer({antialias: true})
    renderer.setSize(WIDTH, HEIGHT)
    renderer.shadowMap.enabled=true
    renderer.setClearColor(0x303030)

    //Texture
    const bowlTex = new THREE.TextureLoader().load('./texture/ball.jpg'); //Bowling ball Texture
    const laneTex = new THREE.TextureLoader().load('./texture/lane.jpg'); //Lane Texture
    // const groundTex = new THREE.TextureLoader().load('./texture/ground.jpg');

    //Bowling Lane
    var planeGeo = new THREE.BoxGeometry(10, 0.5, 50);
    var planeMat = new THREE.MeshStandardMaterial( { map : laneTex} );
    planeMesh = new THREE.Mesh(planeGeo, planeMat);
    planeMesh.receiveShadow=true;
    planeMesh.castShadow=false;
    planeMesh.position.z = -20;
    scene.add(planeMesh);

    //Ground
    var boxGeo = new THREE.BoxGeometry(15, 2, 50);
    var boxMat = new THREE.MeshMatcapMaterial({ color: 0x00000 })
    boxMesh = new THREE.Mesh(boxGeo, boxMat);
    boxMesh.position.set(0,-1.2,2);
    boxMesh.position.z = -20;
    scene.add(boxMesh);

    //Bowling Ball
    var bowlBall = new THREE.SphereGeometry(1, 8, 8);
    var bowlMat = new THREE.MeshStandardMaterial( { map : bowlTex } );
    bowlMesh = new THREE.Mesh(bowlBall, bowlMat);
    bowlMesh.castShadow=true;
    bowlMesh.receiveShadow=false;
    bowlMesh.position.set(0, 1.2, 3);
    bowlMesh.name = "bowlingball"
    scene.add(bowlMesh);

    //Pin Top
    var pinGeo = new THREE.ConeGeometry(1, 2, 8)
    var pinMat = new THREE.MeshStandardMaterial( {color : 0xffffff} )
    pinMesh = new THREE.Mesh(pinGeo, pinMat)
    pinMesh.castShadow=true
    pinMesh.position.set(0, 1.2, -42)
    scene.add(pinMesh)

    //Pin Bottom
    var pinHeadGeo = new THREE.SphereGeometry(0.8, 10, 5)
    var pinHeadMat = new THREE.MeshStandardMaterial( {color : 0xffffff} )
    pinHeadMesh = new THREE.Mesh(pinHeadGeo, pinHeadMat)
    pinHeadMesh.castShadow=true
    pinHeadMesh.position.set(0, 2.5, -42)
    scene.add(pinHeadMesh)

    //Interactive element
    var slider = document.getElementById("slider"); //Position and Rotation
    var slider2 = document.getElementById("slider2") //Scale
    slider.addEventListener("input", moveBall)
    slider2.addEventListener("input", scaleBall)

    const button = document.getElementById("Reset") //Reset button
    button.addEventListener("click", resetScene);

    //Lighting
    sun = new THREE.DirectionalLight( 0xffffff, 0.8 );
	sun.position.set( 0,4,1 );
	sun.castShadow = true;
	scene.add(sun);
	sun.shadow.mapSize.width = 256;
	sun.shadow.mapSize.height = 256;
	sun.shadow.camera.near = 0.5;
	sun.shadow.camera.far = 50 ;

    //Camera Control
    control = new OrbitControls(camera, renderer.domElement)
    control.target = bowlMesh.position
    // control.enableZoom = false
    // control.enableRotate= false

    document.body.appendChild(renderer.domElement)
}

//Move the ball using value from HTML slider
function moveBall(e){
    var target = (e.target) ? e.target : e.srcElement;
    bowlMesh.position.z = -target.value;
    bowlMesh.rotation.z += -target.value;
}

//Scale the ball using value from HTML slider2
function scaleBall(e){
    var target = (e.target) ? e.target : e.srcElement;
    bowlMesh.scale.x = target.value;
    bowlMesh.scale.y = target.value;
    bowlMesh.scale.z = target.value;
}

//Get mouse position to convert into RGB code and change the ground color
let mouseMove = (event) =>{
    boxMesh.material.color = new THREE.Color(`rgb(${(event.clientX % 255)}, ${event.clientY % 255}, 50)`)
}

let addListener = () =>{
    document.addEventListener("mousemove", mouseMove)
}

//Resetting the scene by reinstantiate the object to original position
function resetScene(e){
    scene.add(pinMesh)
    scene.add(pinHeadMesh);
    bowlMesh.position.z = 3;
}

//Animation of moving the ball from point A to point B using LERP
//Animation is triggered by clicking on the ball
let alpha = 0.01;

function doRender(){
    requestAnimationFrame(doRender)
    control.update()
    renderer.render(scene, camera)

    if(animation == true)
    {
        bowlMesh.rotation.x ++;
        bowlMesh.position.lerp(new THREE.Vector3(0, 1.2, -51), alpha);
        if(bowlMesh.position.z < -40.8)
        {
            animation = false;
            scene.remove(pinMesh);
            scene.remove(pinHeadMesh);
        }
    }
}

window.onload = () => {
    doInit()
    addListener()
    doRender()
}

window.onresize = () => {
    const NEW_WIDTH = innerWidth
    const NEW_HEIGHT = innerHeight

    renderer.setSize(NEW_WIDTH, NEW_HEIGHT)

    camera.aspect = NEW_WIDTH / NEW_HEIGHT
    camera.updateProjectionMatrix()
}

//basic raycasting to check the object ID/name and enabling animation for the Bowling Ball
const onClickFunc = (event) => 
{
    var mouse = new THREE.Vector2();

    mouse.x = (event.clientX / window.innerWidth)*2 - 1;
    mouse.y = -(event.clientY / window.innerHeight)*2 + 1;

    let raycast = new THREE.Raycaster();

    raycast.setFromCamera(mouse, camera);

    let interact = raycast.intersectObjects(scene.children);
    if(interact.length != 0)
    {
        for (let index = 0; index < interact.length; index++) 
        {
            const element = interact[index];
            if(element.object.name == "bowlingball")
            {
                animation = true;
            }
        }    
    }
}

document.addEventListener("pointerdown", onClickFunc);