/* global THREE */
(function createEnergyThreeMap() {
  const canvas = document.getElementById('three-map-canvas');
  const stage = document.querySelector('.map-stage');

  if (!canvas || !stage || !window.THREE) return;

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-500, 500, 380, -380, 0.1, 2200);
  camera.position.set(0, 0, 1040);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const mapGroup = new THREE.Group();
  scene.add(mapGroup);

  scene.add(new THREE.HemisphereLight(0x78b9df, 0x010714, 0.9));
  const keyLight = new THREE.DirectionalLight(0xd9fbff, 1.45);
  keyLight.position.set(-360, 430, 800);
  scene.add(keyLight);
  const rimLight = new THREE.PointLight(0x155fae, 16, 940, 2);
  rimLight.position.set(260, -160, 340);
  scene.add(rimLight);

  const provinceMeshes = new Map();
  const hoverMeshes = new Set();
  let activeCode = null;

  const MAP_WIDTH = 1000;
  const MAP_HEIGHT = 760;
  const DEPTH = 26;
  const BASE_COLOR = new THREE.Color(0x02173d);
  const ACTIVE_COLOR = new THREE.Color(0x0e4b73);
  const HOVER_COLOR = new THREE.Color(0x062d58);

  function project(point) {
    return [72 + (point[0] - 73.5) * 13.05, 668 - (point[1] - 18) * 14.35];
  }

  function toVector(point) {
    const [x, y] = project(point);
    return new THREE.Vector2(x - MAP_WIDTH / 2, MAP_HEIGHT / 2 - y);
  }

  function clockwise(points) {
    return THREE.ShapeUtils.isClockWise(points) ? points : points.slice().reverse();
  }

  function counterClockwise(points) {
    return THREE.ShapeUtils.isClockWise(points) ? points.slice().reverse() : points;
  }

  function polygonShape(rings) {
    const outer = clockwise(rings[0].map(toVector));
    const shape = new THREE.Shape(outer);
    rings.slice(1).forEach(ring => shape.holes.push(new THREE.Path(counterClockwise(ring.map(toVector)))));
    return shape;
  }

  function makeSurfaceMaterial() {
    const material = new THREE.MeshPhysicalMaterial({
      color: BASE_COLOR,
      metalness: 0.2,
      roughness: 0.22,
      clearcoat: 0.92,
      clearcoatRoughness: 0.18,
      transparent: true,
      opacity: 0.98,
      side: THREE.FrontSide
    });
    material.onBeforeCompile = shader => {
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying float vEnergyMapY;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvEnergyMapY = position.y;');
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying float vEnergyMapY;')
        .replace('#include <color_fragment>', '#include <color_fragment>\nfloat energyGradient = smoothstep(-360.0, 330.0, vEnergyMapY);\ndiffuseColor.rgb *= mix(vec3(0.58, 0.82, 1.0), vec3(0.36, 0.63, 0.9), energyGradient);');
    };
    material.needsUpdate = true;
    return material;
  }

  function makeSideMaterial() {
    return new THREE.MeshStandardMaterial({
      color: 0x000918,
      metalness: 0.28,
      roughness: 0.35,
      transparent: true,
      opacity: 0.96,
      side: THREE.DoubleSide
    });
  }

  function makeDepthMaterial() {
    return new THREE.MeshStandardMaterial({
      color: 0x000612,
      metalness: 0.34,
      roughness: 0.46,
      transparent: true,
      opacity: 0.94,
      side: THREE.DoubleSide
    });
  }

  function addPolygon(rings, adcode) {
    const shape = polygonShape(rings);
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: DEPTH,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 1.15,
      bevelThickness: 1.35,
      curveSegments: 1
    });
    geometry.computeVertexNormals();

    const mesh = new THREE.Mesh(geometry, [makeSurfaceMaterial(), makeSideMaterial()]);
    mesh.renderOrder = 2;
    mapGroup.add(mesh);

    // A displaced lower volume keeps the extrusion readable in an aligned orthographic view.
    const depthMesh = new THREE.Mesh(geometry.clone(), makeDepthMaterial());
    depthMesh.position.set(-8, -13, -DEPTH - 2);
    depthMesh.renderOrder = 1;
    mapGroup.add(depthMesh);

    const edgeGeometry = new THREE.EdgesGeometry(geometry, 20);
    const edges = new THREE.LineSegments(edgeGeometry, new THREE.LineBasicMaterial({
      color: 0x1b4565,
      transparent: true,
      opacity: 0.24,
      depthTest: false
    }));
    edges.position.z = DEPTH + 0.8;
    edges.renderOrder = 4;
    mapGroup.add(edges);

    const code = String(adcode);
    if (!provinceMeshes.has(code)) provinceMeshes.set(code, []);
    provinceMeshes.get(code).push({ mesh, edges, depthMesh });
  }

  function addFeature(feature) {
    const geometry = feature.geometry;
    const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
    polygons.forEach(rings => addPolygon(rings, feature.properties.adcode));
  }

  function setVisualState(entry, state) {
    const material = entry.mesh.material[0];
    const target = state === 'active' ? ACTIVE_COLOR : state === 'hover' ? HOVER_COLOR : BASE_COLOR;
    material.color.copy(target);
    material.emissive.set(state === 'active' ? 0x123c5e : state === 'hover' ? 0x08233d : 0x000000);
    material.emissiveIntensity = state === 'active' ? 0.62 : state === 'hover' ? 0.38 : 0;
    entry.edges.material.color.set(state === 'active' ? 0x9bd9de : state === 'hover' ? 0x4c8298 : 0x1b4565);
    entry.edges.material.opacity = state === 'active' ? 0.5 : state === 'hover' ? 0.32 : 0.24;
  }

  function refreshCode(code) {
    const state = code === activeCode ? 'active' : hoverMeshes.has(code) ? 'hover' : 'idle';
    (provinceMeshes.get(code) || []).forEach(entry => setVisualState(entry, state));
  }

  function resize() {
    const rect = stage.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    renderer.setSize(rect.width, rect.height, false);
    camera.left = -MAP_WIDTH / 2;
    camera.right = MAP_WIDTH / 2;
    camera.top = MAP_HEIGHT / 2;
    camera.bottom = -MAP_HEIGHT / 2;
    camera.updateProjectionMatrix();
  }

  function render(now) {
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  window.energyThreeMap = {
    load(geo) {
      geo.features.forEach(addFeature);
      resize();
      requestAnimationFrame(render);
    },
    select(adcode) {
      const code = adcode == null ? null : String(adcode);
      if (activeCode && activeCode !== code) refreshCode(activeCode);
      activeCode = code;
      if (activeCode) refreshCode(activeCode);
    },
    hover(adcode, enabled) {
      const code = String(adcode);
      if (enabled) hoverMeshes.add(code);
      else hoverMeshes.delete(code);
      refreshCode(code);
    },
    setTransform(transform) {
      canvas.style.transform = transform || '';
    },
    resize
  };

  window.addEventListener('resize', resize);
})();
