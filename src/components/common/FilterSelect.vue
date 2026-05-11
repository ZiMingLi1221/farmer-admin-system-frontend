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
  color: var(--text-primary);
  cursor: pointer;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
  transition: border-color 0.15s ease;
}

.filter-select--sm {
  min-height: 32px;
  padding: 0.375rem 0.625rem;
  font-size: 0.8125rem;
}

.filter-select--md {
  min-height: 40px;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
}

.filter-select--lg {
  min-height: 48px;
  padding: 0.625rem 1rem;
  font-size: 0.9375rem;
}

.filter-select:hover {
  border-color: var(--text-secondary);
}

.filter-select:focus {
  outline: none;
  border-color: var(--primary);
}

/* Mobile: 自動套用 sm 尺寸（不需 view 傳 prop） */
@media (width <= 767px) {
  .filter-select {
    min-height: 32px;
    padding: 0.375rem 0.625rem;
    font-size: 0.8125rem;
  }
}
</style>
