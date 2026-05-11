<template>
  <div class="departments-tab">
    <ViewToolbar subtitle="管理組織部門結構" />

    <div class="toolbar">
      <BatchActionToolbar
        v-if="selectedIds.length > 0"
        :count="selectedIds.length"
        @confirm-delete="handleBatchDeleteClick"
        @cancel="clearSelection"
      />
      <div v-else class="toolbar-placeholder">
        <IconBtn
          v-if="isAdmin"
          icon="PLUS"
          label="新增部門"
          class="btn-primary"
          @click="handleAddDept"
        />
      </div>
    </div>

    <DepartmentTable
      :departments="paginatedDepartments"
      :is-admin="isAdmin"
      :selected-ids="selectedIds"
      :expanded-ids="expandedDeptIds"
      @toggle-row="toggleRow"
      @toggle-all="toggleAll"
      @toggle-expand="handleToggleExpand"
      @edit="handleEditDept"
      @view="handleViewDept"
      @bt-add="handleBtAdd"
      @bt-edit="handleBtEdit"
      @bt-delete="handleBtDeleteClick"
    />

    <Pagination
      :current-page="currentPage"
      :total-pages="totalPages"
      :total="total"
      :start-index="startIndex"
      :end-index="endIndex"
      @page-change="goToPage"
    />

    <!-- 部門 Modal -->
    <DepartmentModal
      v-model="showDepartmentModal"
      :department="selectedDepartment"
      @submit="handleDepartmentSubmit"
    />

    <!-- 業務別 Modal -->
    <BusinessTypeModal
      ref="btModalRef"
      v-model="showBtModal"
      :business-type="selectedBt"
      @submit="handleBtSubmit"
    />

    <!-- 刪除確認 Modal -->
    <BaseModal
      v-model="showDeleteModal"
      :title="deleteModalTitle"
      size="sm"
      @close="showDeleteModal = false"
    >
      <p>刪除後將無法恢復此資料</p>
      <template #footer>
        <button class="btn-cancel" @click="showDeleteModal = false">取消</button>
        <button class="btn-danger" @click="handleConfirmDelete">確認刪除</button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import BaseModal from '@/components/base/BaseModal.vue';
import IconBtn from '@/components/base/IconBtn.vue';
import BatchActionToolbar from '@/components/common/BatchActionToolbar.vue';
import Pagination from '@/components/common/Pagination.vue';
import ViewToolbar from '@/components/common/ViewToolbar.vue';
import { usePagination } from '@/composables/usePagination';
import { usePermission } from '@/composables/usePermission';
import { useTableSelection } from '@/composables/useTableSelection';
import { useBusinessTypeStore } from '@/stores/business-type';
import { useDepartmentStore } from '@/stores/department';
import type {
  BusinessType,
  CreateBusinessTypePayload,
  Department,
  DepartmentFormData,
  UpdateBusinessTypePayload,
} from '@/types/department';

import DepartmentTable from './components/DepartmentTable.vue';
import BusinessTypeModal from './components/modals/BusinessTypeModal.vue';
import DepartmentModal from './components/modals/DepartmentModal.vue';

const { isAdmin } = usePermission();
const departmentStore = useDepartmentStore();
const btStore = useBusinessTypeStore();

onMounted(() => {
  departmentStore.fetchDepartments();
});

// --- Pagination ---
const departmentList = computed(() => departmentStore.departments);
const {
  currentPage,
  totalPages,
  paginatedItems: paginatedDepartments,
  startIndex,
  endIndex,
  goToPage,
} = usePagination(departmentList);
const total = computed(() => departmentStore.departments.length);

// --- Selection (batch delete) ---
const { selectedIds, toggleRow, toggleAll, clearSelection } =
  useTableSelection(paginatedDepartments);

// --- Expand ---
const expandedDeptIds = ref<Set<string>>(new Set());

function handleToggleExpand(deptId: string) {
  const next = new Set(expandedDeptIds.value);
  if (next.has(deptId)) {
    next.delete(deptId);
  } else {
    next.add(deptId);
    btStore.fetchBusinessTypes(deptId);
  }
  expandedDeptIds.value = next;
}

