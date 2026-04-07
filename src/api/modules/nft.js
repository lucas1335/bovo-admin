import apiService from '../base';

// ==================== NFT合集管理 ====================

/**
 * 获取NFT合集列表
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.searchParam - 搜索条件JSON字符串
 * @returns {Promise}
 */
export const getNftSeriesList = (params) => apiService.get('/contract/nftSeries/getList', { params });

/**
 * 获取NFT合集详情
 * @param {string|number} id - 合集ID
 * @returns {Promise}
 */
export const getNftSeriesDetail = (id) => apiService.get(`/contract/nftSeries/${id}`);

/**
 * 新增NFT合集
 * @param {Object} data - 合集数据
 * @returns {Promise}
 */
export const saveNftSeries = (data) => apiService.post('/contract/nftSeries/save', data);

/**
 * 更新NFT合集
 * @param {Object} data - 合集数据
 * @returns {Promise}
 */
export const updateNftSeries = (data) => apiService.post('/contract/nftSeries/update', data);

/**
 * 删除NFT合集
 * @param {string|number} id - 合集ID
 * @returns {Promise}
 */
export const deleteNftSeries = (id) => apiService.post('/contract/nftSeries/delete', { id });

// ==================== NFT藏品管理 ====================

/**
 * 获取NFT藏品列表
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.searchParam - 搜索条件JSON字符串
 * @returns {Promise}
 */
export const getNftProductList = (params) => apiService.get('/contract/nftProduct/getList', { params });

/**
 * 获取NFT藏品详情
 * @param {string|number} id - 藏品ID
 * @returns {Promise}
 */
export const getNftProductDetail = (id) => apiService.get(`/contract/nftProduct/${id}`);

/**
 * 新增NFT藏品
 * @param {Object} data - 藏品数据
 * @returns {Promise}
 */
export const saveNftProduct = (data) => apiService.post('/contract/nftProduct/save', data);

/**
 * 更新NFT藏品
 * @param {Object} data - 藏品数据
 * @returns {Promise}
 */
export const updateNftProduct = (data) => apiService.post('/contract/nftProduct/update', data);

/**
 * 删除NFT藏品
 * @param {string|number} id - 藏品ID
 * @returns {Promise}
 */
export const deleteNftProduct = (id) => apiService.post('/contract/nftProduct/delete', { id });

/**
 * 获取NFT合集列表（用于下拉选择）
 * @returns {Promise}
 */
export const getNftSeriesOptions = () => apiService.get('/contract/nftProduct/getSeriesList');

/**
 * NFT藏品上架/下架
 * @param {Object} data - 操作数据
 * @param {string|number} data.id - 藏品ID
 * @param {number} data.status - 状态: 1-未上架, 2-已上架
 * @returns {Promise}
 */
export const updateNftProductStatus = (data) => apiService.post('/contract/nftProduct/updateStatus', data);

// ==================== NFT订单管理 ====================

/**
 * 获取NFT订单列表
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.searchParam - 搜索条件JSON字符串
 * @returns {Promise}
 */
export const getNftOrderList = (params) => apiService.get('/contract/nftOrder/getList', { params });

/**
 * 获取NFT订单详情
 * @param {string|number} id - 订单ID
 * @returns {Promise}
 */
export const getNftOrderDetail = (id) => apiService.get(`/contract/nftOrder/${id}`);

/**
 * 新增NFT订单
 * @param {Object} data - 订单数据
 * @returns {Promise}
 */
export const saveNftOrder = (data) => apiService.post('/contract/nftOrder/save', data);

/**
 * 更新NFT订单
 * @param {Object} data - 订单数据
 * @returns {Promise}
 */
export const updateNftOrder = (data) => apiService.post('/contract/nftOrder/update', data);

/**
 * 删除NFT订单
 * @param {string|number} id - 订单ID
 * @returns {Promise}
 */
export const deleteNftOrder = (id) => apiService.post('/contract/nftOrder/delete', { id });
