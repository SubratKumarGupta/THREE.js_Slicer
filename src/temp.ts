// ---
// import Layout from "../layouts/Layout.astro";
// ---

// <Layout title="Welcome to Astro.">
//   <main class="relative text-white">
//     <div
//       class="pointer-events-none"
//       style="position:absolute;font-family:monospace;transform:translate(-50%, -50%);left:50%;top:2.5%;"
//     >
//       Mesh Slicer - C to cut , V to view , T transform
//       <div class="-pt-2">
//         MODE:<span id="mode" class="text-blue-600"></span>
//       </div>
//     </div>

//     <svg
//       class="pointer-events-none"
//       id="lineVisualizer"
//       width="100%"
//       height="100%"
//       style="position:absolute"
//     >
//     </svg>
//     <canvas class="100% ,100%" id="slicer_canvas"></canvas>
//   </main>
// </Layout>

// <script>
//   import {
//     Scene,
//     PerspectiveCamera,
//     WebGLRenderer,
//     BoxGeometry,
//     MeshBasicMaterial,
//     Mesh,
//     AmbientLight,
//     GridHelper,
//     Vector2,
//     DoubleSide,
//     Vector3,
//   } from "three";
//   import * as THREE from "three";
//   import { TransformControls } from "three/examples/jsm/controls/TransformControls";
//   import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
//   import { Brush, Evaluator, SUBTRACTION } from "three-bvh-csg";
//   import { InteractionManager } from "three.interactive";
//   const scene = new Scene();
//   const renderer = new WebGLRenderer({
//     alpha: true,
//     antialias: true,
//     canvas: document.getElementById("slicer_canvas") as HTMLCanvasElement,
//   });
//   renderer.setSize(window.innerWidth, window.innerHeight);
//   renderer.setPixelRatio(window.devicePixelRatio);
//   renderer.setClearColor(0x000000);
//   const camera = new PerspectiveCamera(
//     75,
//     window.innerWidth / window.innerHeight,
//     0.1,
//     1000
//   );
//   camera.lookAt(0, 0, 0);
//   const interactionManager = new InteractionManager(
//     renderer,
//     camera,
//     renderer.domElement
//   );

//   // Add OrbitControls
//   const csgEvaluator = new Evaluator();
//   const controls = new OrbitControls(camera, renderer.domElement);

//   const size = 100;
//   const divisions = 30;
//   const transformHelpers: TransformControls[] = [];

//   const transformHelpersOff = () => {
//     transformHelpers.forEach((transformControls) => {
//       transformControls.showX ? (transformControls.showX = false) : () => {};
//       transformControls.showY ? (transformControls.showY = false) : () => {};
//       transformControls.showZ ? (transformControls.showZ = false) : () => {};
//     });
//   };
//   // const transformHelpersOn = () => {
//   //   transformHelpers.forEach((transformControls) => {
//   //     transformControls.showX ? () => {} : (transformControls.showX = true);
//   //     transformControls.showY ? () => {} : (transformControls.showY = true);
//   //     transformControls.showZ ? () => {} : (transformControls.showZ = true);
//   //   });
//   // };
//   const gridHelper = new GridHelper(size, divisions);
//   scene.add(gridHelper);
//   const translatePointer = (vec2: Vector2) => {
//     // calculate pointer position in normalized device coordinates
//     // (-1 to +1) for both components
//     const pointer = new Vector2();
//     pointer.x = (vec2.x / window.innerWidth) * 2 - 1;
//     pointer.y = -(vec2.y / window.innerHeight) * 2 + 1;
//     return pointer;
//   };
//   const addTransformControls = (mesh: Mesh) => {
//     const transformControls = new TransformControls(
//       camera,
//       renderer.domElement
//     );
//     mesh.name ? () => {} : (mesh.name = `${transformHelpers.length}`);
//     transformControls.name = mesh.name;
//     transformControls.attach(mesh);
//     transformHelpers.push(transformControls);
//     scene.add(transformControls);
//     interactionManager.add(mesh);

//     mesh.addEventListener("click", (e) => {
//       if (mode !== "TRANSFORM") return;
//       console.log("top", e.target);
//       const transformControls = transformHelpers.find(
//         (obj) => obj.name === e.target.name
//       );
//       if (transformControls === undefined) {
//         throw Error(`can't find transformControls with name ${e.target.name}`);
//       }
//       transformControls.showX
//         ? (transformControls.showX = false)
//         : (transformControls.showX = true);
//       transformControls.showY
//         ? (transformControls.showY = false)
//         : (transformControls.showY = true);
//       transformControls.showZ
//         ? (transformControls.showZ = false)
//         : (transformControls.showZ = true);
//     });
//   };

