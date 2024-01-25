import ThreeGlobe from "three-globe";
import { WebGLRenderer, Scene } from "three";
import {
  PerspectiveCamera,
  AmbientLight,
  DirectionalLight,
  Color,
  Fog,
  AxesHelper,
  DirectionalLightHelper,
  PointLightHelper,
  CameraHelper,
  OctahedronGeometry,
  PointLight,
  MeshLambertMaterial,
  Mesh,
  SphereGeometry,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import countries from "./files/globe-data-min.json";
import awsRegionsData from "./files/regions-data-aws.json";
import googleRegionsData from "./files/regions-data-google.json";
import azureRegionsData from "./files/regions-data-azure.json";
import labelfont from "../assets/src/files/helvetiker_bold.typeface.json"

var renderer, camera, scene, controls;
let mouseX = 0;
let mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;
var GlobeRegionsAWS;
var GlobeRegionsGoogle;
var GlobeRegionsAzure;
let isLongName = true; // Default display mode
let selectedProvider = 'AWS'; // Default provider
let showLocalZones = false; // Default local zones visibility
let showPoPs = false; // Default PoPs visibility

const satelitesData = `0 VANGUARD 2
1    11U 59001A   22053.83197560  .00000847  00000-0  45179-3 0  9996
2    11  32.8647 264.6509 1466352 126.0358 248.5175 11.85932318689790
0 VANGUARD 3
1 00020U 59007A   22053.60170665  .00000832  00000-0  32375-3 0  9992
2 00020  33.3540 150.1993 1666456 290.4879  52.4980 11.56070084301793
0 EXPLORER 7
1 00022U 59009A   22053.49750630  .00000970  00000-0  93426-4 0  9997
2 00022  50.2831  94.4956 0136813  90.0531 271.6094 14.96180956562418
0 TIROS 1
1    29U 60002B   22053.73599453  .00000075  00000-0  41992-4 0  9997
2    29  48.3791 284.6069 0024160 344.1103  15.9048 14.74533417309456
0 TRANSIT 2A
1    45U 60007A   22053.78590077  .00000201  00000-0  76203-4 0  9992
2    45  66.6938 199.2201 0260624 228.7924 129.0448 14.33783651210919
0 SOLRAD 1 (GREB)
1 00046U 60007B   22053.56859360  .00000150  00000-0  52806-4 0  9998
2 00046  66.6903 184.2260 0206083  30.7482 330.5510 14.49531925228257
0 COURIER 1B
1 00058U 60013A   22053.57007590  .00000103  00000-0  27843-4 0  9990
2 00058  28.3254 213.9685 0164896 121.8823 239.7880 13.46331018 21563
0 EXPLORER 11
1 00107U 61013A   22053.36462913  .00001102  00000-0  12806-3 0  9999
2 00107  28.7906 307.3320 0544222 325.7790  30.8820 14.09575093 53048
0 TRANSIT 4A
1 00116U 61015A   22053.59491362 -.00000005  00000-0  54851-4 0  9995
2 00116  66.8101 144.3927 0081903 295.7647  63.4996 13.91813101 77406
0 SOLRAD 3/INJUN 1
1   117U 61015B   22053.79061784 -.00000049  00000-0  22091-4 0  9998
2   117  66.8101 244.7414 0082529 316.1382  43.3161 13.89881521 75544
0 TIROS 3
1 00162U 61017A   22053.46597274 -.00000070  00000-0  26849-4 0  9991
2 00162  47.9009 328.3344 0044533 162.9380 197.3021 14.44121209163949
0 TRANSIT 4B
1 00202U 61031A   22053.44440530  .00000075  00000-0  64572-4 0  9991
2 00202  32.4390 333.3810 0101119 127.6129 233.3720 13.63561486  5782
0 TRAAC
1   205U 61031B   22053.81871020  .00000048  00000-0  29606-4 0  9996
2   205  32.4412 111.3714 0102305 273.2854  85.6067 13.62426388  4587
0 TIROS 4
1 00226U 62002A   22053.55470977 -.00000073  00000-0  26949-4 0  9991
2 00226  48.2966 294.6206 0078438 246.1904 113.0756 14.45747526140364
0 TIROS 5
1 00309U 62025A   22053.49776455  .00000052  00000-0  45126-4 0  9995
2 00309  58.0907 234.2031 0187097 259.3128  98.6784 14.57001830151929
0 FTV 3502
1   369U 62039A   22053.83720329  .00000503  00000-0  63534-4 0  9997
2   369  98.4743   2.4600 0091774 178.0695 182.0890 14.84082654181797
0 TIROS 6
1   397U 62047A   22053.72178655  .00000404  00000-0  65962-4 0  9991
2   397  58.3050 189.8944 0013697 121.8001 238.4380 14.88736291198537
0 ALOUETTE 1 (S-27)
1 00424U 62049A   22053.41475221  .00000047  00000-0  44206-4 0  9990
2 00424  80.4639  15.1233 0022989 345.1338  14.9129 13.69192853965647
0 ANNA 1B
1   446U 62060A   22053.81766611 -.00000119  00000-0  14384-4 0  9992
2   446  50.1412 289.0608 0070306  19.7513 102.8060 13.35283453893637
0 EXPLORER 16
1 00506U 62070A   22053.30995854 -.00000109  00000-0  23050-4 0  9996
2 00506  52.0028 276.5814 0276698 310.2412  47.4602 13.85206712990314
0 HITCH HIKER 1
1 00614U 63025B   22053.51365970  .00020198 -10814-5  34773-3 0  9992
2 00614  81.9763 228.9109 0502466  87.8717 277.9922 14.72876469687338
0 TRANSIT 5B-1
1 00670U 63038B   22053.30437135  .00000066  00000-0  97197-4 0  9990
2 00670  90.0289 333.9670 0039860 223.5583 136.2415 13.44369388862421
0 RADIATION SAT (5E 1)
1   671U 63038C   22053.84386399  .00000083  00000-0  12579-3 0  9994
2   671  90.0297 333.9349 0039918 180.8481 179.2606 13.44890822863859
0 TRANSIT 5B-2
1 00704U 63049B   22053.62734081  .00000038  00000-0  46921-4 0  9993
2 00704  89.8998  84.4781 0035849 145.3699 326.0739 13.46878690859220
0 TRANSIT 5E 3
1 00705U 63049C   22053.56100324  .00000035  00000-0  41584-4 0  9991
2 00705  89.9002  84.4181 0035881 107.2552   2.4068 13.47374399859928
0 TIROS 8
1 00716U 63054A   22053.50793386  .00000090  00000-0  45917-4 0  9994
2 00716  58.4949  96.5697 0027319  41.8364 318.4756 14.69684003 83832
0 GGSE 1 (GGRS)
1 00728U 64001B   22053.58217419  .00000009  00000-0  44901-4 0  9998
2 00728  69.9102 355.1870 0015643 224.9707 135.0132 13.97218465959548
0 SECOR 1B
1 00729U 64001C   22053.44564916 -.00000047  00000-0  50977-5 0  9995
2 00729  69.8999  72.1889 0016708 292.1532  67.7799 13.94933169957005
0 SOLRAD 7A
1 00730U 64001D   22053.44938698 -.00000019  00000-0  25671-4 0  9990
2 00730  69.9057  59.7776 0016843 258.6897 209.7621 13.95665137840753
0 GREB
1   731U 64001E   22053.76509136 -.00000006  00000-0  35146-4 0  9991
2   731  69.9059  50.6671 0016844 255.0782 104.8458 13.95890813958175
0 OPS 3367 A
1   734U 64002B   22053.85166267  .00000008  00000-0  22243-4 0  9994
2   734  99.1029 269.7912 0015536  73.7958 286.4930 14.28928739 23821
0 OPS 3367 B
1   735U 64002C   22053.80410084  .00000009  00000-0  22927-4 0  9999
2   735  99.1248 263.7937 0016656 178.8911 181.2308 14.27879024 21916
0 OPS 4412 (TRANSIT 9)
1   801U 64026A   22053.71494511  .00000221  00000-0  10805-3 0  9993
2   801  90.5169 102.7153 0050726  70.1058 290.5585 14.14811931963635
0 OPS 4467 A
1 00812U 64031A   22053.57749780  .00000031  00000-0  36729-4 0  9999
2 00812  99.7969   6.9897 0005579 173.6966 186.4280 14.23921954992015
0 OPS 4467 B
1 00813U 64031B   22053.59518480  .00000023  00000-0  33908-4 0  9990
2 00813  99.8047   5.2050 0004557 263.5174  96.5482 14.23101389990770
0 EXPLORER 20
1   870U 64051A   22053.83422166  .00000073  00000-0  48959-4 0  9994
2   870  79.8993 192.2499 0098085 102.1807 259.0356 13.91204999914828
0 COSMOS 44
1 00876U 64053A   22053.07740883  .00000000  00000-0  23374-4 0  9991
2 00876  65.0610 295.3133 0133852 167.5314 192.9156 14.63847306 57834
0 OPS 5798 (TRANSIT 5B-4)
1 00897U 64063B   22053.50155365  .00000056  00000-0  69242-4 0  9993
2 00897  90.1802  41.6412 0021561  79.0093  32.6471 13.53476912832082
0 EXPLORER 22
1 00899U 64064A   22053.51089747  .00000099  00000-0  82208-4 0  9991
2 00899  79.6895  49.9973 0119566 294.4464  64.4251 13.82213343887223
0 CALSPHERE 1
1 00900U 64063C   22053.46035986  .00000375  00000-0  39125-3 0  9999
2 00900  90.1695  38.8095 0028042  12.2902 109.1497 13.73689201854879
0 CALSPHERE 2
1 00902U 64063E   22053.51688094  .00000019  00000-0  14990-4 0  9990
2 00902  90.1812  41.8087 0020104 118.4932   2.1025 13.52707185643234
0 EXPLORER 25 (INJUN-4)
1 00932U 64076B   22053.53084652  .00000453  00000-0  16203-3 0  9999
2 00932  81.3443 147.9111 1131379 232.9255 116.3130 12.64152768619818
0 OPS 6582 (TRANSIT 5E-5)
1 00959U 64083C   22053.44930219  .00000123  00000-0  14811-3 0  9992
2 00959  89.9955 187.1802 0040356 273.1301 153.5573 13.61714251835705
0 OPS 6582 (TRANSIT 5B-5)
1   965U 64083D   22053.82091714  .00000053  00000-0  61878-4 0  9997
2   965  90.0266 195.0823 0040356 201.6689 277.6017 13.56769407830541
0 TIROS 9
1 00978U 65004A   22053.47621103  .00000229  00000-0  30860-3 0  9998
2 00978  96.3873 228.7465 1158468 201.2825 153.6047 12.10907713520889
0 SECOR 3
1 01208U 65016E   22053.44415196 -.00000018  00000-0  25430-4 0  9993
2 01208  70.0796 299.0083 0020406 349.4893 183.5198 13.95637262899325
0 GGSE 2
1 01244U 65016B   22053.41356298  .00000009  00000-0  44716-4 0  9994
2 01244  70.0795 301.7329 0021011 352.9822   7.0986 13.95694985898219
0 OPS 4988 (GREB 6)
1 01271U 65016A   22053.40533134 -.00000013  00000-0  28909-4 0  9991
2 01271  70.0784 276.2274 0021667 336.0082 197.5394 13.96179303898862
0 PORCUPINE 1
1  1272U 65016H   22053.84055333 -.00000001  00000-0  38285-4 0  9995
2  1272  70.0822 355.4838 0021002  21.9802 338.2199 13.94246820897251
0 SOLRAD 7B
1  1291U 65016D   22053.84038263 -.00000016  00000-0  27042-4 0  9994
2  1291  70.0818 344.4770 0019820  21.5097 338.6836 13.94627105897528
0 GGSE 3
1 01292U 65016C   22053.56056613  .00000040  00000-0  62240-4 0  9998
2 01292  70.0765  96.2613 0022649 241.7699 118.1123 14.00689668903859
0 OSCAR 3
1  1293U 65016F   22053.84710079  .00000369  00000-0  25508-3 0  9992
2  1293  70.0729 219.5747 0015031 102.5214 257.7580 14.06565318911017
0 OPS 4682 (SNAPSHOT)
1 01314U 65027A   22053.50655189  .00000010  00000-0  93600-5 0  9994
2 01314  90.2764 330.7186 0032027  79.3973  93.6088 12.91764428427594
0 SECOR 4 (EGRS 4)
1 01315U 65027B   22053.55793323 -.00000021  00000-0 -10398-3 0  9998
2 01315  90.2665 340.1398 0031126 357.7605 178.7343 12.92616797683363
0 EXPLORER 27
1  1328U 65032A   22053.80963938 -.00000079  00000-0  10993-4 0  9991
2  1328  41.1835 277.0032 0257724  31.9870 329.6247 13.38665446777622
0 OPS 8480 (TRANSIT 5B-6)
1 01420U 65048A   22053.61192285  .00000062  00000-0  80272-4 0  9997
2 01420  89.9154 303.1783 0072953 318.0061 102.2834 13.51428028790612
0 TIROS 10
1  1430U 65051A   22053.81490283  .00000075  00000-0  36366-4 0  9992
2  1430  98.3570 173.9639 0057333 132.1031 228.5053 14.40348889969471
0 SECOR 5 (EGRS 5)
1 01506U 65063A   22053.57605197 -.00000002  00000-0  22080-3 0  9992
2 01506  69.2331 110.4917 0786147 334.3597 130.4713 11.78647783432570
0 DODECAPOLE 2
1 01510U 65065C   22053.55894276  .00002400  00000-0  17328-2 0  9996
2 01510  90.0369  16.7479 0041006 118.3382 242.1940 13.95999631812285
0 TEMPSAT 1
1 01512U 65065E   22053.50623625  .00000027  00000-0  36381-4 0  9996
2 01512  89.9043 219.6319 0069715 354.8397  66.5528 13.33445598750056
0 OPS 8464 (TRANSIT 5B-7)
1  1514U 65065F   22053.75676480  .00000061  00000-0  10224-3 0  9997
2  1514  89.8874 236.4905 0068395 278.0516  92.1111 13.35003479751571
0 NAVSPASUR ROD 1
1 01515U 65065G   22053.43511465  .00000301  00000-0  46167-3 0  9996
2 01515  89.9333 217.6432 0056795 183.2404 230.3749 13.48986541767735
0 CALSPHERE 4(A)
1 01520U 65065H   22053.53714337  .00000068  00000-0  11396-3 0  9992
2 01520  90.0019 130.2159 0068507 225.9878 242.1196 13.35871043752315
0 COSMOS 80
1 01570U 65070A   22053.42817994 -.00000102  00000-0 -37058-4 0  9999
2 01570  56.0559  65.9042 0101339 346.8179 162.8037 12.52767439583881
0 COSMOS 81
1  1571U 65070B   22053.68714169 -.00000095  00000-0  44863-5 0  9991
2  1571  56.0594 124.1061 0090071 129.1494  36.4490 12.48837545576244
0 COSMOS 82
1 01572U 65070C   22053.59885359 -.00000077  00000-0  11414-3 0  9996
2 01572  56.0591 150.8466 0073814 316.1560 142.9804 12.45094829567963
0 COSMOS 83
1 01573U 65070D   22053.59248050 -.00000085  00000-0  58474-4 0  9995
2 01573  56.0521 205.2616 0069494 143.8255 216.7376 12.41018763559610
0 COSMOS 84
1 01574U 65070E   22053.47373271 -.00000091  00000-0  96108-5 0  9991
2 01574  56.0512 257.0851 0062414 321.5221 108.1175 12.37010033551452`

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
  scene.add(new AmbientLight(0xbbbbbb, Math.PI));
  scene.background = new Color(0x191b20);

  // Initialize camera, light
  camera = new PerspectiveCamera();
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  var dLight = new DirectionalLight(0xd4dada, 2.5 * Math.PI);
  dLight.position.set(-800, 2000, 400);
  camera.add(dLight);

  var dLight1 = new DirectionalLight(0xd4dada, 0.1 * Math.PI);
  dLight1.position.set(-200, 500, 200);
  camera.add(dLight1);

  var dLight2 = new PointLight(0xd4dada, 1 * Math.PI);
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
  // var helper = new DirectionalLightHelper(dLight1);
  // scene.add(helper);
  // var pointHelper = new PointLightHelper(dLight2);
  // scene.add(pointHelper);
  // var helperCamera = new CameraHelper(dLight.shadow.camera);
  // scene.add(helperCamera);

  // Initialize controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dynamicDampingFactor = 0.01;
  controls.enablePan = false;
  controls.minDistance = 170;
  controls.maxDistance = 500;
  controls.rotateSpeed = 0.8;
  controls.zoomSpeed = 0.5;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.3;

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
  document.getElementById('popCheckbox').addEventListener('change', togglePoPs);
  document.getElementById('cloudProviderSelect').addEventListener('change', uncheckCheckboxes);
}

