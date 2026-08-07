# 综合能源业务网络

以呼和浩特为调度中枢的全国能源业务可视化页面。项目使用 Three.js 将中国省级 GeoJSON 生成深蓝玻璃质感的立体地图，并连接八个重点业务城市。

## 功能

- Three.js 省级挤出地图，包含深蓝侧壁、玻璃高光和低对比省界。
- 呼和浩特调度中枢与乌鲁木齐、北京、沈阳、上海、杭州、广州、成都、银川八个业务节点。
- 页面加载时，八条黄色光线从呼和浩特同时沿向上弧线发射，并在抵达后保留路径。
- 自动巡展依次展示八个业务城市，地图镜头聚焦目标区域；结束后回到全图视角，并保留最后一个城市的选中信息。
- 点击有业务的省份或城市节点，显示对应的业务分类、说明和业务节点信息。
- 选中或悬停省份会提高省块亮度与边缘可见度。
- `data/background.mp4` 作为深蓝压暗的视频背景；地图下方有延迟出现的扩散环动画。

## 技术

- 原生 HTML、CSS、JavaScript，无需构建工具。
- Three.js r128 通过 CDN 加载，用于省份立体渲染。
- 中国省级边界数据：`data/china.geojson`。

## 本地运行

无需安装 npm 依赖。在项目目录执行：

```powershell
powershell -ExecutionPolicy Bypass -File .\server.ps1 -Port 5180
```

浏览器打开：

```text
http://localhost:5180/
```

也可将 `5180` 换为任意空闲端口。静态服务已包含 JavaScript、GeoJSON 和 MP4 视频的响应类型。

## 目录

```text
energy-network-dashboard/
├─ data/
│  ├─ background.mp4       页面背景视频
│  └─ china.geojson        中国省级地图数据
├─ app.js                  节点、业务数据、路线和自动巡展逻辑
├─ three-map.js            Three.js 省份挤出、材质与高亮逻辑
├─ styles.css              布局、深蓝主题与动效
├─ index.html              页面结构和第三方资源引用
├─ server.ps1              本地静态服务器
└─ README.md               项目说明
```

## 数据与交互维护

- 在 `app.js` 的 `regions` 数组中维护城市坐标、业务分类、指标和说明文案。
- `provinceCodes` 将每个业务城市关联到对应的省级行政区代码。
- 地图边界数据替换后，需保持 `data/china.geojson` 的标准 GeoJSON FeatureCollection 结构。
- 背景视频可替换为同路径的 `data/background.mp4`，建议保持 MP4 格式并控制文件体积。

## 部署

本项目为纯静态页面，可直接部署到 GitHub Pages、任意静态站点托管或对象存储。部署时请一并上传 `data/` 目录、`three-map.js` 和其余静态文件。

https://lv12556.github.io/energy-network-dashboard/
