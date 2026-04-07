import apiService from '../base';

/**
 * 取消跟单日志模块 API
 * 对应旧项目: /contract/cancelFollowLog/*
 */

// 查询取消订单列表
export const listCancelFollowLog = (params) => apiService.get('/contract/cancelFollowLog/list', { params });