function uncheckCheckboxes() {
  document.getElementById('localZonesCheckbox').checked = false;
  document.getElementById('popCheckbox').checked = false;
  document.getElementById('nameDisplaySelect').value = 'longName';
}

function initGlobes() {
  if (!GlobeRegionsAWS && !GlobeRegionsGoogle) {
    GlobeRegionsAWS = initGlobe(true, awsRegionsData);
    GlobeRegionsGoogle = initGlobe(false, googleRegionsData);
    GlobeRegionsAzure = initGlobe(false, azureRegionsData);

  }
}

function loadProviderData(provider) {
  isLongName = true; // Default display mode
  showLocalZones = false; // Default local zones visibility
  showPoPs = false; // Default PoPs visibility

  switch (provider) {
    case 'aws':
      scene.remove(GlobeRegionsGoogle);
      scene.remove(GlobeRegionsAzure);
      scene.add(GlobeRegionsAWS);
      selectedProvider = 'AWS';
      break;
    case 'google':
      scene.remove(GlobeRegionsAWS);
      scene.remove(GlobeRegionsAzure);
      scene.add(GlobeRegionsGoogle);
      selectedProvider = 'Google';
      break;
    case 'azure':
      scene.remove(GlobeRegionsAWS);
      scene.remove(GlobeRegionsGoogle);
      scene.add(GlobeRegionsAzure); // Add Azure globe
      selectedProvider = 'Azure';
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
  } else if (selectedProvider === 'Azure') {
    updateGlobe(GlobeRegionsAzure, azureRegionsData);
  }

}

