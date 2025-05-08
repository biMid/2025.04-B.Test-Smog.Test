<template>
  <div class="circle-progress">
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    <canvas ref="canvasRef" width="150" height="150"></canvas>
    <div class="status-text">
      <span :style="{color: getColor(value)}">{{ getStatusText(value) }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch, onBeforeUnmount } from 'vue';

interface Props {
  value: number;
}

export default defineComponent({
  name: 'panel',
  props: {
    value: {
      type: Number,
      required: true,
      validator: (value: number) => value >= 0
    }
  },
  setup(props: Props) {
    // 状态管理
    const isLoading = ref(false);
    const error = ref<string | null>(null);
    const canvasRef = ref<HTMLCanvasElement | null>(null);
    let animationFrameId: number | null = null;

    // 画布相关变量
    const canvas = ref<HTMLCanvasElement | null>(null);
    const ctx = ref<CanvasRenderingContext2D | null>(null);
    const circleX = ref(75);
    const circleY = ref(75);
    const radius = ref(60);
    const cradius = ref(75);
    const lineWidth = ref(8);
    const fontSize = ref(24);
    const process = ref(0);
    const color = ref('#00ff01');
    const percent = ref(0);

    /**
     * 绘制小圆点1
     */
    const smallcircle1 = (cx: number, cy: number, r: number) => {
      if (!ctx.value) return;
      ctx.value.beginPath();
      ctx.value.lineWidth = 1;
      ctx.value.fillStyle = "#06a8f3";
      ctx.value.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.value.fill();
    };

    /**
     * 绘制小圆点2
     */
    const smallcircle2 = (cx: number, cy: number, r: number) => {
      if (!ctx.value) return;
      ctx.value.beginPath();
      ctx.value.lineWidth = 1;
      ctx.value.fillStyle = "#fff";
      ctx.value.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.value.fill();
    };

    /**
     * 绘制圆环
     */
    const circle = (cx: number, cy: number, r: number) => {
      if (!ctx.value) return;
      ctx.value.beginPath();
      ctx.value.lineWidth = lineWidth.value;
      ctx.value.strokeStyle = "#eee";
      ctx.value.arc(cx, cy, r, (Math.PI * 2) / 3, (Math.PI * 1) / 3);
      ctx.value.stroke();
    };

    /**
     * 绘制扇形
     */
    const sector = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
      if (!ctx.value) return;
      ctx.value.beginPath();
      ctx.value.lineWidth = lineWidth.value;
      ctx.value.strokeStyle = color.value;
      ctx.value.lineCap = "round";
      ctx.value.arc(cx, cy, r, (Math.PI * 2) / 3, (Math.PI * 2) / 3 + (endAngle / 100) * ((Math.PI * 5) / 3), false);
      ctx.value.stroke();
    };

    /**
     * 更新动画
     */
    const loading = (progress: number) => {
      if (!ctx.value || !canvas.value) return;
      
      try {
        ctx.value.clearRect(0, 0, circleX.value * 2, circleY.value * 2);
        
        // 绘制中间文字
        ctx.value.font = `${fontSize.value}px Arial`;
        ctx.value.textAlign = "center";
        ctx.value.textBaseline = "middle";
        ctx.value.fillStyle = color.value;
        ctx.value.fillText(
          process.value === percent.value ? props.value.toString() : Math.ceil(process.value * 5).toString(),
          circleX.value,
          circleY.value
        );
        
        // 绘制圆环
        circle(circleX.value, circleY.value, radius.value);
        
        // 绘制扇形
        sector(circleX.value, circleY.value, radius.value, (Math.PI * 2) / 3, process.value);
        
        // 绘制端点
        smallcircle1(
          cradius.value + Math.cos(((2 * Math.PI) / 360) * 120) * radius.value,
          cradius.value + Math.sin(((2 * Math.PI) / 360) * 120) * radius.value,
          0
        );
        smallcircle2(
          cradius.value + Math.cos(((2 * Math.PI) / 360) * (120 + process.value * 3)) * radius.value,
          cradius.value + Math.sin(((2 * Math.PI) / 360) * (120 + process.value * 3)) * radius.value,
          2
        );
        
        // 控制动画速度
        if (process.value / percent.value > 0.99) {
          process.value = percent.value;
        } else if (process.value / percent.value > 0.9) {
          process.value += 0.3;
        } else if (process.value / percent.value > 0.8) {
          process.value += 0.55;
        } else if (process.value / percent.value > 0.7) {
          process.value += 0.75;
        } else {
          process.value += 1.0;
        }
        
        // 继续动画
        animationFrameId = requestAnimationFrame(() => loading(progress));
      } catch (err) {
        error.value = err instanceof Error ? err.message : '绘制失败';
        console.error('绘制失败:', err);
      }
    };

    /**
     * 初始化画布
     */
    const initCanvas = () => {
      try {
        isLoading.value = true;
        if (!canvasRef.value) {
          throw new Error('Canvas element not found');
        }
        
        canvas.value = canvasRef.value;
        ctx.value = canvas.value.getContext('2d');
        
        if (!ctx.value) {
          throw new Error('Failed to get canvas context');
        }
        
        percent.value = props.value / 5;
        process.value = 0;
        color.value = getColor(props.value);
        
        loading(percent.value);
      } catch (err) {
        error.value = err instanceof Error ? err.message : '初始化画布失败';
        console.error('初始化画布失败:', err);
      } finally {
        isLoading.value = false;
      }
    };

    /**
     * 获取颜色
     */
    const getColor = (value: number): string => {
      if (value <= 50) return '#00ff01';
      if (value <= 100) return '#ffff00';
      if (value <= 150) return '#ff7e01';
      if (value <= 200) return '#ff0100';
      if (value <= 300) return '#9a004d';
      return '#7d0124';
    };

    /**
     * 获取状态文本
     */
    const getStatusText = (value: number): string => {
      if (value <= 50) return '优';
      if (value <= 100) return '良';
      if (value <= 150) return '轻度污染';
      if (value <= 200) return '中度污染';
      if (value <= 300) return '重度污染';
      return '严重污染';
    };

    // 监听值变化
    watch(() => props.value, (newVal) => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      initCanvas();
    });

    // 生命周期钩子
    onMounted(() => {
      initCanvas();
    });

    onBeforeUnmount(() => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    });

    return {
      canvasRef,
      isLoading,
      error,
      getColor,
      getStatusText
    };
  }
});
</script>

<style lang="scss" scoped>
.circle-progress {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background: rgba(255,255,255,0.95);
  border-radius: 20px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
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

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.15);
  }
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #4facfe;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.error-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #ff4d4f;
  font-size: 14px;
  text-align: center;
  z-index: 1;
}

.status-text {
  margin-top: 1rem;
  font-size: 1.2rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  transition: all 0.3s ease;
}

canvas {
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .circle-progress {
    padding: 1.5rem;
  }

  .status-text {
    font-size: 1rem;
  }
}
</style>