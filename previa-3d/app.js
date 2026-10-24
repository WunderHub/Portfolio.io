// Prévia 3D da WunderHub: milhares de partículas que formam o W,
// viram um globo (ser encontrado), um site no celular (ser escolhido)
// e voltam ao W (ser chamado), conforme a rolagem.
import * as THREE from './vendor/three.module.min.js';

const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const small = matchMedia('(max-width: 760px)');
const loaderN = document.querySelector('[data-loader-n]');
const loaderBar = document.querySelector('[data-loader-bar]');

/* ---------- Texto: palavras do título e títulos que se decifram ---------- */
function splitWords(el) {
  const words = el.textContent.trim().split(/\s+/);
  el.textContent = '';
  words.forEach((w, i) => {
    const o = document.createElement('span');
    o.className = 'w';
    const inner = document.createElement('i');
    inner.textContent = w;
    inner.style.transitionDelay = `${0.15 + i * 0.06}s`;
    o.append(inner);
    el.append(o, document.createTextNode(' '));
  });
}
document.querySelectorAll('[data-words]').forEach(splitWords);

const GLYPHS = 'ABCDEFGHJKLMNPRSTUVWXZ0123456789#%&*+=/<>';
function scramble(el) {
  const final = el.dataset.final || (el.dataset.final = el.textContent);
  if (reduce.matches) { el.textContent = final; return; }
  const dur = 900, start = performance.now();
  const step = (now) => {
    const t = Math.min(1, (now - start) / dur);
    const solved = Math.floor(t * final.length);
    let out = '';
    for (let i = 0; i < final.length; i++) {
      const c = final[i];
      out += i < solved || c === ' ' || c === ',' || c === '.' ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0];
    }
    el.textContent = out;
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) { scramble(e.target); io.unobserve(e.target); } });
}, { threshold: 0.6 });
document.querySelectorAll('[data-scramble]').forEach((el) => io.observe(el));

/* ---------- Carregador ---------- */
let shown = 0;
function setLoad(p) {
  shown = p;
  loaderN.textContent = String(Math.round(p * 100)).padStart(3, '0');
  loaderBar.style.transform = `scaleX(${p})`;
}
function finishLoad() {
  return new Promise((resolve) => {
    if (reduce.matches) { setLoad(1); resolve(); return; }
    const from = shown, start = performance.now(), dur = 700;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur);
      setLoad(from + (1 - from) * (1 - Math.pow(1 - t, 3)));
      t < 1 ? requestAnimationFrame(tick) : resolve();
    };
    requestAnimationFrame(tick);
  });
}
function reveal() {
  root.classList.add('loaded');
  requestAnimationFrame(() => root.classList.add('ready'));
}

/* ---------- Formas (amostradas de desenhos em canvas) ---------- */
const W_PATHS = [
  ['M0 0H216L447 337L668 71L992 536H791L628 301L434 536H365Z', '#c9cfd6'],
  ['M575 0H681L445 289L394 216Z', '#e3121c'],
  ['M1009 0H1205L904 359L815 232Z', '#e3121c'],
];

// Desenha num canvas e sorteia n pontos; a opacidade do pixel é a chance de ele ser escolhido.
function sampleCanvas(w, h, draw, n, worldW, depth) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d', { willReadFrequently: true });
  draw(g);
  const d = g.getImageData(0, 0, w, h).data;
  const pos = new Float32Array(n * 3), red = new Float32Array(n);
  const k = worldW / w;
  let i = 0, guard = 0;
  while (i < n && guard < n * 400) {
    guard++;
    const x = Math.random() * w, y = Math.random() * h;
    const p = ((y | 0) * w + (x | 0)) * 4;
    const a = d[p + 3] / 255;
    if (a === 0 || Math.random() > a) continue;
    pos[i * 3] = (x - w / 2) * k;
    pos[i * 3 + 1] = -(y - h / 2) * k;
    pos[i * 3 + 2] = (Math.random() - 0.5) * depth * (0.4 + a * 0.6);
    red[i] = d[p] > 150 && d[p + 1] < 90 ? 1 : 0;
    i++;
  }
  return { pos, red };
}

