import apiService from '../base';

/**
 * 站内信模块 API
 * 对应旧项目: /system/appMail/*
 */

// 查询1v1站内信列表
export const listMail = (params) => apiService.get('/system/appMail/list', { params });

// 新增1v1站内信
export const addMail = (data) => apiService.post('/system/appMail', data);

// 删除1v1站内信
export const delMail = (id) => apiService.delete(`/system/appMail/${id}`);
