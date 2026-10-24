// Prévia WunderHub: metal líquido que esfria e se solidifica em estruturas.
// A cena é desenhada inteira num shader (raymarching), sem bibliotecas.
// Estágios ao rolar: 0 líquido · 1 estrutura vazada · 2 fios torcidos · 3 o W da marca.

const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const narrow = matchMedia('(max-width: 860px)');
const capture = location.search.includes('captura');

/* ---------- Texto ---------- */
function splitWords(el) {
  const out = document.createDocumentFragment();
  let i = 0;
  const addWord = (text, wrapEm) => {
    const w = document.createElement('span');
    w.className = 'w';
    const inner = document.createElement('span');
    inner.style.transitionDelay = `${0.2 + i++ * 0.07}s`;
    if (wrapEm) { const em = document.createElement('em'); em.textContent = text; inner.append(em); } else inner.textContent = text;
    w.append(inner);
    out.append(w, document.createTextNode(' '));
  };
  el.childNodes.forEach((n) => {
    const isEm = n.nodeName === 'EM';
    n.textContent.trim().split(/\s+/).filter(Boolean).forEach((t) => addWord(t, isEm));
  });
  el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
  el.textContent = '';
  el.append(out);
  [...el.children].forEach((c) => c.setAttribute('aria-hidden', 'true'));
}
document.querySelectorAll('[data-words]').forEach(splitWords);

const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.35 });
document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));

/* ---------- Painel de orçamento ---------- */
const dialog = document.getElementById('orcamento');
const form = document.querySelector('[data-form]');
const enviar = document.querySelector('[data-enviar]');
function montarLink() {
  const f = new FormData(form);
  const nome = (f.get('nome') || '').trim();
  const negocio = (f.get('negocio') || '').trim();
  const tipo = f.get('tipo') || 'ajuda para escolher o formato';
  const msg = (f.get('msg') || '').trim();
  let t = 'Olá, Kauê! Vi o site da WunderHub.';
  if (nome) t += ` Sou ${nome}${negocio ? `, de ${negocio}` : ''}.`;
  else if (negocio) t += ` Tenho ${negocio}.`;
  t += ` Quero ${tipo}.`;
  if (msg) t += ` ${msg}`;
  enviar.href = `https://wa.me/5511959300903?text=${encodeURIComponent(t)}`;
}
if (dialog && typeof dialog.showModal === 'function') {
  document.querySelectorAll('[data-open-orcamento]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    montarLink();
    dialog.showModal();
  }));
  form.addEventListener('input', montarLink);
  enviar.addEventListener('click', () => setTimeout(() => dialog.close(), 300));
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
}

/* ---------- Carregador ---------- */
const loaderN = document.querySelector('[data-loader-n]');
const loaderBar = document.querySelector('[data-loader-bar]');
function runLoader() {
  return new Promise((resolve) => {
    if (reduce.matches || capture) { resolve(); return; }
    const start = performance.now(), dur = 1300;
    const step = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const e = 1 - Math.pow(1 - t, 3);
      loaderN.textContent = String(Math.round(e * 100)).padStart(3, '0');
      loaderBar.style.transform = `scaleX(${e})`;
      t < 1 ? requestAnimationFrame(step) : resolve();
    };
    requestAnimationFrame(step);
  });
}
function reveal() {
  root.classList.add('loaded');
  requestAnimationFrame(() => root.classList.add('ready'));
}

/* ---------- Shader ---------- */
// Vértices do W da marca, convertidos para o espaço da cena (2,4 de largura)
const WS = 2.4 / 1205;
const toW = (pts) => pts.map(([x, y]) => `vec2(${((x - 602.5) * WS).toFixed(4)},${(-(y - 268) * WS).toFixed(4)})`).join(',');
const W_SILVER = toW([[0, 0], [216, 0], [447, 337], [668, 71], [992, 536], [791, 536], [628, 301], [434, 536], [365, 536]]);
const W_O1 = toW([[575, 0], [681, 0], [445, 289], [394, 216]]);
const W_O2 = toW([[1009, 0], [1205, 0], [904, 359], [815, 232]]);

