<template>
  <div class="base-table-container" :class="{ 'sticky-first': stickyFirstColumn }">
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
            :class="{ 'col-sortable': col.sortable, 'col-sticky': col.key === firstColumnKey }"
            :style="col.width ? { width: col.width } : undefined"
            @click="col.sortable ? $emit('sort', col.key) : undefined"
          >
            <span class="th-label">
              {{ col.label }}
              <span
                v-if="col.sortable"
                class="sort-indicator"
                :class="{ 'sort-active': sortBy === col.key }"
              >
                <!-- asc: single up triangle -->
                <svg
                  v-if="sortBy === col.key && sortOrder === 'asc'"
                  class="sort-icon"
                  viewBox="0 0 9 7"
                  aria-hidden="true"
                >
                  <path d="M4.5 0 L9 7 L0 7 Z" />
                </svg>
                <!-- desc: single down triangle -->
                <svg
                  v-else-if="sortBy === col.key && sortOrder === 'desc'"
                  class="sort-icon"
                  viewBox="0 0 9 7"
                  aria-hidden="true"
                >
                  <path d="M4.5 7 L9 0 L0 0 Z" />
                </svg>
                <!-- unsorted: neutral double-arrow -->
                <svg v-else class="sort-icon" viewBox="0 0 9 12" aria-hidden="true">
                  <path d="M4.5 0 L9 5 L0 5 Z" />
                  <path d="M4.5 12 L9 7 L0 7 Z" />
                </svg>
              </span>
            </span>
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
          <td
            v-for="col in columns"
            :key="col.key"
            :class="{ 'col-sticky': col.key === firstColumnKey }"
          >
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
  sortable?: boolean;
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
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  stickyFirstColumn?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  selectedIds: undefined,
  permissions: undefined,
  emptyText: '暫無資料',
  sortBy: undefined,
  sortOrder: 'desc',
  stickyFirstColumn: false,
});

defineEmits<{
  'toggle-row': [id: string];
  'toggle-all': [];
  edit: [row: BaseTableRow];
  sort: [key: string];
}>();

const slots = useSlots();
const hasActionsSlot = computed(() => !!slots['actions']);

// 首欄凍結時鎖定的資料欄（checkbox 另由 .col-checkbox 處理）
const firstColumnKey = computed(() =>
  props.stickyFirstColumn ? props.columns[0]?.key : undefined
);

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
  overflow-x: auto;
  background: var(--bg-1);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
}

.base-table {
  width: 100%;
  min-width: 760px;
  border-collapse: collapse;
}

.base-table thead th {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-2);
  text-align: left;
  white-space: nowrap;
  background: var(--bg-hover);
  border-bottom: 1px solid var(--border);
}

.col-sortable {
  cursor: pointer;
  user-select: none;
}

.th-label {
  display: inline-flex;
  gap: 0.25rem;
  align-items: center;
}

.sort-indicator {
  display: inline-flex;
  align-items: center;
  color: var(--text-3);
}

.sort-indicator.sort-active {
  color: var(--accent);
}

.col-sortable:hover .sort-indicator {
  color: var(--accent);
  transition: color 0.15s ease;
}

.sort-icon {
  width: 9px;
  height: 9px;
  fill: currentcolor;
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
  white-space: nowrap;
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

/* 寬度依內容收縮：單一 ⋮ 時極窄，多按鈕表格仍自動撐開 */
.col-actions {
  width: 1%;
  text-align: center;
  white-space: nowrap;
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

/* 首欄凍結（RWD：窄螢幕橫向滾動時保留檔名欄可見） */
.sticky-first .col-checkbox {
  position: sticky;
  left: 0;
  z-index: 2;
  background: var(--bg-1);
}

.sticky-first thead .col-checkbox {
  z-index: 3;
  background: var(--bg-hover);
}

/* 僅凍結勾選框首欄；其餘欄位（含檔名）隨橫向滾動 */
.sticky-first tbody tr:hover .col-checkbox {
  background: var(--bg-hover);
}
</style>
