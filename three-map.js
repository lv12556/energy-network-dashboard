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
  const surfaceTexture = new THREE.TextureLoader().load('assets/image-1.png');
  surfaceTexture.encoding = THREE.sRGBEncoding;
  surfaceTexture.wrapS = THREE.ClampToEdgeWrapping;
  surfaceTexture.wrapT = THREE.ClampToEdgeWrapping;

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
        .replace('#include <common>', '#include <common>\nvarying float vEnergyMapY;\nvarying vec2 vEnergyTextureUv;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvEnergyMapY = position.y;\nvEnergyTextureUv = vec2((position.x + 500.0) / 1000.0, (position.y + 380.0) / 760.0);');
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying float vEnergyMapY;\nvarying vec2 vEnergyTextureUv;\nuniform sampler2D energySurfaceTexture;')
        .replace('#include <color_fragment>', '#include <color_fragment>\nvec4 energyTextureColor = texture2D(energySurfaceTexture, vEnergyTextureUv);\nfloat textureRelief = dot(energyTextureColor.rgb, vec3(0.299, 0.587, 0.114));\nfloat deepRelief = pow(clamp(textureRelief, 0.0, 1.0), 0.9);\ndiffuseColor.rgb = mix(vec3(0.003, 0.011, 0.04), vec3(0.018, 0.12, 0.38), deepRelief);');
      shader.uniforms.energySurfaceTexture = { value: surfaceTexture };
    };
    material.needsUpdate = true;
    return material;
  }

  function makeSideMaterial() {
    return new THREE.MeshStandardMaterial({
      color: 0x021a31,
      metalness: 0.22,
      roughness: 0.42,
      transparent: true,
      opacity: 0.82,
      side: THREE.DoubleSide
    });
  }

  function makeDepthMaterial() {
    return new THREE.MeshStandardMaterial({
      color: 0x01243b,
      metalness: 0.2,
      roughness: 0.5,
      transparent: true,
      opacity: 0.54,
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

    // A translucent lower volume gives the map a restrained, layered base.
    const depthMesh = new THREE.Mesh(geometry.clone(), makeDepthMaterial());
    depthMesh.position.set(-6, -10, -DEPTH - 2);
    depthMesh.renderOrder = 1;
    mapGroup.add(depthMesh);

    const edgeGeometry = new THREE.EdgesGeometry(geometry, 20);
    const edges = new THREE.LineSegments(edgeGeometry, new THREE.LineBasicMaterial({
      color: 0x123047,
      transparent: true,
      opacity: 0,
      depthTest: false
    }));
    edges.position.z = DEPTH + 0.8;
    edges.renderOrder = 4;
    mapGroup.add(edges);

    const baseRim = new THREE.LineSegments(edgeGeometry.clone(), new THREE.LineBasicMaterial({
      color: 0x2c8092,
      transparent: true,
      opacity: 0.16,
      depthTest: true,
      depthWrite: false
    }));
    baseRim.position.copy(depthMesh.position);
    baseRim.renderOrder = 3;
    mapGroup.add(baseRim);

    const code = String(adcode);
    if (!provinceMeshes.has(code)) provinceMeshes.set(code, []);
    provinceMeshes.get(code).push({ mesh, edges, depthMesh, baseRim });
  }

  function addFeature(feature) {
    const geometry = feature.geometry;
    const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
    polygons.forEach(rings => addPolygon(rings, feature.properties.adcode));
  }

  function addNationalOutline(geo) {
    const segments = new Map();
    const pointKey = point => `${Number(point[0]).toFixed(6)},${Number(point[1]).toFixed(6)}`;

    geo.features.forEach(feature => {
      const polygons = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates;
      polygons.forEach(rings => {
        const ring = rings[0];
        for (let index = 0; index < ring.length - 1; index += 1) {
          const start = ring[index];
          const end = ring[index + 1];
          const startKey = pointKey(start);
          const endKey = pointKey(end);
          if (startKey === endKey) continue;
          const key = startKey < endKey ? `${startKey}|${endKey}` : `${endKey}|${startKey}`;
          const segment = segments.get(key) || { count: 0, start, end };
          segment.count += 1;
          segments.set(key, segment);
        }
      });
    });

    const outerPositions = [];
    const provincePositions = [];
    segments.forEach(segment => {
      const start = toVector(segment.start);
      const end = toVector(segment.end);
      const target = segment.count === 1 ? outerPositions : provincePositions;
      target.push(start.x, start.y, DEPTH + 1.3, end.x, end.y, DEPTH + 1.3);
    });

    const outlineGeometry = new THREE.BufferGeometry();
    outlineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(outerPositions, 3));

    const makeOutline = (color, opacity, scale, order) => {
      const outline = new THREE.LineSegments(outlineGeometry, new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity,
        depthTest: false,
        depthWrite: false,
        toneMapped: false
      }));
      outline.scale.setScalar(scale);
      outline.renderOrder = order;
      mapGroup.add(outline);
    };

    makeOutline(0x0c85df, 0.2, 1.024, 8);
    makeOutline(0x23cfff, 0.44, 1.017, 9);
    makeOutline(0x70efff, 0.78, 1.01, 10);
    makeOutline(0xe4ffff, 1, 1.004, 11);

    const provinceGeometry = new THREE.BufferGeometry();
    provinceGeometry.setAttribute('position', new THREE.Float32BufferAttribute(provincePositions, 3));
    const provinceBoundaries = new THREE.LineSegments(provinceGeometry, new THREE.LineBasicMaterial({
      color: 0x59dcff,
      transparent: true,
      opacity: 0.68,
      depthTest: false,
      depthWrite: false,
      toneMapped: false
    }));
    provinceBoundaries.renderOrder = 7;
    mapGroup.add(provinceBoundaries);
  }

  function setVisualState(entry, state) {
    const material = entry.mesh.material[0];
    const target = state === 'active' ? ACTIVE_COLOR : state === 'hover' ? HOVER_COLOR : BASE_COLOR;
    material.color.copy(target);
    material.emissive.set(state === 'active' ? 0x08a9ff : state === 'hover' ? 0x0b3c6a : 0x000000);
    material.emissiveIntensity = state === 'active' ? 1.45 : state === 'hover' ? 0.48 : 0;
    material.clearcoat = state === 'active' ? 1 : 0.92;
    entry.edges.material.color.set(state === 'active' ? 0x8fcbd0 : state === 'hover' ? 0x356379 : 0x123047);
    entry.edges.material.opacity = state === 'active' ? 0.36 : state === 'hover' ? 0.18 : 0;
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
      addNationalOutline(geo);
      resize();
      requestAnimationFrame(render);
    },
    select(adcode) {
      const code = adcode == null ? null : String(adcode);
      activeCode = code;
      provinceMeshes.forEach((entries, provinceCode) => {
        const state = provinceCode === activeCode ? 'active' : hoverMeshes.has(provinceCode) ? 'hover' : 'idle';
        entries.forEach(entry => setVisualState(entry, state));
      });
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