function shapeW(n, width) {
  return sampleCanvas(1205 / 2, 536 / 2, (g) => {
    g.scale(0.5, 0.5);
    W_PATHS.forEach(([d, f]) => { g.fillStyle = f; g.fill(new Path2D(d)); });
  }, n, width, 0.7);
}

function shapeGlobe(n, r) {
  const pos = new Float32Array(n * 3), red = new Float32Array(n);
  const cities = Array.from({ length: 14 }, () => {
    const v = new THREE.Vector3().randomDirection();
    return v;
  });
  const ringN = Math.floor(n * 0.14);
  const ga = Math.PI * (3 - Math.sqrt(5));
  const sphereN = n - ringN;
  const v = new THREE.Vector3();
  for (let i = 0; i < sphereN; i++) {
    const y = 1 - (i / (sphereN - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const th = ga * i;
    v.set(Math.cos(th) * rad, y, Math.sin(th) * rad);
    let isRed = 0;
    for (const c of cities) if (v.angleTo(c) < 0.06 + Math.random() * 0.03) { isRed = 1; break; }
    const rr = r * (1 + (isRed ? 0.04 + Math.random() * 0.08 : (Math.random() - 0.5) * 0.02));
    pos.set([v.x * rr, v.y * rr, v.z * rr], i * 3);
    red[i] = isRed;
  }
  // Anel inclinado em volta do globo: as buscas chegando
  for (let i = sphereN; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const rr = r * (1.45 + (Math.random() - 0.5) * 0.08);
    const x = Math.cos(a) * rr, z = Math.sin(a) * rr;
    pos.set([x, z * 0.28 + (Math.random() - 0.5) * 0.03, z * 0.96], i * 3);
    red[i] = Math.sin(a * 9) > 0.75 ? 1 : 0;
  }
  return { pos, red };
}

function shapePhone(n, height) {
  const W = 300, H = 600;
  return sampleCanvas(W, H, (g) => {
    const rr = (x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); };
    // corpo do celular
    g.lineWidth = 7; g.strokeStyle = 'rgba(201,207,214,1)';
    rr(6, 6, W - 12, H - 12, 40); g.stroke();
    g.fillStyle = 'rgba(201,207,214,.05)'; g.fill();
    // barra do topo e logo
    g.fillStyle = 'rgba(201,207,214,1)';
    rr(40, 48, 56, 12, 6); g.fill();
    rr(W - 80, 48, 40, 12, 6); g.fill();
    // imagem de destaque
    g.fillStyle = 'rgba(201,207,214,.32)';
    rr(32, 88, W - 64, 170, 16); g.fill();
    // título
    g.fillStyle = 'rgba(201,207,214,1)';
    rr(32, 284, W - 96, 22, 6); g.fill();
    rr(32, 314, W - 140, 22, 6); g.fill();
    // linhas de texto
    g.fillStyle = 'rgba(201,207,214,.55)';
    for (let i = 0; i < 4; i++) { rr(32, 360 + i * 20, W - 64 - (i % 2) * 50, 8, 4); g.fill(); }
    // botão vermelho
    g.fillStyle = 'rgba(227,18,28,1)';
    rr(32, 462, W - 64, 50, 25); g.fill();
    // indicador inferior
    g.fillStyle = 'rgba(201,207,214,.9)';
    rr(W / 2 - 40, H - 30, 80, 6, 3); g.fill();
  }, n, height * (W / H), 0.35);
}

function shuffleInPlace(shape, n) {
  // Embaralha a ordem para que cada partícula viaje para um lugar novo na troca
  for (let i = n - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    for (let k = 0; k < 3; k++) { const t = shape.pos[i * 3 + k]; shape.pos[i * 3 + k] = shape.pos[j * 3 + k]; shape.pos[j * 3 + k] = t; }
    const t = shape.red[i]; shape.red[i] = shape.red[j]; shape.red[j] = t;
  }
  return shape;
}

/* ---------- Shaders ---------- */
const vert = /* glsl */ `
  attribute vec3 aA; attribute vec3 aB; attribute vec3 aC; attribute vec3 aD;
  attribute vec4 aRed; attribute vec2 aRnd;
  uniform float uProg, uTime, uPix, uSize, uMotion, uScatter, uMouseK, uSpin;
  uniform vec3 uMouse;
  varying vec3 vCol; varying float vA;

  vec3 rotY(vec3 p, float a) { float c = cos(a), s = sin(a); return vec3(c*p.x + s*p.z, p.y, -s*p.x + c*p.z); }

  void main() {
    float seg = floor(clamp(uProg, 0.0, 2.9999));
    float f = uProg - seg;
    // cada partícula sai num tempo um pouco diferente
    float t = clamp(f * 1.7 - aRnd.x * 0.7, 0.0, 1.0);
    t = t * t * (3.0 - 2.0 * t);

    vec3 B = rotY(aB, uSpin);
    vec3 from = aA, to = B; float rf = aRed.x, rt = aRed.y;
    if (seg > 0.5) { from = B; to = aC; rf = aRed.y; rt = aRed.z; }
    if (seg > 1.5) { from = aC; to = aD; rf = aRed.z; rt = aRed.w; }
    vec3 p = mix(from, to, t);
    float red = mix(rf, rt, t);

    // no meio da viagem, as partículas espiralam
    float mid = sin(t * 3.14159) * uMotion;
    float ang = aRnd.y * 6.2831 + uTime * 0.6;
    vec3 swirl = vec3(cos(ang), sin(ang * 1.3), sin(ang)) * (0.6 + aRnd.x * 1.6);
    p += swirl * mid;

    // respiração leve quando paradas
    p += uMotion * 0.025 * vec3(
      sin(uTime * 0.9 + p.y * 2.1 + aRnd.y * 6.0),
      cos(uTime * 0.7 + p.x * 1.7 + aRnd.x * 6.0),
      sin(uTime * 0.8 + p.x * 1.3));
    p += uScatter * (vec3(aRnd.x, aRnd.y, fract(aRnd.x * 7.0)) - 0.5) * 0.6;

    // o ponteiro afasta as partículas
    vec2 d = p.xy - uMouse.xy;
    float dist = length(d);
    float push = smoothstep(1.15, 0.0, dist) * uMouseK;
    p.xy += normalize(d + 1e-4) * push * 0.5;
    p.z += push * 0.7;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPix * (0.55 + aRnd.y * 0.9) * (10.0 / -mv.z) * (1.0 + mid * 0.6);

    vec3 silver = mix(vec3(0.72, 0.76, 0.82), vec3(1.0, 1.0, 1.0), aRnd.x);
    vec3 col = mix(silver, vec3(0.95, 0.08, 0.12), red);
    // faíscas vermelhas durante a viagem
    col = mix(col, vec3(1.0, 0.18, 0.2), step(0.9, aRnd.y) * mid);
    col += push * vec3(0.9, 0.2, 0.2);
    vCol = col;
    vA = (0.8 + red * 0.4) * (0.75 + 0.25 * sin(uTime * 2.0 + aRnd.y * 40.0) * uMotion);
  }
`;
const frag = /* glsl */ `
  varying vec3 vCol; varying float vA;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float a = smoothstep(0.5, 0.0, d);
    a *= a;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vCol * a * vA, 1.0);
  }
`;

/* ---------- Cena ---------- */
function webglOk() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch { return false; }
}

