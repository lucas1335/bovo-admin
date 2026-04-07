import apiService from '../base';

/**
 * OTC业务管理模块 API
 * 对应旧项目: /system/otc/*
 */

// 查询OTC商户列表
export const getOtcBusinessList = (params) => apiService.get('/system/otc/list', { params });

// 查询OTC商户详细
export const getOtcBusinessDetail = (id) => apiService.get(`/system/otc/${id}`);

// 新增OTC商户
export const addOtcBusiness = (data) => apiService.post('/system/otc', data);

// 修改OTC商户
export const updateOtcBusiness = (data) => apiService.put('/system/otc', data);

// 删除OTC商户
export const deleteOtcBusiness = (id) => apiService.delete(`/system/otc/${id}`);

// 发布OTC商户
export const releaseOtcBusiness = (id) => apiService.post(`/system/otc/publish/${id}`);
