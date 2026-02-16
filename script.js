console.clear();

/* SETUP */
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  5000
);
camera.position.z = 500;

const renderer = new THREE.WebGLRenderer({
  powerPreference: "high-performance",
  antialias: false
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

/* CONTROLS */
const controlsWebGL = new THREE.OrbitControls(camera, renderer.domElement);
controlsWebGL.enableDamping = true;
controlsWebGL.dampingFactor = 0.05;

/* PARTICLES */
const tl = gsap.timeline({
  repeat: -1,
  yoyo: true
});

const paths = document.querySelectorAll("path");
const vertices = [];
const colors = [];

paths.forEach(path => {
  const colorHex = path.getAttribute("data-color") || "ffffff";
  const type = path.getAttribute("data-type");
  const colorObj = new THREE.Color("#" + colorHex);
  
  const length = path.getTotalLength();

  // Tối ưu: Dùng 0.08 cho chữ để cân bằng giữa độ nét và hiệu năng
  const step = type === "text" ? 0.1 : 0.2; 

  for (let i = 0; i < length; i += step) { 
    const point = path.getPointAtLength(i);
    const vector = new THREE.Vector3(point.x, -point.y, 0);
    if (type === "text") {
      vector.x += 36;   // kéo chữ sang trái (đổi số để căn giữa)
      vector.y -= 145;   // vì y đang bị đảo dấu (-point.y), muốn chữ xuống thì dùng số âm
    }
    const randSpread = type === "text" ? 5 : 30;
    
    vector.x += (Math.random() - 0.5) * randSpread;
    vector.y += (Math.random() - 0.5) * randSpread;
    vector.z += (Math.random() - 0.5) * randSpread;
    
    vertices.push(vector);
    colors.push(colorObj.r, colorObj.g, colorObj.b);

    tl.from(vector, {
        x: 600 / 2, 
        y: -552 / 2, 
        z: 0, 
        ease: "power2.inOut",
        duration: "random(2, 5)"
      },
      i * 0.002
    );
  }
});

const geometry = new THREE.BufferGeometry().setFromPoints(vertices);
geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

const material = new THREE.PointsMaterial({ 
    size: 3, // Hạt to hơn để chữ rõ nét
    vertexColors: true, 
    blending: THREE.AdditiveBlending,
    depthWrite: false
});

const particles = new THREE.Points(geometry, material);

particles.position.x -= 600 / 2;
particles.position.y += 552 / 2;

scene.add(particles);

gsap.fromTo(scene.rotation, {
  y: -0.2
}, {
  y: 0.2,
  repeat: -1,
  yoyo: true,
  ease: 'power2.inOut',
  duration: 3
});

/* RENDERING */
function render() {
  requestAnimationFrame(render);
  controlsWebGL.update();
  geometry.setFromPoints(vertices); 
  renderer.render(scene, camera);
}

/* EVENTS */
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", onWindowResize, false);

requestAnimationFrame(render);