const VERT = `#version 300 es
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
out vec4 fragColor;
uniform vec2 uRes;
uniform float uTime, uProg, uCamZ;
uniform vec4 uMouse;
uniform vec2 uShift, uRot;
uniform int uSteps;

#define ORANGE vec3(1.0, 0.33, 0.05)

const vec2 WS9[9] = vec2[9](${W_SILVER});
const vec2 WO1[4] = vec2[4](${W_O1});
const vec2 WO2[4] = vec2[4](${W_O2});

float ss(float a, float b, float x) { float t = clamp((x - a) / (b - a), 0.0, 1.0); return t * t * (3.0 - 2.0 * t); }
mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
float smin(float a, float b, float k) { float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0); return mix(b, a, h) - k * h * (1.0 - h); }

float sdPoly9(vec2 p) {
  float d = dot(p - WS9[0], p - WS9[0]); float s = 1.0;
  for (int i = 0, j = 8; i < 9; j = i, i++) {
    vec2 e = WS9[j] - WS9[i], w = p - WS9[i];
    vec2 b = w - e * clamp(dot(w, e) / dot(e, e), 0.0, 1.0);
    d = min(d, dot(b, b));
    bvec3 c = bvec3(p.y >= WS9[i].y, p.y < WS9[j].y, e.x * w.y > e.y * w.x);
    if (all(c) || all(not(c))) s *= -1.0;
  }
  return s * sqrt(d);
}
float sdQuad(vec2 p, vec2 v0, vec2 v1, vec2 v2, vec2 v3) {
  vec2 v[4] = vec2[4](v0, v1, v2, v3);
  float d = dot(p - v[0], p - v[0]); float s = 1.0;
  for (int i = 0, j = 3; i < 4; j = i, i++) {
    vec2 e = v[j] - v[i], w = p - v[i];
    vec2 b = w - e * clamp(dot(w, e) / dot(e, e), 0.0, 1.0);
    d = min(d, dot(b, b));
    bvec3 c = bvec3(p.y >= v[i].y, p.y < v[j].y, e.x * w.y > e.y * w.x);
    if (all(c) || all(not(c))) s *= -1.0;
  }
  return s * sqrt(d);
}
float extrude(float d2, float z, float h, float r) {
  vec2 w = vec2(d2 + r, abs(z) - h + r);
  return min(max(w.x, w.y), 0.0) + length(max(w, 0.0)) - r;
}

// 0: metal líquido
float liquid(vec3 p) {
  float t = uTime;
  float d = length(p) - 0.74;
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    vec3 c = vec3(sin(t * 0.55 + fi * 1.7) * 0.6, cos(t * 0.75 + fi * 2.3) * 0.45, sin(t * 0.42 + fi * 3.1) * 0.4);
    d = smin(d, length(p - c) - (0.34 + 0.07 * sin(fi * 4.1)), 0.42);
  }
  d = mix(d, smin(d, length(p - uMouse.xyz) - 0.2, 0.55), uMouse.w);
  d += 0.022 * sin(p.x * 7.0 + t * 2.1) * sin(p.y * 6.0 - t * 1.7) * sin(p.z * 6.5 + t * 1.3);
  return d;
}
// 1: estrutura vazada (casca com treliça orgânica)
float lattice(vec3 q) {
  float k = 6.2; vec3 g3 = q * k;
  float g = abs(dot(sin(g3), cos(g3.yzx))) / k - 0.038;
  float shell = abs(length(q) - 0.95) - 0.26;
  return max(shell, g * 0.7);
}
// 2: fios torcidos; y = 1 no fio de luz do centro
vec2 cables(vec3 q) {
  vec3 c = q; c.xy *= rot(0.55);
  float tw = c.x * 1.25;
  vec2 yz = c.yz * rot(tw);
  float d = 1e5;
  for (int i = 0; i < 6; i++) { float a = 6.2831 * float(i) / 6.0; d = min(d, length(yz - 0.36 * vec2(cos(a), sin(a))) - 0.095); }
  vec2 yz2 = c.yz * rot(-tw * 1.8 + 0.7);
  float core = 1e5;
  for (int i = 0; i < 3; i++) { float a = 6.2831 * float(i) / 3.0; core = min(core, length(yz2 - 0.13 * vec2(cos(a), sin(a))) - 0.045); }
  float ends = abs(c.x) - 2.1;
  float m = core < d ? 1.0 : 0.0;
  return vec2(max(min(d, core), ends), m);
}
// 3: o W; y = 1 nas partes laranja
vec2 wmark(vec3 q) {
  float a = extrude(sdPoly9(q.xy), q.z, 0.13, 0.03);
  float b = extrude(min(sdQuad(q.xy, WO1[0], WO1[1], WO1[2], WO1[3]), sdQuad(q.xy, WO2[0], WO2[1], WO2[2], WO2[3])), q.z - 0.02, 0.1, 0.02);
  return vec2(min(a, b), b < a ? 1.0 : 0.0);
}

vec3 toObj(vec3 p) { vec3 q = p; q.xz *= rot(uRot.x); q.yz *= rot(uRot.y); return q; }

// material: 0 líquido, 1 estrutura, 2 fio, 3 fio de luz, 4 W prata, 5 W laranja
vec2 stage(int i, vec3 p, vec3 q) {
  if (i == 0) return vec2(liquid(p), 0.0);
  if (i == 1) return vec2(lattice(q), 1.0);
  if (i == 2) { vec2 c = cables(q); return vec2(c.x, 2.0 + c.y); }
  vec2 w = wmark(q); return vec2(w.x, 4.0 + w.y);
}

// devolve distância, material e calor (a borda quente onde o metal está solidificando)
vec3 map(vec3 p) {
  vec3 q = toObj(p);
  float pr = clamp(uProg, 0.0, 3.0);
  int i0 = int(min(floor(pr), 2.0));
  float t = pr - float(i0);
  if (t <= 0.0005) { vec2 a = stage(i0, p, q); return vec3(a, 0.0); }
  if (t >= 0.9995) { vec2 b = stage(i0 + 1, p, q); return vec3(b, 0.0); }
  vec2 a = stage(i0, p, q), b = stage(i0 + 1, p, q);
  float h = mix(-1.9, 1.9, t);
  float k = ss(h + 0.35, h - 0.35, p.y);
  float band = 1.0 - abs(2.0 * k - 1.0);
  float d = mix(a.x, b.x, k);
  d += band * 0.035 * sin(p.x * 9.0 + uTime * 3.0) * sin(p.z * 8.0 - uTime * 2.0);
  d = smin(d, mix(a.x, b.x, 0.5), 0.12 * band + 0.0001);
  return vec3(d * 0.85, k > 0.5 ? b.y : a.y, band);
}

vec3 env(vec3 r) {
  float y = r.y;
  vec3 c = mix(vec3(0.008, 0.009, 0.011), vec3(0.13, 0.14, 0.155), ss(-0.35, 0.35, y));
  c = mix(c, vec3(0.05, 0.055, 0.06), ss(0.35, 0.8, y));
  c += vec3(0.55) * ss(0.55, 0.98, r.z) * ss(0.7, 0.1, abs(y - 0.15));
  c += vec3(2.6) * ss(0.7, 0.9, y) * ss(0.9, 0.3, abs(r.x + 0.2));
  c += vec3(1.6) * ss(0.86, 0.97, r.x) * ss(0.6, 0.0, abs(y - 0.1));
  c += vec3(0.5, 0.56, 0.66) * ss(0.86, 0.98, -r.x) * ss(0.8, 0.2, abs(y));
  c += vec3(0.9) * ss(0.93, 0.995, r.z) * ss(0.35, 0.05, abs(y - 0.3));
  c += ORANGE * 0.9 * ss(-0.82, -0.95, y) * ss(0.5, 0.0, abs(r.x));
  return c;
}

vec3 normalAt(vec3 p) {
  const vec2 e = vec2(0.0018, -0.0018);
  return normalize(e.xyy * map(p + e.xyy).x + e.yyx * map(p + e.yyx).x + e.yxy * map(p + e.yxy).x + e.xxx * map(p + e.xxx).x);
}
float aoAt(vec3 p, vec3 n) {
  float o = 0.0, w = 1.0;
  for (int i = 1; i <= 4; i++) { float h = 0.04 * float(i * i); o += (h - map(p + n * h).x) * w; w *= 0.6; }
  return clamp(1.0 - o * 2.2, 0.0, 1.0);
}

vec3 background(vec2 uv) {
  vec3 c = vec3(0.039, 0.043, 0.051);
  c += vec3(0.05, 0.03, 0.02) * ss(1.3, 0.0, length(uv - vec2(0.0, -0.9)));
  c += ORANGE * 0.02 * ss(0.9, 0.0, length(uv - vec2(0.0, -0.55)));
  return c;
}

void main() {
  vec2 fc = gl_FragCoord.xy;
  vec2 uv = (fc - 0.5 * uRes) / uRes.y;
  vec2 suv = uv - uShift;
  vec3 ro = vec3(0.0, 0.0, uCamZ);
  vec3 rd = normalize(vec3(suv, -1.75));

  vec3 col = background(uv);
  float glow = 0.0;

  // esfera que envolve a cena: pula o que fica de fora
  float b = dot(ro, rd), cc = dot(ro, ro) - 2.75 * 2.75, disc = b * b - cc;
  if (disc > 0.0) {
    float tn = max(0.0, -b - sqrt(disc)), tf = -b + sqrt(disc);
    float t = tn; vec3 m = vec3(1.0); bool hit = false;
    for (int i = 0; i < 140; i++) {
      if (i >= uSteps) break;
      vec3 p = ro + rd * t;
      m = map(p);
      float hot = m.z + (m.y > 2.5 && m.y < 3.5 ? 0.35 : 0.0) + (m.y > 4.5 ? 0.6 : 0.0);
      glow += hot * 0.010 / (1.0 + m.x * m.x * 260.0);
      if (m.x < 0.0012 * t) { hit = true; break; }
      t += m.x;
      if (t > tf) break;
    }
    if (hit) {
      vec3 p = ro + rd * t;
      vec3 n = normalAt(p);
      vec3 q = toObj(p);
      float ao = aoAt(p, n);
      vec3 r = reflect(rd, n);
      float fres = 0.55 + 0.45 * pow(1.0 - max(dot(n, -rd), 0.0), 4.0);
      float mat = m.y;
      vec3 tint = vec3(0.9, 0.92, 0.95);
      vec3 e = env(r);
      if (mat > 0.5) { e = 0.55 * e + 0.45 * env(normalize(r + n * 0.4)); tint = vec3(0.6, 0.63, 0.67); }
      vec3 c = e * tint * fres * (0.35 + 0.65 * ao);

      if (mat > 0.5 && mat < 1.5) { // brilho laranja dentro da estrutura
        float inner = ss(0.82, 0.7, length(q));
        float pulse = 0.7 + 0.3 * sin(uTime * 1.4 + q.y * 5.0 + q.x * 3.0);
        c = mix(c, c * 0.25, inner) + ORANGE * 1.6 * inner * pulse * (1.0 - ao * 0.7);
      }
      if (mat > 2.5 && mat < 3.5) { // fio de luz com pulsos correndo
        vec3 cq = q; cq.xy *= rot(0.55);
        float dash = ss(0.55, 0.95, fract(cq.x * 1.1 - uTime * 0.7));
        c = vec3(0.03) + e * 0.12 + ORANGE * (0.5 + 3.2 * dash);
      }
      if (mat > 4.5) { // partes laranja do W
        c = ORANGE * (0.75 + 0.25 * fres) + e * 0.08;
      }
      c += ORANGE * 3.2 * m.z; // borda quente onde está solidificando
      col = c;
    }
  }
  col += ORANGE * glow;

  // tom final
  col = (col * (2.51 * col + 0.03)) / (col * (2.43 * col + 0.59) + 0.14);
  col = pow(clamp(col, 0.0, 1.0), vec3(0.4545));
  col *= 1.0 - 0.35 * pow(length(uv * vec2(0.8, 1.0)), 2.2);
  col += (fract(sin(dot(fc, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
  fragColor = vec4(col, 1.0);
}`;

