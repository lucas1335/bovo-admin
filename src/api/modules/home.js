import apiService from '../base';

/**
 * 首页统计模块 API
 * 对应旧项目: /asset/system/statistics/*, /system/link/*
 */

// 获取首页统计数据
export const statisticsDataList = (params) => apiService.get('/asset/system/statistics/platform', { params });

// 获取活跃系统链接
export const getActiveSysLink = (key) => apiService.get(`/system/link/active/${key}`);
