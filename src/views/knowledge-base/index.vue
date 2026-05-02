<template>
  <div class="knowledge-page">
    <PageHeader
      title="知識庫管理"
      subtitle="管理 AI 知識庫文件，文件上傳後將自動解析並建立可檢索的向量索引"
    >
      <template #action>
        <IconBtn
          v-if="canUpload"
          icon="PLUS"
          label="上傳文件"
          class="btn-primary"
          @click="showUploadModal = true"
        />
      </template>
    </PageHeader>

    <SearchToolbar
      v-model:search-query="searchQuery"
      v-model:filter-category="filterCategory"
      v-model:filter-department="filterDepartment"
      v-model:filter-status="filterStatus"
      :categories="categories"
      :departments="departments"
      :is-admin="isAdmin"
    />

    <DocumentTable
      :documents="paginatedDocuments"
      :is-admin="isAdmin"
      :is-manager="isManager"
      :sort-field="sortField"
      :sort-order="sortOrder"
      @detail="handleDetail"
      @preview="handlePreview"
      @edit="handleEdit"
      @delete="handleDelete"
      @sort="handleSort"
    />

    <Pagination
      :current-page="currentPage"
      :total-pages="totalPages"
      :total="total"
      :start-index="startIndex"
      :end-index="endIndex"
      @page-change="goToPage"
    />

    <!-- 上傳文件 Modal -->
    <UploadDocumentModal
      v-model="showUploadModal"
      :departments="departments"
      @submit="handleUpload"
    />

    <!-- 文件詳情/編輯 Modal -->
    <DocumentDetailModal
      v-model="showDetailModal"
      :document="selectedDocument"
      :departments="departments"
      @save="handleSave"
    />

    <!-- 刪除確認 Modal -->
    <DeleteConfirmModal
      :open="showDeleteModal"
      :title="`確定要刪除「${selectedDocument?.title}」嗎？`"
      detail="文件刪除後，相關的向量索引也將一併移除且無法恢復"
      @confirm="handleConfirmDelete"
      @cancel="showDeleteModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import IconBtn from '@/components/base/IconBtn.vue';
import DeleteConfirmModal from '@/components/common/DeleteConfirmModal.vue';
import PageHeader from '@/components/common/PageHeader.vue';
import Pagination from '@/components/common/Pagination.vue';
import { usePagination } from '@/composables/usePagination';
import { usePermission } from '@/composables/usePermission';
import { useDepartmentStore } from '@/stores/department';
import { useKnowledgeStore } from '@/stores/knowledge';
import { useUserStore } from '@/stores/user';
import type { KnowledgeDocument } from '@/types';

import DocumentTable from './components/DocumentTable.vue';
import DocumentDetailModal from './components/modals/DocumentDetailModal.vue';
import UploadDocumentModal from './components/modals/UploadDocumentModal.vue';
import SearchToolbar from './components/SearchToolbar.vue';

const { isAdmin, isManager } = usePermission();
const userStore = useUserStore();
const knowledgeStore = useKnowledgeStore();
const departmentStore = useDepartmentStore();

onMounted(() => {
  knowledgeStore.fetchDocuments();
  departmentStore.fetchDepartments();
});

// 只有管理員和主管可以上傳
const canUpload = computed(() => isAdmin.value || isManager.value);

// 動態選單資料
// 分類：從現有文件中取得（後端整合後由 API 返回）
const categories = computed(() => knowledgeStore.categories);
// 部門：從 DepartmentStore 取得啟用中的部門
const departments = computed(() =>
  departmentStore.departments.filter((d) => d.active).map((d) => d.name)
);

// Modal 狀態
const showUploadModal = ref(false);
const showDetailModal = ref(false);
const showDeleteModal = ref(false);
const selectedDocument = ref<KnowledgeDocument | null>(null);

