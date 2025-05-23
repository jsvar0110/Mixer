import './style.css';
import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import CustomShaderMaterial from "three-custom-shader-material/vanilla";
import {mergeVertices} from 'three/examples/jsm/utils/BufferGeometryUtils';
import vertexShader from './shaders/vertex.glsl';
import textVertex from './shaders/textVertex.glsl';
// import{ GUI } from 'lil-gui';
import {Text} from 'troika-three-text'
import { gsap } from 'gsap';

// import fragmentShader from './shaders/fragment.glsl';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Setup loading manager
const loadingManager = new THREE.LoadingManager();
const rgbeLoader = new RGBELoader(loadingManager);
const textureLoader = new THREE.TextureLoader(loadingManager);



const blobs = [
    {
        name: 'Color Fusion',
        background: '#FF9D23',
        config: { "uPositionFrequency": 0.1, "uPositionStrength": 0.35, "uSmallWavePositionFrequency": 3.5, "uSmallWavePositionStrength": 0.3, "roughness": 0.1, "metalness": 0, "envMapIntensity": 0.5, "clearcoat": 0, "clearcoatRoughness": 0, "transmission": 0, "flatShading": false, "wireframe": false, "map": "cosmic-fusion" },
    },
    {
        name: 'Purple Mirror',
        background: '#5300B1',
        config: { "uPositionFrequency": 0.584, "uPositionStrength": 0.276, "uSmallWavePositionFrequency": 0.899, "uSmallWavePositionStrength": 1.266, "roughness": 0, "metalness": 1, "envMapIntensity": 2, "clearcoat": 0, "clearcoatRoughness": 0, "transmission": 0, "flatShading": false, "wireframe": false, "map": "purple-rain" },
    },
    {
        name: 'Alien Goo',
        background: '#45ACD8',
        config: { "uPositionFrequency": 1.022, "uPositionStrength": 0.99, "uSmallWavePositionFrequency": 0.378, "uSmallWavePositionStrength": 0.341, "roughness": 0.292, "metalness": 0.73, "envMapIntensity": 0.86, "clearcoat": 1, "clearcoatRoughness": 0, "transmission": 0, "flatShading": false, "wireframe": false, "map": "lucky-day" },
    },
    {
        name: 'Bittle bee',
        background: '#4D55CC',
        config: { "uPositionFrequency": 0.0, "uPositionStrength": 0.19, "uSmallWavePositionFrequency": 3.5, "uSmallWavePositionStrength": 0.11, "roughness": 0.2, "metalness": 0.7, "envMapIntensity": 0.8, "clearcoat": 1, "clearcoatRoughness": 0, "transmission": 0, "flatShading": false, "wireframe": false, "map": "pink-floyd" },
    },
]

let isAnimating = false;
let currentIndex = 0;


// Initialize scene, camera and renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color('#333')
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#canvas'),
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;

// // Initialize orbit controls
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true; // Add smooth damping effect

// Load HDRI environment map

rgbeLoader.load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_08_1k.hdr', function(texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
});

const uniforms = {
    uTime: { value: 0 },
    uPositionFrequency: { value: blobs[currentIndex].config.uPositionFrequency },
    uPositionStrength: { value: blobs[currentIndex].config.uPositionStrength },
    uTimeFrequency: { value: .3 },

    uSmallWavePositionFrequency: { value: blobs[currentIndex].config.uSmallWavePositionFrequency },
    uSmallWavePositionStrength: { value: blobs[currentIndex].config.uSmallWavePositionStrength },
    uSmallWaveTimeFrequency: { value: .3 },

};

// // Setup GUI
// const gui = new GUI();
// const largeWaveFolder = gui.addFolder('Large Wave');
// gui.add(uniforms.uPositionFrequency, 'value', 0, 10, 0.01).name('Position Frequency');
// gui.add(uniforms.uPositionStrength, 'value', 0, 2, 0.01).name('Position Strength');
// gui.add(uniforms.uTimeFrequency, 'value', 0, 2, 0.01).name('Time Frequency');

