import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  BoxGeometry,
  MeshBasicMaterial,
  Mesh,
  AmbientLight,
  GridHelper,
  Vector2,
  DoubleSide,
  Vector3,
  Plane,
  Box3,
} from "three";
import * as THREE from "three";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Brush, Evaluator, SUBTRACTION } from "three-bvh-csg";
import { InteractionManager } from "three.interactive";

const scene = new Scene();
const renderer = new WebGLRenderer({
  alpha: true,
  antialias: true,
  canvas: document.getElementById("slicer_canvas") as HTMLCanvasElement,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x000000);
const camera = new PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.lookAt(0, 0, 0);
camera.position.set(7.768773050774172, 6.32921584068296, 4.301236421690618);
const interactionManager = new InteractionManager(
  renderer,
  camera,
  renderer.domElement
);
let staterMesh = new THREE.Mesh(
  new THREE.BoxGeometry(3, 3, 3, 2, 2),
  new THREE.MeshStandardMaterial({
    color: 0x101010, // Base color of the material
    roughness: 0.2, // Specifies the surface roughness (0: smooth, 1: rough)
  })
) as any;

const gltfLoader = new GLTFLoader();
// Add OrbitControls
const csgEvaluator = new Evaluator();
const controls = new OrbitControls(camera, renderer.domElement);
const transformHelpers: TransformControls[] = [];

// lodaing diffrent models
const monkeyBtn = document.getElementById("monkey") as HTMLSpanElement;
const knotBtn = document.getElementById("knot") as HTMLSpanElement;
const cubeBtn = document.getElementById("cube") as HTMLSpanElement;
monkeyBtn.addEventListener("click", () => {
  gltfLoader.load(
    "/suzanne_skin_material_test.glb",
    function (gltf) {
      const obj = gltf.scene.children[0]!;
      staterMesh = obj.children[0]?.children[1]?.children[0] as any;
      staterMesh.geometry.scale(2, 2, 2);
      staterMesh.geometry.rotateX(-90);
      scene.clear();
      initScene(staterMesh, true);
    },
    (e) => {
      console.log(e);
    },
    function (error) {
      console.error(error);
    }
  );
});
knotBtn.addEventListener("click", () => {
  staterMesh = new THREE.Mesh(
    new THREE.TorusKnotGeometry(3, 1, 100, 16),
    new THREE.MeshStandardMaterial({
      color: 0x101010, // Base color of the material
      metalness: 0.1, // Specifies the metallic behavior (0: non-metallic, 1: fully metallic)
      roughness: 0.4, // Specifies the surface roughness (0: smooth, 1: rough)
    })
  );
  scene.clear();
  initScene(staterMesh);
});
cubeBtn.addEventListener("click", () => {
  staterMesh = new THREE.Mesh(
    new THREE.BoxGeometry(3, 3, 3, 2, 2),
    new THREE.MeshStandardMaterial({
      color: 0x101010, // Base color of the material
      roughness: 0.2, // Specifies the surface roughness (0: smooth, 1: rough)
    })
  ) as any;
  scene.clear();
  initScene(staterMesh);
});

// transformControls utils
const transformHelpersOff = () => {
  transformHelpers.forEach((transformControls) => {
    transformControls.showX ? (transformControls.showX = false) : () => {};
    transformControls.showY ? (transformControls.showY = false) : () => {};
    transformControls.showZ ? (transformControls.showZ = false) : () => {};
  });
};
const translatePointer = (vec2: Vector2) => {
  // calculate pointer position in normalized device coordinates
  // (-1 to +1) for both components
  const pointer = new Vector2();
  pointer.x = (vec2.x / window.innerWidth) * 2 - 1;
  pointer.y = -(vec2.y / window.innerHeight) * 2 + 1;
  return pointer;
};
const addTransformControls = (mesh: Mesh) => {
  const transformControls = new TransformControls(camera, renderer.domElement);
  mesh.name ? () => {} : (mesh.name = `${transformHelpers.length}`);
  transformControls.name = mesh.name;
  // transformControls.mode = "rotate";
  mesh.userData = { type: "Mesh" };
  transformControls.userData = { type: "transformControls" };
  transformControls.attach(mesh);
  transformHelpers.push(transformControls);
  scene.add(transformControls);

  interactionManager.add(mesh);

  mesh.addEventListener("click", (e) => {
    e.stopPropagation();
    if (mode !== "TRANSFORM") return;

    const transformControls = transformHelpers.find(
      (obj) => obj.name === e.target.name
    );
    if (transformControls === undefined) {
      throw Error(`can't find transformControls with name ${e.target.name}`);
    }

    transformControls.showX
      ? (transformControls.showX = false)
      : (transformControls.showX = true);
    transformControls.showY
      ? (transformControls.showY = false)
      : (transformControls.showY = true);
    transformControls.showZ
      ? (transformControls.showZ = false)
      : (transformControls.showZ = true);
  });
};
// create scene
const initScene = (staterMesh: Mesh, ismonkey: boolean = false) => {
  const size = 100;
  const divisions = 30;
  const gridHelper = new GridHelper(size, divisions);
  scene.add(gridHelper);

  addTransformControls(staterMesh);
  scene.add(staterMesh);

  staterMesh.position.set(0, 0, 0);
  const ambientLight = new AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);
  let light: THREE.DirectionalLight;
  if (ismonkey) {
    light = new THREE.DirectionalLight(0xffffff, 0.5);
  } else {
    light = new THREE.DirectionalLight(0xffffff, 3);
  }
  light.position.set(1, 10, 1).normalize();
  scene.add(light);

  transformHelpersOff();
};
initScene(staterMesh);
const resetButtom = document.getElementById("reset-btn") as HTMLSpanElement;
resetButtom.addEventListener("click", () => {
  scene.clear();
  initScene(staterMesh);
});

