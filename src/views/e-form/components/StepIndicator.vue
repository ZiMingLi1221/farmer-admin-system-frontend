<template>
  <div class="step-indicator">
    <div v-for="(step, index) in steps" :key="step.id" class="step-wrapper">
      <!-- 步驟節點 -->
      <div
        class="step-node"
        :class="{
          'step-completed': currentStep > step.id,
          'step-active': currentStep === step.id,
          'step-pending': currentStep < step.id,
        }"
      >
        <!-- 完成圖示 -->
        <svg
          v-if="currentStep > step.id"
          class="check-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2.5"
            d="M5 13l4 4L19 7"
          />
        </svg>
        <span v-else class="step-number">{{ step.id }}</span>
      </div>

      <!-- 步驟標籤 -->
      <div class="step-label" :class="{ 'label-active': currentStep === step.id }">
        {{ step.label }}
      </div>

      <!-- 連接線（最後一步不畫） -->
      <div
        v-if="index < steps.length - 1"
        class="step-connector"
        :class="{ 'connector-done': currentStep > step.id }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const STEPS = [
  { id: 1, label: '選擇業務別與表單' },
  { id: 2, label: '填入申請人資訊' },
  { id: 3, label: '生成與下載' },
];

defineProps<{ currentStep: number }>();

const steps = STEPS;
</script>

<style scoped>
.step-indicator {
  display: flex;
  gap: 0;
  align-items: flex-start;
  justify-content: center;
  padding: 0.625rem 1rem 0.75rem;
}

.step-wrapper {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  max-width: 180px;
}

/* 節點 */
.step-node {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 50%;
  transition: transform 0.3s ease;
}

.step-pending {
  color: var(--text-2);
  background: var(--bg-hover);
  border: 2px solid var(--border);
}

.step-active {
  color: white;
  background: var(--accent);
  border: 2px solid var(--accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 20%, transparent);
}

.step-completed {
  color: white;
  background: var(--accent);
  border: 2px solid var(--accent);
}

/* 數字與勾勾 */
.step-number {
  line-height: 1;
}

.check-icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* 標籤：全部顯示 */
.step-label {
  margin-top: 0.375rem;
  font-size: 0.875rem;
  color: var(--text-2);
  text-align: center;
  white-space: nowrap;
}

.label-active {
  max-height: 2rem;
  font-weight: 600;
  color: var(--accent);
  opacity: 1;
  transition: color 0.3s;
}

/* 連接線：絕對定位在節點的右半側 */
.step-connector {
  position: absolute;
  top: 1.25rem; /* 節點高度一半 (2.5rem / 2) */
  left: calc(50% + 1.25rem);
  width: calc(100% - 1.25rem);
  height: 1.5px;
  background: var(--border);
}

.connector-done {
  background: var(--accent);
  transition: background 0.3s ease;
}
</style>