//   const geometry = new BoxGeometry(1, 1, 1, 2, 2);
//   const material = new MeshBasicMaterial({ color: 0x00ff00 });
//   const mesh = new Mesh(geometry, material);
//   addTransformControls(mesh);
//   scene.add(mesh);
//   mesh.position.set(0, 0, 0);

//   const thickness = 500;
//   const rotateX: number = 15;
//   const getTopMesh = (mesh: Mesh) => {
//     const planeProxyClip = new BoxGeometry(5, thickness, 5);
//     planeProxyClip.center().translate(0, thickness / 2, 0);
//     planeProxyClip.rotateX(rotateX);

//     const planeProxy = new Brush(
//       planeProxyClip,
//       new MeshBasicMaterial({ color: 0xff0000 })
//     );
//     planeProxy.name = "topClip";
//     const brush2 = new Brush(mesh.geometry);
//     // scene.add(planeProxy);
//     // addTransformControls(planeProxy);

//     const result = csgEvaluator.evaluate(brush2, planeProxy, SUBTRACTION);
//     result.material = mesh.material;
//     return result;
//   };
//   const getBottomMesh = (mesh: Mesh) => {
//     const planeProxyClip = new BoxGeometry(5, thickness, 5);
//     planeProxyClip.center().translate(0, -(thickness / 2), 0);
//     planeProxyClip.rotateX(rotateX);

//     const planeProxy = new Brush(
//       planeProxyClip,
//       new MeshBasicMaterial({ color: 0xff0000 })
//     );
//     planeProxy.name = "BottomClip";
//     const brush2 = new Brush(mesh.geometry);
//     // scene.add(planeProxy);
//     // addTransformControls(planeProxy);

//     const result = csgEvaluator.evaluate(brush2, planeProxy, SUBTRACTION);
//     result.material = mesh.material;
//     return result;
//   };
//   const topMesh = getTopMesh(mesh);
//   const bottomMesh = getBottomMesh(mesh);

//   topMesh.translateY(2);
//   bottomMesh.translateY(2);

//   addTransformControls(bottomMesh);
//   addTransformControls(topMesh);
//   scene.add(bottomMesh);
//   scene.add(topMesh);

//   // mesh.rota
//   console.log(scene);
//   const ambientLight = new AmbientLight(0xffffff, 5);
//   scene.add(ambientLight);
//   camera.position.set(
//     -5.995905848476253,
//     0.5128365591830274,
//     -3.3196737473194697
//   );

//   const point1 = new Vector2();
//   const point2 = new Vector2();
//   document.onmousedown = (e) => {
//     if (mode !== "CUT") return;
//     if (point1.length() === 0) {
//       point1.x = e.clientX;
//       point1.y = e.clientY;
//     } else {
//       point2.x = e.clientX;
//       point2.y = e.clientY;
//       const raycaster1 = new THREE.Raycaster();
//       const raycaster2 = new THREE.Raycaster();

//       raycaster1.setFromCamera(translatePointer(point1), camera);
//       raycaster2.setFromCamera(translatePointer(point2), camera);
//       const rayPos1 = camera.position.clone().add(raycaster1.ray.direction);
//       const rayPos2 = camera.position.clone().add(raycaster2.ray.direction);
//       const rayOrigin1 = camera.position
//         .clone()
//         .add(
//           raycaster1.ray.direction
//             .clone()
//             .multiplyScalar(camera.position.length())
//         );
//       const rayOrigin2 = camera.position
//         .clone()
//         .add(
//           raycaster2.ray.direction
//             .clone()
//             .multiplyScalar(camera.position.length())
//         );
//       const rayDir1 = rayPos2.clone().sub(rayPos1).normalize();
//       const rayDir2 = camera.getWorldDirection(new THREE.Vector3());
//       raycaster1.setFromCamera(
//         translatePointer(point1.clone().add(point2).multiplyScalar(0.5)),
//         camera
//       );

//       console.time();
//       let ray1Hits = raycaster1.intersectObjects(scene.children); //[0];.point;
//       let ray2Hits = raycaster2.intersectObjects(scene.children); //[0].point;
//       console.timeEnd();
//       if (ray2Hits[0] === undefined || ray1Hits[0] === undefined) return;
//       let ray1Hit = ray1Hits[0].point;
//       let ray2Hit = ray2Hits[0].point;

