import apiService from '../base';

// ==================== 用户资产管理 ====================

/**
 * 获取用户资产列表
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.searchParam - 搜索条件JSON字符串
 * @returns {Promise}
 */
export const getAssetList = (params) => apiService.get('/asset/appAsset/list', { params });

/**
 * 获取用户资产详情
 * @param {string|number} userId - 用户ID
 * @returns {Promise}
 */
export const getAssetDetail = (userId) => apiService.get(`/asset/appAsset/${userId}`);

/**
 * 新增用户资产
 * @param {Object} data - 资产数据
 * @returns {Promise}
 */
export const saveAsset = (data) => apiService.post('/asset/appAsset', data);

/**
 * 更新用户资产
 * @param {Object} data - 资产数据
 * @returns {Promise}
 */
export const updateAsset = (data) => apiService.put('/asset/appAsset', data);

/**
 * 删除用户资产
 * @param {string|number} userId - 用户ID
 * @returns {Promise}
 */
export const deleteAsset = (userId) => apiService.delete(`/asset/appAsset/${userId}`);

/**
 * 资产冻结/解冻
 * @param {Object} data - 操作数据
 * @param {string|number} data.userId - 用户ID
 * @param {string} data.symbol - 币种
 * @param {string} data.operation - 操作类型: freeze(冻结)/unfreeze(解冻)
 * @param {number} data.amount - 金额
 * @param {string} data.remark - 备注
 * @returns {Promise}
 */
export const freezeAsset = (data) => apiService.post('/asset/appAsset/freeze', data);

/**
 * 资产调整
 * @param {Object} data - 调整数据
 * @param {string|number} data.userId - 用户ID
 * @param {string} data.symbol - 币种
 * @param {string} data.operation - 操作类型: add(增加)/reduce(减少)
 * @param {number} data.amount - 金额
 * @param {string} data.remark - 备注
 * @returns {Promise}
 */
export const adjustAsset = (data) => apiService.post('/asset/appAsset/adjust', data);
