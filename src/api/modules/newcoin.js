import apiService from '../base';

// ==================== 新币列表管理 ====================

/**
 * 获取新币列表
 */
export const getNewCoinList = (params) => apiService.get('/contract/ownCoin/list', { params });

/**
 * 获取新币详情
 */
export const getNewCoinDetail = (id) => apiService.get(`/contract/ownCoin/${id}`);

/**
 * 新增新币
 */
export const saveNewCoin = (data) => apiService.post('/contract/ownCoin', data);

/**
 * 更新新币
 */
export const updateNewCoin = (data) => apiService.put('/contract/ownCoin', data);

/**
 * 删除新币
 */
export const deleteNewCoin = (id) => apiService.delete(`/contract/ownCoin/${id}`);

/**
 * 提前发布新币
 */
export const publishNewCoin = (id) => apiService.get(`/contract/ownCoin/editStatus/${id}`);

/**
 * 到期发布新币
 */
export const releaseNewCoin = (id) => apiService.get(`/contract/ownCoin/editReleaseStatus/${id}`);

/**
 * 获取币种价格
 */
export const getCoinPrice = (data) => apiService.post('/system/common/getCoinPrice', data);

// ==================== 认购记录管理 ====================

/**
 * 获取认购记录列表
 */
export const getSubscriptionList = (params) => apiService.get('/contract/ownCoin/subscribeList', { params });

/**
 * 获取认购记录详情
 */
export const getSubscriptionDetail = (id) => apiService.get(`/contract/ownCoin/subOrder/${id}`);

/**
 * 审批认购申请
 */
export const approvalSubscription = (data) => apiService.post('/contract/ownCoin/editSubscribe', data);

// ==================== 申购订单管理 ====================

/**
 * 获取申购订单列表
 */
/**
 * 获取申购订单列表
 */
export const getOwnCoinOrderList = (params) => apiService.get('/contract/ownCoinOrder/list', { params });

/**
 * 获取申购订单详情
 */
export const getOwnCoinOrderDetail = (id) => apiService.get(`/contract/ownCoinOrder/${id}`);

/**
 * 新增申购订单
 */
export const saveOwnCoinOrder = (data) => apiService.post('/contract/ownCoinOrder', data);

/**
 * 更新申购订单
 */
export const updateOwnCoinOrder = (data) => apiService.put('/contract/ownCoinOrder', data);

/**
 * 删除申购订单
 */
export const deleteOwnCoinOrder = (id) => apiService.delete(`/contract/ownCoinOrder/${id}`);

// ==================== 统计数据 ====================

/**
 * 获取认购统计数据
 */
export const getSubscriptionStatistics = (params) => apiService.get('/contract/ownCoin/statistics', { params });
