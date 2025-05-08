<template>
  <div class="app-container">
    <!-- 顶部导航栏 -->
    <nav class="nav-container">
      <div class="nav-content">
        <div class="nav-brand">
          <i class="bi bi-cloud-sun"></i>
          <span>雾霾探测系统</span>
        </div>
        <div class="nav-location">
          <i class="bi bi-geo-alt"></i>
          <span>{{ positionData.code != "0" ? positionData.location[0].adm2 + "-" + positionData.location[0].name : "---" }}</span>
        </div>
        <div class="nav-credit">天气数据来源于和风天气</div>
      </div>
    </nav>

    <!-- 主要内容区域 -->
    <main class="main-container">
      <!-- 天气和空气质量卡片区域 -->
      <section class="info-section">
        <div class="info-card weather-air-card">
          <div class="card-header">
            <h2>实时天气</h2>
          </div>
          
          <div v-if="weatherData.code == '0' || airData.code == '0'" class="loading-placeholder">
            <div class="loading-animation"></div>
          </div>
          
          <div v-else class="weather-air-content">
            <div class="weather-main">
              <div class="temperature">
                <span class="temp-value">{{ weatherData.now.temp }}</span>
                <span class="temp-unit">°C</span>
              </div>
              <div class="weather-info">
                <div class="info-item">
                  <span class="label">天气</span>
                  <span class="value">{{ weatherData.now.text }}</span>
                </div>
                <div class="info-item">
                  <span class="label">体感温度</span>
                  <span class="value">{{ weatherData.now.feelsLike }}°C</span>
                </div>
                <div class="info-item">
                  <span class="label">风向</span>
                  <span class="value">{{ weatherData.now.windDir }} {{ weatherData.now.windScale }}级</span>
                </div>
              </div>
            </div>
            
            <div class="air-main">
              <panel :value="parseInt(airData.now.aqi)"></panel>
              <!-- <div class="air-status">{{ airData.now.category }}</div> -->
            </div>
            
            <div class="weather-air-details">
              <div class="detail-item">
                <i class="bi bi-eye"></i>
                <span class="label">能见度</span>
                <span class="value">{{ weatherData.now.vis }}km</span>
              </div>
              <div class="detail-item">
                <i class="bi bi-droplet"></i>
                <span class="label">降水量</span>
                <span class="value">{{ weatherData.now.precip }}mm</span>
              </div>
              <div class="detail-item">
                <i class="bi bi-speedometer2"></i>
                <span class="label">气压</span>
                <span class="value">{{ weatherData.now.pressure }}hPa</span>
              </div>
              <div class="detail-item">
                <i class="bi bi-wind"></i>
                <span class="label">风速</span>
                <span class="value">{{ weatherData.now.windSpeed }}km/h</span>
              </div>
            </div>

            <div class="pollutant-grid">
              <div class="pollutant-item">
                <div class="pollutant-header">
                  <span class="name">PM2.5</span>
                  <span class="value">{{ airData.now.pm2p5 }}</span>
                </div>
                <div class="progress-bar">
                  <div class="progress" :style="{ width: getProcess(airData.now.pm2p5, 200) + '%' }"></div>
                </div>
              </div>
              
              <div class="pollutant-item">
                <div class="pollutant-header">
                  <span class="name">PM10</span>
                  <span class="value">{{ airData.now.pm10 }}</span>
                </div>
                <div class="progress-bar">
                  <div class="progress" :style="{ width: getProcess(airData.now.pm10, 200) + '%' }"></div>
                </div>
              </div>
              
              <div class="pollutant-item">
                <div class="pollutant-header">
                  <span class="name">O₃</span>
                  <span class="value">{{ airData.now.o3 }}</span>
                </div>
                <div class="progress-bar">
                  <div class="progress" :style="{ width: getProcess(airData.now.o3, 300) + '%' }"></div>
                </div>
              </div>
              
              <div class="pollutant-item">
                <div class="pollutant-header">
                  <span class="name">CO</span>
                  <span class="value">{{ airData.now.co }}</span>
                </div>
                <div class="progress-bar">
                  <div class="progress" :style="{ width: getProcess(airData.now.co, 200) + '%' }"></div>
                </div>
              </div>
              
              <div class="pollutant-item">
                <div class="pollutant-header">
                  <span class="name">SO₂</span>
                  <span class="value">{{ airData.now.so2 }}</span>
                </div>
                <div class="progress-bar">
                  <div class="progress" :style="{ width: getProcess(airData.now.so2, 200) + '%' }"></div>
                </div>
              </div>
              
              <div class="pollutant-item">
                <div class="pollutant-header">
                  <span class="name">NO₂</span>
                  <span class="value">{{ airData.now.no2 }}</span>
                </div>
                <div class="progress-bar">
                  <div class="progress" :style="{ width: getProcess(airData.now.no2, 200) + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 图表区域 -->
      <section class="charts-section">
        <div class="chart-card">
          <h2>未来天气趋势</h2>
          <my-chart :data="tempArr"></my-chart>
        </div>
        
        <div class="chart-card">
          <h2>未来湿度趋势</h2>
          <my-chart :data="humidityArr"></my-chart>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";
