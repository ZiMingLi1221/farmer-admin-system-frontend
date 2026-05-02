import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import type { UserFormData, UserInfo, UserRole } from '@/types';
import { httpClient } from '@/utils/request';

export const useStaffStore = defineStore('staff', () => {
  // State
  const users = ref<UserInfo[]>([]);
  const isLoading = ref(false);

  // Getters
  const managers = computed(() =>
    users.value.filter((u) => (u.role === 'manager' || u.role === 'admin') && u.active)
  );

  const getUsersByDepartment = (department: string) => {
    return users.value.filter((u) => u.department === department);
  };

  const getUserById = (id: string) => {
    return users.value.find((u) => u.id === id);
  };

  const getUserByUsername = (username: string) => {
    return users.value.find((u) => u.username === username);
  };

  // Actions
  async function fetchStaff() {
    isLoading.value = true;
    try {
      const res = await httpClient.get<{ items: UserInfo[] }>('/staff');
      users.value = res.data.items;
    } finally {
      isLoading.value = false;
    }
  }

  function addUser(formData: UserFormData) {
    const newUser: UserInfo = {
      id: `USER${String(users.value.length + 1).padStart(3, '0')}`,
      username: formData.username ?? '',
      name: formData.name,
      role: formData.role,
      department: formData.department || '',
      active: true,
      mustChangePassword: formData.mustChangePassword,
      createdAt: new Date().toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }),
      lastLoginAt: undefined,
    };
    users.value.push(newUser);
    return newUser;
  }

  function updateUser(id: string, formData: UserFormData) {
    const index = users.value.findIndex((u) => u.id === id);
    if (index !== -1) {
      users.value[index] = {
        ...users.value[index],
        name: formData.name,
        role: formData.role,
        department: formData.department || '',
      };
      return users.value[index];
    }
    return null;
  }

  function updateUserRole(id: string, newRole: UserRole) {
    const index = users.value.findIndex((u) => u.id === id);
    if (index !== -1) {
      users.value[index].role = newRole;
      return users.value[index];
    }
    return null;
  }

  function resetUserPassword(id: string, mustChange: boolean) {
    const index = users.value.findIndex((u) => u.id === id);
    if (index !== -1) {
      users.value[index].mustChangePassword = mustChange;
      return users.value[index];
    }
    return null;
  }

  function deleteUser(id: string) {
    const index = users.value.findIndex((u) => u.id === id);
    if (index !== -1) {
      const deleted = users.value[index];
      users.value.splice(index, 1);
      return deleted;
    }
    return null;
  }

  return {
    // State
    users,
    isLoading,
    // Getters
    managers,
    getUsersByDepartment,
    getUserById,
    getUserByUsername,
    // Actions
    fetchStaff,
    addUser,
    updateUser,
    updateUserRole,
    resetUserPassword,
    deleteUser,
  };
});
