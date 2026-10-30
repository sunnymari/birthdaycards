import * as THREE from './vendor/three.module.min.js';
import { GLTFLoader } from './vendor/loaders/GLTFLoader.js';

// Starbot is a static remesh, not an authored animation rig. Keep its vertex
// positions and normals intact; animate only the complete model's transform.
export async function mountStarbot(host, fallback) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.setClearColor(0x000000, 0);
  host.append(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1.5, 1.5, 2.5, -.5, .1, 30);
  camera.position.set(.10, 1.20, 7);
  const target = new THREE.Vector3(0, 1.08, 0);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xd4bbcc, 1.8));
  const key = new THREE.DirectionalLight(0xfffaf5, 2.4);
  key.position.set(-2.5, 4, 5); scene.add(key);
  const fill = new THREE.DirectionalLight(0xe7ecff, .85);
  fill.position.set(3, 1.5, 3); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffd5e8, 1.5);
  rim.position.set(1, 3, -3); scene.add(rim);
  const pivot = new THREE.Group(); scene.add(pivot);
  let playing = false, frame = 0, elapsed = 0, lastTime = 0, loaded = false, failed = false;
  // A soft contact shadow without the hard disc edge of the previous floor mesh.
  const shadowCanvas = document.createElement('canvas'); shadowCanvas.width = shadowCanvas.height = 128;
  const context = shadowCanvas.getContext('2d');
  const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(112,55,88,.30)'); gradient.addColorStop(.4, 'rgba(112,55,88,.15)'); gradient.addColorStop(1, 'rgba(112,55,88,0)');
  context.fillStyle = gradient; context.fillRect(0, 0, 128, 128);
  const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(2.15, 1.3), new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false, toneMapped: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.set(0, -.025, 0); scene.add(shadow);
  function resize() {
    const width = host.clientWidth, height = host.clientHeight;
    if (!width || !height || failed) return;
    renderer.setSize(width, height, false);
    const aspect = width / height;
    // Fit the complete dance envelope, including hands and antenna, at every size.
    const viewHeight = Math.max(2.65, 2.55 / aspect);
    camera.left = -viewHeight * aspect / 2; camera.right = viewHeight * aspect / 2;
    camera.top = viewHeight / 2; camera.bottom = -viewHeight / 2;
    camera.lookAt(target); camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  }
  const observer = new ResizeObserver(resize); observer.observe(host);
  function pose(t) {
    const beat = t * 4.4;
    const cycle = t % 7.2;
    const flourish = THREE.MathUtils.smoothstep(cycle, 2.0, 2.7) * (1 - THREE.MathUtils.smoothstep(cycle, 4.7, 5.4));
    const bow = THREE.MathUtils.smoothstep(cycle, 5.5, 5.95) * (1 - THREE.MathUtils.smoothstep(cycle, 6.3, 6.9));
    const entrance = Math.min(t / .55, 1);
    const scale = .88 + .12 * (1 - Math.pow(1 - entrance, 3));
    // Uniform scaling and rigid movement preserve the original body and arms.
    pivot.scale.setScalar(scale);
    pivot.position.set(Math.sin(beat / 2) * .12, .055 + (1 - Math.cos(beat * 2)) * .045, 0);
    pivot.rotation.set(bow * .12, Math.sin(beat / 2) * .28 + flourish * Math.sin(beat * 1.2) * .12, Math.sin(beat) * .07);
    shadow.scale.setScalar(1 - pivot.position.y * .8);
  }
  function tick(now) {
    frame = 0;
    if (!playing || !loaded || failed) return;
    if (lastTime) elapsed += Math.min((now - lastTime) / 1000, .05);
    lastTime = now; pose(elapsed); renderer.render(scene, camera);
    frame = requestAnimationFrame(tick);
  }
  function setPlaying(value) {
    playing = value && !failed;
    if (!playing) { cancelAnimationFrame(frame); frame = 0; lastTime = 0; }
    else if (loaded && !frame) frame = requestAnimationFrame(tick);
  }
  try {
    const gltf = await new GLTFLoader().loadAsync(new URL('./starbot.glb', import.meta.url).href);
    const model = gltf.scene;
    const meshes = []; model.traverse(node => { if (node.isMesh) meshes.push(node); });
    for (const node of meshes) {
      for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
        if (material.map) material.map.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        material.envMapIntensity = .6;
      }
    }
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    model.scale.multiplyScalar(1.9 / size.y); box.setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.add(new THREE.Vector3(-center.x, -box.min.y, -center.z));
    pivot.add(model); loaded = true;
    pose(playing ? 0 : .75); resize(); fallback.hidden = true; setPlaying(playing);
  } catch (error) {
    failed = true; observer.disconnect(); renderer.dispose(); renderer.domElement.remove();
    throw error;
  }
  renderer.domElement.addEventListener('webglcontextlost', () => {
    failed = true; setPlaying(false); fallback.hidden = false; renderer.domElement.hidden = true;
  });
  function replayDance() {
    elapsed = 0; lastTime = 0;
    if (loaded) { pose(playing ? 0 : .75); renderer.render(scene, camera); }
  }
  return { setPlaying, replayDance };
}