import { ref, reactive, onMounted } from "vue";
import panel from "./panel.vue";
import axios from "axios";
import MyChart from "./MyChart.vue";

import { chartDataType } from "./config.ts";

const tempArr = ref<chartDataType[]>([
  {
    name: "最高气温",
    type: "line",
    data: [],
  },
  {
    name: "最低气温",
    type: "line",
    data: [],
  },
]);

const humidityArr = ref<chartDataType[]>([
  {
    name: "相对湿度",
    type: "line",
    data: [],
  },
]);

let positionData = reactive({
  code: "0",
  location: [
    {
      name: "长安",
      id: "101110102",
      lat: "34.15710",
      lon: "108.94158",
      adm2: "西安",
      adm1: "陕西省",
      country: "中国",
      tz: "Asia/Shanghai",
      utcOffset: "+08:00",
      isDst: "0",
      type: "city",
      rank: "23",
      fxLink: "https://www.qweather.com/weather/chang'an-101110102.html",
    },
  ],
  refer: {
    sources: ["QWeather"],
    license: ["QWeather Developers License"],
  },
});
let weatherData = reactive({
  code: "0",
  updateTime: "2024-05-06T23:34+08:00",
  fxLink: "https://www.qweather.com/weather/chang'an-101110102.html",
  now: {
    obsTime: "2024-05-06T23:32+08:00",
    temp: "19",
    feelsLike: "19",
    icon: "150",
    text: "晴",
    wind360: "57",
    windDir: "东北风",
    windScale: "2",
    windSpeed: "8",
    humidity: "89",
    precip: "0.0",
    pressure: "962",
    vis: "16",
    cloud: "10",
    dew: "12",
  },
  refer: {
    sources: ["QWeather"],
    license: ["CC BY-SA 4.0"],
  },
});
let airData = reactive({
  code: "0",
  updateTime: "2024-05-06T23:37+08:00",
  fxLink: "https://www.qweather.com/air/chang'an-101110102.html",
  now: {
    pubTime: "2024-05-06T23:00+08:00",
    aqi: "59",
    level: "2",
    category: "良",
    primary: "PM10",
    pm10: "67",
    pm2p5: "21",
    no2: "38",
    so2: "3",
    co: "0.6",
    o3: "52",
  },
  refer: {
    sources: ["中国环境监测总站 (CNEMC)"],
    license: ["CC BY-SA 4.0"],
  },
});

const getAssetsFile = (url: string) => {
  return new URL(`../assets/${url}`, import.meta.url).href;
};

const location = ref("");