//       if (ray1Hits.length > 0) {
//         ray1Hit = ray1Hits[0].point;
//       } else {
//         ray1Hit = raycaster1.ray.origin
//           .clone()
//           .add(raycaster1.ray.direction.clone().multiplyScalar(1000));
//       }
//       if (ray2Hits.length > 0) {
//         ray2Hit = ray2Hits[0].point;
//       } else {
//         ray2Hit = raycaster2.ray.origin
//           .clone()
//           .add(raycaster2.ray.direction.clone().multiplyScalar(1000));
//       }

//       const centroid = ((p1: Vector3, p2: Vector3) => {
//         return p1.clone().add(p2).multiplyScalar(0.5);
//       })(rayDir1, rayDir2);

//       const slicerPlane = new THREE.Plane().setFromCoplanarPoints(
//         ray1Hit,
//         ray2Hit,
//         centroid.add(camera.position.clone().sub(centroid).normalize())
//       );
//       console.log(
//         rayDir1,
//         rayDir2,
//         centroid.add(camera.position.clone().sub(centroid).normalize())
//       );
//       // Create a basic rectangle geometry
//       // Create a basic rectangle geometry
//       const planeGeometry = new THREE.PlaneGeometry(5, 5);

//   // Align the geometry to the plane
//   const coplanarPoint = slicerPlane.coplanarPoint(new THREE.Vector3());
//   const focalPoint = new THREE.Vector3()
//     .copy(coplanarPoint)
//     .add(slicerPlane.normal);
//   const slash = new THREE.Mesh(
//     planeGeometry,
//     new MeshBasicMaterial({
//       color: 0x0000ff,
//       side: DoubleSide,
//       // wireframe: true,
//       opacity: 0.5,
//     })
//   );

//   slash.lookAt(focalPoint);
//   // slash.rotateX(Math.PI / 12);
//   slash.position.set(coplanarPoint.x, coplanarPoint.y, coplanarPoint.z);
//   slash.name = "slace";
//   addTransformControls(slash);
//   scene.add(slash);
//   console.log(scene);

//       point1.x = 0;
//       point1.y = 0;
//       point2.x = 0;
//       point2.y = 0;
//       // (document.getElementById("lineVisualizer") as HTMLElement).innerHTML = "";
//     }
//   };

//   let mode: "TRANSFORM" | "VIEW" | "CUT" = "VIEW";
//   const displayMode = document.getElementById("mode") as HTMLSpanElement;
//   transformHelpersOff();
//   displayMode.innerText = mode;
//   document.onkeydown = (e) => {
//     const key = e.code;
//     console.log(key, "a");
//     switch (key) {
//       case "KeyT":
//         mode = "TRANSFORM";
//         transformHelpersOff();
//         controls.enabled = false;
//         break;
//       case "KeyV":
//         mode = "VIEW";
//         transformHelpersOff();
//         controls.enabled = true;
//         break;
//       case "KeyC":
//         mode = "CUT";
//         transformHelpersOff();
//         controls.enabled = false;
//         break;
//       default:
//         break;
//     }
//     console.log(camera.position);
//     displayMode.innerText = mode;
//   };

//   document.onmousemove = (e) => {
//     if (point1.length() > 0) {
//       (document.getElementById("lineVisualizer") as HTMLElement).innerHTML = `
//         <line x1="${point1.x}" y1="${point1.y}" x2="${e.clientX}" y2="${e.clientY}" style="stroke:rgb(255,0,0);stroke-width:1" />
//       `;
//     }
//   };
//   function animate() {
//     requestAnimationFrame(animate);

//     controls.update();

//     // Perform any necessary updates to the scene or objects
//     // ...
//     renderer.render(scene, camera);
//   }
//   animate();

//   // Function to handle window resize

//   function handleResize() {
//     // Update renderer dimensions
//     const width = window.innerWidth;
//     const height = window.innerHeight;
//     renderer.setSize(width, height);
//     interactionManager.update();

//     // Update camera aspect ratio
//     camera.aspect = width / height;
//     camera.updateProjectionMatrix();
//   }

//   // Add event listener for window resize
//   window.addEventListener("resize", handleResize);

//   // Call handleResize initially to set initial dimensions
//   handleResize();
// </script>

// <style>
//   #lineVisualizer {
//     /* pointer-events: none; */
//   }
//   body {
//     background: linear-gradient(#e4e0ba, #f7d9aa);
//     margin: 0px;
//   }
// </style>
