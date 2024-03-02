<script setup lang="ts">
import { onMounted, ref } from "vue";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'proj4leaflet';
import proj4 from 'proj4';
import { convertCoordinates_4436_to_3857 } from '../utils/index'



const map: any = ref(null);

const config = {
    tianditu_key: "cca632d0f52e2e34f091af5a25699305",
    gaode_key: "4fe0867f228e2524e33bf89d78dfbf49",
};

const initializeMap = () => {
    // 定义自定义地图投影
    proj4.defs('EPSG:32661', '+proj=utm +zone=61 +datum=WGS84 +units=m +no_defs');

    // 创建 TileLayer，使用自定义地图投影
    const crs_32661 = new L.Proj.CRS('EPSG:32661',
        '+proj=utm +zone=61 +datum=WGS84 +units=m +no_defs',
        {
            resolutions: [8192, 4096, 2048],
            origin: [-5120900, 10000000],
            bounds: L.bounds([-5120900, 10000000], [819200, 10000000])
        }
    );

    const crs_4490 = new L.Proj.CRS('EPSG:4490',
        '+proj=longlat +ellps=GRS80 +no_defs',
        {
            resolutions: [
                0.703125, 0.3515625, 0.17578125, 0.087890625, 0.0439453125,
                0.02197265625, 0.010986328125, 0.0054931640625, 0.00274658203125,
                0.001373291015625, 0.0006866455078125, 0.00034332275390625,
                0.000171661376953125, 0.0000858306884765625, 0.00004291534423828125,
                0.000021457672119140625, 0.0000107288360595703125, 0.000005364418029785156
            ],
            origin: [-180, 90],
            bounds: L.bounds([-180, -90], [180, 90])
        }
    );

    const TianDiTuTileLayer = L.TileLayer.extend({
        // initialize: function (url, options) {
        //     // 调用父类的构造函数
        //     L.TileLayer.prototype.initialize.call(this, url, options);
        //     // 添加天地图的服务地址和参数
        //     this._url = url;
        //     this._options = options;
        // },

        // // 重写父类的 getTileUrl 方法，用于生成天地图瓦片的 URL
        // getTileUrl: function (coords) {
        //     const zoom = coords.z;
        //     const x = coords.x;
        //     const y = coords.y;

        //     // 使用天地图的 URL 模板，替换其中的参数
        //     return this._url
        //         .replace('{z}', zoom)
        //         .replace('{x}', x)
        //         .replace('{y}', y);
        // }
        initialize: function (type: string, key: string, options: object) {
            // var templateUrl = "https://t{s}.tianditu.gov.cn/DataServer?T={t}&x={x}&y={y}&l={z}&tk={k}"
            var templateUrl =
                "https://t{s}.tianditu.gov.cn/{t}/wmts?service=WMTS&request=GetTile&version=1.0.0&layer={l}&style=default&tilematrixset=w&format=tiles&tilematrix={z}&tilecol={x}&tilerow={y}&tk={k}";
            // 用于将一个或多个对象的属性合并到目标对象中
            options = L.extend(
                {
                    t: type,
                    l: type.substr(0, 3), // 表示瓦片图层的标识前缀，通常是根据 type 截取前三个字符得到的。
                    k: key,
                    subdomains: "01234567", // 表示天地图服务使用的子域名列表。这些子域名将分散负载并提供数据。
                    minZoom: 0, // 表示地图允许的最小缩放级别。在这个级别下，地图会显示最大范围的数据。
                    maxZoom: 23, // 表示地图允许的最大缩放级别。在这个级别下，地图会显示最详细的数据。
                    minNativeZoom: type === "ibo_w" ? 3 : 1, // 表示地图的原生最小缩放级别。
                    maxNativeZoom: type === "ibo_w" ? 10 : 18, // 表示地图的原生最大缩放级别。
                    crs: crs_4490
                },
                options
            );
            L.TileLayer.prototype.initialize.call(this, templateUrl, options);
        },
    });

    const img_Layer = new TianDiTuTileLayer("img_w", config.tianditu_key),
        cia_Layer = new TianDiTuTileLayer("cia_w", config.tianditu_key),
        eia_Layer = new TianDiTuTileLayer("eia_w", config.tianditu_key),
        vec_Layer = new TianDiTuTileLayer("vec_w", config.tianditu_key),
        cva_Layer = new TianDiTuTileLayer("cva_w", config.tianditu_key),
        eva_Layer = new TianDiTuTileLayer("eva_w", config.tianditu_key),
        ter_Layer = new TianDiTuTileLayer("ter_w", config.tianditu_key),
        cta_Layer = new TianDiTuTileLayer("cta_w", config.tianditu_key),
        ibo_Layer = new TianDiTuTileLayer("ibo_w", config.tianditu_key);

    map.value = L.map("mapContainer", {
        center: [24.475165917104817, 118.10640616888577],
        zoom: 18,
        layers: [img_Layer],
        zoomControl: false,
        attributionControl: false,
        doubleClickZoom: false,
    });

    var overlayLayers = {
        // 影像底图: img_Layer,
        影像注记: cia_Layer,
        影像英文注记: eia_Layer,
        电子底图: vec_Layer,
        电子注记: cva_Layer,
        电子英文注记: eva_Layer,
        地形底图: ter_Layer,
        地形注记: cta_Layer,
        全球境界: ibo_Layer,
    };

    L.control.layers([], overlayLayers, { autoZIndex: false }).addTo(map.value);
    const marker = L.marker([24.475165917104817, 118.10640616888577]).addTo(map.value);
}

