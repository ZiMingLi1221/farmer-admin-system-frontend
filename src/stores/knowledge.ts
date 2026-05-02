import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import type { KnowledgeDocument } from '@/types/knowledge';
import { httpClient } from '@/utils/request';

export const useKnowledgeStore = defineStore('knowledge', () => {
  // State
  const documents = ref<KnowledgeDocument[]>([]);
  const isLoading = ref(false);

  // Getters

  // 所有可用分類
  const categories = computed((): string[] => {
    const cats = new Set(documents.value.map((d) => d.category).filter(Boolean));
    return Array.from(cats);
  });

  // 所有可用部門
  const departments = computed((): string[] => {
    const depts = new Set(documents.value.map((d) => d.department).filter(Boolean));
    return Array.from(depts);
  });

  // Actions

  async function fetchDocuments(): Promise<void> {
    isLoading.value = true;
    try {
      const res = await httpClient.get<{ items: KnowledgeDocument[] }>('/knowledge/documents');
      documents.value = res.data.items;
    } finally {
      isLoading.value = false;
    }
  }

  async function addDocument(
    doc: Omit<KnowledgeDocument, 'id' | 'uploadedAt' | 'updatedAt' | 'status' | 'chunkCount'>
  ): Promise<KnowledgeDocument> {
    isLoading.value = true;
    try {
      const res = await httpClient.post<KnowledgeDocument>('/knowledge/documents', doc);
      documents.value.push(res.data);
      return res.data;
    } finally {
      isLoading.value = false;
    }
  }

  function updateDocument(
    id: string,
    data: Partial<
      Pick<KnowledgeDocument, 'title' | 'category' | 'department' | 'tags' | 'description'>
    >
  ): KnowledgeDocument | null {
    const index = documents.value.findIndex((d) => d.id === id);
    if (index !== -1) {
      const now = new Date().toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      documents.value[index] = { ...documents.value[index], ...data, updatedAt: now };
      return documents.value[index];
    }
    return null;
  }

  function deleteDocument(id: string): KnowledgeDocument | null {
    const index = documents.value.findIndex((d) => d.id === id);
    if (index !== -1) {
      const deleted = documents.value[index];
      documents.value.splice(index, 1);
      return deleted;
    }
    return null;
  }

  return {
    // State
    documents,
    isLoading,
    // Getters
    categories,
    departments,
    // Actions
    fetchDocuments,
    addDocument,
    updateDocument,
    deleteDocument,
  };
});
