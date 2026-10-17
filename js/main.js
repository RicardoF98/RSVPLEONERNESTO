/* =========================================================
   DATOS DE LA INVITACIÓN — edita aquí (lo marcado PENDIENTE)
   ========================================================= */
const INVITACION = {
  nombre: 'León Ernesto',
  apellidos: 'Escobar de la Cruz',
  evento: 'Mi Bautizo',
  fecha: '2026-11-28T10:00:00-06:00',
  papas: ['Estefany Johany de la Cruz Martínez', 'Ernesto Salvador Escobar Pérez'],
  padrinos: ['Evelyn', 'Ricardo', 'Victor', 'Dora'],
  ceremonia: {
    titulo: 'Ceremonia religiosa',
    hora: '10:00 a.m.',
    lugar: 'Parroquia de San Pedro y San Pablo',
    direccion: 'C. Río Pánuco 108, Sierra Morena, 89210 Tampico, Tamps.',
    mapa: '',   // link de Google Maps (opcional)
  },
  recepcion: {
    titulo: 'Fiesta y piñata',
    hora: '3:30 p.m.',
    lugar: 'Salón V.I.P.',
    direccion: 'Calle Cinco de Mayo 611, Col. Primero de Mayo, Ciudad Madero, Tamps.',
    mapa: '',
  },
  vestimenta: 'Formal — de preferencia en tonos tierra, beige o dorado.',            // PENDIENTE
  regalos: {
    mensaje: 'Tu presencia es nuestro mejor regalo. Si deseas tener un detalle, te compartimos nuestra mesa.',
    tienda: 'Liverpool',
    evento: '60062323',
    link: 'https://mesaderegalos.liverpool.com.mx/milistaderegalos/60062323',
  },
  musica: 'assets/hakuna-matata.mp3',   // o 'assets/ciclo-sin-fin.mp3'
  confirmarAntes: '20 de noviembre',                             // PENDIENTE
  whatsapp: '528334283994',
};

/* ========================================================= */

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = matchMedia('(max-width: 760px)').matches;
const state = { intro: 0, scroll: 0, scrollTarget: 0, px: 0, py: 0, tx: 0, ty: 0 };

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

/* ---------- Datos → página ---------- */
const fechaEvento = new Date(INVITACION.fecha);
const fechaLarga = (() => {
  const s = fechaEvento.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return s.charAt(0).toUpperCase() + s.slice(1);
})();
const getPath = (obj, path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);

document.querySelectorAll('[data-bind]').forEach((el) => {
  const key = el.dataset.bind;
  const val = key === 'fechaLarga' ? fechaLarga : getPath(INVITACION, key);
  if (val != null) el.textContent = Array.isArray(val) ? val.join('\n') : val;
});
document.querySelectorAll('[data-map]').forEach((el) => {
  const lugar = INVITACION[el.dataset.map];
  el.href = lugar.mapa || 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(`${lugar.lugar} ${lugar.direccion}`);
});

document.getElementById('padrinos').append(...INVITACION.padrinos.map((n) => {
  const p = document.createElement('p');
  p.className = 'gp';
  p.textContent = n;
  return p;
}));

/* ---------- Letras del nombre ---------- */
document.querySelectorAll('.split').forEach((el) => {
  const text = el.textContent.trim();
  el.textContent = '';
  [...text].forEach((ch, i) => {
    const s = document.createElement('span');
    s.className = 'char';
    s.style.setProperty('--i', i);
    s.textContent = ch;
    el.appendChild(s);
  });
});

