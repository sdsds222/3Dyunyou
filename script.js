import * as THREE from './js/three.module.js'
import { OrbitControls } from './js/OrbitControls.js'
import { GLTFLoader } from './js/GLTFLoader.js';
import { RGBELoader } from './js/RGBELoader.js';
import { CharacterControls } from './CharacterControls.js';
import * as CANNON from './js/cannon-es.js'

var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;
var renderer, scene, camera, orbitcontrols, world;
var clock = new THREE.Clock();
var characterControls;
//保存按键wasd的
const keysPressed = {}
// const keyDisplayQueue = new KeyDisplay();

init();




    window.document.getElementById("test").addEventListener('touchstart', () => {
        keysPressed['w'] = true;
    })

    window.document.getElementById("test").addEventListener('touchend', () => {
        keysPressed['w'] = false;
    })

const geometry = new THREE.BoxGeometry(10, 2, 8);
const texture = new THREE.TextureLoader().load('./imgs/ground.jpg');
const material = new THREE.MeshLambertMaterial({ map: texture })//设置贴图
const cube = new THREE.Mesh(geometry, material);
cube.receiveShadow = true
scene.add(cube);
// 创建物理小球形状
const sphereShape = new CANNON.Box(new CANNON.Vec3(5, 1, 4))//半径为一的球
//设置物体材质
const sphereWorldMaterial = new CANNON.Material();
// 创建物理世界的物体
var sphereBody = new CANNON.Body({
    shape: sphereShape,
    //   小球质量
    mass: 100,
    //   物体材质
    material: sphereWorldMaterial,
});
cube.userData = sphereBody;
// 将物体添加至物理世界
world.addBody(sphereBody);

function addBox() {
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const texture = new THREE.TextureLoader().load('./imgs/Sand 002_COLOR.jpg');
    const material = new THREE.MeshLambertMaterial({ map: texture })//设置贴图
    const cube = new THREE.Mesh(geometry, material);
    cube.receiveShadow = true
    scene.add(cube);
    // 创建物理小球形状
    const sphereShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1))//半径为一的球
    //设置物体材质
    const sphereWorldMaterial = new CANNON.Material();
    // 创建物理世界的物体
    var sphereBody = new CANNON.Body({
        shape: sphereShape,
        //   小球质量
        mass: 50,
        //   物体材质
        material: sphereWorldMaterial,
    });
    cube.userData = sphereBody;
    // 将物体添加至物理世界
    world.addBody(sphereBody);
    sphereBody.position.set(30, 2, 30);
}
addBox();

animate();
function animate() {
    let deltaTime = clock.getDelta();
    // 更新物理引擎里世界的物体
    world.step(1 / 120, deltaTime);
    scene.children.forEach(d => {//遍历场景中的子对象，如果对象的isMesh属性为true，我们就将更新改对象的position和quaternion属性（他们对应的刚体数据存在对应的userData中）。
        if (d.isMesh == true) {
            d.position.copy(d.userData.position);
            d.quaternion.copy(d.userData.quaternion);
        }
    })
    if (orbitcontrols) orbitcontrols.update()
    if (characterControls) {
        characterControls.update(deltaTime, keysPressed);
    }
    requestAnimationFrame(animate);
    renderer.render(scene, camera);

}

document.addEventListener('keydown', (event) => {
    // keyDisplayQueue.down(event.key)
    if (event.shiftKey && characterControls) {
        characterControls.switchRunToggle()
    } else {
        keysPressed[event.key.toLowerCase()] = true
        // console.log(keysPressed)

    }
}, false);
document.addEventListener('keyup', (event) => {
    // keyDisplayQueue.up(event.key);
    keysPressed[event.key.toLowerCase()] = false
    // console.log(keysPressed)
}, false);


function init() {
    // initStats()
    initRenderer();
    initScene();
    initLights();
    initCamera();
    initControls();
    // initHelp();
    generateFloor();
    initGlb();
}


function initRenderer() {
    var container = document.getElementById('container');
    renderer = new THREE.WebGLRenderer({ antialias: true }); //alpha: true, logarithmicDepthBuffer: true
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true
    renderer.setSize(WIDTH, HEIGHT);
    container.appendChild(renderer.domElement);
}

function initScene() {
    scene = new THREE.Scene();
    const cubeTextureLoader = new THREE.CubeTextureLoader();
    cubeTextureLoader.setPath('./imgs/');
    let cubeTexture = cubeTextureLoader.load([
        'Epic_BlueSunset_Cam_2_Left+X.png', 'Epic_BlueSunset_Cam_3_Right-X.png',
        'Epic_BlueSunset_Cam_4_Up+Y.png', 'Epic_BlueSunset_Cam_5_Down-Y.png',
        'Epic_BlueSunset_Cam_0_Front+Z.png', 'Epic_BlueSunset_Cam_1_Back-Z.png'
    ]);
    scene.background = cubeTexture;

    //加载hdr
    new RGBELoader()
        .setPath('./imgs/')
        .load('kloppenheim_12.hdr', function (texture) {

            texture.mapping = THREE.EquirectangularReflectionMapping;
            scene.environment = texture;

        });
    //启动物理引擎
    world = new CANNON.World();
    world.gravity.set(0, -9.8, 0);//9.8重力加速度
}

