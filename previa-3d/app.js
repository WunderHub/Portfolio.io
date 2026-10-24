// Prévia 3D da WunderHub, estilo metal escuro com brilho laranja.
// Topo: um feixe de cabos de metal com pulsos de luz laranja correndo por dentro.
// Ao rolar, a câmera viaja pelos cabos até uma estrutura de metal vazada
// que brilha por dentro, e termina no W da WunderHub em metal.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const small = matchMedia('(max-width: 760px)');
const coarse = matchMedia('(pointer: coarse)');
const loaderN = document.querySelector('[data-loader-n]');
const loaderBar = document.querySelector('[data-loader-bar]');
const ORANGE = new THREE.Color('#ff6a1a');

/* ---------- Texto ---------- */
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
const tick = () => new Promise((r) => setTimeout(r, 0));
function finishLoad() {
  return new Promise((resolve) => {
    if (reduce.matches) { setLoad(1); resolve(); return; }
    const from = shown, start = performance.now(), dur = 600;
    const step = (now) => {
      const t = Math.min(1, (now - start) / dur);
      setLoad(from + (1 - from) * (1 - Math.pow(1 - t, 3)));
      t < 1 ? requestAnimationFrame(step) : resolve();
    };
    requestAnimationFrame(step);
  });
}
function reveal() {
  root.classList.add('loaded');
  requestAnimationFrame(() => root.classList.add('ready'));
}

/* ---------- Ambiente refletido no metal: sala escura com faixas de luz ---------- */
function makeEnvironment(renderer) {
  const env = new THREE.Scene();
  const room = new THREE.Mesh(new THREE.BoxGeometry(30, 30, 30), new THREE.MeshBasicMaterial({ color: 0x050607, side: THREE.BackSide }));
  env.add(room);
  const strip = (w, h, color, pos, rot) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }));
    m.position.set(...pos); m.rotation.set(...rot); env.add(m);
  };
  strip(26, 2.2, new THREE.Color(5, 5.2, 5.6), [0, 14, -2], [Math.PI / 2, 0, 0]);
  strip(2, 18, new THREE.Color(3.2, 3.3, 3.6), [-14, 2, -4], [0, Math.PI / 2, 0]);
  strip(8, 1.4, new THREE.Color(1.6, 1.7, 1.9), [6, 5, -14], [0, 0, 0.3]);
  strip(10, 3, new THREE.Color(6, 1.6, 0.25), [9, -10, 4], [-Math.PI / 3, 0, 0]);
  strip(3, 10, new THREE.Color(2.4, 0.6, 0.08), [14, -2, -6], [0, -Math.PI / 2, 0]);
  strip(16, 3, new THREE.Color(3.4, 3.5, 3.8), [-2, 5, 14], [0, Math.PI, 0.25]);
  strip(4, 1.2, new THREE.Color(5, 1.4, 0.2), [6, -3, 14], [0, Math.PI, 0]);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const tex = pmrem.fromScene(env, 0.02).texture;
  pmrem.dispose();
  return tex;
}

/* ---------- Cabos com pulsos de luz ---------- */
function pulseMaterial(opts, shared) {
  const mat = new THREE.MeshStandardMaterial(opts.base);
  const u = {
    uLen: { value: opts.len }, uGap: { value: opts.gap }, uDash: { value: opts.dash },
    uSpeed: { value: opts.speed }, uSeed: { value: opts.seed }, uGlow: { value: opts.glow },
  };
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, u, shared);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec2 vTubeUv;')
      .replace('#include <uv_vertex>', '#include <uv_vertex>\nvTubeUv = uv;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>
        varying vec2 vTubeUv;
        uniform float uLen, uGap, uDash, uSpeed, uSeed, uGlow, uTime, uBoost;
        uniform vec3 uOrange;`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        float px = vTubeUv.x * uLen - uTime * uSpeed * uBoost + uSeed;
        float pd = fract(px / uGap);
        float pulse = smoothstep(0.0, 0.015, pd) * (1.0 - smoothstep(uDash * 0.5, uDash, pd));
        float fade = smoothstep(0.0, 0.08, vTubeUv.x) * (1.0 - smoothstep(0.9, 1.0, vTubeUv.x));
        totalEmissiveRadiance += uOrange * pulse * uGlow * fade;`);
  };
  mat.customProgramCacheKey = () => 'wh-pulse';
  return mat;
}

