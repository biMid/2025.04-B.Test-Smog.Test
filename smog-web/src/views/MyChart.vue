<template>
    <div ref="chartDom" class="chart-dom"></div>
</template>
  
<script name="MyChart" lang="ts" setup>
  import { ref, computed, watch, onMounted, onBeforeUnmount, PropType, nextTick } from "vue";
  import * as ECharts from "echarts";
  import { debounce } from "lodash";
  import {
    baseColorArr,
    chartDataType,
    chartOptionsType,
    chartSupportType,
    chartDataItemType,
    getLineBarBaseOptions,
    getLineSeriesOptions,
    getBarSeriesOptions,
    config,
  } from "./config";
  
  const props = defineProps({
    color: {
      type: Array as PropType<string[]>,
      default: () => {
        return baseColorArr;
      },
    },
    // 超过该数字时显示滚动条
    showZoomLimit: {
      type: Number,
      default: 7,
    },
    // 坐标轴是否两边留白
    isBoundaryGap: {
      type: Boolean,
      default: false,
    },
    baseOptions: {
      type: Object as PropType<chartOptionsType>,
      default: () => {
        return {};
      },
    },
    data: {
      type: Array as PropType<chartDataType[]>,
      require: true,
    },
  });
  
  const emits = defineEmits(["chart-click"]);
  
  const initSeriesData = () => {
    if (props?.data?.length) {
      getXAxisDataArr();
      const tempSeriesArr = props?.data.map((item: chartDataType, index: number) => {
        const chartOptions = getSeriesItemOptions(item, index);
        return {
          name: item.name,
          data: getValueArr(item.data, item?.valueKey),
          type: item.type,
          ...chartOptions,
        };
      });
      const tempLegendDataArr = props?.data.map((item: chartDataType) => item.name);
      legendDataArr.value = tempLegendDataArr;
      seriesArr.value = tempSeriesArr;
    }
  };
  
  const getXAxisDataArr = () => {
    const labelName = props?.data?.[0]?.labelKey || config.labelKey;
    const xDataArr = props?.data?.[0]?.data.map((item) => item[labelName]);
    dataArr.value = xDataArr as string[];
  };
  
  const callbackMap = {
    line: getLineSeriesOptions,
    bar: getBarSeriesOptions,
  };
  
  const getSeriesItemDefaultOptions = (type: chartSupportType = "line") => {
    return callbackMap[type];
  };
  
  const getChartBaseOptions = () => {
    return getLineBarBaseOptions;
  };
  
  const getSeriesItemOptions = (chartItem: chartDataType, index = 0) => {
    const cb = getSeriesItemDefaultOptions(chartItem.type);
    const defaultOptions = cb(index);
    if (chartItem?.options) {
      const mergeOptions = Object.assign({}, defaultOptions, chartItem?.options);
      return mergeOptions;
    } else {
      return defaultOptions;
    }
  };
  
  const getBaseChartOptions = () => {
    const cb = getChartBaseOptions();
    const baseOptions = cb(dataArr.value.length, props.showZoomLimit);
    if (props?.baseOptions) {
      const mergeOptions = Object.assign({}, baseOptions, props?.baseOptions);
      return mergeOptions;
    } else {
      return baseOptions;
    }
  };
  
  const getValueArr = (arr: chartDataItemType[], valueKey?: string) => {
    const keyName = valueKey ? valueKey : config.valueKey;
    return arr.map((item) => Number(item[keyName]));
  };
  
  const resizeHandler = () => {
    chartExample.resize();
  };
  const resizeHandlerOrigin = debounce(resizeHandler, 300);
  
  const dataArr = ref<any[]>([]);
  const seriesArr = ref<any[]>([]);
  const legendDataArr = ref<string[]>([]);
  
  const getOptions = computed(() => {
    const baseOptions = getBaseChartOptions();
    const options = {
      color: props.color,
      ...baseOptions,
      legend: {
        data: legendDataArr.value,
      },
      xAxis: {
        type: "category",
        data: dataArr.value,
        boundaryGap: props.isBoundaryGap,
        axisTick: {
          alignWithLabel: true,
        },
      },
      series: seriesArr.value,
    };
    return options;
  });
  
  watch(
    () => props.data,
    () => {
      init();
    },
    {
      deep: true,
    }
  );
  
  const chartDom = ref();
  let chartExample: any = null;
  const initChart = () => {
    if (chartExample) {
      // 若存在图表实例，则先执行销毁操作
      chartExample.dispose();
    }
    nextTick(() => {
      chartExample = ECharts.init(chartDom.value);
      const options = getOptions.value;
      chartExample.setOption(options, true);
      initResizerListener();
      initChartEvent();
    });
  };
  
  const initResizerListener = () => {
    window.removeEventListener("resize", resizeHandlerOrigin);
    window.addEventListener("resize", resizeHandlerOrigin);
  };
  
  const initChartEvent = () => {
    cancelClickEvent();
    chartExample.on("click", (params) => {
      emits("chart-click", params);
    });
  };
  
  const cancelClickEvent = () => {
    chartExample.off("click");
  };
  
  const init = () => {
    initSeriesData();
    initChart();
  };
  
  onMounted(() => {
    init();
  });
  
  onBeforeUnmount(() => {
    cancelClickEvent();
    window.removeEventListener("resize", resizeHandlerOrigin);
    chartExample.dispose();
  });
</script>

<style lang="scss" scoped>
.chart-dom {
  height: 250px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  padding: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
    pointer-events: none;
  }
}

@media (max-width: 1400px) {
  .chart-dom {
    height: 220px;
  }
}

@media (max-width: 1200px) {
  .chart-dom {
    height: 200px;
  }
}

@media (max-width: 992px) {
  .chart-dom {
    height: 180px;
  }
}

@media (max-width: 768px) {
  .chart-dom {
    height: 160px;
    padding: 0.4rem;
  }
}

@media (max-width: 480px) {
  .chart-dom {
    height: 140px;
    padding: 0.3rem;
  }
}
</style>
  