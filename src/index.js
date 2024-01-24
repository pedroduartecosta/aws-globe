import ThreeGlobe from "three-globe";
import { WebGLRenderer, Scene } from "three";
import {
  PerspectiveCamera,
  AmbientLight,
  DirectionalLight,
  Color,
  Fog,
  // AxesHelper,
  // DirectionalLightHelper,
  // CameraHelper,
  PointLight,
  SphereGeometry,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import countries from "./files/globe-data-min.json";
import awsRegionsData from "./files/regions-data-aws.json";
import googleRegionsData from "./files/regions-data-google.json";
import labelfont from "../assets/src/files/helvetiker_bold.typeface.json"

var renderer, camera, scene, controls;
let mouseX = 0;
let mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;
var GlobeRegionsAWSLongName, GlobeRegionsAWSName;
var GlobeRegionsGoogleLongName, GlobeRegionsGoogleName;
let isLongName = true; // Default display mode
let selectedProvider = 'AWS'; // Default provider

init();
initGlobes();
onWindowResize();
animate();

// SECTION Initializing core ThreeJS elements
function init() {
  // Initialize renderer
  renderer = new WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  // renderer.outputEncoding = THREE.sRGBEncoding;
  document.body.appendChild(renderer.domElement);

  // Initialize scene, light
  scene = new Scene();
  scene.add(new AmbientLight(0xbbbbbb, 0.3));
  scene.background = new Color(0x192133);

  // Initialize camera, light
  camera = new PerspectiveCamera();
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  var dLight = new DirectionalLight(0xd4dada, 0.4);
  dLight.position.set(-800, 2000, 400);
  camera.add(dLight);

  var dLight1 = new DirectionalLight(0xd4dada, 0.5);
  dLight1.position.set(-200, 500, 200);
  camera.add(dLight1);

  var dLight2 = new PointLight(0xd4dada, 0.5);
  dLight2.position.set(-200, 500, 200);
  camera.add(dLight2);

  camera.position.z = 300;
  camera.position.x = 0;
  camera.position.y = 150;

  scene.add(camera);

  // Additional effects
  scene.fog = new Fog(0x535ef3, 400, 2000);

  // Helpers
  // const axesHelper = new AxesHelper(800);
  // scene.add(axesHelper);
  // var helper = new DirectionalLightHelper(dLight);
  // scene.add(helper);
  // var helperCamera = new CameraHelper(dLight.shadow.camera);
  // scene.add(helperCamera);

  // Initialize controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dynamicDampingFactor = 0.01;
  controls.enablePan = false;
  controls.minDistance = 250;
  controls.maxDistance = 500;
  controls.rotateSpeed = 0.8;
  controls.zoomSpeed = 0.5;
  controls.autoRotate = false;

  //controls.minPolarAngle = Math.PI / 3.5;
  //controls.maxPolarAngle = Math.PI - Math.PI / 3;

  window.addEventListener("resize", onWindowResize, false);
  document.addEventListener("mousemove", onMouseMove);
  //document.addEventListener("mousedown", onMouseDown);
  //document.addEventListener("mouseup", onMouseUp);
  //document.addEventListener("touchstart", onMouseDown, false);
  //document.addEventListener("touchend", onMouseUp, false);
  document.getElementById('cloudProviderSelect').addEventListener('change', (event) => {
    const selectedOption = event.target.value;
    loadProviderData(selectedOption);
  });
  document.getElementById('nameDisplaySelect').addEventListener('change', (event) => {
    const isLongName = event.target.value === 'longName';
    updateNameDisplay(isLongName);
  });

}

function initGlobes() {
  // Initialize AWS Globes
  GlobeRegionsAWSLongName = initGlobe("longName", true, awsRegionsData);
  GlobeRegionsAWSName = initGlobe("name", false, awsRegionsData);

  // Initialize Google Globes
  GlobeRegionsGoogleLongName = initGlobe("longName", false, googleRegionsData);
  GlobeRegionsGoogleName = initGlobe("name", false, googleRegionsData);
}

function loadProviderData(provider) {
  console.log("Loading " + provider + " data");

  switch (provider) {
    case 'aws':
      scene.remove(GlobeRegionsGoogleLongName);
      scene.remove(GlobeRegionsGoogleName);
      scene.add(isLongName ? GlobeRegionsAWSLongName : GlobeRegionsAWSName);
      selectedProvider = 'AWS';
      break;
    case 'google':
      scene.remove(GlobeRegionsAWSLongName);
      scene.remove(GlobeRegionsAWSName);
      scene.add(isLongName ? GlobeRegionsGoogleLongName : GlobeRegionsGoogleName);
      selectedProvider = 'Google';
      break;
    default:
      console.error('Unknown provider:', provider);
  }
}



function updateNameDisplay(longName) {
  // Determine which set of globes to show and hide based on the provider
  var globeToShowLongName, globeToShowName, globeToHideLongName, globeToHideName;

  if (selectedProvider === 'AWS') {
    globeToShowLongName = GlobeRegionsAWSLongName;
    globeToShowName = GlobeRegionsAWSName;
    globeToHideLongName = GlobeRegionsGoogleLongName;
    globeToHideName = GlobeRegionsGoogleName;
  } else if (selectedProvider === 'Google') {
    globeToShowLongName = GlobeRegionsGoogleLongName;
    globeToShowName = GlobeRegionsGoogleName;
    globeToHideLongName = GlobeRegionsAWSLongName;
    globeToHideName = GlobeRegionsAWSName;
  } else {
    console.error('Unknown provider:', provider);
    return;
  }

  // Hide the globes of the other provider
  scene.remove(globeToHideLongName);
  scene.remove(globeToHideName);

  // Show the appropriate globe based on the longName flag
  if (longName) {
    scene.add(globeToShowLongName);
    scene.remove(globeToShowName);
  } else {
    scene.add(globeToShowName);
    scene.remove(globeToShowLongName);
  }
}


// SECTION Globe
function initGlobe(labelText, addToScene, regionsData) {
  // Initialize the Globe
  let Globe = new ThreeGlobe({
    waitForGlobeReady: true,
    animateIn: true,
  })
    .hexPolygonsData(countries.features)
    .hexPolygonResolution(3)
    .hexPolygonMargin(0.7)
    .showAtmosphere(true)
    .atmosphereColor("#232F3E")
    .atmosphereAltitude(0.25)
    .hexPolygonColor((e) => {
      if (
        [""].includes(
          e.properties.ISO_A3
        )
      ) {
        return "rgba(80,80,0, 0.8)";
      } else return "rgba(255,153,0, 0.8)";
    });

  // NOTE Arc animations are followed after the globe enters the scene
  setTimeout(() => {
    Globe
      .ringsData(regionsData.regions)
      .ringAltitude(0.05)
      .ringMaxRadius(2)
      .ringColor(() => "#f1f3f3")
      .ringRepeatPeriod(100)
      .labelsData(regionsData.regions)
      .labelColor((e) => {
        if (e.type == "GA") {
          return "#f1f3f3";
        } else return "#ff6633";
      })
      .labelDotRadius(1)
      .labelSize(1.2)
      .labelText(labelText)
      .labelResolution(6)
      .labelAltitude(0.02)
      .labelDotOrientation(() => 'right')
      .labelTypeFace(labelfont)
      .pointsData(regionsData.regions)
      .pointColor((e) => {
        if (e.type == "GA") {
          return "#f1f3f3";
        } else return "#ff6633";
      })
      .pointsMerge(true)
      .pointAltitude(0.17)
      .pointRadius(0.05);
  }, 1000);

  //Globe.rotateY(-Math.PI * (5 / 9));
  //Globe.rotateZ(-Math.PI / 6);
  const globeMaterial = Globe.globeMaterial();
  globeMaterial.color = new Color(0x232F3E);
  globeMaterial.emissive = new Color(0x232F3E);
  globeMaterial.emissiveIntensity = 0.1;
  globeMaterial.shininess = 0.7;

  // NOTE Cool stuff
  // globeMaterial.wireframe = true;
  if (addToScene) {
    scene.add(Globe);
  }

  return Globe;
}

function onMouseMove(event) {
  mouseX = event.clientX - windowHalfX;
  mouseY = event.clientY - windowHalfY;
  // console.log("x: " + mouseX + " y: " + mouseY);
}

function onMouseDown(event) {
  scene.remove(GlobeRegionsLongName);
  scene.add(GlobeRegionsName);
}

function onMouseUp(event) {
  scene.remove(GlobeRegionsName);
  scene.add(GlobeRegionsLongName);
}



function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  windowHalfX = window.innerWidth / 1.5;
  windowHalfY = window.innerHeight / 1.5;
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  //camera.position.x +=
  //  Math.abs(mouseX) <= windowHalfX / 2
  //    ? (mouseX / 2 - camera.position.x) * 0.005
  //    : 0;
  //camera.position.y += (-mouseY / 2 - camera.position.y) * 0.005;
  camera.lookAt(scene.position);
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
