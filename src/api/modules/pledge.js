import apiService from '../base';

// ==================== 抵押订单管理 ====================

/**
 * 获取抵押订单列表
 */
export const getPledgeOrderList = (params) => apiService.get('/contract/mingOrder/list', { params });

/**
 * 获取抵押订单详情
 */
export const getPledgeOrderDetail = (params) => apiService.get(`/contract/mingOrder/${params.id}`);

/**
 * 新增抵押订单
 */
export const savePledgeOrder = (data) => apiService.post('/contract/mingOrder', data);

/**
 * 更新抵押订单
 */
export const updatePledgeOrder = (data) => apiService.put('/contract/mingOrder', data);

/**
 * 删除抵押订单
 */
export const deletePledgeOrder = (params) => apiService.delete(`/contract/mingOrder/${params.id}`);

// ==================== 抵押产品管理 ====================

/**
 * 获取抵押产品列表
 */
export const getPledgeProductList = (params) => apiService.get('/contract/mingProduct/list', { params });

/**
 * 获取抵押产品详情
 */
export const getPledgeProductDetail = (params) => apiService.get(`/contract/mingProduct/${params.id}`);

/**
 * 新增抵押产品
 */
export const savePledgeProduct = (data) => apiService.post('/contract/mingProduct', data);

/**
 * 更新抵押产品
 */
export const updatePledgeProduct = (data) => apiService.put('/contract/mingProduct', data);

/**
 * 删除抵押产品
 */
export const deletePledgeProduct = (params) => apiService.delete(`/contract/mingProduct/${params.id}`);

// ==================== 抵押限购管理 ====================

/**
 * 获取限购列表
 */
export const getPledgeUserList = (params) => apiService.get('/contract/productUser/list', { params });

/**
 * 获取可限购的用户列表
 */
export const getPledgeAvailableUsers = (productId) => apiService.get(`/asset/appUser/getListByPledge?productId=${productId}`);

/**
 * 新增限购
 */
export const savePledgeUser = (data) => apiService.post('/contract/productUser', data);

/**
 * 更新限购
 */
export const updatePledgeUser = (data) => apiService.put('/contract/productUser', data);

/**
 * 删除限购
 */
export const deletePledgeUser = (params) => apiService.delete(`/contract/productUser/${params.id}`);