// 搜尋 & 篩選
const searchQuery = ref('');
const filterCategory = ref('');
const filterDepartment = ref('');
const filterStatus = ref('');

// 排序
const sortField = ref('uploadedAt');
const sortOrder = ref<'asc' | 'desc'>('desc');

const handleSort = (field: string) => {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortField.value = field;
    sortOrder.value = 'desc';
  }
};

// 過濾後的資料
const filteredDocuments = computed(() => {
  let result = knowledgeStore.documents;

  // 權限過濾：主管/員工只能看本部門 + 公開文件
  if (!isAdmin.value) {
    const userDept = userStore.user?.department;
    result = result.filter((d) => !d.department || d.department === userDept);
  }

  // 關鍵字搜尋
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.filename.toLowerCase().includes(q) ||
        d.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  // 分類篩選（只有資料庫中存在該分類才會出現在下拉）
  if (filterCategory.value) {
    result = result.filter((d) => d.category === filterCategory.value);
  }

  // 部門篩選（管理員）
  if (isAdmin.value && filterDepartment.value) {
    if (filterDepartment.value === '__public__') {
      result = result.filter((d) => !d.department);
    } else {
      result = result.filter((d) => d.department === filterDepartment.value);
    }
  }

  // 狀態篩選
  if (filterStatus.value) {
    result = result.filter((d) => d.status === filterStatus.value);
  }

  // 排序
  if (sortField.value) {
    result = [...result].sort((a, b) => {
      const aVal = (a as KnowledgeDocument)[sortField.value as keyof KnowledgeDocument] ?? '';
      const bVal = (b as KnowledgeDocument)[sortField.value as keyof KnowledgeDocument] ?? '';
      const cmp =
        typeof aVal === 'string'
          ? aVal.localeCompare(bVal as string)
          : (aVal as number) - (bVal as number);
      return sortOrder.value === 'asc' ? cmp : -cmp;
    });
  }

  return result;
});

// 分頁
const {
  currentPage,
  totalPages,
  paginatedItems: paginatedDocuments,
  startIndex,
  endIndex,
  goToPage,
} = usePagination(filteredDocuments);
const total = computed(() => filteredDocuments.value.length);

// 點擊列 → 開詳情 Modal
const handleDetail = (doc: KnowledgeDocument) => {
  selectedDocument.value = doc;
  showDetailModal.value = true;
};

// 眼睛圖示 → 開新分頁預覽原始文件
const handlePreview = (doc: KnowledgeDocument) => {
  // TODO: 後端整合後替換為 window.open(doc.fileUrl, '_blank')，打開實際檔案 URL
  console.warn('[handlePreview] 尚未提供後端實際檔案預覽 URL', doc);
};

// 編輯按鈕 → 直接開詳情 Modal（詳情 Modal 內可切換編輯模式）
const handleEdit = (doc: KnowledgeDocument) => {
  selectedDocument.value = doc;
  showDetailModal.value = true;
};

const handleDelete = (doc: KnowledgeDocument) => {
  selectedDocument.value = doc;
  showDeleteModal.value = true;
};

const handleUpload = async (_file: File, formData: any) => {
  await knowledgeStore.addDocument({
    title: formData.title,
    filename: _file.name,
    fileSize: _file.size,
    mimeType: _file.type,
    category: formData.category,
    department: formData.department,
    tags: formData.tags,
    description: formData.description,
    uploadedBy: userStore.user?.name ?? userStore.user?.username ?? '使用者',
  });
};

const handleSave = (id: string, data: any) => {
  knowledgeStore.updateDocument(id, data);
};

const handleConfirmDelete = () => {
  if (selectedDocument.value) {
    knowledgeStore.deleteDocument(selectedDocument.value.id);
  }
  showDeleteModal.value = false;
  selectedDocument.value = null;
};
</script>

<style scoped>
.knowledge-page {
  max-width: 1400px;
  padding: 2rem;
  margin: 0 auto;
}
</style>