function initCamera() {
    camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 1000);
    // 确定相机位置 并将相机指向场景中心
    camera.position.x = 0;
    camera.position.y = 10;
    camera.position.z = -6;
}

function initControls() {
    orbitcontrols = new OrbitControls(camera, renderer.domElement);
    // 使动画循环使用时阻尼或自转 意思是否有惯性
    orbitcontrols.enableDamping = true;
    //动态阻尼系数 就是鼠标拖拽旋转灵敏度
    //controls.dampingFactor = 0.25;
    //是否可以缩放
    orbitcontrols.enableZoom = true;
    //是否自动旋转
    // orbitcontrols.autoRotate = true;
    // orbitcontrols.autoRotateSpeed = 0.5;
    //设置相机距离原点的最远距离
    orbitcontrols.minDistance = 8;
    //设置相机距离原点的最远距离
    orbitcontrols.maxDistance = 10
    //是否开启右键拖拽
    orbitcontrols.enablePan = false;
    orbitcontrols.maxPolarAngle = Math.PI / 2 - 0;
    //orbitcontrols.minPolarAngle = Math.PI / 2 - 0.8;
    orbitcontrols.target = new THREE.Vector3(0, 1, 0)
    orbitcontrols.addEventListener('change', () => {
        orbitcontrols.minDistance = 0;
    });
}

function initLights() {
    scene.add(new THREE.AmbientLight(0xffffff, 0.5))

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.7)
    dirLight.position.set(- 60, 100, 50);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 50;
    dirLight.shadow.camera.bottom = - 50;
    dirLight.shadow.camera.left = - 50;
    dirLight.shadow.camera.right = 50;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 200;
    dirLight.shadow.mapSize.width = 4096;
    dirLight.shadow.mapSize.height = 4096;
    scene.add(dirLight);
}

/**
 * 加载地板
 */
function generateFloor() {
    // TEXTURES
    const textureLoader = new THREE.TextureLoader();
    const sandBaseColor = textureLoader.load("./imgs/grass.jpg");
    const sandNormalMap = textureLoader.load("./imgs/Sand 002_NRM.jpg");
    const sandHeightMap = textureLoader.load("./imgs/Sand 002_DISP.jpg");
    const sandAmbientOcclusion = textureLoader.load("./imgs/Sand 002_OCC.jpg");

    const WIDTH = 320
    const LENGTH = 320

    const geometry = new THREE.PlaneGeometry(WIDTH, LENGTH, 1024, 1024);
    geometry.setAttribute("uv2", new THREE.BufferAttribute(geometry.attributes.uv.array, 2))
    const material = new THREE.MeshStandardMaterial(
        {
            map: sandBaseColor,
            normalMap: sandNormalMap,
            // roughnessMap: sandRoughnessMap,
            displacementMap: sandHeightMap,  //置换
            displacementScale: 0.1,
            aoMap: sandAmbientOcclusion
        })
    wrapAndRepeatTexture(material.map)
    wrapAndRepeatTexture(material.normalMap)
    wrapAndRepeatTexture(material.displacementMap)
    wrapAndRepeatTexture(material.aoMap)

    // const material = new THREE.MeshPhongMaterial({ map: placeholder})

    const floor = new THREE.Mesh(geometry, material)
    floor.receiveShadow = true
    floor.rotation.x = - Math.PI / 2
    scene.add(floor)
    floor.position.y = -1;

    // 物理世界创建地面
    const floorShape = new CANNON.Plane();
    var floorBody = new CANNON.Body();
    // 当质量为0的时候，可以使得物体保持不动
    floorBody.mass = 0;
    floorBody.addShape(floorShape);
    // 地面位置
    floorBody.position.set(0, -1, 0);
    floor.userData = floorBody;
    world.addBody(floorBody);
    floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5)
}

function wrapAndRepeatTexture(map) {
    map.wrapS = map.wrapT = THREE.RepeatWrapping
    map.repeat.x = map.repeat.y = 30
}

/**
 * 加载机器人
 */
function initGlb() {
    const loader = new GLTFLoader();
    loader.load('model/Soldier.glb', function (gltf) {
        const model = gltf.scene;
        model.traverse(function (object) {
            if (object.isMesh) object.castShadow = true;
        });
        model.rotation.y += Math.PI
        scene.add(model);
        const gltfAnimations = gltf.animations;
        const mixer = new THREE.AnimationMixer(model);
        const animationsMap = new Map()
        gltfAnimations.filter(a => a.name != 'TPose').forEach((a) => {
            animationsMap.set(a.name, mixer.clipAction(a))
        })

        // 创建物理世界的物体
        const characterBody = new CANNON.Body({
            shape: new CANNON.Box(new CANNON.Vec3(1, 1, 1)),
            //三维坐标
            position: new CANNON.Vec3(0, 2, 0),//三维坐标
            //   小球质量
            mass: 10,
            //   物体材质
            material: new CANNON.Material(),
        });
        model.userData = characterBody;
        // 将物体添加至物理世界
        world.addBody(characterBody);
        characterControls = new CharacterControls(characterBody, mixer, animationsMap, orbitcontrols, camera, 'Idle', model); //Idle
        model.position.copy(characterBody.position);
    })
}
window.addEventListener('resize', function () {
    let w = window.innerWidth;
    let h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}, false);
window.addEventListener("orientationchange", function () {
    let w = window.innerWidth;
    let h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});


