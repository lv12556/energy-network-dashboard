const svg = document.getElementById('network-map');
const ns = 'http://www.w3.org/2000/svg';
const layers = {
  provinces: document.getElementById('map-provinces'),
  routes: document.getElementById('network-routes'),
  nodes: document.getElementById('network-nodes')
};

const regions = [
  { name: '乌鲁木齐', lng: 87.6177, lat: 43.8256, category: '风光发电与绿电外送', metric: '风光基地', copy: '连接大型风电、光伏基地，支撑远距离绿电输送与本地消纳协同。', bend: 36 },
  { name: '北京', lng: 116.4074, lat: 39.9042, category: '碳绿降与应急保电', metric: '城市保障', copy: '面向公共机构与重点建筑，提供低碳用能优化、应急保电和能效管理服务。', bend: 20 },
  { name: '沈阳', lng: 123.4315, lat: 41.8057, category: '工业供电与装备制造', metric: '工业负荷', copy: '服务装备制造与工业园区，持续提升配电可靠性与电网稳定能力。', bend: 30 },
  { name: '上海', lng: 121.4737, lat: 31.2304, category: '数据中心与城市配电', metric: '数字能源', copy: '围绕数据中心、公共建筑和城市配电网络，建设数字化能源运营体系。', bend: 28 },
  { name: '杭州', lng: 120.1551, lat: 30.2741, category: '数字负荷与光伏接入', metric: '光伏接入', copy: '通过负荷柔性调控与分布式光伏接入，提升园区绿色用能占比。', bend: 42 },
  { name: '广州', lng: 113.2644, lat: 23.1291, category: '综合能源与储能充电', metric: '终端负荷', copy: '覆盖综合能源站、储能充电与终端负荷协同，支持多场景灵活用能。', bend: 50 },
  { name: '成都', lng: 104.0665, lat: 30.5723, category: '园区配电与能效服务', metric: '园区服务', copy: '结合产业园区配电与设备管理，形成可量化的用能诊断和节能服务闭环。', bend: 38 },
  { name: '银川', lng: 106.2309, lat: 38.4872, category: '新能源消纳与调峰', metric: '调峰能力', copy: '连接区域新能源项目与调峰资源，保障绿色电力平稳接入和灵活消纳。', bend: 16 },
  { name: '西安', lng: 108.9398, lat: 34.3416, category: '装备制造与综合供能', metric: '装备制造', copy: '围绕高端装备制造与产业园区，提供配电升级、综合供能和能效优化服务。', bend: 30 },
  { name: '武汉', lng: 114.3054, lat: 30.5931, category: '城市能源与智慧运维', metric: '智慧运维', copy: '面向城市公共设施与重点园区，建设数字化运维和多能协同调度体系。', bend: 34 },
  { name: '南京', lng: 118.7969, lat: 32.0603, category: '工业绿电与柔性负荷', metric: '工业绿电', copy: '服务先进制造业的绿色电力采购、柔性负荷管理与低碳用能改造。', bend: 36 },
  { name: '昆明', lng: 102.8329, lat: 24.8801, category: '清洁能源与区域协同', metric: '清洁能源', copy: '连接水电、光伏等清洁能源资源，支撑区域协同消纳和绿色用能服务。', bend: 46 }
];

