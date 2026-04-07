import apiService from '../base';

/**
 * 提现订单管理 API
 */

/**
 * 获取提现订单列表
 * @param {object} params - 查询参数
 * @returns {Promise}
 */
export const getWithdrawOrderList = (params) => apiService.get('/asset/withdraw/list', { params });

/**
 * 提现管理 - 锁定订单
 * @param {object} data - 订单数据
 * @returns {Promise}
 */
export const lockWithdrawOrder = (data) => apiService.post('/asset/withdraw/lockorder', data);

/**
 * 提现管理 - 解锁订单
 * @param {object} data - 订单数据
 * @returns {Promise}
 */
export const unlockWithdrawOrder = (data) => apiService.post('/asset/withdraw/unlockorder', data);

/**
 * 提现管理 - 锁定判断（检查是否可以审核）
 * @param {object} data - 订单数据
 * @returns {Promise}
 */
export const tryCheckWithdraw = (data) => apiService.post('/asset/withdraw/tryCheck', data);

/**
 * 提现管理 - 审核通过
 * @param {object} data - 订单数据
 * @returns {Promise}
 */
export const passWithdrawOrder = (data) => apiService.post('/asset/withdraw/passOrderNew', data);

/**
 * 提现管理 - 审核拒绝
 * @param {object} data - 订单数据
 * @returns {Promise}
 */
export const rejectWithdrawOrder = (data) => apiService.post('/asset/withdraw/rejectOrderNew', data);

/**
 * 获取总提现金额
 * @param {object} params - 查询参数
 * @returns {Promise}
 */
export const getAllWithdrawAmount = (params) => apiService.post('/asset/withdraw/getAllWithdraw', null, { params });

/**
 * 获取所有用户总提现金额
 * @param {object} params - 查询参数
 * @returns {Promise}
 */
export const getUserAllWithdrawAmount = (params) => apiService.get('/asset/appUser/allWithdraw', { params });

/**
 * 回退用户金额
 * @param {object} data - 订单数据
 * @returns {Promise}
 */
export const rollBackWithdrawOrder = (data) => apiService.post('/asset/withdraw/rollBackOrderNew', data);

/**
 * 重新发起提款
 * @param {object} data - 订单数据
 * @returns {Promise}
 */
export const retryWithdrawOrder = (data) => apiService.post('/asset/withdraw/retryOrderNew', data);

/**
 * 批量拒绝订单
 * @param {object} data - 订单数据 { ids: [] }
 * @returns {Promise}
 */
export const batchRejectWithdrawOrder = (data) => apiService.post('/asset/withdraw/rejectOrderBatch', data);

/**
 * 获取配置设置（通用配置接口）
 * @param {string} configKey - 配置键
 * @returns {Promise}
 */
export const getConfigSetting = (configKey) => apiService.get(`/system/setting/get/${configKey}`);

/**
 * 保存配置设置（通用配置接口）
 * @param {object} data - 配置数据 { configKey, configValue }
 * @returns {Promise}
 */
export const saveConfigSetting = (configKey, configValue) => {
  const data = typeof configValue === 'string' ? configValue : JSON.stringify(configValue);
  return apiService.put(`/system/setting/put/${configKey}`, data);
};
