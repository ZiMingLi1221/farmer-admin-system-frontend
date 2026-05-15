<template>
  <div class="bt-sub-row">
    <div class="bt-header">
      <span class="bt-title">業務別</span>
      <button v-if="isAdmin" class="btn-add" @click="$emit('add')">+ 新增業務別</button>
    </div>

    <div v-if="isLoading" class="bt-loading">載入中…</div>

    <BaseTable
      v-else
      :columns="columns"
      :rows="businessTypes as unknown as BaseTableRow[]"
      empty-text="尚無業務別"
    >
      <template #cell-active="{ row }">
        <span
          :class="['status-badge', (row as unknown as BusinessType).active ? 'active' : 'inactive']"
        >
          {{ (row as unknown as BusinessType).active ? '啟用' : '停用' }}
        </span>
      </template>

      <template v-if="isAdmin" #actions="{ row }">
        <button
          class="btn-icon"
          title="編輯"
          @click="$emit('edit', row as unknown as BusinessType)"
        >
          <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="ICONS.EDIT" />
          </svg>
        </button>
        <button
          class="btn-icon btn-danger"
          title="刪除"
          @click="$emit('delete', row as unknown as BusinessType)"
        >
          <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              :d="ICONS.DELETE"
            />
          </svg>
        </button>
      </template>
    </BaseTable>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import type { BaseTableRow, ColumnDef } from '@/components/base/BaseTable.vue';
import BaseTable from '@/components/base/BaseTable.vue';
import { ICONS } from '@/constants/icons';
import { useBusinessTypeStore } from '@/stores/business-type';
import type { BusinessType } from '@/types/department';

interface Props {
  deptId: string;
  isAdmin: boolean;
}

const props = defineProps<Props>();

defineEmits<{
  add: [];
  edit: [bt: BusinessType];
  delete: [bt: BusinessType];
}>();

const btStore = useBusinessTypeStore();

const isLoading = computed(() => btStore.isLoadingByDept[props.deptId] ?? false);
const businessTypes = computed(() => btStore.businessTypesByDept[props.deptId] ?? []);

const columns: ColumnDef[] = [
  { key: 'name', label: '業務別名稱' },
  { key: 'description', label: '說明', width: '40%' },
  { key: 'active', label: '狀態', width: '80px' },
];
</script>

<style scoped>
.bt-sub-row {
  padding: 1rem 1.5rem 1rem 3rem;
  background: var(--bg);
  border-top: 1px solid var(--border-strong);
}

.bt-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.bt-title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-2);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.btn-add {
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--accent);
  cursor: pointer;
  background: transparent;
  border: 1px solid var(--accent);
  border-radius: var(--r-md);
}

.btn-add:hover {
  color: white;
  background: var(--accent);
  transition: background-color 0.15s ease;
}

.bt-loading {
  padding: 1rem 0;
  font-size: 0.875rem;
  color: var(--text-2);
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
  background: var(--bg-1);
  transition:
    color 0.15s ease,
    background-color 0.2s ease;
}

.btn-icon.btn-danger:hover {
  color: var(--error);
}

.icon {
  width: 1rem;
  height: 1rem;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: var(--r-xs);
}

.status-badge.active {
  color: var(--success);
  background: rgb(16 185 129 / 10%);
}

.status-badge.inactive {
  color: var(--error);
  background: rgb(239 68 68 / 10%);
}
</style>