function togglePoPs() {
  showPoPs = showPoPs ? false : true;

  // Check which globe is currently visible
  if (selectedProvider === 'AWS') {
    updateGlobe(GlobeRegionsAWS, awsRegionsData);
  } else if (selectedProvider === 'Google') {
    updateGlobe(GlobeRegionsGoogle, googleRegionsData);
  } else if (selectedProvider === 'Azure') {
    updateGlobe(GlobeRegionsAzure, azureRegionsData);
  }

}


function updateNameDisplay() {
  isLongName = isLongName ? false : true;

  // Check which globe is currently visible
  if (selectedProvider === 'AWS') {
    updateGlobe(GlobeRegionsAWS, awsRegionsData);
  } else if (selectedProvider === 'Google') {
    updateGlobe(GlobeRegionsGoogle, googleRegionsData);
  } else if (selectedProvider === 'Azure') {
    updateGlobe(GlobeRegionsAzure, azureRegionsData);
  }
}


function updateGlobe(globe, regionsData) {
  // Filter data based on local zones visibility
  const filteredRegionsData = regionsData.regions.filter((e) =>
    e.type === "Region" || (showLocalZones && e.type === "Local Zone") || (showPoPs && e.type === "PoP"));

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
      } else if (e.type == "PoP") {
        return "#337aff"
      } else return "#ff6633";
    })
    .labelDotRadius((e) => {
      if (e.type == "Region") {
        return 1;
      } else if (e.type == "Local Zone") {
        return 0.5;
      } else if (e.type == "PoP") {
        return 0.4;
      } else return 0;
    })
    .labelSize((e) => {
      if (e.type == "Region") {
        return 1.2;
      } else if (e.type == "Local Zone") {
        return 0.8;
      } else if (e.type == "PoP") {
        return 0.7;
      } else return 0;
    })
    .labelText((e) => {
      if (e.type == "Region") {
        return isLongName ? e.longName : e.name;
      } else if (e.type == "Local Zone") {
        return isLongName ? e.longName : e.name;
      } else if (e.type == "PoP") {
        return isLongName ? e.longName : e.name;
      } else return "";
    })
    .labelResolution(6)
    .labelAltitude((e) => {
      if (e.type == "Region") {
        return 0.02;
      } else if (e.type == "Local Zone") {
        return 0.01;
      } else if (e.type == "PoP") {
        return 0.005;
      } else return 0;
    })
    .labelDotOrientation((e) => {
      if (e.type == "Region") {
        return "right";
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
      } else if (e.type == "PoP") {
        return "#337aff"
      } else return "#ff6633";
    })
    .pointsMerge(true)
    .pointAltitude(0)
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
    .objectLat('lat')
    .objectLng('lng')
    .objectAltitude('alt')
    .objectFacesSurface(false)
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
    e.type === "Region" || (showLocalZones && e.type === "Local Zone") || (showPoPs && e.type === "PoP"));


  // NOTE Arc animations are followed after the globe enters the scene
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
      } else if (e.type == "PoP") {
        return "#337aff"
      } else return "#ff6633";
    })
    .labelDotRadius((e) => {
      if (e.type == "Region") {
        return 1;
      } else if (e.type == "Local Zone") {
        return 0.5;
      } else if (e.type == "PoP") {
        return 0.4;
      } else return 0;
    })
    .labelSize((e) => {
      if (e.type == "Region") {
        return 1.2;
      } else if (e.type == "Local Zone") {
        return 0.8;
      } else if (e.type == "PoP") {
        return 0.7;
      } else return 0;
    })
    .labelText((e) => {
      if (e.type == "Region") {
        return isLongName ? e.longName : e.name;
      } else if (e.type == "Local Zone") {
        return isLongName ? e.longName : e.name;
      } else if (e.type == "PoP") {
        return isLongName ? e.longName : e.name;
      } else return "";
    })
    .labelResolution(6)
    .labelAltitude((e) => {
      if (e.type == "Region") {
        return 0.02;
      } else if (e.type == "Local Zone") {
        return 0.01;
      } else if (e.type == "PoP") {
        return 0.005;
      } else return 0;
    })
    .labelDotOrientation((e) => {
      if (e.type == "Region") {
        return "right";
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
      } else if (e.type == "PoP") {
        return "#337aff"
      } else return "#ff6633";
    })
    .pointsMerge(true)
    .pointAltitude((e) => { return 0 })
    .pointRadius(0.05);



  const EARTH_RADIUS_KM = 6371; // km
  const SAT_SIZE = 80; // km
  const TIME_STEP = 0.5 * 1000; // per frame

  const satGeometry = new OctahedronGeometry(SAT_SIZE * 100 / EARTH_RADIUS_KM / 2, 0);
  const satMaterial = new MeshLambertMaterial({ color: 'palegreen', transparent: true, opacity: 0.3 });
  Globe.objectThreeObject(() => new Mesh(satGeometry, satMaterial));



  const tleData = satelitesData.replace(/\r/g, '').split(/\n(?=[^12])/).map(tle => tle.split('\n'));
  const satData = tleData.map(([name, ...tle]) => ({
    satrec: satellite.twoline2satrec(...tle),
    name: name.trim().replace(/^0 /, '')
  }));

  // time ticker
  let time = new Date();
  (function frameTicker() {
    requestAnimationFrame(frameTicker);

    time = new Date(+time + TIME_STEP);

    // Update satellite positions
    const gmst = satellite.gstime(time);
    satData.forEach(d => {
      const eci = satellite.propagate(d.satrec, time);
      if (eci.position) {
        const gdPos = satellite.eciToGeodetic(eci.position, gmst);
        d.lat = satellite.radiansToDegrees(gdPos.latitude);
        d.lng = satellite.radiansToDegrees(gdPos.longitude);
        d.alt = 1;
      }
    });

    Globe.objectsData(satData);
  })();

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
