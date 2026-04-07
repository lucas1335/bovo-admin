import apiService from '../base';

/**
 * 查询币种管理列表
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.symbol - 币种
 * @param {number} params.commissionMin - 最小手续费
 * @param {number} params.commissionMax - 最大手续费
 * @returns {Promise}
 */
export const getSymbolManageList = (params) =>
  apiService.get('/match-engine/symbolManage/list', { params });

/**
 * 查询可添加币种列表
 * @returns {Promise}
 */
export const getCoinList = () =>
  apiService.get('/match-engine/klineSymbol/list');

/**
 * 一键新增币种
 * @param {Object} params - 参数
 * @param {string} params.symbols - 币种列表，逗号分隔
 * @returns {Promise}
 */
export const batchAddCoin = (params) =>
  apiService.post('/match-engine/symbolManage/addBatch/', null, { params });

/**
 * 查询币种管理详情
 * @param {string|number} id - 币种管理ID
 * @returns {Promise}
 */
export const getSymbolManageDetail = (id) =>
  apiService.get(`/match-engine/symbolManage/${id}`);

/**
 * 新增币种管理
 * @param {Object} data - 币种管理数据
 * @param {string} data.symbol - 币种
 * @param {string} data.market - 市场
 * @param {number} data.minChargeNum - 最小兑换数量
 * @param {number} data.maxChargeNum - 最大兑换数量
 * @param {number} data.commission - 手续费
 * @param {number} data.sort - 排序
 * @param {number} data.enable - 状态 (1:启用, 2:禁用)
 * @param {string} data.remark - 备注
 * @returns {Promise}
 */
export const addSymbolManage = (data) =>
  apiService.post('/match-engine/symbolManage', data);

/**
 * 修改币种管理
 * @param {Object} data - 币种管理数据（包含id）
 * @returns {Promise}
 */
export const updateSymbolManage = (data) =>
  apiService.put('/match-engine/symbolManage', data);

/**
 * 删除币种管理
 * @param {string|number} id - 币种管理ID
 * @returns {Promise}
 */
export const deleteSymbolManage = (id) =>
  apiService.delete(`/match-engine/symbolManage/${id}`);

/**
 * 查询币种兑换记录
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export const getSwapRecordList = (params) =>
  apiService.get('/match-engine/symbolManage/list', { params });
