import apiService from '../base';

/**
 * 通知公告模块 API
 * 对应旧项目: /system/tNotice/*
 */

// 查询通知公告列表
export const listNotice = (params) => apiService.get('/system/tNotice/list', { params });

// 查询标签列表
export const getTabList = (params) => apiService.get('/system/tNotice/noticeTypeList', { params });

// 查询通知公告详细
export const getNotice = (noticeId) => apiService.get(`/system/tNotice/${noticeId}`);

// 新增通知公告
export const addNotice = (data) => apiService.post('/system/tNotice', data);

// 修改通知公告
export const updateNotice = (data) => apiService.put('/system/tNotice', data);

// 删除通知公告
export const delNotice = (noticeId) => apiService.delete(`/system/tNotice/${noticeId}`);