/* ---------- Borde ondulado del sello ---------- */
(() => {
  const n = 28, cx = 80, cy = 80;
  let d = '';
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const am = ((i - 0.5) / n) * Math.PI * 2;
    const r = 66, rm = 74 + (i % 3 === 0 ? 2 : 0);
    const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
    if (i === 0) d += `M${x.toFixed(1)} ${y.toFixed(1)}`;
    else d += ` Q${(cx + Math.cos(am) * rm).toFixed(1)} ${(cy + Math.sin(am) * rm).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  document.getElementById('seal-edge').setAttribute('d', d + 'Z');
})();

/* =========================================================
   ESCENA 3D — sabana, roca del rey, cielo que cambia con el scroll
   ========================================================= */
const fract = (x) => x - Math.floor(x);
const hash2 = (x, y) => fract(Math.sin(x * 127.1 + y * 311.7) * 43758.5453);
const hash3 = (x, y, z, s) => fract(Math.sin(x * 12.9898 + y * 78.233 + z * 37.719 + s * 4.581) * 43758.5453);
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
function vnoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi), b = hash2(xi + 1, yi), c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x, y) {
  let s = 0, a = 0.5, f = 1;
  for (let i = 0; i < 4; i++) { s += a * vnoise(x * f, y * f); f *= 2; a *= 0.5; }
  return s;
}
function terrainH(x, z) {
  const d = Math.hypot(x, z);
  let h = (fbm(x * 0.02 + 3, z * 0.02 + 7) - 0.45) * 8;
  const facing = 0.22 + 0.78 * smooth(-0.3, 0.5, z / (d || 1)); // colinas bajas frente al sol
  h += smooth(110, 320, d) * (18 + 40 * fbm(x * 0.01, z * 0.01)) * facing;
  h *= 0.3 + 0.7 * smooth(16, 48, d); // planicie alrededor de la roca
  return h;
}
// Desplaza cada vértice según su posición: los vértices duplicados se mueven igual y no se abren grietas
function roughen(geo, amt, seed) {
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const kx = Math.round(x * 100) / 100, ky = Math.round(y * 100) / 100, kz = Math.round(z * 100) / 100;
    p.setXYZ(i,
      x + (hash3(kx, ky, kz, seed) - 0.5) * amt,
      y + (hash3(kx, ky, kz, seed + 1) - 0.5) * amt,
      z + (hash3(kx, ky, kz, seed + 2) - 0.5) * amt);
  }
  geo.computeVertexNormals();
  return geo;
}

// Momentos del día a lo largo del scroll: noche → amanecer → día → atardecer naranja → noche estrellada
const SKY_KEYS = [
  { t: 0.00, top: '#05070f', mid: '#121735', bot: '#2b2350', sun: '#ff7a3d', elev: -9, sunI: 0.0, sunR: 0.035, li: 0.12, hs: '#28305e', hg: '#0b0810', stars: 1 },
  { t: 0.12, top: '#1b2050', mid: '#7a3b6b', bot: '#ff8a4c', sun: '#ff9a50', elev: 1.5, sunI: 1.0, sunR: 0.05, li: 0.7, hs: '#6b5a8a', hg: '#2a1a14', stars: 0.35 },
  { t: 0.30, top: '#2c3f7a', mid: '#d9774a', bot: '#ffb766', sun: '#ffc46a', elev: 9, sunI: 0.9, sunR: 0.035, li: 1.5, hs: '#9db4e0', hg: '#5a3c22', stars: 0 },
  { t: 0.52, top: '#35609e', mid: '#dd9a5c', bot: '#f7c27a', sun: '#ffd890', elev: 20, sunI: 0.7, sunR: 0.03, li: 2.0, hs: '#bcd2f0', hg: '#6b4a2a', stars: 0 },
  { t: 0.74, top: '#5a1e3a', mid: '#e0552a', bot: '#ffb347', sun: '#ffa040', elev: 4.5, sunI: 1.5, sunR: 0.085, li: 1.3, hs: '#c0603a', hg: '#3a1a10', stars: 0 },
  { t: 0.87, top: '#141640', mid: '#6a2a5a', bot: '#e0603a', sun: '#ff6a3a', elev: -1.5, sunI: 0.8, sunR: 0.08, li: 0.45, hs: '#4a3060', hg: '#1a0c10', stars: 0.55 },
  { t: 1.00, top: '#03040c', mid: '#0b1030', bot: '#1e1a40', sun: '#ff6a3a', elev: -10, sunI: 0.0, sunR: 0.05, li: 0.16, hs: '#2a3466', hg: '#08060c', stars: 1 },
];

const BABY_POS = { x: 10.6, y: 13.6, z: 3 };

function initScene() {
  if (typeof THREE === 'undefined') { document.documentElement.classList.add('no-webgl'); return; }
  const canvas = document.getElementById('scene');
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  } catch (e) {
    document.documentElement.classList.add('no-webgl');
    canvas.remove();
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
  renderer.setSize(innerWidth, innerHeight, false);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x000000, 70, 340);
  const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 1500);

  const keys = SKY_KEYS.map((k) => ({
    ...k,
    top: new THREE.Color(k.top), mid: new THREE.Color(k.mid), bot: new THREE.Color(k.bot),
    sun: new THREE.Color(k.sun), hs: new THREE.Color(k.hs), hg: new THREE.Color(k.hg),
  }));

  /* Cielo */
  const skyU = {
    uTop: { value: new THREE.Color() }, uMid: { value: new THREE.Color() }, uBot: { value: new THREE.Color() },
    uSunCol: { value: new THREE.Color() }, uSunDir: { value: new THREE.Vector3(0, 0.1, -1) },
    uSunI: { value: 1 }, uSunR: { value: 0.04 },
  };
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(900, 48, 24),
    new THREE.ShaderMaterial({
      uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
      vertexShader: `varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `
        uniform vec3 uTop, uMid, uBot, uSunCol, uSunDir; uniform float uSunI, uSunR;
        varying vec3 vDir;
        void main(){
          vec3 d = normalize(vDir);
          float h = d.y;
          vec3 c = mix(uBot, uMid, smoothstep(-0.02, 0.2, h));
          c = mix(c, uTop, smoothstep(0.2, 0.8, h));
          vec3 sd = normalize(uSunDir);
          float cs = dot(d, sd);
          float s = max(cs, 0.0);
          float ang = acos(clamp(cs, -1.0, 1.0));
          float disc = 1.0 - smoothstep(uSunR * 0.9, uSunR, ang);
          c += uSunCol * (pow(s, 8.0) * 0.22 + pow(s, 64.0) * 0.6) * uSunI;
          c = mix(c, uSunCol * 1.2 + vec3(0.18), disc * clamp(uSunI, 0.0, 1.0));
          c *= mix(0.6, 1.0, smoothstep(-0.25, 0.0, h));
          gl_FragColor = vec4(c, 1.0);
        }`,
    })
  );
  sky.renderOrder = -1;
  scene.add(sky);

  /* Estrellas */
  const STAR_N = isMobile ? 1200 : 2200;
  const sPos = new Float32Array(STAR_N * 3), sPh = new Float32Array(STAR_N), sSz = new Float32Array(STAR_N);
  for (let i = 0; i < STAR_N; i++) {
    const u = Math.random() * Math.PI * 2, y = 0.04 + Math.random() * 0.96, r = Math.sqrt(1 - y * y);
    sPos.set([Math.cos(u) * r * 800, y * 800, Math.sin(u) * r * 800], i * 3);
    sPh[i] = Math.random() * 10; sSz[i] = 0.6 + Math.pow(Math.random(), 4) * 2.6;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
  starGeo.setAttribute('aPhase', new THREE.BufferAttribute(sPh, 1));
  starGeo.setAttribute('aSize', new THREE.BufferAttribute(sSz, 1));
  const starU = { uTime: { value: 0 }, uOpacity: { value: 1 }, uPR: { value: renderer.getPixelRatio() } };
  const stars = new THREE.Points(starGeo, new THREE.ShaderMaterial({
    uniforms: starU, transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending,
    vertexShader: `
      attribute float aPhase; attribute float aSize; uniform float uTime, uPR; varying float vA;
      void main(){ vA = 0.55 + 0.45 * sin(uTime * 1.7 + aPhase * 6.0);
        gl_PointSize = aSize * 2.2 * uPR; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `
      uniform float uOpacity; varying float vA;
      void main(){ float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(vec3(1.0, 0.95, 0.85), a * vA * uOpacity); }`,
  }));
  stars.renderOrder = 0;
  scene.add(stars);

  /* Luces */
  const hemi = new THREE.HemisphereLight(0xffffff, 0x222222, 0.9);
  const sunLight = new THREE.DirectionalLight(0xffffff, 1);
  const fill = new THREE.DirectionalLight(0xffe2b8, 0.3); // luz suave desde la cámara para que la roca no sea un bloque plano
  fill.position.set(30, 40, 90);
  scene.add(hemi, sunLight, sunLight.target, fill);

  /* Terreno */
  const SEG = isMobile ? 120 : 170;
  const tGeo = new THREE.PlaneGeometry(760, 760, SEG, SEG);
  tGeo.rotateX(-Math.PI / 2);
  const tp = tGeo.attributes.position, tCol = new Float32Array(tp.count * 3);
  const gA = new THREE.Color('#d39a45'), gB = new THREE.Color('#8f6b2c'), gC = new THREE.Color('#5d5a26'), tmp = new THREE.Color();
  for (let i = 0; i < tp.count; i++) {
    const x = tp.getX(i), z = tp.getZ(i), y = terrainH(x, z);
    tp.setY(i, y + (hash2(x, z) - 0.5) * 0.35);
    const n = fbm(x * 0.045, z * 0.045);
    tmp.copy(gA).lerp(gB, smooth(0.35, 0.7, n)).lerp(gC, smooth(0.62, 0.85, n) * 0.7);
    tmp.multiplyScalar(0.92 + hash2(z, x) * 0.16);
    tCol.set([tmp.r, tmp.g, tmp.b], i * 3);
  }
  tGeo.setAttribute('color', new THREE.BufferAttribute(tCol, 3));
  tGeo.computeVertexNormals();
  scene.add(new THREE.Mesh(tGeo, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 1, metalness: 0 })));

  /* Roca del rey */
  const rockMat = new THREE.MeshStandardMaterial({ color: '#7a5840', flatShading: true, roughness: 1 });
  function makeRock(scale, seed) {
    const s = new THREE.Shape();
    [[-6, 0], [-5, 1.4], [-3.6, 2.3], [-1.6, 3.3], [0.4, 4.3], [2.2, 5.2], [3.4, 5.55], [4.4, 5.75], [4.5, 5.25],
     [3.2, 4.85], [2.3, 4.3], [1.9, 3.5], [2.2, 2.6], [2.8, 1.4], [3.4, 0]]
      .forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
    s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth: 3.4, steps: 3, bevelEnabled: true, bevelThickness: 0.9, bevelSize: 0.6, bevelSegments: 2, curveSegments: 4 });
    geo.translate(1, -0.2, -1.7);
    roughen(geo, 0.38, seed);
    const g = new THREE.Group();
    const main = new THREE.Mesh(geo, rockMat);
    g.add(main);
    // peñascos en la base
    for (let i = 0; i < 9; i++) {
      const r = 0.9 + hash2(i, seed) * 1.6;
      const b = new THREE.Mesh(roughen(new THREE.IcosahedronGeometry(r, 1), r * 0.35, seed + i * 3), rockMat);
      b.position.set(-6 + i * 1.3 + hash2(seed, i) * 1.2, r * 0.25, (hash2(i + 9, seed) - 0.5) * 6);
      b.scale.y = 0.7;
      g.add(b);
    }
    g.scale.setScalar(scale);
    return g;
  }
  const pride = makeRock(2.5, 1);
  pride.position.set(0, -0.9, 0);
  scene.add(pride);
  /* León Ernesto sentado en la punta de la roca */
  const glowCanvas = document.createElement('canvas');
  glowCanvas.width = glowCanvas.height = 128;
  const gctx = glowCanvas.getContext('2d');
  const grad = gctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255,220,150,0.9)');
  grad.addColorStop(0.35, 'rgba(255,190,90,0.35)');
  grad.addColorStop(1, 'rgba(255,170,60,0)');
  gctx.fillStyle = grad;
  gctx.fillRect(0, 0, 128, 128);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(glowCanvas), blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  halo.scale.set(14, 14, 1);
  halo.position.set(BABY_POS.x, BABY_POS.y + 3, BABY_POS.z - 0.6);
  scene.add(halo);
  const babyMat = new THREE.SpriteMaterial({ fog: false, transparent: true, opacity: 0 });
  const baby = new THREE.Sprite(babyMat);
  baby.center.set(0.5, 0.07);
  baby.position.set(BABY_POS.x, BABY_POS.y, BABY_POS.z);
  new THREE.TextureLoader().load('assets/leon.png', (tex) => {
    const h = 6;
    baby.scale.set(h * tex.image.width / tex.image.height, h, 1);
    babyMat.map = tex;
    babyMat.opacity = 1;
    babyMat.needsUpdate = true;
  });
  scene.add(baby);
  const white = new THREE.Color(1, 1, 1);

  const rock2 = makeRock(1.3, 7);
  rock2.position.set(-78, terrainH(-78, -70) - 0.6, -70);
  rock2.scale.x *= -1;
  scene.add(rock2);

  /* Acacias */
  const trunkMat = new THREE.MeshStandardMaterial({ color: '#3d2a1c', flatShading: true, roughness: 1 });
  const leafMat = new THREE.MeshStandardMaterial({ color: '#4d4c22', flatShading: true, roughness: 1 });
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  function makeAcacia(seed) {
    const g = new THREE.Group();
    const lean = (hash2(seed, 1) - 0.5) * 1.2;
    const tube = (pts, r) => new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 8, r, 5, false), trunkMat);
    g.add(tube([V(0, 0, 0), V(0.4 + lean * 0.3, 2.4, 0.1), V(-0.2 + lean, 4.8, 0), V(0.3 + lean, 6.4, 0.1)], 0.32));
    g.add(tube([V(-0.2 + lean, 4.8, 0), V(-1.6 + lean, 6.2, 0.4), V(-3 + lean, 7.1, 0.3)], 0.17));
    g.add(tube([V(0.3 + lean, 6.4, 0.1), V(1.8 + lean, 7.0, -0.3), V(3.2 + lean, 7.4, -0.2)], 0.15));
    [[-2.6, 7.6, 0.2, 3.6], [0.4, 7.9, 0, 4.4], [3.0, 7.7, -0.3, 3.2], [-0.6, 8.3, 0.8, 3.0]].forEach(([x, y, z, w], i) => {
      const c = new THREE.Mesh(roughen(new THREE.IcosahedronGeometry(1, 1), 0.25, seed * 10 + i), leafMat);
      c.position.set(x + lean, y, z);
      c.scale.set(w, 0.55, w * 0.75);
      g.add(c);
    });
    return g;
  }
  [[-38, 12, 1.1], [44, -6, 1.3], [-66, -34, 1.6], [80, 28, 1.4], [-24, 52, 0.9], [62, -58, 1.8], [-105, 14, 1.5], [118, -22, 1.7], [18, -96, 2.0]]
    .forEach(([x, z, s], i) => {
      const t = makeAcacia(i + 2);
      t.position.set(x, terrainH(x, z) - 0.2, z);
      t.rotation.y = hash2(i, 3) * Math.PI;
      t.scale.setScalar(s);
      scene.add(t);
    });

  /* Polvo dorado / luciérnagas */
  const DUST_N = isMobile ? 380 : 760;
  const dPos = new Float32Array(DUST_N * 3), dPh = new Float32Array(DUST_N);
  for (let i = 0; i < DUST_N; i++) {
    dPos.set([(Math.random() - 0.5) * 140, Math.random() * 42, -50 + Math.random() * 130], i * 3);
    dPh[i] = Math.random() * 100;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
  dustGeo.setAttribute('aPhase', new THREE.BufferAttribute(dPh, 1));
  const dustU = { uTime: { value: 0 }, uColor: { value: new THREE.Color('#ffd28a') }, uOpacity: { value: 0.8 }, uPR: { value: renderer.getPixelRatio() } };
  scene.add(new THREE.Points(dustGeo, new THREE.ShaderMaterial({
    uniforms: dustU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `
      attribute float aPhase; uniform float uTime, uPR; varying float vA;
      void main(){
        vec3 p = position;
        p.y += sin(uTime * 0.35 + aPhase) * 1.6;
        p.x += cos(uTime * 0.22 + aPhase * 1.3) * 1.2;
        p.z += sin(uTime * 0.18 + aPhase * 0.7) * 1.2;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vA = 0.45 + 0.55 * sin(uTime * 2.0 + aPhase * 5.0);
        gl_PointSize = uPR * 26.0 / -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform vec3 uColor; uniform float uOpacity; varying float vA;
      void main(){ float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(uColor, a * a * vA * uOpacity); }`,
  })));

  /* Parvada de aves */
  const birdMat = new THREE.MeshBasicMaterial({ color: '#1a0f0a', side: THREE.DoubleSide, fog: false });
  const wingL = new THREE.BufferGeometry();
  wingL.setAttribute('position', new THREE.Float32BufferAttribute([0.45, 0, 0, -0.45, 0, 0, -0.25, 0, 2.0], 3));
  const wingR = new THREE.BufferGeometry();
  wingR.setAttribute('position', new THREE.Float32BufferAttribute([0.45, 0, 0, -0.45, 0, 0, -0.25, 0, -2.0], 3));
  const flock = new THREE.Group();
  const birds = [];
  [[0, 0, 0], [-3, -0.6, 3], [-3, -0.6, -3], [-6, -1.2, 6], [-6, -1.2, -6], [-9.5, -1.4, 2.5], [-11, -2, -8]].forEach(([x, y, z], i) => {
    const b = new THREE.Group();
    const l = new THREE.Mesh(wingL, birdMat), r = new THREE.Mesh(wingR, birdMat);
    b.add(l, r, new THREE.Mesh(new THREE.ConeGeometry(0.22, 1.4, 4).rotateZ(-Math.PI / 2), birdMat));
    b.position.set(x, y, z);
    b.userData = { l, r, ph: i * 0.7 };
    birds.push(b);
    flock.add(b);
  });
  flock.scale.setScalar(1.3);
  scene.add(flock);

  /* Recorrido de cámara */
  const camCurve = new THREE.CatmullRomCurve3([
    V(0, 4.5, 66), V(-28, 8, 44), V(-22, 17, 36), V(24, 10, 32), V(40, 22, 6), V(8, 28, 52), V(0, 9, 74),
  ]);
  const lookCurve = new THREE.CatmullRomCurve3([
    V(0, 21, 0), V(0, 14, 0), V(6, 13, 0), V(0, 7, 0), V(-4, 6, -12), V(0, 18, -70), V(0, 44, -140),
  ]);
  const introFrom = V(0, 2.2, 92), introLook = V(0, 26, 0);
  const camPos = V(0, 0, 0), camLook = V(0, 0, 0), sunDir = V(0, 0, -1);

  function applySky(t) {
    let i = 0;
    while (i < keys.length - 2 && t > keys[i + 1].t) i++;
    const a = keys[i], b = keys[i + 1];
    const f = smooth(0, 1, (t - a.t) / (b.t - a.t));
    skyU.uTop.value.copy(a.top).lerp(b.top, f);
    skyU.uMid.value.copy(a.mid).lerp(b.mid, f);
    skyU.uBot.value.copy(a.bot).lerp(b.bot, f);
    skyU.uSunCol.value.copy(a.sun).lerp(b.sun, f);
    skyU.uSunI.value = lerp(a.sunI, b.sunI, f);
    skyU.uSunR.value = lerp(a.sunR, b.sunR, f);
    const e = THREE.MathUtils.degToRad(lerp(a.elev, b.elev, f)), az = 0.1;
    sunDir.set(Math.sin(az) * Math.cos(e), Math.sin(e), -Math.cos(az) * Math.cos(e));
    skyU.uSunDir.value.copy(sunDir);
    scene.fog.color.copy(skyU.uBot.value).lerp(skyU.uMid.value, 0.15);
    hemi.color.copy(a.hs).lerp(b.hs, f);
    hemi.groundColor.copy(a.hg).lerp(b.hg, f);
    const li = lerp(a.li, b.li, f);
    hemi.intensity = 0.35 + li * 0.35;
    fill.intensity = 0.08 + li * 0.22;
    sunLight.color.copy(skyU.uSunCol.value);
    sunLight.intensity = Math.max(0, Math.sin(e) + 0.08) * li * 2.2;
    sunLight.position.copy(sunDir).multiplyScalar(200);
    const night = lerp(a.stars, b.stars, f);
    starU.uOpacity.value = night;
    // de día polvo dorado; de noche luciérnagas
    dustU.uColor.value.set('#ffd28a').lerp(new THREE.Color('#c8ff8a'), night * 0.6);
    dustU.uOpacity.value = 0.55 + night * 0.45;
    babyMat.color.copy(white).lerp(skyU.uSunCol.value, 0.15).multiplyScalar(0.7 + 0.3 * (1 - night));
    halo.material.opacity = 0.55 + night * 0.35;
  }

  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w / h < 0.8 ? 72 : w / h < 1.2 ? 62 : 52;
    camera.updateProjectionMatrix();
  }
  addEventListener('resize', resize);
  resize();

  const clock = new THREE.Clock();
  function frame() {
    requestAnimationFrame(frame);
    if (document.hidden) return;
    const time = clock.getElapsedTime();
    const k = reduceMotion ? 1 : 0.06;
    state.scroll += (state.scrollTarget - state.scroll) * k;
    state.px += (state.tx - state.px) * 0.05;
    state.py += (state.ty - state.py) * 0.05;

    const p = Math.min(1, Math.max(0, state.scroll));
    const ie = state.intro;
    applySky(0.22 * ie + p * 0.78);

    camCurve.getPoint(p, camPos);
    lookCurve.getPoint(p, camLook);
    camPos.lerpVectors(introFrom, camPos, ie);
    camLook.lerpVectors(introLook, camLook, ie);
    camPos.x += state.px * 3;
    camPos.y += state.py * 1.6 + (reduceMotion ? 0 : Math.sin(time * 0.4) * 0.25);
    camPos.y = Math.max(camPos.y, terrainH(camPos.x, camPos.z) + 2.2);
    camera.position.copy(camPos);
    camera.lookAt(camLook);

    sky.position.copy(camera.position);
    stars.position.copy(camera.position);
    stars.rotation.y = time * 0.004;

    dustU.uTime.value = time;
    starU.uTime.value = time;

    const fx = ((time * 7) % 420) - 210;
    flock.position.set(fx, 46 + Math.sin(time * 0.3) * 3, -95);
    birds.forEach((b) => {
      const w = Math.sin(time * 7 + b.userData.ph) * 0.65;
      b.userData.l.rotation.x = w;
      b.userData.r.rotation.x = -w;
    });

    renderer.render(scene, camera);
  }
  frame();
}

/* ---------- Scroll y movimiento ---------- */
function updateScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  state.scrollTarget = max > 0 ? scrollY / max : 0;
}
addEventListener('scroll', updateScroll, { passive: true });
addEventListener('resize', updateScroll);

addEventListener('pointermove', (e) => {
  if (e.pointerType !== 'mouse') return;
  state.tx = (e.clientX / innerWidth) * 2 - 1;
  state.ty = -((e.clientY / innerHeight) * 2 - 1);
});
let baseBeta = null;
function onOrient(e) {
  if (e.gamma == null) return;
  if (baseBeta == null) baseBeta = e.beta;
  state.tx = Math.max(-1, Math.min(1, e.gamma / 30));
  state.ty = Math.max(-1, Math.min(1, (e.beta - baseBeta) / -30));
}

/* ---------- Música (assets/musica.mp3) ---------- */
const music = document.getElementById('music');
const musicBtn = document.getElementById('music-btn');
let musicOk = true;
music.addEventListener('error', () => { musicOk = false; musicBtn.remove(); });
music.src = INVITACION.musica;
function startMusic() {
  if (!musicOk) return;
  music.volume = 0;
  music.play().then(() => {
    musicBtn.classList.add('show');
    if (window.gsap) gsap.to(music, { volume: 0.6, duration: 4 });
    else music.volume = 0.6;
  }).catch(() => musicBtn.classList.add('show', 'paused'));
}
musicBtn.addEventListener('click', () => {
  if (music.paused) { music.play(); musicBtn.classList.remove('paused'); }
  else { music.pause(); musicBtn.classList.add('paused'); }
  musicBtn.setAttribute('aria-pressed', String(!music.paused));
  musicBtn.setAttribute('aria-label', music.paused ? 'Reproducir música' : 'Pausar música');
});

/* ---------- Abrir la invitación ---------- */
let heroTl;
function openInvite() {
  const intro = document.getElementById('intro');
  if (intro.classList.contains('open')) return;

  // iOS pide permiso para usar el giroscopio; tiene que ser dentro del toque
  if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function') {
    DeviceOrientationEvent.requestPermission().then((r) => r === 'granted' && addEventListener('deviceorientation', onOrient)).catch(() => {});
  } else if (window.DeviceOrientationEvent) {
    addEventListener('deviceorientation', onOrient);
  }

  intro.classList.add('open');
  startMusic();
  if (window.gsap) {
    gsap.to(state, { intro: 1, duration: reduceMotion ? 0.6 : 6, ease: 'power2.inOut' });
    heroTl && heroTl.play();
  } else {
    state.intro = 1;
  }
  setTimeout(() => {
    document.body.classList.remove('locked');
    updateScroll();
    window.ScrollTrigger && ScrollTrigger.refresh();
  }, reduceMotion ? 300 : 1800);
}
document.getElementById('seal').addEventListener('click', openInvite);

/* ---------- Animaciones de entrada ---------- */
function initAnimations() {
  if (!window.gsap) return;
  gsap.registerPlugin(ScrollTrigger);
  if (reduceMotion) {
    heroTl = gsap.timeline({ paused: true });
    return;
  }

  heroTl = gsap.timeline({ paused: true, delay: 1.1 })
    .from('.hero-kicker', { opacity: 0, y: 24, letterSpacing: '0.9em', duration: 1.6, ease: 'power3.out' })
    .from('.name .char', {
      opacity: 0, yPercent: 110, rotationX: -100, transformPerspective: 700, transformOrigin: '50% 100%',
      stagger: 0.07, duration: 1.3, ease: 'back.out(1.7)',
    }, 0.4)
    .from('.surname', { opacity: 0, y: 14, letterSpacing: '0.8em', duration: 1.4, ease: 'power3.out' }, 1.2)
    .from('.subtitle', { opacity: 0, scale: 0.7, duration: 1.4, ease: 'expo.out' }, 1.3)
    .from('.date-line', { opacity: 0, y: 18, duration: 1 }, 1.7)
    .from('.scroll-cue', { opacity: 0, duration: 1 }, 2.2);

  gsap.utils.toArray('.reveal').forEach((el) => {
    gsap.from(el, {
      opacity: 0, y: 70, rotationX: -28, scale: 0.94,
      transformPerspective: 1000, transformOrigin: '50% 100%',
      duration: 1.3, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' },
    });
  });

  gsap.utils.toArray('.units .unit').forEach((el, i) => {
    gsap.from(el, {
      opacity: 0, rotationY: -90, transformPerspective: 600, duration: 1, delay: i * 0.12, ease: 'back.out(1.4)',
      scrollTrigger: { trigger: '.units', start: 'top 88%' },
    });
  });

  // la manada de huellas camina al final
  gsap.from('.paws svg', {
    opacity: 0, scale: 0, stagger: 0.25, duration: 0.6, ease: 'back.out(2)',
    scrollTrigger: { trigger: '.paws', start: 'top 90%' },
  });
}

/* ---------- Tarjetas con inclinación 3D ---------- */
document.querySelectorAll('.tilt').forEach((card) => {
  card.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    card.style.transform = `perspective(900px) rotateY(${(x - 0.5) * 14}deg) rotateX(${(0.5 - y) * 12}deg) translateZ(10px)`;
    card.style.setProperty('--mx', `${x * 100}%`);
    card.style.setProperty('--my', `${y * 100}%`);
  });
  card.addEventListener('pointerleave', () => { card.style.transform = ''; });
});

/* ---------- Cuenta regresiva ---------- */
(() => {
  const els = {};
  document.querySelectorAll('[data-unit]').forEach((el) => (els[el.dataset.unit] = el));
  const set = (k, v) => {
    const s = String(v).padStart(2, '0');
    if (els[k].textContent === s) return;
    els[k].textContent = s;
    els[k].classList.remove('tick');
    void els[k].offsetWidth;
    els[k].classList.add('tick');
  };
  function tick() {
    const diff = Math.max(0, fechaEvento - Date.now());
    set('d', Math.floor(diff / 864e5));
    set('h', Math.floor(diff / 36e5) % 24);
    set('m', Math.floor(diff / 6e4) % 60);
    set('s', Math.floor(diff / 1e3) % 60);
  }
  tick();
  setInterval(tick, 1000);
})();

/* ---------- Calendario ---------- */
(() => {
  const start = fechaEvento, end = new Date(start.getTime() + 11 * 36e5); // hasta que termine la fiesta
  const f = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const title = `Bautizo de ${INVITACION.nombre} ${INVITACION.apellidos}`;
  const loc = `${INVITACION.ceremonia.lugar}, ${INVITACION.ceremonia.direccion}`;
  const details = `Ceremonia: ${INVITACION.ceremonia.hora} — ${INVITACION.ceremonia.lugar}\n${INVITACION.recepcion.titulo}: ${INVITACION.recepcion.hora} — ${INVITACION.recepcion.lugar}`;
  document.getElementById('gcal').href = 'https://calendar.google.com/calendar/render?action=TEMPLATE'
    + `&text=${encodeURIComponent(title)}&dates=${f(start)}/${f(end)}`
    + `&location=${encodeURIComponent(loc)}&details=${encodeURIComponent(details)}`;
  document.getElementById('ics').addEventListener('click', () => {
    const esc = (s) => s.replace(/[,;\\]/g, (m) => '\\' + m).replace(/\n/g, '\\n');
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Bautizo Leon Ernesto//ES', 'BEGIN:VEVENT',
      `UID:${f(start)}-leon-ernesto@invitacion`, `DTSTAMP:${f(new Date())}`, `DTSTART:${f(start)}`, `DTEND:${f(end)}`,
      `SUMMARY:${esc(title)}`, `LOCATION:${esc(loc)}`, `DESCRIPTION:${esc(details)}`,
      'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', `DESCRIPTION:${esc(title)}`, 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
    a.download = 'bautizo-leon-ernesto.ics';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  });
})();

/* ---------- Mesa de regalos ---------- */
(() => {
  document.getElementById('gift-link').href = INVITACION.regalos.link;
  const btn = document.getElementById('copy-event');
  btn.addEventListener('click', async () => {
    const num = INVITACION.regalos.evento;
    try {
      await navigator.clipboard.writeText(num);
    } catch (e) {
      const t = document.createElement('textarea');
      t.value = num;
      document.body.appendChild(t);
      t.select();
      document.execCommand('copy');
      t.remove();
    }
    btn.textContent = '¡Copiado!';
    setTimeout(() => (btn.textContent = 'Copiar número'), 2000);
  });
})();

/* ---------- Confirmación por WhatsApp ---------- */
(() => {
  const form = document.getElementById('rsvp');
  const guests = document.getElementById('guests-field');
  const err = document.getElementById('form-error');
  form.addEventListener('change', () => guests.classList.toggle('off', form.asiste.value === 'no'));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = form.nombre.value.trim();
    if (!nombre) { err.textContent = 'Escribe tu nombre para confirmar.'; form.nombre.focus(); return; }
    err.textContent = '';
    const si = form.asiste.value === 'si';
    const n = form.personas.value;
    let msg = si
      ? `¡Hola! Soy ${nombre} y confirmo mi asistencia al bautizo de ${INVITACION.nombre} 🦁✨\nPersonas: ${n}`
      : `¡Hola! Soy ${nombre}. Lamentablemente no podré asistir al bautizo de ${INVITACION.nombre}, pero les mando todo mi cariño 🦁`;
    const extra = form.mensaje.value.trim();
    if (extra) msg += `\n\nMensaje para León: ${extra}`;
    window.open(`https://wa.me/${INVITACION.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
  });
})();

/* ---------- Arranque ---------- */
initScene();
initAnimations();
updateScroll();