async function start() {
  setLoad(0.12);
  if (!webglOk()) { await finishLoad(); reveal(); return; }
  root.classList.add('gl-ok');

  const canvas = document.querySelector('[data-gl]');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
  const dpr = Math.min(window.devicePixelRatio || 1, small.matches ? 1.5 : 1.75);
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 10);

  const N = small.matches ? 24000 : 64000;
  await new Promise((r) => setTimeout(r, 0));
  const A = shapeW(N, 7.2); setLoad(0.35);
  const B = shuffleInPlace(shapeGlobe(N, 1.9), N); setLoad(0.55);
  const C = shuffleInPlace(shapePhone(N, 5.2), N); setLoad(0.75);
  const D = shuffleInPlace(shapeW(N, 7.2), N); setLoad(0.85);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(A.pos.slice(), 3));
  geo.setAttribute('aA', new THREE.BufferAttribute(A.pos, 3));
  geo.setAttribute('aB', new THREE.BufferAttribute(B.pos, 3));
  geo.setAttribute('aC', new THREE.BufferAttribute(C.pos, 3));
  geo.setAttribute('aD', new THREE.BufferAttribute(D.pos, 3));
  const red = new Float32Array(N * 4), rnd = new Float32Array(N * 2);
  for (let i = 0; i < N; i++) {
    red.set([A.red[i], B.red[i], C.red[i], D.red[i]], i * 4);
    rnd[i * 2] = Math.random(); rnd[i * 2 + 1] = Math.random();
  }
  geo.setAttribute('aRed', new THREE.BufferAttribute(red, 4));
  geo.setAttribute('aRnd', new THREE.BufferAttribute(rnd, 2));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 20);

  const uniforms = {
    uProg: { value: 0 }, uTime: { value: 0 }, uPix: { value: dpr }, uSize: { value: small.matches ? 3.0 : 2.8 },
    uMotion: { value: reduce.matches ? 0 : 1 }, uScatter: { value: 0 }, uMouse: { value: new THREE.Vector3(99, 99, 0) },
    uMouseK: { value: 0 }, uSpin: { value: 0 },
  };
  const mat = new THREE.ShaderMaterial({
    vertexShader: vert, fragmentShader: frag, uniforms,
    transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
  });
  const group = new THREE.Group();
  group.add(new THREE.Points(geo, mat));
  scene.add(group);

  // Poeira ao fundo: dá profundidade e se move um pouco com o ponteiro e a rolagem
  const DN = small.matches ? 900 : 2200;
  const dpos = new Float32Array(DN * 3);
  for (let i = 0; i < DN; i++) dpos.set([(Math.random() - 0.5) * 30, (Math.random() - 0.5) * 18, -2 - Math.random() * 14], i * 3);
  const dgeo = new THREE.BufferGeometry();
  dgeo.setAttribute('position', new THREE.BufferAttribute(dpos, 3));
  const dust = new THREE.Points(dgeo, new THREE.PointsMaterial({
    size: 0.035, color: 0x8d949e, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  scene.add(dust);

  // Onde a forma fica em cada capítulo (no computador o texto fica do outro lado)
  const OFF_DESK = [[2.3, 0.95], [-2.4, 0], [2.6, 0], [-2.5, 0.1]];
  const SCALE = [1, 1, 1, 0.78];
  const OFF_MOB = [[0, 1.35], [0, 1.25], [0, 1.15], [0, 1.35]];

  let vw = 0, vh = 0, fit = 1, tops = [];
  const caps = [...document.querySelectorAll('[data-cap]')];
  function resize() {
    vw = innerWidth; vh = innerHeight;
    renderer.setSize(vw, vh, false);
    camera.aspect = vw / vh;
    camera.updateProjectionMatrix();
    const visH = 2 * 10 * Math.tan(THREE.MathUtils.degToRad(35 / 2));
    const visW = visH * camera.aspect;
    fit = small.matches ? Math.min(1, (visW * 0.92) / 7.2) : Math.min(1, visW / 12);
    tops = caps.map((c) => c.getBoundingClientRect().top + scrollY);
    tops.push(document.documentElement.scrollHeight);
    needs = true;
  }

  function scrollProg() {
    const y = scrollY + vh * 0.5;
    for (let i = 0; i < caps.length; i++) {
      if (y < tops[i + 1] || i === caps.length - 1) {
        if (i === caps.length - 1) return 3;
        const f = (y - tops[i]) / (tops[i + 1] - tops[i]);
        const s = Math.min(1, Math.max(0, (f - 0.45) / 0.5));
        return i + s * s * (3 - 2 * s);
      }
    }
    return 3;
  }

  // ponteiro
  const ndc = new THREE.Vector2(0, 0), ndcSmooth = new THREE.Vector2(0, 0);
  let mouseActive = 0, lastMove = -1e9;
  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    ndc.set((e.clientX / vw) * 2 - 1, -(e.clientY / vh) * 2 + 1);
    lastMove = performance.now();
    needs = true;
  }, { passive: true });

  const hudCap = document.querySelector('[data-hud-cap]');
  const hudBar = document.querySelector('[data-hud-bar]');
  const hudXY = document.querySelector('[data-hud-xy]');

  let prog = 0, lastScroll = scrollY, scatter = 0, needs = true, last = performance.now();
  addEventListener('resize', resize);
  addEventListener('scroll', () => { needs = true; }, { passive: true });
  reduce.addEventListener?.('change', () => { uniforms.uMotion.value = reduce.matches ? 0 : 1; needs = true; });
  resize();

  const ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), hit = new THREE.Vector3();
  const tmp = new THREE.Vector3();

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const still = reduce.matches;
    const target = scrollProg();
    prog = still ? target : prog + (target - prog) * Math.min(1, dt * 3.2);

    const v = scrollY - lastScroll; lastScroll = scrollY;
    scatter += ((still ? 0 : Math.min(1, Math.abs(v) / 120)) - scatter) * Math.min(1, dt * 6);

    const moving = !still && now - lastMove < 1600;
    mouseActive += ((moving ? 1 : 0) - mouseActive) * Math.min(1, dt * 3);
    ndcSmooth.lerp(ndc, Math.min(1, dt * 5));

    // posição da forma
    const offs = small.matches ? OFF_MOB : OFF_DESK;
    const i0 = Math.min(3, Math.floor(prog)), i1 = Math.min(3, i0 + 1), fr = prog - i0;
    const ox = offs[i0][0] + (offs[i1][0] - offs[i0][0]) * fr;
    const oy = offs[i0][1] + (offs[i1][1] - offs[i0][1]) * fr;
    group.position.set(ox * (small.matches ? 1 : Math.max(0.6, fit)), oy, 0);
    group.scale.setScalar(fit * (small.matches ? 1 : SCALE[i0] + (SCALE[i1] - SCALE[i0]) * fr));
    if (!still) {
      group.rotation.y = ndcSmooth.x * 0.28 * mouseActive + Math.sin(now * 0.00025) * 0.12;
      group.rotation.x = -ndcSmooth.y * 0.16 * mouseActive + Math.cos(now * 0.0002) * 0.05;
      camera.position.z = 10 - Math.sin(Math.min(1, prog % 1) * Math.PI) * 1.6;
    } else {
      group.rotation.set(0, 0, 0);
      camera.position.z = 10;
    }

    dust.position.y = (scrollY / vh) * 0.9;
    if (!still) { dust.rotation.y = ndcSmooth.x * 0.04; dust.rotation.x = -ndcSmooth.y * 0.03; }

    // ponteiro no espaço da forma
    if (!still) {
      ray.setFromCamera(ndcSmooth, camera);
      if (ray.ray.intersectPlane(plane, hit)) {
        tmp.copy(hit);
        group.worldToLocal(tmp);
        uniforms.uMouse.value.copy(tmp);
      }
    }

    uniforms.uProg.value = prog;
    uniforms.uTime.value = still ? 0 : now / 1000;
    uniforms.uScatter.value = scatter;
    uniforms.uMouseK.value = mouseActive;
    uniforms.uSpin.value = still ? 0.6 : now * 0.00018;
    renderer.render(scene, camera);

    hudCap.textContent = `0${Math.min(4, Math.round(prog) + 1)} / 04`;
    hudBar.style.transform = `scaleX(${(prog / 3).toFixed(4)})`;
    hudXY.textContent = `x ${ndcSmooth.x.toFixed(2)} · y ${ndcSmooth.y.toFixed(2)}`;

    needs = false;
    if (!still || Math.abs(target - prog) > 0.001) requestAnimationFrame(frame);
    else idle = true;
  }
  let idle = false;
  // com movimento reduzido, só desenha quando algo muda
  const wake = () => { if (idle) { idle = false; last = performance.now(); requestAnimationFrame(frame); } };
  addEventListener('scroll', wake, { passive: true });
  addEventListener('resize', wake);
  reduce.addEventListener?.('change', wake);

  renderer.compile(scene, camera);
  await finishLoad();
  reveal();
  requestAnimationFrame(frame);
}

start().catch((err) => {
  console.error(err);
  root.classList.remove('gl-ok');
  reveal();
});
