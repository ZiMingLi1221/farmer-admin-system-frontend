<template>
  <select
    :value="modelValue"
    class="filter-select"
    :class="`filter-select--${size}`"
    @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
  >
    <option value="">{{ placeholder }}</option>
    <option v-for="opt in normalizedOptions" :key="opt.value" :value="opt.value">
      {{ opt.label }}
    </option>
  </select>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue: string;
    options: Array<string | { value: string; label: string }>;
    placeholder: string;
    size?: 'sm' | 'md' | 'lg';
  }>(),
  {
    size: 'md',
  }
);

defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const normalizedOptions = computed(() =>
  props.options.map((opt) => (typeof opt === 'string' ? { value: opt, label: opt } : opt))
);
</script>

<style scoped>
.filter-select {
  box-sizing: border-box;
  color: var(--text);
  appearance: none;
  cursor: pointer;
  background-color: var(--bg-1);

  /*
   * Chevron anchored from the right edge of the element's padding box
   * (box-sizing: border-box). Using `right` offsets instead of
   * `calc(100% - N)` prevents the chevron from shifting when border
   * width changes between states.
   */
  background-image:
    linear-gradient(45deg, transparent 50%, var(--text-2) 50%),
    linear-gradient(135deg, var(--text-2) 50%, transparent 50%);
  background-repeat: no-repeat;
  background-position:
    right 16px center,
    right 11px center;
  background-size:
    5px 5px,
    5px 5px;
  border: 2px solid var(--border);
  border-radius: var(--r-md);
  transition: border-color 0.15s ease;
}

.filter-select--sm {
  min-height: 32px;
  padding: 0.375rem 36px 0.375rem 0.625rem;
  font-size: 0.8125rem;
}

.filter-select--md {
  min-height: 40px;
  padding: 0.5rem 36px 0.5rem 0.75rem;
  font-size: 0.875rem;
}

.filter-select--lg {
  min-height: 48px;
  padding: 0.625rem 36px 0.625rem 1rem;
  font-size: 0.9375rem;
}

.filter-select:hover {
  border-color: var(--border-strong);
}

.filter-select:focus {
  outline: none;
  border-color: var(--accent);

  /* border 保持 2px，僅換色；chevron 以 right 定位不受影響 */
}

/* Mobile: 自動套用 sm 尺寸（不需 view 傳 prop） */
@media (width <= 767px) {
  .filter-select {
    min-height: 32px;
    padding: 0.375rem 36px 0.375rem 0.625rem;
    font-size: 0.8125rem;
  }
}
</style>
