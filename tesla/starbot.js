import * as THREE from './vendor/three.module.min.js';
import { GLTFLoader } from './vendor/loaders/GLTFLoader.js';

// The Meshy export is a single static surface. Bind it once to a small dance rig
// with continuous weights, rather than editing bands of vertices every frame.
function rigRobot(source) {
  const geometry = source.geometry.clone();
  const root = new THREE.Bone(); root.name = 'dance_root';
  const bones = [root];
  const add = (name, x, y, z, parent = root) => {
    const bone = new THREE.Bone(); bone.name = name;
    bone.position.set(x, y, z); parent.add(bone); bones.push(bone);
    return { bone, index: bones.length - 1 };
  };
  const head = add('dance_head', 0, .22, 0);
  const limbs = [-1, 1].map(side => {
    const shoulder = add(`shoulder_${side}`, side * .25, -.07, .04);
    const elbow = add(`elbow_${side}`, side * .25, -.02, 0, shoulder.bone);
    const hip = add(`hip_${side}`, side * .12, -.42, .04);
    const knee = add(`knee_${side}`, 0, -.25, 0, hip.bone);
    return { side, shoulder, elbow, hip, knee };
  });
  const positions = geometry.attributes.position;
  const indices = new Uint16Array(positions.count * 4);
  const weights = new Float32Array(positions.count * 4);
  const smooth = THREE.MathUtils.smoothstep;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i), y = positions.getY(i);
    const limb = limbs[x < 0 ? 0 : 1];
    const arm = smooth(Math.abs(x), .23, .39) * smooth(y, -.38, -.22) * (1 - smooth(y, .10, .27));
    const forearm = smooth(Math.abs(x), .43, .58);
    const leg = (1 - smooth(y, -.48, -.35)) * smooth(Math.abs(x), .025, .09);
    const shin = 1 - smooth(y, -.73, -.59);
    const neck = smooth(y, .17, .33);
    const influences = [
      [limb.shoulder.index, arm * (1 - forearm)],
      [limb.elbow.index, arm * forearm],
      [limb.hip.index, leg * (1 - shin)],
      [limb.knee.index, leg * shin],
      [head.index, neck],
    ].filter(([, weight]) => weight > .00001);
    const total = influences.reduce((sum, [, w]) => sum + w, 0);
    influences.push([0, Math.max(0, 1 - total)]);
    influences.sort((a, b) => b[1] - a[1]);
    const top = influences.slice(0, 4);
    const sum = top.reduce((value, [, w]) => value + w, 0) || 1;
    top.forEach(([index, weight], n) => {
      indices[i * 4 + n] = index; weights[i * 4 + n] = weight / sum;
    });
  }
  geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(indices, 4));
  geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(weights, 4));
  const mesh = new THREE.SkinnedMesh(geometry, source.material);
  mesh.name = source.name;
  mesh.position.copy(source.position); mesh.quaternion.copy(source.quaternion); mesh.scale.copy(source.scale);
  mesh.add(root);
  const parent = source.parent; parent.add(mesh); parent.remove(source);
  parent.updateMatrixWorld(true);
  mesh.bind(new THREE.Skeleton(bones));
  mesh.frustumCulled = false;
  return { mesh, head: head.bone, limbs };
}

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
  let rig;
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
    const viewHeight = Math.max(2.45, 2.35 / aspect);
    camera.left = -viewHeight * aspect / 2; camera.right = viewHeight * aspect / 2;
    camera.top = viewHeight / 2; camera.bottom = -viewHeight / 2;
    camera.lookAt(target); camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  }
  const observer = new ResizeObserver(resize); observer.observe(host);
  function pose(t) {
    const beat = t * 3.2;
    pivot.position.set(Math.sin(beat / 2) * .07, .045 + (1 - Math.cos(beat * 2)) * .035, 0);
    pivot.rotation.set(0, Math.sin(beat / 2) * .16, Math.sin(beat) * .055);
    shadow.scale.setScalar(1 - pivot.position.y * .7);
    if (!rig) return;
    rig.head.rotation.set(0, Math.sin(beat / 2) * -.07, Math.sin(beat) * -.025);
    for (const {side, shoulder, elbow, hip, knee} of rig.limbs) {
      const phase = beat + (side < 0 ? Math.PI : 0);
      shoulder.bone.rotation.z = side * (-.22 + Math.sin(phase) * .20);
      shoulder.bone.rotation.y = Math.cos(phase) * .06;
      elbow.bone.rotation.z = side * (-.10 + Math.cos(phase) * .10);
      hip.bone.rotation.x = Math.sin(phase) * .08;
      knee.bone.rotation.x = Math.max(0, Math.sin(phase)) * .13;
    }
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
      rig = rigRobot(node);
    }
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    model.scale.multiplyScalar(1.9 / size.y); box.setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.add(new THREE.Vector3(-center.x, -box.min.y, -center.z));
    pivot.add(model); loaded = true;
    pose(0); resize(); fallback.hidden = true; setPlaying(playing);
  } catch (error) {
    failed = true; observer.disconnect(); renderer.dispose(); renderer.domElement.remove();
    throw error;
  }
  renderer.domElement.addEventListener('webglcontextlost', () => {
    failed = true; setPlaying(false); fallback.hidden = false; renderer.domElement.hidden = true;
  });
  return { setPlaying };
}