const hub = { name: '呼和浩特', lng: 111.7492, lat: 40.8426 };
const projectImagesByCity = {
  '乌鲁木齐': ['assets/image-1785574746405.png', 'assets/image-1785716048697.png'],
  '北京': ['assets/image-1785715510868.png', 'assets/image-1785716155364.png'],
  '沈阳': ['assets/image-1785575087758.png', 'assets/image-1785715699955.png'],
  '上海': ['assets/image-1785574863836.png', 'assets/image-1785716152533.png'],
  '杭州': ['assets/image-1785715531896.png', 'assets/image-1785575092622.png'],
  '广州': ['assets/image-1785716149866.png', 'assets/image-1785715526442.png'],
  '成都': ['assets/image-1785575190522.png'],
  '银川': ['assets/image-1785716045738.png'],
  '西安': ['assets/image-1785574868254.png'],
  '武汉': ['assets/image-1785716051352.png'],
  '南京': ['assets/image-1785715694404.png'],
  '昆明': ['assets/image-1785715697224.png']
};
const projectTitlesByCity = {
  '乌鲁木齐': '新能源基地',
  '北京': '城市保电',
  '沈阳': '工业供电',
  '上海': '城市配电',
  '杭州': '数字能源',
  '广州': '储能充电',
  '成都': '园区配电',
  '银川': '新能源调峰',
  '西安': '综合供能',
  '武汉': '智慧运维',
  '南京': '工业绿电',
  '昆明': '清洁能源'
};
const projectDetailsByCity = {
  '乌鲁木齐': '接入风电、光伏等大型新能源项目。\n提供绿电外送与场站运维支持。',
  '北京': '服务重点建筑与公共设施用能。\n提供应急保电和低碳能效管理。',
  '沈阳': '覆盖装备制造与工业园区负荷。\n提升供电可靠性与设备运维效率。',
  '上海': '面向城市配电和数据中心场景。\n支持重点负荷监测与数字化运营。',
  '杭州': '连接园区数字负荷与分布式光伏。\n推动柔性调控和绿色用能提升。',
  '广州': '服务综合能源站与充换电场景。\n联动储能资源与终端负荷调度。',
  '成都': '面向产业园区配电升级项目。\n提供设备管理与节能诊断服务。',
  '银川': '衔接区域新能源项目与调峰资源。\n保障绿色电力稳定接入和消纳。',
  '西安': '服务装备制造及产业园区客户。\n提供配电升级与综合供能方案。',
  '武汉': '覆盖城市公共设施和重点园区。\n提供智能监测与协同运维服务。',
  '南京': '面向先进制造业绿色用能需求。\n提供绿电采购和柔性负荷管理。',
  '昆明': '连接水电、光伏等清洁能源资源。\n支持区域协同消纳与用能服务。'
};
let activeIndex = 0;
let autoShowcaseTimer = null;
let autoShowcaseActive = false;
let autoShowcaseIndex = 0;
const autoShowcaseInterval = 3200;
const autoInteractionDelay = 3000;
const idleOverviewDelay = 10000;
const cameraFocusScale = 1.42;
const provinceCodes = [650000, 110000, 210000, 310000, 330000, 440000, 510000, 640000, 610000, 420000, 320000, 530000];
const routeModels = [];
const routeFlightDuration = 1500;
const initialRouteFlightDuration = 1200;
const hubEntryDuration = 1450;
let hubEntryNode = null;
let idleOverviewTimer = null;
let idleOverviewVersion = 0;

