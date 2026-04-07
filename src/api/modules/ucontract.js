import apiService from '../base';

// ==================== U本位合约币种管理 ====================

/**
 * 获取U本位合约币种列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export const getUContractList = (params) => apiService.get('/contract/ucontract/list', { params });

/**
 * 获取U本位合约币种详情
 * @param {string|number} id - 币种ID
 * @returns {Promise}
 */
export const getUContract = (id) => apiService.get(`/contract/ucontract/${id}`);

/**
 * 新增U本位合约币种
 * @param {Object} data - 币种数据
 * @returns {Promise}
 */
export const addUContract = (data) => apiService.post('/contract/ucontract', data);

/**
 * 修改U本位合约币种
 * @param {Object} data - 币种数据
 * @returns {Promise}
 */
export const updateUContract = (data) => apiService.put('/contract/ucontract', data);

/**
 * 删除U本位合约币种
 * @param {string|number} id - 币种ID
 * @returns {Promise}
 */
export const deleteUContract = (id) => apiService.delete(`/contract/ucontract/${id}`);

// ==================== 合约订单管理 ====================

/**
 * 获取合约订单列表
 */
export const getUContractOrderList = (params) => apiService.get('/contract/contractOrder/list', { params });

/**
 * 获取合约订单详情
 */
export const getUContractOrderDetail = (params) => apiService.get(`/contract/contractOrder/${params.id}`);

/**
 * 新增合约订单
 */
export const saveUContractOrder = (data) => apiService.post('/contract/contractOrder', data);

/**
 * 更新合约订单
 */
export const updateUContractOrder = (data) => apiService.put('/contract/contractOrder', data);

/**
 * 删除合约订单
 */
export const deleteUContractOrder = (params) => apiService.delete(`/contract/contractOrder/${params.id}`);

// ==================== 合约持仓管理 ====================

/**
 * 获取合约持仓列表
 */
export const getUContractPositionList = (params) => apiService.get('/contract/contractPosition/list', { params });

/**
 * 获取合约持仓详情
 */
export const getUContractPositionDetail = (params) => apiService.get(`/contract/contractPosition/${params.id}`);

/**
 * 新增合约持仓
 */
export const saveUContractPosition = (data) => apiService.post('/contract/contractPosition', data);

/**
 * 更新合约持仓
 */
export const updateUContractPosition = (data) => apiService.put('/contract/contractPosition', data);

/**
 * 删除合约持仓
 */
export const deleteUContractPosition = (params) => apiService.delete(`/contract/contractPosition/${params.id}`);

/**
 * 平仓操作
 */
export const stopUContractPosition = (data) => apiService.post('/contract/contractPosition/stopPositon', data);

/**
 * 一键爆仓
 */
export const stopAllUContractPosition = (data) => apiService.post('/contract/contractPosition/stopAllPositon', data);

/**
 * 平仓审核通过
 */
export const passUContractPositionReview = (data) => apiService.put('/contract/contractPosition/pass', data);

/**
 * 平仓审核拒绝
 */
export const rejectUContractPositionReview = (data) => apiService.put('/contract/contractPosition/reject', data);

/**
 * 获取止盈止损列表
 */
export const getUContractProfitList = (id) => apiService.post(`/contract/contractPosition/contractLoss/${id}`);

// ==================== 合约配置管理（已废弃，请使用上面的 U本位合约币种管理 API）====================

/**
 * 获取合约配置列表（已废弃，请使用 getUContractList）
 * @deprecated 请使用 getUContractList
 */
export const getUContractConfigList = getUContractList;

/**
 * 获取合约配置详情（已废弃，请使用 getUContract）
 * @deprecated 请使用 getUContract
 */
export const getUContractConfigDetail = getUContract;

/**
 * 获取合约配置详情（别名，已废弃，请使用 getUContract）
 * @deprecated 请使用 getUContract
 */
export const getUContractDetail = getUContract;

/**
 * 新增合约配置（已废弃，请使用 addUContract）
 * @deprecated 请使用 addUContract
 */
export const saveUContractConfig = addUContract;

/**
 * 更新合约配置（已废弃，请使用 updateUContract）
 * @deprecated 请使用 updateUContract
 */
export const updateUContractConfig = updateUContract;

/**
 * 删除合约配置（已废弃，请使用 deleteUContract）
 * @deprecated 请使用 deleteUContract
 */
export const deleteUContractConfig = deleteUContract;
