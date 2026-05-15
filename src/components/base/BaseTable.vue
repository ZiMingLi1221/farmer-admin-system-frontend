<template>
  <div class="base-table-container">
    <table class="base-table">
      <thead>
        <tr>
          <th v-if="selectedIds !== undefined" class="col-checkbox">
            <input
              type="checkbox"
              :checked="isAllSelected"
              :indeterminate="isIndeterminate"
              @change="$emit('toggle-all')"
            />
          </th>
          <th
            v-for="col in columns"
            :key="col.key"
            :style="col.width ? { width: col.width } : undefined"
          >
            {{ col.label }}
          </th>
          <th v-if="hasActionsSlot || permissions?.canEdit" class="col-actions">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.id">
          <td v-if="selectedIds !== undefined" class="col-checkbox">
            <input
              type="checkbox"
              :checked="selectedIds.includes(row.id)"
              @change="$emit('toggle-row', row.id)"
            />
          </td>
          <td v-for="col in columns" :key="col.key">
            <slot :name="`cell-${col.key}`" :row="row">
              {{ row[col.key] }}
            </slot>
          </td>
          <td v-if="hasActionsSlot || permissions?.canEdit" class="col-actions">
            <div class="action-buttons">
              <button
                v-if="permissions?.canEdit"
                class="btn-icon"
                title="編輯"
                @click="$emit('edit', row)"
              >
                <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    :d="ICONS.EDIT"
                  />
                </svg>
              </button>
              <slot name="actions" :row="row" />
            </div>
          </td>
        </tr>
        <tr v-if="rows.length === 0">
          <td :colspan="totalColumns" class="empty-cell">
            <slot name="empty">{{ emptyText }}</slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue';

import { ICONS } from '@/constants/icons';

export interface ColumnDef {
  key: string;
  label: string;
  width?: string;
}

export interface BaseTableRow {
  id: string;
  [key: string]: unknown;
}

interface Props {
  columns: ColumnDef[];
  rows: BaseTableRow[];
  selectedIds?: string[];
  permissions?: { canEdit?: boolean };
  emptyText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  selectedIds: undefined,
  permissions: undefined,
  emptyText: '暫無資料',
});

defineEmits<{
  'toggle-row': [id: string];
  'toggle-all': [];
  edit: [row: BaseTableRow];
}>();

const slots = useSlots();
const hasActionsSlot = computed(() => !!slots['actions']);

const isAllSelected = computed(() => {
  if (!props.selectedIds || props.rows.length === 0) return false;
  return props.selectedIds.length === props.rows.length;
});

const isIndeterminate = computed(() => {
  if (!props.selectedIds) return false;
  return props.selectedIds.length > 0 && props.selectedIds.length < props.rows.length;
});

const totalColumns = computed(() => {
  let count = props.columns.length;
  if (props.selectedIds !== undefined) count++;
  if (hasActionsSlot.value || props.permissions?.canEdit) count++;
  return count;
});
</script>

<style scoped>
.base-table-container {
  overflow: hidden;
  background: var(--bg-1);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
}

.base-table {
  width: 100%;
  border-collapse: collapse;
}

.base-table thead th {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-2);
  text-align: left;
  background: var(--bg-hover);
  border-bottom: 1px solid var(--border);
}

.base-table tbody tr {
  border-bottom: 1px solid var(--border-strong);
}

.base-table tbody tr:last-child {
  border-bottom: none;
}

.base-table tbody tr:hover {
  background: var(--bg-hover);
}

.base-table tbody td {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: var(--text);
}

.col-checkbox {
  width: 3rem;
  text-align: center;
}

.col-checkbox input[type='checkbox'] {
  width: 1rem;
  height: 1rem;
  cursor: pointer;
}

.col-actions {
  width: 120px;
  text-align: center;
}

.action-buttons {
  display: flex;
  gap: 0.25rem;
  justify-content: center;
}

.btn-icon {
  padding: 0.375rem;
  color: var(--text-2);
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: var(--r-md);
}

.btn-icon:hover {
  color: var(--accent);
  background: var(--bg);
  transition:
    color 0.15s ease,
    background-color 0.15s ease;
}

.icon {
  width: 1rem;
  height: 1rem;
}

.empty-cell {
  padding: 2rem 1rem;
  font-size: 0.875rem;
  color: var(--text-2);
  text-align: center;
}
</style>