/* ---------- Cena ---------- */
function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
  return s;
}

async function start() {
  const canvas = document.querySelector('[data-gl]');
  const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'high-performance' });
  const loading = runLoader();
  if (!gl) { await loading; reveal(); return; }

  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  gl.useProgram(prog);
  gl.bindVertexArray(gl.createVertexArray());
  const U = {};
  ['uRes', 'uTime', 'uProg', 'uCamZ', 'uMouse', 'uShift', 'uRot', 'uSteps'].forEach((n) => { U[n] = gl.getUniformLocation(prog, n); });
  root.classList.add('gl-ok');

  const secs = [...document.querySelectorAll('[data-estagio]')];
  const estados = [...document.querySelectorAll('[data-estado]')];
  let vw = 0, vh = 0, tops = [], scale = narrow.matches ? 0.55 : 0.7;
  const dprCap = Math.min(window.devicePixelRatio || 1, 2);

  function size() {
    vw = innerWidth; vh = innerHeight;
    const s = Math.min(dprCap, Math.max(0.35, scale));
    canvas.width = Math.round(vw * s);
    canvas.height = Math.round(vh * s);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  function measure() {
    tops = secs.map((s) => s.getBoundingClientRect().top + scrollY);
    tops.push(document.documentElement.scrollHeight);
  }
  function resize() { size(); measure(); }

  function targetProg() {
    const y = scrollY + vh * 0.5;
    for (let i = 0; i < secs.length - 1; i++) {
      if (y < tops[i + 1]) {
        const a = +secs[i].dataset.estagio, b = +secs[i + 1].dataset.estagio;
        const f = Math.max(0, (y - tops[i]) / (tops[i + 1] - tops[i]));
        const s = Math.min(1, Math.max(0, (f - 0.5) / 0.45));
        return a + (b - a) * s * s * (3 - 2 * s);
      }
    }
    return +secs[secs.length - 1].dataset.estagio;
  }
  function currentSection() {
    const y = scrollY + vh * 0.5;
    let k = 0;
    for (let i = 0; i < secs.length; i++) if (y >= tops[i]) k = i;
    return secs[k];
  }

  // ponteiro: no líquido, puxa uma gota; arrastando, gira a escultura
  const mouse = { x: 0, y: 0, last: -1e9, down: false, px: 0, py: 0 };
  const rot = { x: 0.4, y: 0.18, tx: 0.4, ty: 0.18 };
  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    mouse.x = e.clientX; mouse.y = e.clientY; mouse.last = performance.now();
    if (mouse.down) {
      rot.tx += (e.clientX - mouse.px) * 0.006;
      rot.ty = Math.max(-0.9, Math.min(0.9, rot.ty + (e.clientY - mouse.py) * 0.004));
      mouse.px = e.clientX; mouse.py = e.clientY;
    }
    wake();
  }, { passive: true });
  addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.target.closest('a, button, input, textarea, label, dialog, .card')) return;
    mouse.down = true; mouse.px = e.clientX; mouse.py = e.clientY;
  });
  addEventListener('pointerup', () => { mouse.down = false; });

  const shift = { x: 0, y: 0 };
  let progV = 0, t0 = performance.now(), last = t0, idle = false, frames = 0, fpsT = 0;
  const mw = [0, 0, 0, 0];

  function frame(now, manual) {
    const dt = manual ? (location.search.includes('rapido') ? 0.6 : 1 / 24) : Math.min(0.05, (now - last) / 1000);
    last = now;
    const still = reduce.matches;
    const target = targetProg();
    progV = still ? target : progV + (target - progV) * Math.min(1, dt * 2.2);

    // lado do texto: a escultura vai para o outro lado
    const sec = currentSection();
    const dir = sec.classList.contains('lado-dir');
    root.classList.toggle('shade-dir', dir && !narrow.matches);
    const aspect = vw / vh;
    const sx = narrow.matches ? 0 : (dir ? -1 : 1) * Math.min(0.42, aspect * 0.24);
    const sy = narrow.matches ? 0.2 : 0;
    const ks = still ? 1 : Math.min(1, dt * 2.5);
    shift.x += (sx - shift.x) * ks; shift.y += (sy - shift.y) * ks;
    const camZ = Math.max(5.6, 5.4 / aspect);

    if (!still && !mouse.down) {
      if (progV > 2.3) {
        const base = Math.round(rot.tx / (Math.PI * 2)) * Math.PI * 2;
        const goal = base + Math.sin((now - t0) / 2000) * 0.32;
        rot.tx += (goal - rot.tx) * Math.min(1, dt * 1.5);
        rot.ty += (0.06 - rot.ty) * Math.min(1, dt * 1.5);
      } else rot.tx += dt * 0.12;
    }
    if (still && progV > 2.3) { rot.tx = Math.round(rot.tx / (Math.PI * 2)) * Math.PI * 2 - 0.2; rot.ty = 0.06; }
    rot.x += (rot.tx - rot.x) * (still ? 1 : Math.min(1, dt * 4));
    rot.y += (rot.ty - rot.y) * (still ? 1 : Math.min(1, dt * 4));

    // gota que segue o mouse (só no metal líquido)
    const active = !still && now - mouse.last < 2500 && progV < 0.6 ? 1 - progV / 0.6 : 0;
    if (active > 0) {
      const ux = (mouse.x - vw / 2) / vh - shift.x, uy = -(mouse.y - vh / 2) / vh - shift.y;
      const len = Math.hypot(ux, uy, 1.75);
      const dx = ux / len, dy = uy / len, dz = -1.75 / len;
      const tt = (0.45 - camZ) / dz;
      let px = dx * tt, py = dy * tt;
      const r = Math.hypot(px, py), maxR = 1.5;
      if (r > maxR) { px *= maxR / r; py *= maxR / r; }
      mw[0] += (px - mw[0]) * Math.min(1, dt * 6); mw[1] += (py - mw[1]) * Math.min(1, dt * 6); mw[2] = 0.45;
    }
    mw[3] += (active - mw[3]) * Math.min(1, dt * 3);

    const time = still ? 4.0 : (now - t0) / 1000;
    gl.uniform2f(U.uRes, canvas.width, canvas.height);
    gl.uniform1f(U.uTime, time);
    gl.uniform1f(U.uProg, progV);
    gl.uniform1f(U.uCamZ, camZ);
    gl.uniform4f(U.uMouse, mw[0], mw[1], mw[2], mw[3]);
    gl.uniform2f(U.uShift, shift.x, shift.y);
    gl.uniform2f(U.uRot, rot.x, rot.y);
    gl.uniform1i(U.uSteps, narrow.matches ? 90 : 120);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    const on = Math.round(progV);
    estados.forEach((el, i) => el.classList.toggle('on', i === on));

    if (manual) return;
    // ajusta a resolução para manter a animação fluida
    if (!still) {
      frames++;
      if (!fpsT) fpsT = now;
      if (now - fpsT > 1500) {
        const fps = (frames * 1000) / (now - fpsT);
        const prev = scale;
        if (fps < 40) scale *= 0.82;
        else if (fps > 57 && scale < 1) scale *= 1.08;
        scale = Math.min(narrow.matches ? 0.8 : 1, Math.max(0.35, scale));
        if (Math.abs(prev - scale) > 0.01) size();
        frames = 0; fpsT = now;
      }
    }
    const moving = Math.abs(target - progV) > 0.0005 || Math.abs(shift.x - sx) > 0.001 || Math.abs(rot.tx - rot.x) > 0.0005;
    if (!still || moving) requestAnimationFrame(frame);
    else idle = true;
  }
  function wake() { if (idle) { idle = false; last = performance.now(); requestAnimationFrame(frame); } }

  addEventListener('resize', () => { resize(); wake(); });
  addEventListener('scroll', wake, { passive: true });
  reduce.addEventListener?.('change', wake);
  if (document.fonts?.ready) document.fonts.ready.then(measure);
  resize();
  progV = targetProg();

  if (capture) {
    window.__whFrame = (y, ms, mx, my) => {
      scrollTo(0, y); mouse.x = mx; mouse.y = my; mouse.last = performance.now();
      frame(ms, true);
    };
  }
  frame(performance.now(), true); // primeiro quadro já desenhado antes de mostrar a página
  await loading;
  reveal();
  if (capture) { window.__whReady = true; return; }
  last = performance.now();
  requestAnimationFrame(frame);
}

start().catch((err) => {
  console.error(err);
  root.classList.remove('gl-ok');
  reveal();
});
