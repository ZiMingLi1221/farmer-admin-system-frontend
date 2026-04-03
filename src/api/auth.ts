/**
 * 認證相關 API
 *
 * @remarks
 * 目前認證流程（Mock 與未來真實 API）統一由 `stores/auth.ts` 管理。
 * - Mock 模式：由 `stores/auth.ts` 呼叫 `mock/auth.ts` 提供資料
 * - 真實模式：後端 API ready 後，在 `stores/auth.ts` 的 TODO 處接入以下函式
 *
 * 此檔案為 API 層的型別簽名佔位（stub），保留函式定義供 TypeScript 型別系統使用。
 */

import type {
  ChangePasswordRequest,
  ChangePasswordResponse,
  LoginRequest,
  LoginResponse,
} from '@/types/auth';

/**
 * 登入
 *
 * @remarks
 * 目前由 `stores/auth.ts` 內部 Mock 實作；後端 ready 後取消此函式的 stub 狀態
 *
 * TODO: 後端 API ready 後啟用
 * ```ts
 * export const login = (data: LoginRequest) =>
 *   httpClient.post<LoginResponse>('/auth/login', data);
 * ```
 */
export const login = (_data: LoginRequest): Promise<LoginResponse> => {
  if (import.meta.env.DEV) {
    console.warn('[api/auth] login() 尚未接入後端，請透過 stores/auth.ts 呼叫 Mock 流程');
  }
  return Promise.reject(new Error('auth/login: pending backend implementation'));
};

/**
 * 登出
 *
 * TODO: 後端 API ready 後啟用
 * ```ts
 * export const logout = () =>
 *   httpClient.post<void>('/auth/logout');
 * ```
 */
export const logout = (): Promise<void> => {
  if (import.meta.env.DEV) {
    console.warn('[api/auth] logout() 尚未接入後端');
  }
  return Promise.reject(new Error('auth/logout: pending backend implementation'));
};

/**
 * 刷新 Access Token
 *
 * TODO: 後端 API ready 後啟用
 * ```ts
 * export const refreshToken = () =>
 *   httpClient.post<{ accessToken: string }>('/auth/refresh');
 * ```
 */
export const refreshToken = (): Promise<{ accessToken: string }> => {
  if (import.meta.env.DEV) {
    console.warn('[api/auth] refreshToken() 尚未接入後端');
  }
  return Promise.reject(new Error('auth/refreshToken: pending backend implementation'));
};

/**
 * 修改密碼
 *
 * TODO: 後端 API ready 後啟用
 * ```ts
 * export const changePassword = (data: ChangePasswordRequest) =>
 *   httpClient.post<ChangePasswordResponse>('/auth/change-password', data);
 * ```
 */
export const changePassword = (_data: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
  if (import.meta.env.DEV) {
    console.warn('[api/auth] changePassword() 尚未接入後端，請透過 stores/auth.ts 呼叫 Mock 流程');
  }
  return Promise.reject(new Error('auth/changePassword: pending backend implementation'));
};
