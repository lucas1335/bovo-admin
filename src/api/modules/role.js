import apiService from '../base';

/**
 * 角色管理模块 API
 * 对应旧项目: /system/role/*
 */

// 查询角色列表
export const listRole = (params) => apiService.get('/system/role/list', { params });

// 查询角色详细
export const getRole = (roleId) => apiService.get(`/system/role/${roleId}`);

// 新增角色
export const addRole = (data) => apiService.post('/system/role', data);

// 修改角色
export const updateRole = (data) => apiService.put('/system/role', data);

// 角色数据权限
export const dataScope = (data) => apiService.put('/system/role/dataScope', data);

// 角色状态修改
export const changeRoleStatus = (roleId, status) => apiService.put('/system/role/changeStatus', { roleId, status });

// 删除角色
export const delRole = (roleId) => apiService.delete(`/system/role/${roleId}`);

// 查询角色已授权用户列表
export const allocatedUserList = (params) => apiService.get('/system/role/authUser/allocatedList', { params });

// 查询角色未授权用户列表
export const unallocatedUserList = (params) => apiService.get('/system/role/authUser/unallocatedList', { params });

// 取消用户授权角色
export const authUserCancel = (data) => apiService.put('/system/role/authUser/cancel', data);

// 批量取消用户授权角色
export const authUserCancelAll = (data) => apiService.put('/system/role/authUser/cancelAll', null, { params: data });

// 授权用户选择
export const authUserSelectAll = (data) => apiService.put('/system/role/authUser/selectAll', null, { params: data });

// 根据角色ID查询部门树结构
export const deptTreeSelect = (roleId) => apiService.get(`/system/role/deptTree/${roleId}`);
