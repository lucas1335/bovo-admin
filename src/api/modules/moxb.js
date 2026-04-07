import apiService from '../base';

// ==================== 会员管理 ====================

/**
 * 获取会员列表
 */
export const getCMemberList = (params) => apiService.get('/cMemberInfo/getList', { params });

/**
 * 新增会员
 */
export const saveCMember = (data) => apiService.post('/cMemberInfo/save', data);

/**
 * 更新会员
 */
export const updateCMember = (data) => apiService.post('/cMemberInfo/update', data);

/**
 * 删除会员
 */
export const deleteCMember = (params) => apiService.post('/cMemberInfo/delete', params);

// ==================== 企业认证管理 ====================

/**
 * 获取企业认证列表
 */
export const getKCompanyAuthList = (params) => apiService.get('/kCompanyAuth/getList', { params });

/**
 * 新增企业认证
 */
export const saveKCompanyAuth = (data) => apiService.post('/kCompanyAuth/save', data);

/**
 * 更新企业认证
 */
export const updateKCompanyAuth = (data) => apiService.post('/kCompanyAuth/update', data);

/**
 * 删除企业认证
 */
export const deleteKCompanyAuth = (params) => apiService.post('/kCompanyAuth/delete', params);

// ==================== 发布信息审核 ====================

/**
 * 获取发布信息列表
 */
export const getKPublishInfoList = (params) => apiService.get('/kPublishInfo/getList', { params });

/**
 * 新增发布信息
 */
export const saveKPublishInfo = (data) => apiService.post('/kPublishInfo/save', data);

/**
 * 更新发布信息
 */
export const updateKPublishInfo = (data) => apiService.post('/kPublishInfo/update', data);

/**
 * 删除发布信息
 */
export const deleteKPublishInfo = (params) => apiService.post('/kPublishInfo/delete', params);

// ==================== 仓源信息管理 ====================

/**
 * 获取仓源列表
 */
export const getKPublishWarehouseList = (params) => apiService.get('/kPublishWarehouse/getList', { params });

/**
 * 新增仓源
 */
export const saveKPublishWarehouse = (data) => apiService.post('/kPublishWarehouse/save', data);

/**
 * 更新仓源
 */
export const updateKPublishWarehouse = (data) => apiService.post('/kPublishWarehouse/update', data);

/**
 * 删除仓源
 */
export const deleteKPublishWarehouse = (params) => apiService.post('/kPublishWarehouse/delete', params);

// ==================== 运力信息管理 ====================

/**
 * 获取运力列表
 */
export const getKPublishTransportList = (params) => apiService.get('/kPublishTransport/getList', { params });

/**
 * 新增运力
 */
export const saveKPublishTransport = (data) => apiService.post('/kPublishTransport/save', data);

/**
 * 更新运力
 */
export const updateKPublishTransport = (data) => apiService.post('/kPublishTransport/update', data);

/**
 * 删除运力
 */
export const deleteKPublishTransport = (params) => apiService.post('/kPublishTransport/delete', params);

// ==================== 货源运输需求管理 ====================

/**
 * 获取货源运输需求列表
 */
export const getKPublishGoodsTransportList = (params) => apiService.get('/kPublishGoodsTransport/getList', { params });

/**
 * 新增货源运输需求
 */
export const saveKPublishGoodsTransport = (data) => apiService.post('/kPublishGoodsTransport/save', data);

/**
 * 更新货源运输需求
 */
export const updateKPublishGoodsTransport = (data) => apiService.post('/kPublishGoodsTransport/update', data);

/**
 * 删除货源运输需求
 */
export const deleteKPublishGoodsTransport = (params) => apiService.post('/kPublishGoodsTransport/delete', params);

// ==================== 货源储藏需求管理 ====================

/**
 * 获取货源储藏需求列表
 */
export const getKPublishGoodsStorageList = (params) => apiService.get('/kPublishGoodsStorage/getList', { params });

/**
 * 新增货源储藏需求
 */
export const saveKPublishGoodsStorage = (data) => apiService.post('/kPublishGoodsStorage/save', data);

/**
 * 更新货源储藏需求
 */
export const updateKPublishGoodsStorage = (data) => apiService.post('/kPublishGoodsStorage/update', data);

/**
 * 删除货源储藏需求
 */
export const deleteKPublishGoodsStorage = (params) => apiService.post('/kPublishGoodsStorage/delete', params);

// ==================== 企业信息管理 ====================

/**
 * 获取企业信息列表
 */
export const getKCompanyInfoList = (params) => apiService.get('/kCompanyInfo/getList', { params });

/**
 * 新增企业信息
 */
export const saveKCompanyInfo = (data) => apiService.post('/kCompanyInfo/save', data);

/**
 * 更新企业信息
 */
export const updateKCompanyInfo = (data) => apiService.post('/kCompanyInfo/update', data);

/**
 * 删除企业信息
 */
export const deleteKCompanyInfo = (params) => apiService.post('/kCompanyInfo/delete', params);
