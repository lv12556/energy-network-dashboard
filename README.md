# 综合能源业务网络

全国综合能源业务可视化页面，以呼和浩特为调度中枢，展示 12 个重点城市的业务布局、项目图片和区域联动关系。

在线预览：[https://lv12556.github.io/energy-network-dashboard/](https://lv12556.github.io/energy-network-dashboard/)

## 功能

- Three.js 驱动的中国省级立体地图，使用深蓝地形贴图、玻璃质感和分层底座。
- 荧光浅蓝国界、低对比省界，以及深蓝科技风格的地图光效。
- 呼和浩特中心点进场：地图显示后，中心光点自上而下落入位置，触发双层扩散光波，再连接全国业务节点。
- 覆盖乌鲁木齐、北京、沈阳、上海、杭州、广州、成都、银川、西安、武汉、南京、昆明 12 个重点城市。
- 自动巡展逐个展示城市业务；选中城市的省份、节点和文字标签会高亮，并显示对应的业务弹窗和项目图片。
- 可点击业务城市或省份查看详情；点击地图外部可回到全国总览。
- 自动巡展完成后，长时间无交互会回到总览；用户主动返回总览后会短暂停留再恢复巡展。
- 呼和浩特中心图标保持独立浮动，城市节点配有定位标识。

## 技术栈

- 原生 HTML、CSS、JavaScript，无构建步骤。
- Three.js r128（CDN）负责省份挤出、材质、边界和交互状态。
- SVG 负责业务节点、路线、标签与进场动画。
- GeoJSON 提供中国省级边界数据。

## 本地运行

无需安装 npm 依赖。在项目目录执行：

```powershell
powershell -ExecutionPolicy Bypass -File .\server.ps1 -Port 5180
```

浏览器打开：

```text
http://localhost:5180/
```

也可以将 `5180` 替换为任意空闲端口。不要直接双击 `index.html`，浏览器会限制本地 GeoJSON 请求。

## 项目结构

```text
energy-network-dashboard/
├─ assets/
│  ├─ image-1.png                 地图地形贴图
│  ├─ 中心点.png、定位.png          中心与城市定位图标
│  └─ image-*.png                 业务项目图片
├─ data/
│  ├─ background.mp4              页面背景视频
│  └─ china.geojson               中国省级边界数据
├─ index.html                     页面结构、SVG 图层与资源引用
├─ styles.css                     主布局、视觉主题和交互样式
├─ map-scale.css                  地图尺寸与业务弹窗的补充样式
├─ three-map.js                   Three.js 地图、材质、边界与省份高亮
├─ app.js                         城市数据、路线、自动巡展和交互状态
├─ server.ps1                     本地静态服务器
└─ README.md                      项目说明
```

## 内容维护

### 城市与业务信息

在 `app.js` 中维护以下对象：

- `regions`：城市名称、经纬度、业务分类、说明与路线弯曲程度。
- `provinceCodes`：业务城市与省级行政区代码的对应关系。
- `projectTitlesByCity`、`projectDetailsByCity`：弹窗中的项目标题与介绍。
- `projectImagesByCity`：城市对应的项目图片路径。

新增城市时，需要同时补充以上关联数据，并确认 `data/china.geojson` 中存在相应省级行政区代码。

### 地图与素材

- `assets/image-1.png` 是当前地图表面使用的深蓝地形贴图。
- `assets/中心点.png` 和 `assets/定位.png` 分别用于调度中枢和城市定位。
- 业务图片建议使用清晰的横向工程、设备或场站图片，以便适配右侧弹窗的 `16:10` 比例。
- 替换 `data/china.geojson` 时，需保持标准 GeoJSON `FeatureCollection` 结构，并保留省级 `adcode` 属性。

## 部署

项目为纯静态页面，可部署到 GitHub Pages、静态站点托管或对象存储。部署时需要完整上传 `assets/`、`data/` 与全部 HTML、CSS、JavaScript 文件。

GitHub Pages 地址：[https://lv12556.github.io/energy-network-dashboard/](https://lv12556.github.io/energy-network-dashboard/)
