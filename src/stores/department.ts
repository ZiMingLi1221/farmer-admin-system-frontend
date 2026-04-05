import { defineStore } from 'pinia';

import type { Department, DepartmentFormData } from '@/types/department';
import { httpClient } from '@/utils/request';

interface DepartmentState {
  departments: Department[];
}

export const useDepartmentStore = defineStore('department', {
  state: (): DepartmentState => ({
    departments: [],
  }),

  getters: {
    // 獲取所有啟用的部門
    activeDepartments: (state) => state.departments.filter((d) => d.active),

    // 根據 ID 獲取部門
    getDepartmentById: (state) => (id: string) => {
      return state.departments.find((d) => d.id === id);
    },

    // 根據代碼獲取部門
    getDepartmentByCode: (state) => (code: string) => {
      return state.departments.find((d) => d.code === code);
    },
  },

  actions: {
    // 新增部門
    addDepartment(formData: DepartmentFormData) {
      const newDepartment: Department = {
        id: `DEPT${String(this.departments.length + 1).padStart(3, '0')}`,
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
      this.departments.push(newDepartment);
      return newDepartment;
    },

    async fetchDepartments() {
      try {
        const res = await httpClient.get<{ items: Department[] }>('/departments');
        this.departments = res.data.items;
      } catch (err) {
        console.error('[fetchDepartments] 載入部門失敗', err);
      }
    },

    // 更新部門
    updateDepartment(id: string, formData: DepartmentFormData) {
      const index = this.departments.findIndex((d) => d.id === id);
      if (index !== -1) {
        this.departments[index] = {
          ...this.departments[index],
          name: formData.name,
          managerName: formData.managerName || undefined,
          active: formData.active,
        };
        return this.departments[index];
      }
      return null;
    },

    // 刪除部門
    deleteDepartment(id: string) {
      const index = this.departments.findIndex((d) => d.id === id);
      if (index !== -1) {
        const deleted = this.departments[index];
        this.departments.splice(index, 1);
        return deleted;
      }
      return null;
    },
  },
});