const setChartData = () => {
  axios
    .get(
      "https://devapi.qweather.com/v7/weather/7d?location=" +
        location.value +
        "&key="
    )
    .then((response) => {
      console.log(response.data);
      response.data.daily.forEach((element) => {
        let name = element.fxDate.substring(
          element.fxDate.indexOf("-") + 1,
          element.fxDate.length
        );
        tempArr.value[0].data.push({
          name: name,
          value: parseInt(element.tempMax),
        });
        tempArr.value[1].data.push({
          name: name,
          value: parseInt(element.tempMin),
        });
        humidityArr.value[0].data.push({
          name: name,
          value: parseInt(element.humidity) / 100,
        });
      });
    })
    .catch((error) => {
      console.log(error);
    });
};

const setPositionData = () => {
  axios
    .get(
      "https://geoapi.qweather.com/v2/city/lookup?location=" +
        location.value +
        "&key="
    )
    .then((response) => {
      console.log(response.data);
      Object.assign(positionData, response.data);
      setWeatherData();
      setChartData();
    })
    .catch((error) => {
      console.log(error);
    });
};

const getPosition = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(setLocation, (error) => {
      console.log(error);
    });
  } else {
    ElMessage.error("当前无法获取定位信息");
  }
};

const setWeatherData = () => {
  axios
    .get(
      "https://devapi.qweather.com/v7/weather/now?location=" +
        location.value +
        "&key="
    )
    .then((response) => {
      console.log(response.data);
      Object.assign(weatherData, response.data);
      setAirData();
    })
    .catch((error) => {
      console.log(error);
    });
};

const setAirData = () => {
  axios
    .get(
      "https://devapi.qweather.com/v7/air/now?location=" +
        location.value +
        "&key="
    )
    .then((response) => {
      console.log(response.data);
      Object.assign(airData, response.data);
      addRecData();
    })
    .catch((error) => {
      console.log(error);
    });
};

const addRecData = () => {
  const formData = new FormData();
  formData.append(`location`, location.value);
  formData.append(`weather`, JSON.stringify(weatherData));
  formData.append(`air`, JSON.stringify(airData));
  axios
    .post("http://localhost:5590/add_rec", formData)
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.log(error);
    });
};

const setLocation = (position: any) => {
  const lati = position.coords.latitude; //十进制纬度
  const longi = position.coords.longitude; //十进制经度
  location.value = longi + "," + lati;
  setPositionData();
};

const getProcess = (value: string, max: number) => {
  return parseInt(value) < max ? Math.ceil((parseInt(value) / max) * 100) : 100;
};

const getWeatherBackground = () => {
  if (weatherData.code === '0') {
    return 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)';
  }
  
  const weatherText = weatherData.now.text;
  const hour = new Date().getHours();
  const isNight = hour >= 18 || hour <= 6;
  
  switch (weatherText) {
    case '晴':
      return isNight 
        ? 'linear-gradient(135deg, #1a1c2c 0%, #2d3a54 100%)'
        : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
    case '多云':
      return 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)';
    case '阴':
      return 'linear-gradient(135deg, #757f9a 0%, #d7dde8 100%)';
    case '雨':
    case '小雨':
    case '中雨':
    case '大雨':
    case '暴雨':
      return 'linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%)';
    case '雪':
    case '小雪':
    case '中雪':
    case '大雪':
    case '暴雪':
      return 'linear-gradient(135deg, #e6e9f0 0%, #eef1f5 100%)';
    case '雾':
    case '霾':
      return 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)';
    default:
      return 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)';
  }
};

onMounted(() => {
  getPosition();
});

// const count = ref(0)
</script>

<style scoped>

.app-container {
  min-height: 100vh;
  background: v-bind('getWeatherBackground()');
  transition: background 0.5s ease;
  --nav-height: 60px;
  padding-top: var(--nav-height);
  position: relative;
}

.nav-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 0.5rem 0;
  height: var(--nav-height);
}

.nav-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2b5876;
}

.nav-brand i {
  font-size: 1.5rem;
  color: #4facfe;
}