// const smallWaveFolder = gui.addFolder('Small Wave');
// gui.add(uniforms.uSmallWavePositionFrequency, 'value', 0, 10, 0.01).name('Position Frequency');
// gui.add(uniforms.uSmallWavePositionStrength, 'value', 0, 2, 0.01).name('Position Strength');
// gui.add(uniforms.uSmallWaveTimeFrequency, 'value', 0, 2, 0.01).name('Time Frequency');

// Create sphere with shader material;

const material = new CustomShaderMaterial({
    baseMaterial: THREE.MeshPhysicalMaterial,
    vertexShader,
    map: textureLoader.load(`./gradients/${blobs[currentIndex].config.map}.png`),
    metalness: blobs[currentIndex].config.metalness,
    roughness: blobs[currentIndex].config.roughness,
    envMapIntensity: blobs[currentIndex].config.envMapIntensity,
    clearcoat: blobs[currentIndex].config.clearcoat,
    clearcoatRoughness: blobs[currentIndex].config.clearcoatRoughness,
    transmission: blobs[currentIndex].config.transmission,
    flatShading: blobs[currentIndex].config.flatShading,
    wireframe: blobs[currentIndex].config.wireframe,
    uniforms,
});

const mergedGeometry = mergeVertices(new THREE.IcosahedronGeometry(1,100));
mergedGeometry.computeTangents();

const sphere = new THREE.Mesh(mergedGeometry, material);
scene.add(sphere);

// Position camera
camera.position.z = 3;


// Animation loop
const clock = new THREE.Clock();

const textMaterial = new THREE.ShaderMaterial({
    vertexShader: textVertex,
    fragmentShader:`void main() {
        gl_FragColor = vec4(1.0);
    }`,
    side: THREE.DoubleSide,
    uniforms: {
        progress: { value: 0.0 },
        direction: { value: 1},
    }, 
});


const texts = blobs.map((blob, index) => {
    const myText = new Text();
    myText.text = blob.name;
    myText.font =`./aften_screen.woff`
    myText.anchorX = 'center';
    myText.anchorY = 'middle';
    myText.material = textMaterial;
    myText.position.set(0, 0, 2);
    if (index !== 0) myText.scale.set(0, 0, 0);
    myText.letterSpacing = -0.08;
    myText.fontSize = window.innerWidth / 4000;
    myText.glyphGeometryDetailness = 20;
    myText.sync();

    scene.add(myText);
    return myText;
})
console.log(texts);


window.addEventListener('wheel', (e) => {
    if (isAnimating) return;
    isAnimating = true;

    let direction = Math.sign(e.deltaY);
    let next = (currentIndex + direction + blobs.length) % blobs.length;

    texts[next].scale.set(1, 1, 1);
    texts[next].position.x = direction * 3.5;


    gsap.to(textMaterial.uniforms.progress, {
        value: 0.5,
        duration: 1,
        ease: 'linear',
        onComplete: () => {
          currentIndex = next;
          isAnimating = false;
          textMaterial.uniforms.progress.value = 0;

          const bg = new THREE.Color(blobs[next].background);
          gsap.to(scene.background,{
              r: bg.r,
              g: bg.g,
              b: bg.b,
              duration: 0.5,
              ease:'linear',
              
          })
          
        }
    });


      


    gsap.to(texts[currentIndex].position,{
        x: -direction * 3,
        duration: 1,
        ease: 'power2.inOut',

    })
    
   
    gsap.to(sphere.rotation,{
        y: sphere.rotation.y + Math.PI * 2 * -direction,
        duration: 1,
        ease: 'power2.inOut',
    
    })

    gsap.to(texts[next].position,{
        x: 0,

        duration: 1,
        ease: 'power2.inOut',
    })

  
    updateBlob(blobs[next].config);
});


