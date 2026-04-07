import apiService from '../base';

/**
 * 部门管理模块 API
 * 对应旧项目: /system/dept/*
 */

// 查询部门列表
export const listDept = (params) => apiService.get('/system/dept/list', { params });

// 查询部门列表（排除节点）
export const listDeptExcludeChild = (deptId) => apiService.get('/system/dept/list/exclude/' + deptId);

// 查询部门详细
export const getDept = (deptId) => apiService.get(`/system/dept/${deptId}`);

// 新增部门
export const addDept = (data) => apiService.post('/system/dept', data);

// 修改部门
export const updateDept = (data) => apiService.put('/system/dept', data);

// 删除部门
export const delDept = (deptId) => apiService.delete(`/system/dept/${deptId}`);
