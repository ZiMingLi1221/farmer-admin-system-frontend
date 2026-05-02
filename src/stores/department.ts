import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import type { Department, DepartmentFormData } from '@/types/department';
import { httpClient } from '@/utils/request';

export const useDepartmentStore = defineStore('department', () => {
  // State
  const departments = ref<Department[]>([]);
  const isLoading = ref(false);

  // Getters
  const activeDepartments = computed(() => departments.value.filter((d) => d.active));

  const getDepartmentById = (id: string) => {
    return departments.value.find((d) => d.id === id);
  };

  const getDepartmentByCode = (code: string) => {
    return departments.value.find((d) => d.code === code);
  };

  // Actions
  async function fetchDepartments() {
    isLoading.value = true;
    try {
      const res = await httpClient.get<{ items: Department[] }>('/departments');
      departments.value = res.data.items;
    } finally {
      isLoading.value = false;
    }
  }

  function addDepartment(formData: DepartmentFormData) {
    const newDepartment: Department = {
      id: `DEPT${String(departments.value.length + 1).padStart(3, '0')}`,
      code: formData.code,
      name: formData.name,
      managerName: formData.managerName || undefined,
      memberCount: 0,
      knowledgeBaseCount: 0,
      active: formData.active,
      createdAt: new Date().toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }),
    };
    departments.value.push(newDepartment);
    return newDepartment;
  }

  function updateDepartment(id: string, formData: DepartmentFormData) {
    const index = departments.value.findIndex((d) => d.id === id);
    if (index !== -1) {
      departments.value[index] = {
        ...departments.value[index],
        name: formData.name,
        managerName: formData.managerName || undefined,
        active: formData.active,
      };
      return departments.value[index];
    }
    return null;
  }

  function deleteDepartment(id: string) {
    const index = departments.value.findIndex((d) => d.id === id);
    if (index !== -1) {
      const deleted = departments.value[index];
      departments.value.splice(index, 1);
      return deleted;
    }
    return null;
  }

  return {
    // State
    departments,
    isLoading,
    // Getters
    activeDepartments,
    getDepartmentById,
    getDepartmentByCode,
    // Actions
    fetchDepartments,
    addDepartment,
    updateDepartment,
    deleteDepartment,
  };
});