// spliting utils
const getTopMesh = (mesh: Mesh, plane: Plane) => {
  if (!new Box3().setFromObject(mesh, true).intersectsPlane(plane)) {
    return;
  }
  const planeProxyClip = new THREE.BoxGeometry(1000, 1000, 1000);
  planeProxyClip.translate(0, 0, 499.99 - plane.constant);
  planeProxyClip.lookAt(plane.normal);

  const planeProxy = new Brush(
    planeProxyClip,
    new MeshBasicMaterial({ color: 0xff0000 })
  );

  planeProxy.name = "topClip";
  const brush2 = new Brush(mesh.geometry);
  // scene.add(planeProxy);
  // addTransformControls(planeProxy);

  const result = csgEvaluator.evaluate(brush2, planeProxy, SUBTRACTION);
  // const center = new THREE.Vector3();
  // new Box3().setFromObject(result).getCenter(center);
  // result.geometry.center = center;
  result.material = mesh.material;
  return result;
};
const getBottomMesh = (mesh: Mesh, plane: Plane) => {
  if (!new Box3().setFromObject(mesh, true).intersectsPlane(plane)) {
    return;
  }
  const planeProxyClip = new BoxGeometry(1000, 1000, 1000);
  planeProxyClip.translate(0, 0, 499.99 + plane.constant);
  planeProxyClip.lookAt(plane.normal.clone().multiplyScalar(-1));

  const planeProxy = new Brush(
    planeProxyClip,
    new MeshBasicMaterial({ color: 0xff0000 })
  );

  planeProxy.name = "BottomClip";
  const brush2 = new Brush(mesh.geometry);

  const result = csgEvaluator.evaluate(brush2, planeProxy, SUBTRACTION);

  result.material = mesh.material;

  return result;
};

// spliting on mouse down
const point1 = new Vector2();
const point2 = new Vector2();