function makeCables(count, tubular, radial, shared) {
  const group = new THREE.Group();
  const A = new THREE.Vector3(-15, -7, 9), K = new THREE.Vector3(0, 0, -2), B = new THREE.Vector3(15, 6.5, -26);
  const r = (s) => new THREE.Vector3((Math.random() - 0.5) * s, (Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
  for (let i = 0; i < count; i++) {
    const pts = [
      A.clone().add(r(5)),
      A.clone().lerp(K, 0.5).add(r(2.4)),
      K.clone().add(r(0.9)),
      K.clone().lerp(B, 0.45).add(r(2.6)),
      B.clone().add(r(7)),
    ];
    const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
    const kind = Math.random();
    let radius, base, glow, gap, dash, speed;
    if (kind < 0.55) { // cromado
      radius = 0.05 + Math.random() * 0.13;
      base = { color: new THREE.Color().setHSL(0.58, 0.06, 0.55 + Math.random() * 0.2), metalness: 1, roughness: 0.14 + Math.random() * 0.16 };
      glow = Math.random() < 0.4 ? 3 : 0; gap = 5 + Math.random() * 6; dash = 0.05 + Math.random() * 0.06; speed = 2 + Math.random() * 3;
    } else if (kind < 0.82) { // grafite
      radius = 0.08 + Math.random() * 0.16;
      base = { color: 0x24282e, metalness: 0.9, roughness: 0.42 };
      glow = Math.random() < 0.3 ? 2.5 : 0; gap = 7 + Math.random() * 6; dash = 0.04; speed = 1.5 + Math.random() * 2;
    } else { // fibra com luz
      radius = 0.016 + Math.random() * 0.02;
      base = { color: 0x15161a, metalness: 0.6, roughness: 0.3 };
      glow = 7; gap = 2.5 + Math.random() * 4; dash = 0.12 + Math.random() * 0.1; speed = 4 + Math.random() * 5;
    }
    const len = curve.getLength();
    const mat = pulseMaterial({ base: { ...base, envMapIntensity: 1.2 }, len, gap, dash, speed, seed: Math.random() * 50, glow }, shared);
    group.add(new THREE.Mesh(new THREE.TubeGeometry(curve, tubular, radius, radial, false), mat));
  }
  return group;
}

/* ---------- Estrutura de metal vazada (células) ---------- */
function makeLattice(segX, segY, shared) {
  const geo = new THREE.PlaneGeometry(44, 28, segX, segY);
  const mat = new THREE.MeshStandardMaterial({ color: 0x7c838c, metalness: 0.88, roughness: 0.36, flatShading: true, envMapIntensity: 1.1 });
  const WORLEY = `
    vec2 whHash2(vec2 p) { p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3))); return fract(sin(p) * 43758.5453); }
    vec3 whWorley(vec2 x) {
      vec2 n = floor(x), f = fract(x); float F1 = 8.0, F2 = 8.0; vec2 id = n;
      for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
        vec2 g = vec2(float(i), float(j));
        vec2 o = 0.5 + 0.42 * sin(6.2831 * whHash2(n + g));
        vec2 rr = g + o - f; float d = dot(rr, rr);
        if (d < F1) { F2 = F1; F1 = d; id = n + g; } else if (d < F2) { F2 = d; }
      }
      return vec3(sqrt(F1), sqrt(F2), fract(sin(dot(id, vec2(12.9898, 78.233))) * 43758.5453));
    }`;
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, shared);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', `#include <common>
        varying float vEdge; varying float vRnd; varying float vF1;
        ${WORLEY}`)
      .replace('#include <begin_vertex>', `
        vec2 q = position.xy * 0.55;
        vec3 w = whWorley(q);
        float edge = w.y - w.x;
        float ridge = 1.0 - smoothstep(0.1, 0.36, edge);
        float pocket = 0.35 + 1.1 * (0.62 - min(w.x, 0.62));
        float h = pow(ridge, 0.7) * 0.55 - (1.0 - ridge) * pocket;
        h += 0.35 * sin(position.x * 0.18) * cos(position.y * 0.22);
        vec3 transformed = position + vec3(0.0, 0.0, h);
        vEdge = edge; vRnd = w.z; vF1 = w.x;`);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>
        varying float vEdge; varying float vRnd; varying float vF1;
        uniform float uTime; uniform vec3 uOrange;`)
      .replace('#include <color_fragment>', `#include <color_fragment>
        float rim = 1.0 - smoothstep(0.12, 0.34, vEdge);
        diffuseColor.rgb = mix(vec3(0.025, 0.027, 0.03), diffuseColor.rgb, rim);`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
        roughnessFactor = mix(0.6, roughnessFactor, rim);`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        float inner = 1.0 - rim;
        float line = smoothstep(0.36, 0.39, vEdge) * (1.0 - smoothstep(0.39, 0.44, vEdge));
        float lit = step(0.55, vRnd) * (0.6 + 0.4 * sin(uTime * 0.8 + vRnd * 30.0));
        totalEmissiveRadiance += uOrange * (line * 1.2 * lit + inner * (lit * 0.9 + 0.08) * smoothstep(0.5, 0.0, vF1));`);
  };
  mat.customProgramCacheKey = () => 'wh-lattice';
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2 + 0.32;
  mesh.position.set(0, -3.4, -44);
  return mesh;
}