function updateBlob(config){ 
    if (config.uPositionFrequency !== undefined) gsap.to(material.uniforms.uPositionFrequency, { value: config.uPositionFrequency, duration: 1, ease: 'power2.inOut' });
    if (config.uPositionStrength !== undefined) gsap.to(material.uniforms.uPositionStrength, { value: config.uPositionStrength, duration: 1, ease: 'power2.inOut' });
    if (config.uSmallWavePositionFrequency !== undefined) gsap.to(material.uniforms.uSmallWavePositionFrequency, { value: config.uSmallWavePositionFrequency, duration: 1, ease: 'power2.inOut' });
    if (config.uSmallWavePositionStrength !== undefined) gsap.to(material.uniforms.uSmallWavePositionStrength, { value: config.uSmallWavePositionStrength, duration: 1, ease: 'power2.inOut' });
    if (config.uSmallWaveTimeFrequency !== undefined) gsap.to(material.uniforms.uSmallWaveTimeFrequency, { value: config.uSmallWaveTimeFrequency, duration: 1, ease: 'power2.inOut' });
    if (config.map !== undefined) {
        setTimeout(() => { 
            material.map = textureLoader.load(`./gradients/${config.map}.png`);
        },400);
    }
    if (config.roughness !== undefined) gsap.to(material, { roughness: config.roughness, duration: 1, ease: 'power2.inOut' });
    if (config.metalness !== undefined) gsap.to(material, { metalness: config.metalness, duration: 1, ease: 'power2.inOut' });
    if (config.envMapIntensity !== undefined) gsap.to(material, { envMapIntensity: config.envMapIntensity, duration: 1, ease: 'power2.inOut' });
    if (config.clearcoat !== undefined) gsap.to(material, { clearcoat: config.clearcoat, duration: 1, ease: 'power2.inOut' });
    if (config.clearcoatRoughness !== undefined) gsap.to(material, { clearcoatRoughness: config.clearcoatRoughness, duration: 1, ease: 'power2.inOut' });
    if (config.transmission !== undefined) gsap.to(material, { transmission: config.transmission, duration: 1, ease: 'power2.inOut' });
    if (config.flatShading !== undefined) gsap.to(material, { flatShading: config.flatShading, duration: 1, ease: 'power2.inOut' });
    if (config.wireframe !== undefined) gsap.to(material, { wireframe: config.wireframe, duration: 1, ease: 'power2.inOut' });
    
}

// mobile Responsive changes

// 🟢 Scale blob down for mobile
const blobScale = window.innerWidth < 768 ? 0.75 : 1;
sphere.scale.set(blobScale, blobScale, blobScale);

// 🟢 Make Name Text Responsive
texts.forEach((text) => {
  text.fontSize = window.innerWidth < 768 ? 0.15 : window.innerWidth / 4000;
});

// 🟢 Touch Swipe Support for Mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener("touchstart", (e) => {
  touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener("touchend", (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
});

function handleSwipe() {
  if (Math.abs(touchEndX - touchStartX) > 50) {
    const direction = touchEndX < touchStartX ? 1 : -1;
    simulateScroll(direction);
  }
}

function simulateScroll(direction) {
  if (isAnimating) return;
  isAnimating = true;

  let next = (currentIndex + direction + blobs.length) % blobs.length;

  texts[next].scale.set(1, 1, 1);
  texts[next].position.x = direction * 3.5;

  gsap.to(textMaterial.uniforms.progress, {
    value: 0.5,
    duration: 1,
    ease: 'linear',
    onComplete: () => {
      currentIndex = next;
      isAnimating = false;
      textMaterial.uniforms.progress.value = 0;

      const bg = new THREE.Color(blobs[next].background);
      gsap.to(scene.background, {
        r: bg.r,
        g: bg.g,
        b: bg.b,
        duration: 0.5,
        ease: 'linear',
      });
    }
  });

  gsap.to(texts[currentIndex].position, {
    x: -direction * 3,
    duration: 1,
    ease: 'power2.inOut',
  });

  gsap.to(sphere.rotation, {
    y: sphere.rotation.y + Math.PI * 2 * -direction,
    duration: 1,
    ease: 'power2.inOut',
  });

  gsap.to(texts[next].position, {
    x: 0,
    duration: 1,
    ease: 'power2.inOut',
  });

  updateBlob(blobs[next].config);
}






loadingManager.onLoad = () => {
    function animate() {
        requestAnimationFrame(animate);
        
        // controls.update();
        
        uniforms.uTime.value = clock.getElapsedTime();
        renderer.render(scene, camera);
    }
    const bg = new THREE.Color(blobs[currentIndex].background);
    gsap.to(scene.background,{r: bg.r, g: bg.g, b: bg.b, duration: 1, ease:'linear'});
    animate();
};


// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start animation loop

