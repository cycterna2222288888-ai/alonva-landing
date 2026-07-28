/* bg-scene.js — fixed 3D background (glass tech sphere), camera flown by
   GSAP ScrollTrigger as the card grids pass through view. Pure math below,
   THREE.* object building after, mutation confined to the frame() loop. */
(function () {
  "use strict";

  var canvas = document.getElementById("bg-scene");
  if (!canvas || !window.THREE) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setClearColor(0x050608, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  var scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x050608, 8, 18);

  var camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  var CAMERA_RADIUS = 6.2;
  camera.position.set(0, 0, CAMERA_RADIUS);

  // Ported from three.js's own examples/jsm/environments/RoomEnvironment —
  // a lit room baked to a PMREM texture. This is the standard no-HDRI-file
  // stand-in for drei's <Environment>, and gives MeshPhysicalMaterial real
  // reflections/highlights to read against instead of a flat fake sky.
  function buildEnvironment() {
    var pmrem = new THREE.PMREMGenerator(renderer);
    var envScene = new THREE.Scene();

    var geometry = new THREE.BoxGeometry();
    geometry.deleteAttribute("uv");

    function areaLightMaterial(intensity) {
      var m = new THREE.MeshBasicMaterial();
      m.color.setScalar(intensity);
      return m;
    }

    var mainIntensity = renderer._useLegacyLights === false ? 900 : 5;
    var mainLight = new THREE.PointLight(0xffffff, mainIntensity, 28, 2);
    mainLight.position.set(0.418, 16.199, 0.3);
    envScene.add(mainLight);

    var room = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ side: THREE.BackSide }));
    room.position.set(-0.757, 13.219, 0.717);
    room.scale.set(31.713, 28.305, 28.591);
    envScene.add(room);

    var boxMaterial = new THREE.MeshStandardMaterial();
    [
      { p: [-10.906, 2.009, 1.846], r: [0, -0.195, 0], s: [2.328, 7.905, 4.651] },
      { p: [-5.607, -0.754, -0.758], r: [0, 0.994, 0], s: [1.97, 1.534, 3.955] },
      { p: [6.167, 0.857, 7.803], r: [0, 0.561, 0], s: [3.927, 6.285, 3.687] },
      { p: [-2.017, 0.018, 6.124], r: [0, 0.333, 0], s: [2.002, 4.566, 2.064] },
      { p: [2.291, -0.756, -2.621], r: [0, -0.286, 0], s: [1.546, 1.552, 1.496] },
      { p: [-2.193, -0.369, -5.547], r: [0, 0.516, 0], s: [3.875, 3.487, 2.986] }
    ].forEach(function (b) {
      var box = new THREE.Mesh(geometry, boxMaterial);
      box.position.set(b.p[0], b.p[1], b.p[2]);
      box.rotation.set(b.r[0], b.r[1], b.r[2]);
      box.scale.set(b.s[0], b.s[1], b.s[2]);
      envScene.add(box);
    });

    [
      { p: [-16.116, 14.37, 8.208], s: [0.1, 2.428, 2.739], i: 50 },
      { p: [-16.109, 18.021, -8.207], s: [0.1, 2.425, 2.751], i: 50 },
      { p: [14.904, 12.198, -1.832], s: [0.15, 4.265, 6.331], i: 17 },
      { p: [-0.462, 8.89, 14.52], s: [4.38, 5.441, 0.088], i: 43 },
      { p: [3.235, 11.486, -12.541], s: [2.5, 2.0, 0.1], i: 20 },
      { p: [0.0, 20.0, 0.0], s: [1.0, 0.1, 1.0], i: 100 }
    ].forEach(function (l) {
      var mesh = new THREE.Mesh(geometry, areaLightMaterial(l.i));
      mesh.position.set(l.p[0], l.p[1], l.p[2]);
      mesh.scale.set(l.s[0], l.s[1], l.s[2]);
      envScene.add(mesh);
    });

    var tex = pmrem.fromScene(envScene, 0.04).texture;
    pmrem.dispose();
    return tex;
  }

  var envMap = buildEnvironment();
  scene.environment = envMap;
  scene.add(new THREE.AmbientLight(0xdfe9ff, 0.15));
  var keyLight = new THREE.DirectionalLight(0xdfe9ff, 0.6);
  keyLight.position.set(4, 6, 4);
  scene.add(keyLight);

  /* ---------- tech sphere: emissive core + glass shell + wireframe cage ---------- */
  var sphereGroup = new THREE.Group();
  scene.add(sphereGroup);

  var coreMaterial = new THREE.MeshStandardMaterial({
    color: 0x052e1f, emissive: 0x39ff8f, emissiveIntensity: 1.3, roughness: 0.3, metalness: 0.1
  });
  var core = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 2), coreMaterial);
  core.scale.setScalar(0.62);
  sphereGroup.add(core);

  var coreLight = new THREE.PointLight(0x39ff8f, 1.3, 4.2, 2);
  sphereGroup.add(coreLight);

  var glassShell = new THREE.Mesh(
    new THREE.SphereGeometry(1.35, 96, 96),
    new THREE.MeshPhysicalMaterial({
      color: 0x0a0e14, roughness: 0.35, metalness: 0, transmission: 0.9, thickness: 2.2,
      ior: 1.45, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.5
    })
  );
  sphereGroup.add(glassShell);

  var wireCage = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1, 3),
    new THREE.MeshBasicMaterial({ color: 0x4fb2ff, wireframe: true, transparent: true, opacity: 0.16 })
  );
  wireCage.scale.setScalar(1.42);
  wireCage.rotation.set(0.3, 0.2, 0);
  sphereGroup.add(wireCage);

  var blueLight = new THREE.PointLight(0x2f7dff, 2.2, 9);
  blueLight.position.set(3.2, 2, 2);
  scene.add(blueLight);

  var greenLight = new THREE.PointLight(0x39ff8f, 1.8, 9);
  greenLight.position.set(-3.2, -1.6, 2);
  scene.add(greenLight);

  /* ---------- particle field ---------- */
  var PARTICLE_COUNT = 280;
  var particlePositions = new Float32Array(PARTICLE_COUNT * 3);
  for (var i = 0; i < PARTICLE_COUNT; i++) {
    var radius = 6 + Math.random() * 6;
    var theta = Math.random() * Math.PI * 2;
    var phi = Math.acos(Math.random() * 2 - 1);
    particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.6;
    particlePositions[i * 3 + 2] = radius * Math.cos(phi);
  }
  var particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
  var particles = new THREE.Points(particleGeometry, new THREE.PointsMaterial({
    size: 0.02, color: 0x5fd0ff, transparent: true, opacity: 0.5, sizeAttenuation: true
  }));
  scene.add(particles);

  /* ---------- mouse parallax ---------- */
  var mouse = { x: 0, y: 0 };
  window.addEventListener("pointermove", function (e) {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
  });

  /* ---------- resize + responsive scale ---------- */
  function responsiveScale() {
    var vFov = (camera.fov * Math.PI) / 180;
    var visibleHeight = 2 * Math.tan(vFov / 2) * CAMERA_RADIUS;
    var visibleWidth = visibleHeight * camera.aspect;
    var scale = visibleWidth / 8;
    return Math.min(1.15, Math.max(0.65, scale));
  }
  function resize() {
    var w = window.innerWidth, h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    renderer.setSize(w, h);
    sphereGroup.scale.setScalar(responsiveScale());
  }
  window.addEventListener("resize", resize);
  resize();

  /* ---------- GSAP ScrollTrigger camera orbit ---------- */
  var drift = { azimuth: 0, elevation: 0 };
  try {
    if (!reduceMotion && window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      var passes = [
        { trigger: "#solutions", azimuth: -0.22, elevation: 0.05 },
        { trigger: "#usecases", azimuth: 0.22, elevation: -0.04 }
      ];
      passes.forEach(function (p) {
        var el = document.querySelector(p.trigger);
        if (!el) return;
        ScrollTrigger.create({
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
          onUpdate: function (self) {
            var arc = Math.sin(self.progress * Math.PI);
            drift.azimuth = p.azimuth * arc;
            drift.elevation = p.elevation * arc;
          }
        });
      });
    }
  } catch (e) {}

  /* ---------- render loop ---------- */
  function frame(tsMs) {
    var t = tsMs * 0.001;

    if (!reduceMotion) {
      sphereGroup.position.y = Math.sin(t * 0.6) * 0.18;
      sphereGroup.rotation.y += 0.002;
      sphereGroup.rotation.x += (mouse.y * 0.15 - sphereGroup.rotation.x) * 0.04;
      sphereGroup.rotation.z += (-mouse.x * 0.1 - sphereGroup.rotation.z) * 0.04;
      sphereGroup.position.x += (mouse.x * 0.35 - sphereGroup.position.x) * 0.03;

      var pulse = 1.3 + Math.sin(t * 1.8) * 0.85;
      coreLight.intensity = pulse;
      coreMaterial.emissiveIntensity = pulse * 0.7;

      blueLight.position.x = 3.2 + mouse.x * 1.6;
      blueLight.position.y = 2 + mouse.y * 1.1;
      greenLight.position.x = -3.2 - mouse.x * 1.6;
      greenLight.position.y = -1.6 - mouse.y * 1.1;

      particles.rotation.y += 0.00025;

      var targetX = CAMERA_RADIUS * Math.sin(drift.azimuth) * Math.cos(drift.elevation);
      var targetY = CAMERA_RADIUS * Math.sin(drift.elevation);
      var targetZ = CAMERA_RADIUS * Math.cos(drift.azimuth) * Math.cos(drift.elevation);
      camera.position.x += (targetX - camera.position.x) * 0.05;
      camera.position.y += (targetY - camera.position.y) * 0.05;
      camera.position.z += (targetZ - camera.position.z) * 0.05;
      camera.lookAt(0, 0, 0);
    }

    renderer.render(scene, camera);
    if (!reduceMotion) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