.nav-location {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.9rem;
}

.nav-credit {
  color: #666;
  font-size: 0.8rem;
}

.main-container {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  align-items: stretch;
  gap: 1rem;
  min-height: 600px;
  padding: 1rem;
  box-sizing: border-box;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.info-section,
.charts-section {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.weather-air-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.charts-section {
  gap: 1rem;
}

.chart-card {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 0;
}

.info-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  padding: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.card-header h2 {
  font-size: 1.1rem;
  color: #2b5876;
  margin: 0;
}

.weather-air-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.weather-main {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.temperature {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}

.temp-value {
  font-size: 2rem;
  font-weight: 700;
  color: #2b5876;
}

.temp-unit {
  font-size: 1.25rem;
  color: #666;
}

.weather-info {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  flex: 1;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item .label {
  font-size: 0.75rem;
  color: #666;
}

.info-item .value {
  font-size: 0.85rem;
  font-weight: 600;
  color: #2b5876;
}

.weather-air-details {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 6px;
}

.air-main {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 6px;
}

.air-status {
  font-size: 0.9rem;
  font-weight: 600;
  color: #2b5876;
}

.pollutant-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.pollutant-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.pollutant-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pollutant-header .name {
  font-size: 0.75rem;
  font-weight: 600;
  color: #2b5876;
}

.pollutant-header .value {
  font-size: 0.75rem;
  color: #666;
}

.progress-bar {
  height: 3px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 2px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 2px;
  transition: width 0.6s ease;
}

.loading-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100px;
}

.loading-animation {
  width: 30px;
  height: 30px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #4facfe;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.sun {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: radial-gradient(circle at center, #ffd700, #ff8c00);
  box-shadow: 0 0 50px #ffff00;
  animation: pulse 2s infinite;
}

.cloud {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #fff;
  box-shadow: #fff 32px -8px 0 -4px, #fff 16px -16px, #fff 24px 8px,
    #fff 36px 8px 0 -4px, #fff 40px 4px 0 -4px;
  animation: float 3s ease-in-out infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@keyframes float {
  0% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0); }
}

@media (max-width: 1400px) {
  .main-container {
    grid-template-columns: repeat(8, 1fr);
  }
  
  .info-section {
    grid-column: span 5;
  }
  
  .charts-section {
    grid-column: span 3;
  }
}

@media (max-width: 1200px) {
  .main-container {
    grid-template-columns: repeat(6, 1fr);
  }
  
  .info-section {
    grid-column: span 4;
  }
  
  .charts-section {
    grid-column: span 2;
  }
}

@media (max-width: 992px) {
  .main-container {
    grid-template-columns: 1fr;
    min-height: unset;
    padding: 1rem;
  }
  .info-section,
  .charts-section {
    height: auto;
  }
  .chart-card {
    height: auto;
    min-height: 200px;
  }
}

@media (max-width: 768px) {
  .app-container {
    --nav-height: 80px;
  }

  .nav-content {
    justify-content: center;
    text-align: center;
    padding: 0.5rem;
  }
  
  .nav-brand {
    font-size: 1rem;
  }
  
  .nav-location {
    font-size: 0.8rem;
  }
  
  .nav-credit {
    font-size: 0.7rem;
  }
  
  .main-container {
    padding: 0.5rem;
  }
  
  .info-section {
    grid-template-columns: 1fr;
  }
  
  .weather-main {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .weather-info {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .app-container {
    --nav-height: 100px;
  }

  .nav-content {
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.25rem;
  }
  
  .weather-air-details {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .pollutant-grid {
    grid-template-columns: 1fr;
  }
  
  .temp-value {
    font-size: 1.75rem;
  }
  
  .temp-unit {
    font-size: 1rem;
  }
}

@media (max-width: 600px) {
  .main-container {
    padding: 0.5rem;
  }
  .chart-card {
    min-height: 220px;
    padding: 0.5rem;
  }
}
</style>