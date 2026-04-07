import apiService from '../base';

/**
 * 秒合约币种配置模块 API
 * 对应旧项目: /contract/secondCoinConfig/*
 */

// 查询秒合约币种配置列表
export const listConfig = (params) => apiService.get('/contract/secondCoinConfig/list', { params });

// 查询可添加币种列表
export const getCoinList = () => apiService.get('/match-engine/klineSymbol/list');

// 查询可添加币种选择列表
export const getSelectList = () => apiService.get('/match-engine/klineSymbol/selectList');

// 查询复制币种列表
export const getcopyCoinlist = () => apiService.get('/contract/secondCoinConfig/copylist');

// 查询秒合约币种配置详细
export const getConfig = (id) => apiService.get(`/contract/secondCoinConfig/${id}`);

// 新增秒合约币种配置
export const addConfig = (data) => apiService.post('/contract/secondCoinConfig', data);

// 一键新增
export const addCoin = (data) => apiService.post(`/contract/secondCoinConfig/batchSave/${data}`);

// 修改秒合约币种配置
export const updateConfig = (data) => apiService.put('/contract/secondCoinConfig', data);

// 删除秒合约币种配置
export const delConfig = (id) => apiService.delete(`/contract/secondCoinConfig/${id}`);

// 查询复制币种列表
export const getCopyList = () => apiService.post('/contract/secondCoinConfig/query/bathCopy');

// 保存复制币种
export const saveCopy = (data) => apiService.post('/contract/secondCoinConfig/bathCopyIng', data);
