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
var GlobeRegionsAWS;
var GlobeRegionsGoogle;
let isLongName = true; // Default display mode
let selectedProvider = 'AWS'; // Default provider
let showLocalZones = false; // Default local zones visibility

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
    selectedProvider = event.target.value;
    loadProviderData(selectedProvider);
  });
  document.getElementById('nameDisplaySelect').addEventListener('change', updateNameDisplay);
  document.getElementById('localZonesCheckbox').addEventListener('change', toggleLocalZones);

}


function initGlobes() {
  if (!GlobeRegionsAWS && !GlobeRegionsGoogle) {
    GlobeRegionsAWS = initGlobe(true, awsRegionsData);
    GlobeRegionsGoogle = initGlobe(false, googleRegionsData);
  }
}

function loadProviderData(provider) {
  switch (provider) {
    case 'aws':
      scene.remove(GlobeRegionsGoogle);
      scene.add(GlobeRegionsAWS);
      selectedProvider = 'AWS';
      break;
    case 'google':
      scene.remove(GlobeRegionsAWS);
      scene.add(GlobeRegionsGoogle);
      selectedProvider = 'Google';
      break;
    default:
      console.error('Unknown provider:', provider);
  }
}


function toggleLocalZones() {
  showLocalZones = showLocalZones ? false : true;

  // Check which globe is currently visible
  if (selectedProvider === 'AWS') {
    updateGlobe(GlobeRegionsAWS, awsRegionsData);
  } else if (selectedProvider === 'Google') {
    updateGlobe(GlobeRegionsGoogle, googleRegionsData);
  }

}


function updateNameDisplay() {
  isLongName = isLongName ? false : true;

  // Check which globe is currently visible
  if (selectedProvider === 'AWS') {
    updateGlobe(GlobeRegionsAWS, awsRegionsData);
  } else if (selectedProvider === 'Google') {
    updateGlobe(GlobeRegionsGoogle, googleRegionsData);
  }
}


function updateGlobe(globe, regionsData) {
  // Filter data based on local zones visibility
  const filteredRegionsData = regionsData.regions.filter((e) =>
    e.type === "Region" || (showLocalZones && e.type === "Local Zone"));

  // Update the labels on the globe
  globe
    .labelsData(filteredRegionsData.map((e) => {
      return {
        ...e,
        name: isLongName ? e.longName : e.name,
      };
    }))
    .labelsTransitionDuration(0)
    .labelColor((e) => {
      if (e.type == "Region") {
        if (e.status == "available") {
          return "#f1f3f3";
        }
        return "#ff6633";
      } else if (e.type == "Local Zone") {
        return "#ffee53"
      } else return "#ff6633";
    })
    .labelDotRadius((e) => {
      if (e.type == "Region") {
        return 1;
      } else if (e.type == "Local Zone") {
        return 0.5;
      } else return 0;
    })
    .labelSize((e) => {
      if (e.type == "Region") {
        return 1.2;
      } else if (e.type == "Local Zone") {
        return 0.8;
      } else return 0;
    })
    .labelResolution(6)
    .labelAltitude((e) => {
      if (e.type == "Region") {
        return 0.02;
      } else if (e.type == "Local Zone") {
        return 0.01;
      } else return 0;
    })
    .labelDotOrientation((e) => {
      if (e.type == "Region") {
        return "right";
      } else if (e.type == "Local Zone") {
        return "left";
      } else return "left";
    })
    .labelTypeFace(labelfont)
    .pointsData(filteredRegionsData.filter((e) => e.type == "Region"))
    .pointColor((e) => {
      if (e.type == "Region") {
        if (e.status == "available") {
          return "#f1f3f3";
        }
        return "#ff6633";
      } else if (e.type == "Local Zone") {
        return "#ffee53"
      } else return "#ff6633";
    })
    .pointsMerge(true)
    .pointAltitude(0.17)
    .pointRadius(0.05);

}



// SECTION Globe
function initGlobe(addToScene, regionsData) {
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

  // Filter data based on local zones visibility
  const filteredRegionsData = regionsData.regions.filter((e) =>
    e.type === "Region" || (showLocalZones && e.type === "Local Zone"));


  // NOTE Arc animations are followed after the globe enters the scene
  setTimeout(() => {
    Globe
      // .ringsData(regionsData.regions)
      // .ringAltitude(0.05)
      // .ringMaxRadius(2)
      // .ringColor(() => "#f1f3f3")
      // .ringRepeatPeriod(100)
      .labelsData(filteredRegionsData.map((e) => {
        return {
          ...e,
          name: isLongName ? e.longName : e.name,
        };
      }))
      .labelColor((e) => {
        if (e.type == "Region") {
          if (e.status == "available") {
            return "#f1f3f3";
          }
          return "#ff6633";
        } else if (e.type == "Local Zone") {
          return "#ffee53"
        } else return "#ff6633";
      })
      .labelDotRadius((e) => {
        if (e.type == "Region") {
          return 1;
        } else if (e.type == "Local Zone") {
          return 0.5;
        } else return 0;
      })
      .labelSize((e) => {
        if (e.type == "Region") {
          return 1.2;
        } else if (e.type == "Local Zone") {
          return 0.8;
        } else return 0;
      })
      .labelText((e) => {
        if (e.type == "Region") {
          return isLongName ? e.longName : e.name;
        } else if (e.type == "Local Zone") {
          return isLongName ? e.longName : e.name;
        } else return "";
      })
      .labelResolution(6)
      .labelAltitude((e) => {
        if (e.type == "Region") {
          return 0.02;
        } else if (e.type == "Local Zone") {
          return 0.01;
        } else return 0;
      })
      .labelDotOrientation((e) => {
        if (e.type == "Region") {
          return "right";
        } else if (e.type == "Local Zone") {
          return "left";
        } else return "left";
      })
      .labelTypeFace(labelfont)
      .pointsData(filteredRegionsData.filter((e) => e.type == "Region"))
      .pointColor((e) => {
        if (e.type == "Region") {
          if (e.status == "available") {
            return "#f1f3f3";
          }
          return "#ff6633";
        } else if (e.type == "Local Zone") {
          return "#ffee53"
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