onMounted(() => {
    // const data = [
    //     {
    //         "geometry": {
    //             "type": "MultiPolygon",
    //             "coordinates": [
    //                 [
    //                     [
    //                         [
    //                             109.0113631016606,
    //                             33.0037203118536
    //                         ],
    //                         [
    //                             109.0113631016615,
    //                             18.046680037094
    //                         ],
    //                         [
    //                             128.7279216501586,
    //                             18.0466800370834
    //                         ],
    //                         [
    //                             128.7279216501475,
    //                             33.0037203118148
    //                         ]
    //                     ]
    //                 ]
    //             ]
    //         }
    //     }
    // ]

    // const convertedData = data.map((item) => {
    //     const coordinates = item.geometry.coordinates[0][0];
    //     const convertedCoords = convertCoordinates_4436_to_3857(coordinates);
    //     item.geometry.coordinates[0][0] = convertedCoords;
    //     return item;
    // });

    // Leaflet默认使用的CRS是EPSG3857
    // Leaflet 使用的坐标系（WGS84）
    // proj4.Proj(
    //     "EPSG:4326",
    //     "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"
    // );
    initializeMap();


    // 拓展天地图瓦片图层
    // new TianDiTuTileLayer = L.TileLayer.extend({
    //     initialize: function (type: string, key: string, options: object) {
    //         // var templateUrl = "https://t{s}.tianditu.gov.cn/DataServer?T={t}&x={x}&y={y}&l={z}&tk={k}"
    //         var templateUrl =
    //             "https://t{s}.tianditu.gov.cn/{t}/wmts?service=WMTS&request=GetTile&version=1.0.0&layer={l}&style=default&tilematrixset=w&format=tiles&tilematrix={z}&tilecol={x}&tilerow={y}&tk={k}";
    //         // 用于将一个或多个对象的属性合并到目标对象中
    //         options = L.extend(
    //             {
    //                 t: type,
    //                 l: type.substr(0, 3), // 表示瓦片图层的标识前缀，通常是根据 type 截取前三个字符得到的。
    //                 k: key,
    //                 subdomains: "01234567", // 表示天地图服务使用的子域名列表。这些子域名将分散负载并提供数据。
    //                 minZoom: 0, // 表示地图允许的最小缩放级别。在这个级别下，地图会显示最大范围的数据。
    //                 maxZoom: 23, // 表示地图允许的最大缩放级别。在这个级别下，地图会显示最详细的数据。
    //                 minNativeZoom: type === "ibo_w" ? 3 : 1, // 表示地图的原生最小缩放级别。
    //                 maxNativeZoom: type === "ibo_w" ? 10 : 18, // 表示地图的原生最大缩放级别。
    //             },
    //             options
    //         );
    //         L.TileLayer.prototype.initialize.call(this, templateUrl, options);
    //     },
    // });

    // // 定义要添加进去的天地图图层
    // const img_Layer = new TianDiTuTileLayer("img_w", config.tianditu_key),
    //     cia_Layer = new TianDiTuTileLayer("cia_w", config.tianditu_key),
    //     eia_Layer = new TianDiTuTileLayer("eia_w", config.tianditu_key),
    //     vec_Layer = new TianDiTuTileLayer("vec_w", config.tianditu_key),
    //     cva_Layer = new TianDiTuTileLayer("cva_w", config.tianditu_key),
    //     eva_Layer = new TianDiTuTileLayer("eva_w", config.tianditu_key),
    //     ter_Layer = new TianDiTuTileLayer("ter_w", config.tianditu_key),
    //     cta_Layer = new TianDiTuTileLayer("cta_w", config.tianditu_key),
    //     ibo_Layer = new TianDiTuTileLayer("ibo_w", config.tianditu_key);

    // map.value = L.map("map", {
    //     center: [29.70805, 118.321499],
    //     zoom: 15,
    //     layers: [img_Layer],
    //     zoomControl: false,
    //     attributionControl: false,
    //     doubleClickZoom: false,
    // });

    // var overlayLayers = {
    //     影像底图: img_Layer,
    //     影像注记: cia_Layer,
    //     影像英文注记: eia_Layer,
    //     电子底图: vec_Layer,
    //     电子注记: cva_Layer,
    //     电子英文注记: eva_Layer,
    //     地形底图: ter_Layer,
    //     地形注记: cta_Layer,
    //     全球境界: ibo_Layer,
    // };

    // L.control.layers([], overlayLayers, { autoZIndex: false }).addTo(map.value);

    // const gaode =
    //     "http://127.0.0.1/_AMapService/rest/lbs/geohub/tiles/mvt?z={z}&x={x}&y={y}&size=216&key=yangPanMapWeb&id=4fe0867f228e2524e33bf89d78dfbf49";
    // map.value = L.map("map", {
    //     // crs: L.CRS.EPSG3857,
    //     // crs: new L.Proj.CRS("EPSG:4326", proj4.Proj["EPSG:4326"]),
    //     crs: L.CRS.EPSG4326,
    //     zoom: 13,
    // });

    // // 我这边使用的BD09坐标系  定位是福州
    // map.value.setView([26.08, 119.29], 10);

    // const url0 =
    //     "http://{s}.tianditu.gov.cn/{layer}_{type}/wmts?" +
    //     "SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&STYLE=default&TILEMATRIXSET=c" +
    //     "&tilematrix={z}&FORMAT=tiles&layer={layer}&TILECOL={x}&TILEROW={y}&" +
    //     "tk={key}";
    // const tdtLayer_vec = L.tileLayer(url0, {
    //     s: "t0",
    //     key: "cca632d0f52e2e34f091af5a25699305",
    //     layer: "vec",
    //     type: "c",
    //     crs: L.CRS.EPSG4326,
    // });

    // tdtLayer_vec.addTo(map);

    // L.tileLayer(gaode).addTo(map)
    // var gaodeLayer = L.tileLayer(
    //     "http://webrd0x.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}&id=4fe0867f228e2524e33bf89d78dfbf49",
    //     {
    //         attribution: "高德地图",
    //     }
    // );
    // gaodeLayer.addTo(map.value);

    // L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}", {
    //     foo: "bar",
    //     attribution:
    //         '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    // }).addTo(map);

    // // 添加瓦片图层（如 OpenStreetMap）
    // L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    //     attribution:
    //         'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    // }).addTo(map);

    // map.value.on("tileload", leafletEventDelegation.tileload.bind(map.value));
    // map.value.on("moveend", leafletEventDelegation.zoomend.bind(map.value));
    // map.value.on("zoomend", leafletEventDelegation.moveend.bind(map.value));
});

