import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);

// Инициализация рендерера
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Инициализация контроллеров
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1; // Увеличен damping factor для плавности
controls.screenSpacePanning = false;
controls.minDistance = 2;
controls.maxDistance = 20;

// Инициализация постобработки
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

// Уменьшение эффектов Bloom
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.5, // Уменьшена интенсивность эффекта
    0.4, // Уменьшена радиус размытия
    0.85  // Уменьшена яркость
);
composer.addPass(bloomPass);

// Загрузка 3D модели GLTF (например, машины или других объектов)
const loader = new GLTFLoader();
loader.load('./mesh/scene.gltf', function (gltf) {
    scene.add(gltf.scene);
}, undefined, function (error) {
    console.error("Ошибка загрузки модели 1:", error);
});


// Загрузка текстуры для дороги
const roadTexture = new THREE.TextureLoader().load('R3.jpg'); // Убедитесь, что файл существует
const roadMaterial = new THREE.MeshBasicMaterial({ map: roadTexture });

// Создание дороги (плоскость)
const roadGeometry = new THREE.PlaneGeometry(10, 50); // Длина дороги 50, ширина 10
const road = new THREE.Mesh(roadGeometry, roadMaterial);
road.rotation.x = -Math.PI / 2;  // Поворачиваем плоскость, чтобы она лежала на земле
road.position.set(0, -0.1, 0);  // Размещаем дорогу немного ниже, чтобы она не перекрывала другие объекты
scene.add(road);

// Свет
const light = new THREE.DirectionalLight(0xffffff, 1.5); // Уменьшена яркость света
light.position.set(2, 2, 2);
scene.add(light);

// Установка позиции камеры
camera.position.z = 10;  // Удалил камеру чуть дальше, чтобы было лучше видно

// Геометрия и материал куба (для теста)
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Обработчик кликов мышью
const raycraster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseclick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycraster.setFromCamera(mouse, camera);
    const intersects = raycraster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        intersects[0].object.material.color.set("green");
        if (intersects[0].object === cube) {
            intersects[0].object.material = roadMaterial; // Пример замены материала на дорогу
        }
    }
}

window.addEventListener('click', onMouseclick);

// Анимация
function animation() {
    requestAnimationFrame(animation);
    cube.rotation.x += 0.01; // Вращение куба
    cube.rotation.y += 0.01;
    controls.update(); // Обновляем контроллеры камеры
    composer.render(); // Рендерим с эффектами
}

animation();