/* ---------- W da WunderHub em metal ---------- */
function shapeFromPath(d) {
  const nums = d.match(/[MHLZ]|-?\d+(\.\d+)?/g);
  const s = new THREE.Shape();
  let x = 0, y = 0, cmd = '', first = true;
  for (let i = 0; i < nums.length; i++) {
    const t = nums[i];
    if (/[MHLZ]/.test(t)) { cmd = t; if (t === 'Z') s.closePath(); continue; }
    if (cmd === 'M') { x = +t; y = +nums[++i]; s.moveTo(x, -y); first = false; cmd = 'L'; }
    else if (cmd === 'H') { x = +t; s.lineTo(x, -y); }
    else if (cmd === 'L') { x = +t; y = +nums[++i]; s.lineTo(x, -y); }
  }
  return s;
}
function makeW(env) {
  const g = new THREE.Group();
  const opts = { depth: 70, bevelEnabled: true, bevelThickness: 10, bevelSize: 7, bevelSegments: 3, curveSegments: 1 };
  const silver = new THREE.MeshStandardMaterial({ color: 0xd4d9df, metalness: 1, roughness: 0.22, envMapIntensity: 1.8 });
  const orange = new THREE.MeshStandardMaterial({ color: 0x2a1206, emissive: ORANGE, emissiveIntensity: 1.25, metalness: 0.4, roughness: 0.3 });
  [
    ['M0 0H216L447 337L668 71L992 536H791L628 301L434 536H365Z', silver],
    ['M575 0H681L445 289L394 216Z', orange],
    ['M1009 0H1205L904 359L815 232Z', orange],
  ].forEach(([d, m]) => g.add(new THREE.Mesh(new THREE.ExtrudeGeometry(shapeFromPath(d), opts), m)));
  const k = 3.6 / 1205;
  g.scale.setScalar(k);
  g.position.set(-602 * k, 268 * k, -35 * k);
  const holder = new THREE.Group();
  holder.add(g);
  holder.position.set(0, -0.2, -40.5);
  return holder;
}