document.onmousedown = (e) => {
  if (mode !== "CUT") return;
  if (point1.length() === 0) {
    point1.x = e.clientX;
    point1.y = e.clientY;
  } else {
    point2.x = e.clientX;
    point2.y = e.clientY;
    const raycaster1 = new THREE.Raycaster();
    const raycaster2 = new THREE.Raycaster();
    raycaster1.setFromCamera(translatePointer(point1), camera);
    raycaster2.setFromCamera(translatePointer(point2), camera);
    const rayPos1 = camera.position.clone().add(raycaster1.ray.direction);
    const rayPos2 = camera.position.clone().add(raycaster2.ray.direction);
    const rayOrigin1 = camera.position
      .clone()
      .add(
        raycaster1.ray.direction
          .clone()
          .multiplyScalar(camera.position.length())
      );
    const rayOrigin2 = camera.position
      .clone()
      .add(
        raycaster2.ray.direction
          .clone()
          .multiplyScalar(camera.position.length())
      );
    const rayDir1 = rayPos2.clone().sub(rayPos1).normalize();
    const rayDir2 = camera.getWorldDirection(new Vector3());
    raycaster1.setFromCamera(
      translatePointer(point1.clone().add(point2).multiplyScalar(0.5)),
      camera
    );

    const centroid = ((p1: Vector3, p2: Vector3) => {
      return p1.clone().add(p2).multiplyScalar(0.5);
    })(rayDir1, rayDir2);

    const slicerPlane = new Plane().setFromCoplanarPoints(
      rayOrigin1,
      rayOrigin2,
      centroid.add(camera.position.clone().sub(centroid))
    );

    // Create a basic rectangle geometry
    const planeGeometry = new THREE.PlaneGeometry(5, 5);

    // Align the geometry to the plane
    const coplanarPoint = slicerPlane.coplanarPoint(new THREE.Vector3());
    const focalPoint = new THREE.Vector3()
      .copy(coplanarPoint)
      .add(slicerPlane.normal);

    const slash = new THREE.Mesh(
      planeGeometry,
      new MeshBasicMaterial({
        color: 0x0000ff,
        side: DoubleSide,
        // wireframe: true,
        opacity: 0.5,
      })
    );

    slash.lookAt(focalPoint);
    // slash.rotateX(Math.PI / 12);
    slash.position.set(coplanarPoint.x, coplanarPoint.y, coplanarPoint.z);
    slash.name = "slace";
    // addTransformControls(slash);

    // scene.add(slash);
    const allMeshes = scene.children.filter(
      (obj) => obj.userData && obj.userData.type === "Mesh"
    ) as Mesh[];

    (() => {
      const sepration = 0.01;

      allMeshes.forEach((mesh) => {
        const topMesh = getTopMesh(mesh, slicerPlane);
        const bottomMesh = getBottomMesh(mesh, slicerPlane);
        if (topMesh === undefined || bottomMesh == undefined) return;
        addTransformControls(bottomMesh);
        addTransformControls(topMesh);
        topMesh.translateOnAxis(slicerPlane.normal, -(sepration / 2));
        bottomMesh.translateOnAxis(slicerPlane.normal, sepration / 2);
        scene.remove(mesh);
        const transformControls = transformHelpers.find(
          (obj) => obj.name === mesh.name
        );
        try {
          transformControls!.detach();
          scene.remove(transformControls!);
        } catch (error) {
          console.log(error);
        }

        scene.add(bottomMesh);
        scene.add(topMesh);
      });
    })();

    point1.x = 0;
    point1.y = 0;
    point2.x = 0;
    point2.y = 0;
    (document.getElementById("lineVisualizer") as HTMLElement).innerHTML = "";
    mode = "VIEW";
    transformHelpersOff();
    controls.enabled = true;
    displayMode.innerText = mode;
  }
};

// mode controler
let mode: "TRANSFORM" | "VIEW" | "CUT" = "VIEW";

const displayMode = document.getElementById("mode") as HTMLSpanElement;

displayMode.innerText = mode;
document.onkeydown = (e) => {
  const key = e.code;

  switch (key) {
    case "KeyT":
      mode = "TRANSFORM";
      transformHelpersOff();
      controls.enabled = false;
      break;
    case "KeyV":
      mode = "VIEW";
      transformHelpersOff();
      controls.enabled = true;
      break;
    case "KeyC":
      mode = "CUT";
      transformHelpersOff();
      controls.enabled = false;
      break;
    default:
      break;
  }
  displayMode.innerText = mode;
};

// line helper
document.onmousemove = (e) => {
  if (point1.length() > 0) {
    (document.getElementById("lineVisualizer") as HTMLElement).innerHTML = `
        <line x1="${point1.x}" y1="${point1.y}" x2="${e.clientX}" y2="${e.clientY}" style="stroke:rgb(255,0,0);stroke-width:1" />
      `;
  }
};

function animate() {
  requestAnimationFrame(animate);

  renderer.render(scene, camera);

  controls.update();
}
animate();

// Function to handle window resize

function handleResize() {
  // Update renderer dimensions
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  interactionManager.update();

  // Update camera aspect ratio
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

// Add event listener for window resize
window.addEventListener("resize", handleResize);

// Call handleResize initially to set initial dimensions
handleResize();
