import apiService from '../base';

/**
 * 认证管理模块 API
 * 对应旧项目: /asset/appUserDetail/*
 */

// 查询用户详细信息列表
export const listDetail = (params) => apiService.get('/asset/appUserDetail/list', { params });

// 查询用户详细信息详细
export const getDetail = (id) => apiService.get(`/asset/appUserDetail/${id}`);

// 新增用户详细信息
export const addDetail = (data) => apiService.post('/asset/appUserDetail', data);

// 修改用户详细信息
export const updateDetail = (data) => apiService.put('/asset/appUserDetail', data);

// 删除用户详细信息
export const delDetail = (id) => apiService.delete(`/asset/appUserDetail/${id}`);

// 实名认证审核通过
export const review = (data) => apiService.post('/asset/appUser/realName', data);

// 实名认证驳回
export const rejectRealName = (data) => apiService.post('/asset/appUser/rejectRealName', data);

// ==================== 旧接口名（兼容性）====================

/**
 * 获取认证申请列表（旧接口名）
 */
export const getKycCertificationList = (params) => apiService.get('/asset/appUserDetail/list', { params });

/**
 * 获取认证详情（旧接口名）
 */
export const getKycCertificationDetail = (params) => apiService.get('/asset/appUserDetail', { params });

/**
 * 审核通过（旧接口名）
 */
export const approveCertification = (data) => apiService.post('/asset/appUser/realName', data);

/**
 * 拒绝认证（旧接口名）
 */
export const rejectCertification = (data) => apiService.post('/asset/appUser/rejectRealName', data);

/**
 * 驳回已通过的认证（旧接口名）
 */
export const revokeCertification = (data) => apiService.post('/asset/appUser/rejectRealName', data);
