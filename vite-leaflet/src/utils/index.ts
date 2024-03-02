import proj4 from "proj4";

// 定义转换函数
export const convertCoordinates_4436_to_3857 = function (coordinates) {
    // 定义原始坐标系和目标坐标系
    const fromProjection = "EPSG:4326"; // 原始坐标系（WGS 84）
    const toProjection = "EPSG:3857"; // 目标坐标系（Web Mercator）

    // 进行坐标转换
    return coordinates.map((coords) => {
        // proj4 的转换方法
        const point = proj4(fromProjection, toProjection, coords);
        return point;
    });
};


