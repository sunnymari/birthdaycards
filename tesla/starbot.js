import * as THREE from './vendor/three.module.min.js';
import { GLTFLoader } from './vendor/loaders/GLTFLoader.js';

export async function mountStarbot(host, fallback) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  host.append(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, .1, 40);
  camera.position.set(.12, 1.4, 4.7);
  camera.lookAt(0, 1.05, 0);
  scene.add(new THREE.HemisphereLight(0xfffaf3, 0xc386a3, 2.6));
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(2, 4, 4); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffbdd5, 2);
  rim.position.set(-3, 2, -2); scene.add(rim);
  const pivot = new THREE.Group(); scene.add(pivot);
  let playing = false, frame = 0, elapsed = 0, lastTime = 0, loaded = false;
  const armParts = [];
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(.85, 64), new THREE.MeshBasicMaterial({color: 0xb37491, transparent: true, opacity: .12, depthWrite:false}));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = .015; scene.add(shadow);
  function resize() {
    const width = host.clientWidth, height = host.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.z = camera.aspect < 1 ? 5.1 : 4.5;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  }
  const observer = new ResizeObserver(resize); observer.observe(host);
  function pose(t) {
    pivot.position.y = .07 + Math.abs(Math.sin(t * 3.8)) * .14;
    pivot.position.x = Math.sin(t * 1.9) * .09;
    pivot.rotation.z = Math.sin(t * 3.8) * .09;
    pivot.rotation.y = Math.sin(t * 1.9) * .27;
    shadow.scale.setScalar(1 - (pivot.position.y - .07) * .65);
    // The original remesh is static. Soft shoulder regions give its arms a little wave.
    for (const { position, normal, vertices } of armParts) {
      for (const v of vertices) {
        const angle = v.side * (-.13 + Math.sin(t * 3.8 + (v.side < 0 ? Math.PI : 0)) * .42) * v.weight;
        const c = Math.cos(angle), s = Math.sin(angle);
        const x = v.x - v.side * .25, y = v.y + .07;
        position.setXYZ(v.i, x * c - y * s + v.side * .25, x * s + y * c - .07, v.z);
        if (normal) normal.setXYZ(v.i, v.nx * c - v.ny * s, v.nx * s + v.ny * c, v.nz);
      }
      position.needsUpdate = true;
      if (normal) normal.needsUpdate = true;
    }
  }
  function tick(now) {
    frame = 0;
    if (!playing || !loaded) return;
    if (lastTime) elapsed += Math.min((now - lastTime) / 1000, .05);
    lastTime = now;
    pose(elapsed);
    renderer.render(scene, camera);
    frame = requestAnimationFrame(tick);
  }
  function setPlaying(value) {
    playing = value;
    if (!playing) { cancelAnimationFrame(frame); frame = 0; lastTime = 0; }
    else if (loaded && !frame) frame = requestAnimationFrame(tick);
  }
  try {
    const gltf = await new GLTFLoader().loadAsync(new URL('./starbot.glb', import.meta.url).href);
    const model = gltf.scene;
    model.traverse(node => {
      if (!node.isMesh) return;
      node.frustumCulled = false;
      const position = node.geometry.attributes.position, normal = node.geometry.attributes.normal;
      const vertices = [];
      for (let i = 0; i < position.count; i++) {
        const x = position.getX(i), y = position.getY(i), z = position.getZ(i);
        if (Math.abs(x) > .27 && y > -.28 && y < .14) {
          const weight = THREE.MathUtils.smoothstep(Math.abs(x), .27, .48);
          vertices.push({i,x,y,z,side:Math.sign(x),weight,nx:normal?.getX(i) || 0,ny:normal?.getY(i) || 0,nz:normal?.getZ(i) || 0});
        }
      }
      armParts.push({ position, normal, vertices });
    });
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    model.scale.multiplyScalar(1.9 / size.y);
    box.setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.add(new THREE.Vector3(-center.x, -box.min.y, -center.z));
    pivot.add(model);
    loaded = true;
    pose(0); resize(); fallback.hidden = true;
    setPlaying(playing);
  } catch (error) {
    observer.disconnect(); renderer.dispose(); renderer.domElement.remove();
    throw error;
  }
  renderer.domElement.addEventListener('webglcontextlost', () => { setPlaying(false); fallback.hidden = false; renderer.domElement.hidden = true; });
  return { setPlaying };
}
