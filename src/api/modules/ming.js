import apiService from '../base';

/**
 * 明产品管理模块 API
 * 对应旧项目: /contract/mingProduct/*
 */

// 查询mingProduct列表
export const listMing = (params) => apiService.get('/contract/mingProduct/list', { params });

// 查询mingProduct详细
export const getMing = (id) => apiService.get(`/contract/mingProduct/${id}`);

// 新增mingProduct
export const addMing = (data) => apiService.post('/contract/mingProduct', data);

// 修改mingProduct
export const updateMing = (data) => apiService.put('/contract/mingProduct', data);

// 删除mingProduct
export const delMing = (id) => apiService.delete(`/contract/mingProduct/${id}`);

// 限购列表查询
export const pledgeList = (params) => apiService.get('/contract/productUser/list', { params });

// 查询所有用户列表
export const listUserAll = (id) => apiService.get(`/asset/appUser/getListByPledge?productId=${id}`);

// 添加限购
export const addPledge = (data) => apiService.post('/contract/productUser', data);

// 修改限购
export const updatePledge = (data) => apiService.put('/contract/productUser', data);

// 删除限购
export const delPledge = (id) => apiService.delete(`/contract/productUser/${id}`);
