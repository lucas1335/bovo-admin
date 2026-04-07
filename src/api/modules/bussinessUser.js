import apiService from '../base';

/**
 * 玩家管理模块 API
 * 对应旧项目: /asset/appUser/*
 */

// 查询玩家用户列表
export const listUser = (params) => apiService.get('/asset/appUser/list', { params });

// 查询所有玩家用户列表
export const listUserAll = (params) => apiService.get('/asset/appUser/listAll', { params });

// 查询玩家用户详细
export const getUser = (userId) => apiService.get(`/asset/appUser/${userId}`);

// 新增玩家用户
export const addUser = (data) => apiService.post('/asset/appUser', data);

// 修改玩家用户
export const updateUser = (data) => apiService.put('/asset/appUser', data);

// 删除玩家用户
export const delUser = (userId) => apiService.delete(`/asset/appUser/${userId}`);

// 加入黑名单
export const setUserBlack = (data) => apiService.put('/asset/appUser/updateBlackStatus', data);

// 人工下分
export const subAmount = (data) => apiService.post('/asset/appUser/subAmount', data);

// 赠送彩金
export const sendBous = (data) => apiService.post('/asset/appUser/sendBous', data);

// 包赢包输
export const changeWin = (data) => apiService.post('/asset/appUser/buff', data);

// 重置登录密码
export const resetLoginPwd = (data) => apiService.post('/asset/appUser/updateLoginPwd', data);

// 重置资金密码
export const resetTransPwd = (data) => apiService.post('/asset/appUser/updateTransPwd', data);

// 修改返佣比例
export const changeCommissionRate = (data) => apiService.post('/asset/agentNetwork/changeCommissionRate', data);

// 保存或更新用户邀请等级数据
export const saveOrUpdateUserInvitTestData = (data) => apiService.post('/asset/userInvitTestData/saveOrUpdate', data);

// 获取用户邀请等级数据详情
export const getUserInvitTestDataDetail = (userId) => apiService.get(`/asset/userInvitTestData/detail/${userId}`);