const leafletEventDelegation = {
    tileload: function (e) {
        var tileBounds = e.tile.getBounds();
        var ne = tileBounds.getNorthEast();
        var sw = tileBounds.getSouthWest();
        console.log(ne.lng, ne.lat, sw.lng, sw.lat);
    },
    zoomend: function () {
        var center = map.value.getCenter(); // 获取地图当前中心点经纬度
        var zoom = map.value.getZoom(); // 获取地图当前缩放级别
        console.log("Zoom end - Center:", center, "Zoom:", zoom);
        // var projCenter = proj4("EPSG:4326", "EPSG:4490", [
        //     center.lng,
        //     center.lat,
        // ]); // 将 WGS84 转换为 CGCS2000
        // console.log("Move end - Center:", projCenter, "Zoom:", zoom);
    },
    moveend: function () {
        var center = map.value.getCenter(); // 获取地图当前中心点经纬度
        var zoom = map.value.getZoom(); // 获取地图当前缩放级别
        console.log("Move end - Center:", center, "Zoom:", zoom);
    },
};
</script>

<template>
    <div id="mapContainer"></div>
</template>

<style scoped lang="scss">
#mapContainer {
    height: 500px;
    width: 100%;
    background-color: aqua;
    overflow: hidden;
}

.leaflet-control-container {
    display: none;
}
</style>
