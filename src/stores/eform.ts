import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { FIELD_DEF_MAP } from '@/config';
import type {
  ApplicantFieldDef,
  EFormBusinessType,
  EFormTemplate,
  FormFieldCoord,
  FormSessionRecord,
} from '@/types/form';
import { httpClient } from '@/utils/request';

export const useEFormStore = defineStore('eform', () => {
  // State
  const businessTypes = ref<EFormBusinessType[]>([]);
  const sessions = ref<FormSessionRecord[]>([]);
  const isLoading = ref(false);

  // Getters

  /** 依業務別 ID 取得業務別資料 */
  const getBusinessType = computed(
    () => (id: string) => businessTypes.value.find((bt) => bt.id === id)
  );

  /** 依業務別及選取的模板 IDs 計算聯集欄位 */
  const getUnionFields = computed(() => (templateIds: string[]): ApplicantFieldDef[] => {
    // 蒐集所有選中模板的欄位
    const allFields: FormFieldCoord[] = [];
    for (const bt of businessTypes.value) {
      for (const tmpl of bt.templates) {
        if (templateIds.includes(tmpl.id)) {
          allFields.push(...tmpl.fields);
        }
      }
    }

    // 依 fieldKey 聯集：任一表單 required→聯集亦 required
    const unionMap = new Map<string, ApplicantFieldDef>();
    for (const f of allFields) {
      const existing = unionMap.get(f.fieldKey);
      const def = FIELD_DEF_MAP[f.fieldKey] ?? {
        key: f.fieldKey,
        label: f.label,
        type: 'text' as const,
      };
      if (existing) {
        // 任一 required → 聯集 required
        if (f.required) existing.required = true;
      } else {
        unionMap.set(f.fieldKey, { ...def, required: f.required });
      }
    }

    // 按照 FIELD_DEF_MAP 中的順序輸出（未定義的排最後）
    const ORDER = Object.keys(FIELD_DEF_MAP);
    return [...unionMap.values()].sort((a, b) => {
      const ai = ORDER.indexOf(a.key);
      const bi = ORDER.indexOf(b.key);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });
  });

  /** 取得指定模板物件 */
  const getTemplate = computed(() => (templateId: string): EFormTemplate | undefined => {
    for (const bt of businessTypes.value) {
      const t = bt.templates.find((t) => t.id === templateId);
      if (t) return t;
    }
  });

  // Actions

  /** 載入業務別清單 */
  async function fetchBusinessTypes(): Promise<void> {
    isLoading.value = true;
    try {
      const res = await httpClient.get<EFormBusinessType[]>('/eform/business-types');
      businessTypes.value = res.data;
    } finally {
      isLoading.value = false;
    }
  }

  /** 載入生成歷程 */
  async function fetchSessions(): Promise<void> {
    isLoading.value = true;
    try {
      const res = await httpClient.get<{ items: FormSessionRecord[] }>('/eform/sessions');
      sessions.value = res.data.items;
    } finally {
      isLoading.value = false;
    }
  }

  /** 新增生成歷程（Mock：不呼叫 API） */
  function addSession(payload: Omit<FormSessionRecord, 'id' | 'createdAt'>): FormSessionRecord {
    const now = new Date().toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    const record: FormSessionRecord = {
      ...payload,
      id: `S${String(sessions.value.length + 1).padStart(3, '0')}`,
      createdAt: now,
    };
    sessions.value.unshift(record);
    return record;
  }

  return {
    // State
    businessTypes,
    sessions,
    isLoading,
    // Getters
    getBusinessType,
    getUnionFields,
    getTemplate,
    // Actions
    fetchBusinessTypes,
    fetchSessions,
    addSession,
  };
});