// --- Dept CRUD ---
const showDepartmentModal = ref(false);
const selectedDepartment = ref<Department | null>(null);

const handleAddDept = () => {
  selectedDepartment.value = null;
  showDepartmentModal.value = true;
};

const handleEditDept = (dept: Department) => {
  selectedDepartment.value = dept;
  showDepartmentModal.value = true;
};

const handleViewDept = (_dept: Department) => {};

const handleDepartmentSubmit = (formData: DepartmentFormData) => {
  if (selectedDepartment.value) {
    departmentStore.updateDepartment(selectedDepartment.value.id, formData);
  } else {
    departmentStore.addDepartment(formData);
  }
  showDepartmentModal.value = false;
};

// --- Batch delete ---
const showDeleteModal = ref(false);
const deleteModalTitle = ref('');
const pendingDeleteIds = ref<string[]>([]);
const pendingDeleteBt = ref<BusinessType | null>(null);

const handleBatchDeleteClick = () => {
  const ids = selectedIds.value;
  if (ids.length === 1) {
    const dept = departmentStore.getDepartmentById(ids[0]);
    deleteModalTitle.value = `確定要刪除「${dept?.name ?? ''}」嗎？`;
  } else {
    deleteModalTitle.value = `確定要刪除 ${ids.length} 個部門嗎？`;
  }
  pendingDeleteIds.value = [...ids];
  pendingDeleteBt.value = null;
  showDeleteModal.value = true;
};

const handleConfirmDelete = () => {
  if (pendingDeleteBt.value) {
    btStore
      .deleteBusinessType(pendingDeleteBt.value.id, pendingDeleteBt.value.departmentId)
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : '仍有人員使用此業務別，無法刪除';
        alert(msg);
      });
    pendingDeleteBt.value = null;
  } else {
    for (const id of pendingDeleteIds.value) {
      departmentStore.deleteDepartment(id);
    }
    clearSelection();
    pendingDeleteIds.value = [];
  }
  showDeleteModal.value = false;
};

// --- BT CRUD ---
const showBtModal = ref(false);
const selectedBt = ref<BusinessType | null>(null);
const activeBtDeptId = ref('');
const btModalRef = ref<InstanceType<typeof BusinessTypeModal> | null>(null);

const handleBtAdd = (deptId: string) => {
  activeBtDeptId.value = deptId;
  selectedBt.value = null;
  showBtModal.value = true;
};

const handleBtEdit = (bt: BusinessType) => {
  activeBtDeptId.value = bt.departmentId;
  selectedBt.value = bt;
  showBtModal.value = true;
};

const handleBtDeleteClick = (bt: BusinessType) => {
  deleteModalTitle.value = `確定要刪除業務別「${bt.name}」嗎？`;
  pendingDeleteBt.value = bt;
  pendingDeleteIds.value = [];
  showDeleteModal.value = true;
};

const handleBtSubmit = async (payload: CreateBusinessTypePayload | UpdateBusinessTypePayload) => {
  try {
    if (selectedBt.value) {
      await btStore.updateBusinessType(
        selectedBt.value.id,
        activeBtDeptId.value,
        payload as UpdateBusinessTypePayload
      );
    } else {
      await btStore.createBusinessType(activeBtDeptId.value, payload as CreateBusinessTypePayload);
    }
    showBtModal.value = false;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '業務別名稱在此部門已存在';
    btModalRef.value?.setError(msg);
  }
};
</script>

<style scoped>
.departments-tab {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.toolbar {
  min-height: 2.5rem;
}

.toolbar-placeholder {
  display: flex;
  justify-content: flex-end;
}

.btn-cancel,
.btn-danger {
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  border-radius: var(--radius-sm);
}

.btn-cancel {
  color: var(--text-secondary);
  background: transparent;
}

.btn-cancel:hover {
  color: var(--text-primary);
  background: var(--bg-overlay);
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.btn-danger {
  color: white;
  background: var(--error);
}

.btn-danger:hover {
  background: var(--error-hover);
  transition: background-color 0.15s ease;
}
</style>