/* ---------- Luzes desfocadas no ar (bokeh) ---------- */
function makeBokeh(n) {
  const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), sz = new Float32Array(n);
  const o = new THREE.Color(1, 0.42, 0.1), w = new THREE.Color(0.85, 0.9, 1);
  for (let i = 0; i < n; i++) {
    const z = 8 - Math.random() * 54;
    pos.set([(Math.random() - 0.5) * 30, (Math.random() - 0.5) * 16, z], i * 3);
    const c = Math.random() < 0.7 ? o : w;
    col.set([c.r, c.g, c.b], i * 3);
    sz[i] = 0.3 + Math.random() * 1.1;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.setAttribute('aSize', new THREE.BufferAttribute(sz, 1));
  const mat = new THREE.ShaderMaterial({
    uniforms: { uPix: { value: 1 }, uTime: { value: 0 } },
    vertexShader: `
      attribute float aSize; attribute vec3 color; varying vec3 vC; varying float vA; uniform float uPix; uniform float uTime;
      void main() {
        vec3 p = position; p.y += sin(uTime * 0.3 + position.x) * 0.25;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        float dz = -mv.z;
        gl_PointSize = aSize * uPix * 260.0 / max(dz, 1.0);
        vC = color; vA = smoothstep(0.5, 4.0, dz) * (1.0 - smoothstep(18.0, 30.0, dz)) * 0.22;
      }`,
    fragmentShader: `
      varying vec3 vC; varying float vA;
      void main() {
        float d = length(gl_PointCoord - 0.5) * 2.0;
        if (d > 1.0) discard;
        float disc = smoothstep(1.0, 0.86, d) * (0.55 + 0.45 * smoothstep(0.5, 0.95, d));
        gl_FragColor = vec4(vC * disc * vA, 1.0);
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  return new THREE.Points(geo, mat);
}

/* ---------- Cena ---------- */
function webglOk() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch { return false; }
}

// Câmera em cada capítulo: posição, para onde olha, distância de foco e para que lado a cena vai
const KEYS = [
  { pos: [0.4, 0.3, 8.5], look: [0, 0, -2], side: 1 },
  { pos: [-3.2, 5.2, -5.5], look: [7.5, 3.4, -18], side: -1 },
  { pos: [0, 2.8, -30.5], look: [0, -2.8, -43], side: 1 },
  { pos: [0.2, 0.7, -32.2], look: [0, -0.1, -40.5], side: -1 },
];

async function start() {
  setLoad(0.1);
  if (!webglOk()) { await finishLoad(); reveal(); return; }
  root.classList.add('gl-ok');

  const lite = small.matches || coarse.matches;
  const canvas = document.querySelector('[data-gl]');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !lite, powerPreference: 'high-performance' });
  let dpr = Math.min(window.devicePixelRatio || 1, lite ? 1.5 : 1.75);
  renderer.setPixelRatio(dpr);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.setClearColor(0x07080a, 1);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x07080a);
  scene.fog = new THREE.FogExp2(0x07080a, 0.045);
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 120);

  scene.environment = makeEnvironment(renderer);
  setLoad(0.25); await tick();

  const shared = { uTime: { value: 0 }, uBoost: { value: 1 }, uOrange: { value: ORANGE.clone() } };
  const cables = makeCables(lite ? 26 : 44, lite ? 150 : 240, lite ? 8 : 12, shared);
  scene.add(cables);
  setLoad(0.5); await tick();
  const lattice = makeLattice(lite ? 170 : 300, lite ? 110 : 190, shared);
  scene.add(lattice);
  setLoad(0.65); await tick();
  const wMark = makeW();
  scene.add(wMark);
  const bokeh = makeBokeh(lite ? 90 : 180);
  scene.add(bokeh);

  scene.add(new THREE.AmbientLight(0x404650, 0.4));
  const key = new THREE.DirectionalLight(0xdfe8ff, 1.6);
  key.position.set(-6, 10, 8); scene.add(key);
  const glowKnot = new THREE.PointLight(0xff6a1a, 30, 14, 1.6); glowKnot.position.set(1, -1.2, -1); scene.add(glowKnot);
  const glowFloor = new THREE.PointLight(0xff6a1a, 14, 12, 1.8); glowFloor.position.set(0, -1.6, -41); scene.add(glowFloor);
  const rimW = new THREE.PointLight(0xdfe6ff, 22, 12, 1.6); rimW.position.set(-4, 4, -36); scene.add(rimW);
  setLoad(0.8); await tick();

  // pós-processamento: desfoque de câmera (só no computador) e brilho
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  let bokehPass = null;
  if (!lite) {
    bokehPass = new BokehPass(scene, camera, { focus: 9, aperture: 0.0035, maxblur: 0.009 });
    composer.addPass(bokehPass);
  }
  const bloom = new UnrealBloomPass(new THREE.Vector2(512, 512), lite ? 0.6 : 0.7, 0.5, 0.85);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  let vw = 0, vh = 0, tops = [];
  const caps = [...document.querySelectorAll('[data-cap]')];
  function resize() {
    vw = innerWidth; vh = innerHeight;
    renderer.setSize(vw, vh, false);
    composer.setPixelRatio(dpr);
    composer.setSize(vw, vh);
    bloom.resolution.set(vw / 2, vh / 2);
    camera.aspect = vw / vh;
    camera.fov = vw < vh ? 52 : 38;
    camera.updateProjectionMatrix();
    bokeh.material.uniforms.uPix.value = dpr * (vh / 900);
    tops = caps.map((c) => c.getBoundingClientRect().top + scrollY);
    tops.push(document.documentElement.scrollHeight);
  }

  function scrollProg() {
    const y = scrollY + vh * 0.5;
    for (let i = 0; i < caps.length - 1; i++) {
      if (y < tops[i + 1]) {
        const f = (y - tops[i]) / (tops[i + 1] - tops[i]);
        const s = Math.min(1, Math.max(0, (f - 0.4) / 0.55));
        return i + s * s * (3 - 2 * s);
      }
    }
    return caps.length - 1;
  }

  const ndc = new THREE.Vector2(), ndcS = new THREE.Vector2();
  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    ndc.set((e.clientX / vw) * 2 - 1, -(e.clientY / vh) * 2 + 1);
  }, { passive: true });

  const hudCap = document.querySelector('[data-hud-cap]');
  const hudBar = document.querySelector('[data-hud-bar]');

  addEventListener('resize', () => { resize(); wake(); });
  resize();

  const P0 = new THREE.Vector3(), P1 = new THREE.Vector3(), L0 = new THREE.Vector3(), L1 = new THREE.Vector3();
  let prog = scrollProg(), last = performance.now(), frames = 0, fpsStart = 0, degraded = false, idle = false;

  // modo de gravação: desenha quadro a quadro sob comando (usado para gerar o vídeo de prévia)
  const capture = location.search.includes('captura');
  if (capture) {
    window.__whFrame = (y, ms, mx, my) => { scrollTo(0, y); ndc.set(mx, my); frame(ms, true); };
  }

  function frame(now, manual) {
    const dt = manual ? 1 / 24 : Math.min(0.05, (now - last) / 1000);
    last = now;
    const still = reduce.matches;
    const target = scrollProg();
    prog = still ? target : prog + (target - prog) * Math.min(1, dt * 2.6);

    const i0 = Math.min(KEYS.length - 1, Math.floor(prog)), i1 = Math.min(KEYS.length - 1, i0 + 1);
    let f = prog - i0; f = f * f * (3 - 2 * f);
    P0.fromArray(KEYS[i0].pos); P1.fromArray(KEYS[i1].pos);
    L0.fromArray(KEYS[i0].look); L1.fromArray(KEYS[i1].look);
    P0.lerp(P1, f); L0.lerp(L1, f);

    if (!still) {
      ndcS.lerp(ndc, Math.min(1, dt * 3));
      P0.x += ndcS.x * 0.45; P0.y += ndcS.y * 0.3;
      P0.y += Math.sin(now * 0.0004) * 0.08;
    }
    camera.position.copy(P0);
    camera.lookAt(L0);

    // empurra a cena para o lado oposto do texto
    const side = KEYS[i0].side + (KEYS[i1].side - KEYS[i0].side) * f;
    if (small.matches) camera.setViewOffset(vw, vh, 0, vh * 0.16, vw, vh);
    else camera.setViewOffset(vw, vh, -side * vw * 0.17, 0, vw, vh);
    root.classList.toggle('lado-direito', !small.matches && side < 0);

    if (bokehPass) {
      bokehPass.uniforms.focus.value = camera.position.distanceTo(L0) * (i0 === 0 && f < 0.5 ? 0.98 : 0.9);
    }

    const t = still ? 7.3 : now / 1000;
    shared.uTime.value = t;
    shared.uBoost.value = still ? 1 : 1 + Math.sin(Math.PI * (prog % 1)) * 2.5;
    bokeh.material.uniforms.uTime.value = t;
    cables.rotation.z = still ? 0 : Math.sin(t * 0.15) * 0.03;
    wMark.rotation.y = still ? -0.25 : -0.25 + ndcS.x * 0.35 + Math.sin(t * 0.4) * 0.08;
    wMark.rotation.x = still ? 0.05 : -ndcS.y * 0.15;
    glowFloor.intensity = 14 + (still ? 0 : Math.sin(t * 1.3) * 3);

    composer.render(dt);

    hudCap.textContent = `0${Math.min(4, Math.round(prog) + 1)} / 04`;
    hudBar.style.transform = `scaleX(${(prog / 3).toFixed(4)})`;

    // se o aparelho estiver lento, alivia o desenho
    if (manual) return;
    if (!degraded && !still && !location.search.includes('hq')) {
      frames++;
      if (!fpsStart) fpsStart = now;
      if (now - fpsStart > 2500) {
        const fps = (frames * 1000) / (now - fpsStart);
        if (fps < 32) {
          degraded = true;
          dpr = 1; renderer.setPixelRatio(1);
          if (bokehPass) bokehPass.enabled = false;
          resize();
        }
        frames = 0; fpsStart = now;
      }
    }

    if (!still || Math.abs(target - prog) > 0.0005) requestAnimationFrame(frame);
    else idle = true;
  }
  function wake() { if (idle) { idle = false; last = performance.now(); requestAnimationFrame(frame); } }
  addEventListener('scroll', wake, { passive: true });
  reduce.addEventListener?.('change', wake);

  renderer.compile(scene, camera);
  setLoad(0.92);
  await finishLoad();
  reveal();
  if (capture) { window.__whReady = true; return; }
  requestAnimationFrame(frame);
}

start().catch((err) => {
  console.error(err);
  root.classList.remove('gl-ok');
  setLoad(1);
  reveal();
});
