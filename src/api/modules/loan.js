import apiService from '../base';

// ==================== 借贷产品管理 ====================

/**
 * 获取借贷产品列表
 */
export const getLoanProductList = (params) => apiService.get('/contract/loadProduct/list', { params });

/**
 * 获取借贷产品详情
 */
export const getLoanProductDetail = (params) => apiService.get(`/contract/loadProduct/${params.id}`);

/**
 * 新增借贷产品
 */
export const saveLoanProduct = (data) => apiService.post('/contract/loadProduct', data);

/**
 * 更新借贷产品
 */
export const updateLoanProduct = (data) => apiService.put('/contract/loadProduct', data);

/**
 * 删除借贷产品
 */
export const deleteLoanProduct = (params) => apiService.delete(`/contract/loadProduct/${params.id}`);

// ==================== 借贷订单管理 ====================

/**
 * 获取借贷订单列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export const getLoanOrderList = (params) => apiService.get('/loadOrder/orderList', { params });

/**
 * 获取借贷订单详情
 * @param {number|string} id - 订单ID
 * @returns {Promise}
 */
export const getLoanOrderDetail = (id) => apiService.get(`/loadOrder/getTLoadOrder/${id}`);

/**
 * 审核通过借贷订单
 * @param {Object} data - 订单数据
 * @param {number} data.id - 订单ID
 * @param {number} data.proId - 贷款商品ID
 * @param {number} data.userId - 用户ID
 * @param {number} data.amount - 贷款金额
 * @param {number} data.rate - 贷款利率
 * @param {number} data.interest - 利息
 * @param {number} data.disburseAmount - 审批金额
 * @param {string} data.cycleType - 周期类型
 * @returns {Promise}
 */
export const passLoanOrder = (data) => apiService.post('/loadOrder/passTLoadOrder', data);

/**
 * 审核驳回借贷订单
 * @param {Object} data - 订单数据
 * @param {number} data.id - 订单ID
 * @param {string} data.remark - 驳回备注
 * @returns {Promise}
 */
export const refuseLoanOrder = (data) => apiService.post('/loadOrder/refuseTLoadOrder', data);

/**
 * 借贷订单还款
 * @param {Object} params - 还款参数
 * @param {number} params.id - 订单ID
 * @returns {Promise}
 */
export const repayLoanOrder = (params) => apiService.post('/loadOrder/repayment/', params);
