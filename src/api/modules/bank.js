import apiService from '../base';

// ==================== 银行卡管理 ====================

/**
 * 获取银行卡列表
 */
export const getBankCardList = (params) => apiService.get('/system/userBank/list', { params });

/**
 * 获取银行卡详情
 */
export const getBankCardDetail = (params) => apiService.get(`/system/userBank/${params.id}`);

/**
 * 新增银行卡
 */
export const saveBankCard = (data) => apiService.post('/system/userBank', data);

/**
 * 更新银行卡
 */
export const updateBankCard = (data) => apiService.post('/system/userBank', data);

/**
 * 删除银行卡
 */
export const deleteBankCard = (params) => apiService.post('/system/userBank/delete', params);
