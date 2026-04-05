import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import type { ChangePasswordResponse, LoginRequest, LoginResponse } from '@/types/auth';
import { httpClient } from '@/utils/request';

/**
 * 認證狀態管理
 * 專注於管理 Token 和登入狀態
 */
export const useAuthStore = defineStore(
  'auth',
  () => {
    // State
    const accessToken = ref<string | null>(null);
    const isLoggingIn = ref(false);

    // Getters
    const isAuthenticated = computed(() => !!accessToken.value);

    // Actions
    /**
     * 設定 Token
     */
    const setToken = (token: string): void => {
      accessToken.value = token;
    };

    /**
     * 清除 Token
     */
    const clearToken = (): void => {
      accessToken.value = null;
    };

    /**
     * 登入
     */
    const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
      isLoggingIn.value = true;

      try {
        const res = await httpClient.post<LoginResponse>('/auth/login', credentials);
        const { data } = res;
        setToken(data.accessToken);
        return data;
      } finally {
        isLoggingIn.value = false;
      }
    };

    /**
     * 登出
     */
    const logout = (): void => {
      clearToken();
    };

    /**
     * 修改密碼
     */
    const changePassword = async (
      oldPassword: string,
      newPassword: string
    ): Promise<ChangePasswordResponse> => {
      isLoggingIn.value = true;

      try {
        const res = await httpClient.post<ChangePasswordResponse>('/auth/change-password', {
          oldPassword,
          newPassword,
        });
        return res.data;
      } finally {
        isLoggingIn.value = false;
      }
    };

    return {
      // State
      accessToken,
      isLoggingIn,
      // Getters
      isAuthenticated,
      // Actions
      setToken,
      clearToken,
      login,
      logout,
      changePassword,
    };
  },
  {
    persist: {
      key: 'auth-token',
      pick: ['accessToken'],
    },
  }
);
