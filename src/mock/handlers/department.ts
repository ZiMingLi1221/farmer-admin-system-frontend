import { http, HttpResponse } from 'msw';

import type { BusinessType } from '@/types/department';

import { assignedBusinessTypeIds, mockBusinessTypes, mockDepartments } from '../department';

export const departmentHandlers = [
  // 取得部門列表
  http.get('*/api/v1/departments', () => {
    return HttpResponse.json({
      code: 0,
      message: 'success',
      data: {
        items: mockDepartments,
        total: mockDepartments.length,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      },
    });
  }),

  // 取得單一部門
  http.get('*/api/v1/departments/:id', ({ params }) => {
    const department = mockDepartments.find((d) => d.id === params.id);
    if (!department) {
      return HttpResponse.json({
        code: 20004,
        message: '部門不存在',
        data: null,
      });
    }
    return HttpResponse.json({
      code: 0,
      message: 'success',
      data: department,
    });
  }),

  // 新增部門
  http.post('*/api/v1/departments', async ({ request }) => {
    const newDept = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      code: 0,
      message: '部門建立成功',
      data: {
        ...newDept,
        id: `DEPT${Math.floor(Math.random() * 1000)}`,
        memberCount: 0,
        knowledgeBaseCount: 0,
        createdAt: new Date().toISOString(),
      },
    });
  }),

  // 取得部門的業務別列表
  http.get('*/api/v1/departments/:id/business-types', async ({ params }) => {
    await new Promise((r) => setTimeout(r, 200));
    const items = mockBusinessTypes.filter((bt) => bt.departmentId === params.id);
    return HttpResponse.json({ code: 0, message: 'success', data: { items } });
  }),

  // 新增業務別
  http.post('*/api/v1/departments/:id/business-types', async ({ params, request }) => {
    const body = (await request.json()) as {
      name?: string;
      description?: string;
      active?: boolean;
    };
    const deptId = params.id as string;
    const duplicate = mockBusinessTypes.some(
      (bt) => bt.departmentId === deptId && bt.name === body.name
    );
    if (duplicate) {
      return HttpResponse.json(
        { code: 20003, message: '業務別名稱在此部門已存在', data: null },
        { status: 400 }
      );
    }
    const newBt: BusinessType = {
      id: `BT${Date.now()}`,
      departmentId: deptId,
      name: body.name ?? '',
      description: body.description,
      active: body.active ?? true,
    };
    mockBusinessTypes.push(newBt);
    return HttpResponse.json({ code: 0, message: '業務別建立成功', data: newBt }, { status: 201 });
  }),

  // 更新業務別
  http.put('*/api/v1/business-types/:id', async ({ params, request }) => {
    const body = (await request.json()) as {
      name?: string;
      description?: string;
      active?: boolean;
    };
    const idx = mockBusinessTypes.findIndex((bt) => bt.id === params.id);
    if (idx === -1) {
      return HttpResponse.json(
        { code: 20004, message: '業務別不存在', data: null },
        { status: 404 }
      );
    }
    mockBusinessTypes[idx] = { ...mockBusinessTypes[idx], ...body };
    return HttpResponse.json({ code: 0, message: 'success', data: mockBusinessTypes[idx] });
  }),

  // 刪除業務別
  http.delete('*/api/v1/business-types/:id', ({ params }) => {
    const btId = params.id as string;
    if (assignedBusinessTypeIds.has(btId)) {
      return HttpResponse.json(
        { code: 20003, message: '仍有人員使用此業務別，無法刪除', data: null },
        { status: 400 }
      );
    }
    const idx = mockBusinessTypes.findIndex((bt) => bt.id === btId);
    if (idx !== -1) mockBusinessTypes.splice(idx, 1);
    return HttpResponse.json({ code: 0, message: '刪除成功', data: null });
  }),
];
