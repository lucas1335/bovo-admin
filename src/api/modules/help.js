import apiService from '../base';

// ==================== 帮助中心管理 ====================

/**
 * 获取帮助中心列表
 * @param {object} params - 查询参数
 * @returns {Promise}
 */
export const getHelpCenterList = (params) => apiService.get('/system/helpCenter/list', { params });

/**
 * 获取帮助中心详情
 * @param {string|number} id - 帮助中心ID
 * @returns {Promise}
 */
export const getHelpCenterDetail = (id) => apiService.get(`/system/helpCenter/${id}`);

/**
 * 新增帮助中心
 * @param {object} data - 帮助中心数据
 * @returns {Promise}
 */
export const saveHelpCenter = (data) => apiService.post('/system/helpCenter', data);

/**
 * 更新帮助中心
 * @param {object} data - 帮助中心数据
 * @returns {Promise}
 */
export const updateHelpCenter = (data) => apiService.put('/system/helpCenter', data);

/**
 * 删除帮助中心
 * @param {string|number} id - 帮助中心ID
 * @returns {Promise}
 */
export const deleteHelpCenter = (id) => apiService.delete(`/system/helpCenter/${id}`);

// ==================== 帮助中心内容管理 ====================

/**
 * 获取帮助中心内容列表
 * @param {object} params - 查询参数
 * @returns {Promise}
 */
export const getHelpCenterInfoList = (params) => apiService.get('/system/helpCenterInfo/list', { params });

/**
 * 获取帮助中心内容详情
 * @param {string|number} id - 内容ID
 * @returns {Promise}
 */
export const getHelpCenterInfoDetail = (id) => apiService.get(`/system/helpCenterInfo/${id}`);

/**
 * 新增帮助中心内容
 * @param {object} data - 内容数据
 * @returns {Promise}
 */
export const saveHelpCenterInfo = (data) => apiService.post('/system/helpCenterInfo', data);

/**
 * 更新帮助中心内容
 * @param {object} data - 内容数据
 * @returns {Promise}
 */
export const updateHelpCenterInfo = (data) => apiService.put('/system/helpCenterInfo', data);

/**
 * 删除帮助中心内容
 * @param {string|number} id - 内容ID
 * @returns {Promise}
 */
export const deleteHelpCenterInfo = (id) => apiService.delete(`/system/helpCenterInfo/${id}`);

// ==================== App下载链接管理 ====================

/**
 * 获取App下载链接列表
 * @param {object} params - 查询参数
 * @returns {Promise}
 */
export const getAppLinkList = (params) => apiService.get('/system/applink/list', { params });

/**
 * 获取App下载链接详情
 * @param {string|number} id - 链接ID
 * @returns {Promise}
 */
export const getAppLinkDetail = (id) => apiService.get(`/system/applink/${id}`);

/**
 * 新增App下载链接
 * @param {object} data - 链接数据
 * @returns {Promise}
 */
export const saveAppLink = (data) => apiService.post('/system/applink', data);

/**
 * 更新App下载链接
 * @param {object} data - 链接数据
 * @returns {Promise}
 */
export const updateAppLink = (data) => apiService.put('/system/applink', data);

/**
 * 删除App下载链接
 * @param {string|number} id - 链接ID
 * @returns {Promise}
 */
export const deleteAppLink = (id) => apiService.delete(`/system/applink/${id}`);
