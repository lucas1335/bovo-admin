import apiService from '../base';

/**
 * 菜单管理模块 API
 * 对应旧项目: /system/menu/*
 */

// 查询菜单列表
export const listMenu = (params) => apiService.get('/system/menu/list', { params });

// 查询菜单详细
export const getMenu = (menuId) => apiService.get(`/system/menu/${menuId}`);

// 查询菜单下拉树结构
export const treeselect = () => apiService.get('/system/menu/treeselect');

// 根据角色ID查询菜单下拉树结构
export const roleMenuTreeselect = (roleId) => apiService.get(`/system/menu/roleMenuTreeselect/${roleId}`);

// 新增菜单
export const addMenu = (data) => apiService.post('/system/menu', data);

// 修改菜单
export const updateMenu = (data) => apiService.put('/system/menu', data);

// 删除菜单
export const delMenu = (menuId) => apiService.delete(`/system/menu/${menuId}`);

// 别名导出，兼容旧代码
export const saveSysMenu = addMenu;
export const updateSysMenu = updateMenu;
export const deleteSysMenu = delMenu;