function animateOverviewCounts() {
  document.querySelectorAll('[data-count-to]').forEach((element, index) => {
    const target = Number(element.dataset.countTo);
    const suffix = element.dataset.countSuffix || '';
    const duration = 900 + index * 90;
    const startedAt = performance.now();
    const update = timestamp => {
      const progress = Math.min(1, (timestamp - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = `${Math.round(target * eased)}${suffix}`;
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  });
}

function updateNetworkTotals() {
  const count = String(regions.length).padStart(2, '0');
  const updateText = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  };
  updateText('region-total', `/ ${count}`);
  updateText('network-count', `${count} / ${count}`);
  updateText('route-count', `${regions.length} 条重点业务链路`);
}

function make(tag, attrs = {}) {
  const element = document.createElementNS(ns, tag);
  Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
  return element;
}

function project([lng, lat]) {
  return [72 + (lng - 73.5) * 13.05, 668 - (lat - 18) * 14.35];
}

function ringPath(ring) {
  return ring.map((point, index) => {
    const [x, y] = project(point);
    return `${index ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ') + 'Z';
}

function geometryPath(geometry) {
  const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  return polygons.map(polygon => polygon.map(ringPath).join(' ')).join(' ');
}

function drawLocation(point, isHub = false, regionIndex = null) {
  const [x, y] = project([point.lng, point.lat]);
  const group = make('g', {
    class: isHub ? 'hub-node' : 'target-node',
    tabindex: '0',
    role: 'button',
    'aria-label': `${point.name}业务节点`,
    'data-region-index': regionIndex == null ? '' : regionIndex
  });
  if (isHub) {
    group.append(make('circle', { cx: x, cy: y, r: 34, class: 'hub-landing-wave hub-landing-wave-primary', 'aria-hidden': 'true' }));
    group.append(make('circle', { cx: x, cy: y, r: 28, class: 'hub-landing-wave hub-landing-wave-secondary', 'aria-hidden': 'true' }));
    const entryLight = make('g', { class: 'hub-entry', 'aria-hidden': 'true' });
    entryLight.append(make('path', { d: `M${x - 15} ${y - 2} L${x} ${y - 60} L${x + 15} ${y - 2} Z`, class: 'hub-beam' }));
    entryLight.append(make('circle', { cx: x, cy: y, r: 23, class: 'hub-orbit' }));
    entryLight.append(make('circle', { cx: x, cy: y, r: 11, class: 'node-pulse' }));
    entryLight.append(make('circle', { cx: x, cy: y, r: 8, class: 'hub-core' }));
    group.append(entryLight);
    group.append(make('image', { href: 'assets/中心点.png', x: x - 12, y: y - 52, width: 24, height: 50, class: 'hub-location-icon', 'aria-hidden': 'true' }));
    hubEntryNode = group;
  } else {
    group.append(make('circle', { cx: x, cy: y, r: 13, class: 'node-pulse' }));
    group.append(make('circle', { cx: x, cy: y, r: 7, class: 'node-ring' }));
    group.append(make('circle', { cx: x, cy: y, r: 3.6, class: 'node-core' }));
    const labelWidth = Math.max(34, point.name.length * 12 + 12);
    group.append(make('image', { href: 'assets/定位.png', x: x - 6, y: y - 25, width: 12, height: 12, class: 'map-location-icon', 'aria-hidden': 'true' }));
    group.append(make('rect', { x: x - labelWidth / 2, y: y - 42, width: labelWidth, height: 16, rx: 1, class: 'map-label-plate' }));
    const label = make('text', { x, y: y - 30, class: 'map-label' });
    label.textContent = point.name;
    group.append(label);
    group.addEventListener('click', () => setActiveRegion(regions.indexOf(point)));
    group.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') setActiveRegion(regions.indexOf(point)); });
  }
  layers.nodes.append(group);
}

function drawNetwork() {
  const [hx, hy] = project([hub.lng, hub.lat]);
  regions.forEach((region, index) => {
    const [x, y] = project([region.lng, region.lat]);
    const start = { x: hx, y: hy };
    const end = { x, y };
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.hypot(dx, dy) || 1;
    const curveDepth = Math.min(145, Math.max(20, distance * .23 + Math.abs(region.bend) * .28));
    const controlA = {
      x: start.x + dx * .28,
      y: start.y + dy * .28 - curveDepth
    };
    const controlB = {
      x: start.x + dx * .72,
      y: start.y + dy * .72 - curveDepth
    };
    const halo = make('path', { d: `M${hx} ${hy}`, class: 'route-trace-halo', opacity: '0' });
    const trace = make('path', { d: `M${hx} ${hy}`, class: 'route-trace', opacity: '0' });
    const core = make('path', { d: `M${hx} ${hy}`, class: 'route-trace-core', opacity: '0' });
    const tail = make('circle', { r: 5.4, class: 'travel-tail', opacity: '0' });
    const light = make('circle', { r: 2.35, class: 'travel-light', opacity: '0' });
    layers.routes.append(halo, trace, core, tail, light);
    routeModels.push({
      start, controlA, controlB, end, halo, trace, core, tail, light,
      running: false,
      complete: false,
      startedAt: 0
    });
  });
  drawLocation(hub, true);
  regions.forEach((region, index) => drawLocation(region, false, index));
  const [hubX, hubY] = project([hub.lng, hub.lat]);
  layers.nodes.append(make('rect', { x: hubX - 76, y: hubY - 92, width: 152, height: 24, rx: 2, class: 'hub-label-plate' }));
  const hubLabel = make('text', { x: hubX, y: hubY - 75, class: 'hub-label' });
  hubLabel.textContent = '呼和浩特 · 调度中枢';
  layers.nodes.append(hubLabel);
}

function interpolatePoint(from, to, progress) {
  return {
    x: from.x + (to.x - from.x) * progress,
    y: from.y + (to.y - from.y) * progress
  };
}

function cubicPoint(route, progress) {
  const firstA = interpolatePoint(route.start, route.controlA, progress);
  const firstB = interpolatePoint(route.controlA, route.controlB, progress);
  const firstC = interpolatePoint(route.controlB, route.end, progress);
  const secondA = interpolatePoint(firstA, firstB, progress);
  const secondB = interpolatePoint(firstB, firstC, progress);
  return interpolatePoint(secondA, secondB, progress);
}

function partialRoute(route, progress) {
  const firstA = interpolatePoint(route.start, route.controlA, progress);
  const firstB = interpolatePoint(route.controlA, route.controlB, progress);
  const firstC = interpolatePoint(route.controlB, route.end, progress);
  const secondA = interpolatePoint(firstA, firstB, progress);
  const secondB = interpolatePoint(firstB, firstC, progress);
  const end = interpolatePoint(secondA, secondB, progress);
  return `M${route.start.x.toFixed(1)} ${route.start.y.toFixed(1)} C${firstA.x.toFixed(1)} ${firstA.y.toFixed(1)} ${secondA.x.toFixed(1)} ${secondA.y.toFixed(1)} ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
}

function fullRoute(route) {
  return `M${route.start.x.toFixed(1)} ${route.start.y.toFixed(1)} C${route.controlA.x.toFixed(1)} ${route.controlA.y.toFixed(1)} ${route.controlB.x.toFixed(1)} ${route.controlB.y.toFixed(1)} ${route.end.x.toFixed(1)} ${route.end.y.toFixed(1)}`;
}

function emitRoute(index, duration = routeFlightDuration) {
  const route = routeModels[index];
  if (!route || route.running || route.complete) return;
  route.running = true;
  route.startedAt = performance.now();
  route.duration = duration;
  [route.halo, route.trace, route.core, route.light].forEach(element => element.setAttribute('opacity', '1'));
  requestAnimationFrame(animateRoutes);
}

function emitAllRoutes() {
  regions.forEach((_, index) => emitRoute(index, initialRouteFlightDuration));
}

function animateRoutes(timestamp) {
  let hasRunningRoute = false;
  routeModels.forEach(route => {
    if (!route.running) return;
    hasRunningRoute = true;
    const progress = Math.min(1, (timestamp - route.startedAt) / route.duration);
    const d = partialRoute(route, progress);
    route.halo.setAttribute('d', d);
    route.trace.setAttribute('d', d);
    route.core.setAttribute('d', d);
    const head = cubicPoint(route, progress);
    const tail = cubicPoint(route, Math.max(0, progress - .045));
    route.light.setAttribute('cx', head.x.toFixed(1));
    route.light.setAttribute('cy', head.y.toFixed(1));
    route.tail.setAttribute('cx', tail.x.toFixed(1));
    route.tail.setAttribute('cy', tail.y.toFixed(1));
    route.tail.setAttribute('opacity', '0');
    if (progress >= 1) {
      const completedPath = fullRoute(route);
      route.halo.setAttribute('d', completedPath);
      route.trace.setAttribute('d', completedPath);
      route.core.setAttribute('d', completedPath);
      route.light.setAttribute('opacity', '0');
      route.running = false;
      route.complete = true;
    }
  });
  if (hasRunningRoute) requestAnimationFrame(animateRoutes);
}

function stopAutoShowcase() {
  if (autoShowcaseTimer !== null) {
    window.clearTimeout(autoShowcaseTimer);
    autoShowcaseTimer = null;
  }
  autoShowcaseActive = false;
}

function deferAutoShowcaseAfterInteraction(nextIndex = (activeIndex + 1) % regions.length) {
  clearIdleOverviewTimer();
  stopAutoShowcase();
  autoShowcaseTimer = window.setTimeout(() => {
    autoShowcaseTimer = null;
    autoShowcaseActive = true;
    autoShowcaseIndex = nextIndex;
    playAutoShowcaseStep();
  }, autoInteractionDelay);
}

function resetIdleOverviewTimer() {
  if (idleOverviewTimer !== null) window.clearTimeout(idleOverviewTimer);
  const timerVersion = ++idleOverviewVersion;
  idleOverviewTimer = window.setTimeout(() => {
    if (timerVersion === idleOverviewVersion) showOverview();
  }, idleOverviewDelay);
}

function clearIdleOverviewTimer() {
  idleOverviewVersion += 1;
  if (idleOverviewTimer !== null) window.clearTimeout(idleOverviewTimer);
  idleOverviewTimer = null;
}

function resetMapCamera() {
  svg.style.transform = '';
  window.energyThreeMap?.setTransform('');
}

function focusMapCamera(region) {
  const mapWidth = svg.clientWidth || svg.getBoundingClientRect().width;
  const mapHeight = svg.clientHeight || svg.getBoundingClientRect().height;
  if (!mapWidth || !mapHeight) return null;
  const stageBounds = document.querySelector('.map-stage').getBoundingClientRect();
  const [hubX, hubY] = project([hub.lng, hub.lat]);
  const [mapX, mapY] = project([region.lng, region.lat]);
  const focusX = (hubX + mapX) / 2;
  const focusY = (hubY + mapY) / 2;
  const pointX = (mapX / 1000) * mapWidth;
  const pointY = (mapY / 760) * mapHeight;
  const hubPointX = (hubX / 1000) * mapWidth;
  const hubPointY = (hubY / 760) * mapHeight;
  const focusPointX = (focusX / 1000) * mapWidth;
  const focusPointY = (focusY / 760) * mapHeight;
  const translateX = (mapWidth / 2 - focusPointX) * (cameraFocusScale - 1);
  const translateY = (mapHeight / 2 - focusPointY) * (cameraFocusScale - 1);
  svg.style.transform = `translate(${translateX.toFixed(1)}px, ${translateY.toFixed(1)}px) scale(${cameraFocusScale})`;
  window.energyThreeMap?.setTransform(svg.style.transform);
  const centerX = stageBounds.left + stageBounds.width / 2;
  const centerY = stageBounds.top + stageBounds.height / 2;
  return {
    pointX: centerX + (pointX - focusPointX) * cameraFocusScale,
    pointY: centerY + (pointY - focusPointY) * cameraFocusScale,
    hubX: centerX + (hubPointX - focusPointX) * cameraFocusScale,
    hubY: centerY + (hubPointY - focusPointY) * cameraFocusScale
  };
}

function playAutoShowcaseStep() {
  if (!autoShowcaseActive) return;
  if (autoShowcaseIndex >= regions.length) {
    autoShowcaseActive = false;
    autoShowcaseTimer = null;
    resetIdleOverviewTimer();
    return;
  }
  setActiveRegion(autoShowcaseIndex, { auto: true });
  autoShowcaseIndex += 1;
  autoShowcaseTimer = window.setTimeout(playAutoShowcaseStep, autoShowcaseInterval);
}

function startAutoShowcase() {
  if (autoShowcaseActive || regions.length === 0) return;
  autoShowcaseActive = true;
  autoShowcaseIndex = 0;
  playAutoShowcaseStep();
}

function setActiveRegion(index, options = {}) {
  if (!options.auto) {
    deferAutoShowcaseAfterInteraction();
  }
  activeIndex = index;
  const region = regions[index];
  const panel = document.getElementById('business-modal');
  panel.classList.remove('is-overview');
  document.getElementById('region-index').textContent = String(index + 1).padStart(2, '0');
  document.getElementById('business-eyebrow').textContent = 'BUSINESS PROJECT';
  document.getElementById('region-name').textContent = region.name;
  document.getElementById('region-category').textContent = projectTitlesByCity[region.name] || region.category;
  document.getElementById('region-copy').textContent = region.copy;
  document.getElementById('region-details').textContent = projectDetailsByCity[region.name] || '';
  document.getElementById('region-metric-label').textContent = '业务节点';
  document.getElementById('region-metric').textContent = region.metric;
  const projectMedia = document.getElementById('project-media');
  const projectImages = projectImagesByCity[region.name] || [];
  const projectImage = projectImages.length ? projectImages[Math.floor(Math.random() * projectImages.length)] : '';
  projectMedia.classList.toggle('has-image', Boolean(projectImage));
  projectMedia.style.backgroundImage = projectImage ? `url(${projectImage})` : '';
  document.querySelectorAll('.target-node').forEach(node => node.classList.remove('is-active'));
  const selectedNode = document.querySelector(`.target-node[data-region-index="${index}"]`);
  if (selectedNode) selectedNode.classList.add('is-active');
  window.energyThreeMap?.select(provinceCodes[index]);
  focusMapCamera(region);
  emitRoute(index);
  panel.setAttribute('aria-hidden', 'false');
  panel.classList.add('is-open');
}

function showOverview() {
  stopAutoShowcase();
  clearIdleOverviewTimer();
  activeIndex = 0;
  resetMapCamera();
  const panel = document.getElementById('business-modal');
  panel.classList.add('is-open', 'is-overview');
  panel.setAttribute('aria-hidden', 'false');
  document.getElementById('business-eyebrow').textContent = 'BUSINESS OVERVIEW';
  document.getElementById('region-index').textContent = 'ALL';
  document.getElementById('region-name').textContent = '全国业务网络';
  document.getElementById('region-category').textContent = '全国业务概览';
  document.getElementById('region-copy').textContent = '覆盖全国 12 个核心城市，协同服务配电、新能源与综合能源项目。';
  document.getElementById('region-details').textContent = '统筹区域配电装备、新能源配套与综合能源服务。\n形成城市协同、项目联动的业务网络。';
  document.getElementById('region-metric-label').textContent = '核心节点';
  document.getElementById('region-metric').textContent = '12 个城市';
  const projectMedia = document.getElementById('project-media');
  projectMedia.classList.remove('has-image');
  projectMedia.style.backgroundImage = '';
  document.querySelectorAll('.target-node').forEach(node => node.classList.remove('is-active'));
  window.energyThreeMap?.select(null);
}

function returnToOverviewFromOutside() {
  const resumeIndex = autoShowcaseActive && autoShowcaseIndex < regions.length ? autoShowcaseIndex : null;
  showOverview();
  if (resumeIndex !== null) deferAutoShowcaseAfterInteraction(resumeIndex);
}

document.addEventListener('pointerdown', event => {
  if (event.target.closest('.map-stage')) {
    if (!autoShowcaseActive && autoShowcaseIndex >= regions.length) resetIdleOverviewTimer();
  }
  else returnToOverviewFromOutside();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') showOverview();
  else if (!autoShowcaseActive && autoShowcaseIndex >= regions.length) resetIdleOverviewTimer();
});
updateNetworkTotals();
window.setTimeout(animateOverviewCounts, 180);
window.addEventListener('resize', () => {
  if (document.getElementById('business-modal').classList.contains('is-open')) {
    focusMapCamera(regions[activeIndex]);
  }
});

fetch('data/china.geojson')
  .then(response => response.json())
  .then(geo => {
    window.energyThreeMap?.load(geo);
    geo.features.forEach((feature, index) => {
      const d = geometryPath(feature.geometry);
      const provincePath = make('path', { d, class: 'geo-province', 'data-name': feature.properties.name, 'data-adcode': feature.properties.adcode, 'data-index': index });
      const regionIndex = provinceCodes.indexOf(Number(feature.properties.adcode));
      if (regionIndex >= 0) {
        provincePath.classList.add('is-interactive');
        provincePath.addEventListener('click', () => setActiveRegion(regionIndex));
      }
      provincePath.addEventListener('mouseenter', () => window.energyThreeMap?.hover(feature.properties.adcode, true));
      provincePath.addEventListener('mouseleave', () => window.energyThreeMap?.hover(feature.properties.adcode, false));
      layers.provinces.append(provincePath);
    });
    drawNetwork();
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        window.setTimeout(() => {
          hubEntryNode?.classList.add('is-entering');
          window.setTimeout(() => {
            emitAllRoutes();
            window.setTimeout(startAutoShowcase, initialRouteFlightDuration + 180);
          }, hubEntryDuration);
        }, 180);
      });
    });
  })
  .catch(() => { document.querySelector('.map-stage').classList.add('map-error'); });
