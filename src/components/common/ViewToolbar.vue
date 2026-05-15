<template>
  <div class="view-toolbar">
    <p v-if="subtitle" class="view-subtitle">{{ subtitle }}</p>
    <div v-if="hasActions" class="view-header-actions"><slot name="actions" /></div>
    <div v-if="search" class="search-input-wrapper">
      <svg
        class="search-icon"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" :d="ICONS.SEARCH" />
      </svg>
      <input
        class="search-input"
        type="text"
        :value="search.modelValue"
        :placeholder="search.placeholder ?? '搜尋...'"
        @input="$emit('update:search', ($event.target as HTMLInputElement).value)"
      />
    </div>
    <div v-if="hasFilters" class="filters"><slot name="filters" /></div>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue';

import { ICONS } from '@/constants/icons';

interface SearchProp {
  modelValue: string;
  placeholder?: string;
}

defineProps<{
  subtitle?: string;
  search?: SearchProp | null;
}>();

defineEmits<{
  'update:search': [value: string];
}>();

const slots = useSlots();

const hasActions = computed(() => !!slots.actions?.());
const hasFilters = computed(() => !!slots.filters?.());
</script>

<style scoped>
.view-toolbar {
  display: grid;
  grid-template-areas:
    'subtitle actions'
    'search filters';
  grid-template-columns: 1fr auto;
  gap: 1rem 0.75rem;
  margin-bottom: 1.5rem;
}

.view-subtitle {
  grid-area: subtitle;
  align-self: center;
  margin: 0;
  font-size: 1rem;
  font-weight: 400;
  color: var(--text);
}

.view-header-actions {
  display: flex;
  flex-shrink: 0;
  grid-area: actions;
  gap: 0.5rem;
  align-items: center;
  justify-self: end;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  grid-area: search;
  align-items: center;
  width: 100%;
  max-width: 320px;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  width: 1rem;
  height: 1rem;
  color: var(--text-2);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2.25rem;
  font-size: 0.875rem;
  color: var(--text);
  background-color: var(--bg-1);
  border: 1px solid var(--border);
  border-radius: var(--r-md);
}

.search-input:focus {
  outline: none;
  border-color: var(--accent);
}

.filters {
  display: flex;
  flex-wrap: wrap;
  grid-area: filters;
  gap: 0.75rem;
  align-items: center;
  justify-self: end;
}

/* Tablet 中等寬度：search 與 filters 換行 */
@media (width <= 1024px) {
  .view-toolbar {
    grid-template-areas:
      'subtitle actions'
      'search search'
      'filters filters';
  }

  .search-input-wrapper {
    max-width: none;
  }

  .filters {
    justify-self: start;
  }
}

/* Mobile: subtitle 獨佔行 / search + actions 同行 / filters 換行 */
@media (width <= 767px) {
  .view-toolbar {
    grid-template-areas:
      'subtitle subtitle'
      'search actions'
      'filters filters';
    gap: 0.75rem;
  }

  .view-header-actions {
    align-self: center;
  }

  .view-subtitle {
    font-size: 0.9375rem;
  }
}
</style>
