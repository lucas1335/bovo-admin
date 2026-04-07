import apiService from '../base';

/**
 * 岗位管理模块 API
 * 对应旧项目: /system/post/*
 */

// 查询岗位列表
export const listPost = (params) => apiService.get('/system/post/list', { params });

// 查询岗位详细
export const getPost = (postId) => apiService.get(`/system/post/${postId}`);

// 新增岗位
export const addPost = (data) => apiService.post('/system/post', data);

// 修改岗位
export const updatePost = (data) => apiService.put('/system/post', data);

// 删除岗位
export const delPost = (postId) => apiService.delete(`/system/post/${postId}`);
