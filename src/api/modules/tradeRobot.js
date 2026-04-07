import apiService from '../base';

/**
 * 获取控线币种列表
 * @returns {Promise}
 */
export const getSymbolList = () =>
  apiService.post('/match-engine/bot/kline/symbolList');

/**
 * 保存控线数据
 * @param {Object} data - 控线数据
 * @returns {Promise}
 */
export const saveTradeRobot = (data) =>
  apiService.post('/match-engine/bot/kline', data);

/**
 * 获取历史控线数据列表
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.symbol - 交易对
 * @param {number} params.granularity - 控制粒度
 * @returns {Promise}
 */
export const getTradeRobotList = (params) =>
  apiService.get('/match-engine/bot/kline/list', { params });

/**
 * 获取历史控线详情
 * @param {string|number} id - 控线ID
 * @returns {Promise}
 */
export const getTradeRobotDetail = (id) =>
  apiService.get(`/match-engine/bot/kline/${id}`);

/**
 * 删除历史控线详情
 * @param {string|number} id - 控线ID
 * @returns {Promise}
 */
export const deleteTradeRobot = (id) =>
  apiService.delete(`/match-engine/bot/kline/${id}`);

/**
 * 更新历史控线详情
 * @param {Object} data - 控线数据
 * @returns {Promise}
 */
export const updateTradeRobot = (data) =>
  apiService.put('/match-engine/bot/kline', data);
