import { defineStore } from 'pinia';
import { ref } from 'vue';

import type {
  BusinessType,
  CreateBusinessTypePayload,
  UpdateBusinessTypePayload,
} from '@/types/department';
import { httpClient } from '@/utils/request';

export const useBusinessTypeStore = defineStore('business-type', () => {
  const businessTypesByDept = ref<Record<string, BusinessType[]>>({});
  const isLoadingByDept = ref<Record<string, boolean>>({});

  async function fetchBusinessTypes(deptId: string): Promise<void> {
    if (businessTypesByDept.value[deptId]) return;
    isLoadingByDept.value[deptId] = true;
    try {
      const res = await httpClient.get<{ items: BusinessType[] }>(
        `/departments/${deptId}/business-types`
      );
      businessTypesByDept.value[deptId] = res.data.items;
    } finally {
      isLoadingByDept.value[deptId] = false;
    }
  }

  async function createBusinessType(
    deptId: string,
    payload: CreateBusinessTypePayload
  ): Promise<BusinessType> {
    const res = await httpClient.post<BusinessType>(
      `/departments/${deptId}/business-types`,
      payload
    );
    const newBt = res.data;
    if (!businessTypesByDept.value[deptId]) {
      businessTypesByDept.value[deptId] = [];
    }
    businessTypesByDept.value[deptId].push(newBt);
    return newBt;
  }

  async function updateBusinessType(
    btId: string,
    deptId: string,
    payload: UpdateBusinessTypePayload
  ): Promise<BusinessType> {
    const res = await httpClient.put<BusinessType>(`/business-types/${btId}`, payload);
    const updated = res.data;
    const list = businessTypesByDept.value[deptId];
    if (list) {
      const idx = list.findIndex((bt) => bt.id === btId);
      if (idx !== -1) list[idx] = updated;
    }
    return updated;
  }

  async function deleteBusinessType(btId: string, deptId: string): Promise<void> {
    await httpClient.delete(`/business-types/${btId}`);
    const list = businessTypesByDept.value[deptId];
    if (list) {
      const idx = list.findIndex((bt) => bt.id === btId);
      if (idx !== -1) list.splice(idx, 1);
    }
  }

  return {
    businessTypesByDept,
    isLoadingByDept,
    fetchBusinessTypes,
    createBusinessType,
    updateBusinessType,
    deleteBusinessType,
  };
});
