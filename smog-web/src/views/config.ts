export const config = {
    labelKey: "name",
    valueKey: "value",
  };
  
  export type chartDataItemType = {
    [key: string]: string | number;
  };
  
  // 当前支持显示的图表类型(折线，柱形)
  export type chartSupportType = "line" | "bar";
  
  export type chartDataType = {
    name: string;
    data: chartDataItemType[];
    type: chartSupportType;
    labelKey?: string;
    valueKey?: string;
    options?: any;
  };
  
  export type chartOptionsType = {
    [key: string]: any;
  };
  
  // 基础图例颜色数据
  export const baseColorArr = [
    "#3CD7D7",
    "#F9CB28",
    "#A089FF",
    "#5CC4FF",
    "#FF9292",
    "#5CC4FF",
    "#FF8AEC",
    "#FFB35B",
  ];
  
  // 阴影区域颜色数据
  export const areaColorArr = [
    "#C5F3F3",
    "#FDEFBF",
    "#dcd3ff",
    "#bde7ff",
    "#ffd3d3",
    "#bde7ff",
    "#ffd0f7",
    "#ffe0bd",
  ];
  
  // 图例顶部字体大小
  export const defaultLabelFontsize = 8;
  
  export const getColor = (index, type: "default" | "area" = "default") => {
    const colorArr = type === "default" ? baseColorArr : areaColorArr;
    const colorIndex = index % colorArr.length;
    return colorArr[colorIndex];
  };
  
  // 图表底部滚动条默认样式
  export const defaultDataZoomOptions: any[] = [
    {
      type: "slider",
      show: true,
      xAxisIndex: [0],
      start: 0,
      end: 30,
      textStyle: {
        color: "#ccd7d7",
      },
    },
  ];
  
  // 获取滚动条样式
  export const getDataZoom = (seriesLength, showZoomLength) => {
    if (seriesLength > showZoomLength) {
      return defaultDataZoomOptions;
    } else {
      return [];
    }
  };
  
  // 获取折线图、柱形图基础配置
  export const getLineBarBaseOptions = (seriesLength, showZoomLength = 7) => {
    return {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },
      yAxis: {
        type: "value",
        splitNumber: 4,
        axisLabel: {
          fontSize: 10,
          margin: 8,
          hideOverlap: true
        }
      },
      dataZoom: getDataZoom(seriesLength, showZoomLength),
    };
  };
  
  // 获取折线系列配置
  export const getLineSeriesOptions = (index) => {
    return {
      tooltip: {
        trigger: "axis",
      },
      areaStyle: {
        color: getColor(index, "area"),
      },
      smooth: true,
      label: {
        show: true, //开启显示
        position: "top", //在上方显示
        //数值样式
        color: getColor(index, "default"),
        fontSize: defaultLabelFontsize,
      },
    };
  };
  
  // 获取柱形系列配置
  export const getBarSeriesOptions = (index) => {
    return {
      barWidth: 10,
      label: {
        show: true, //开启显示
        position: "top", //在上方显示
        //数值样式
        color: getColor(index, "default"),
        fontSize: defaultLabelFontsize,
      },
      itemStyle: {
        borderRadius: [6, 6, 0, 0],
      },
    };
  };
  