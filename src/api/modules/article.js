import apiService from '../base';

// ==================== 文章管理 ====================

/**
 * 获取文章列表
 */
export const getArticleList = (params) => apiService.post('/pArticleInfo/getList', params);

/**
 * 新增文章
 */
export const saveArticle = (data) => apiService.post('/pArticleInfo/save', data);

/**
 * 更新文章
 */
export const updateArticle = (data) => apiService.post('/pArticleInfo/update', data);

/**
 * 删除文章
 */
export const deleteArticle = (params) => apiService.post('/pArticleInfo/delete', params);

// ==================== 文章分类 ====================

/**
 * 获取文章分类树
 */
export const getArticleClassifyTree = (params) => apiService.get('/pArticleCategory/getListTree', { params });

/**
 * 获取文章分类列表
 */
export const getArticleClassifyList = (params) => apiService.get('/pArticleCategory/getList', { params });

/**
 * 新增文章分类
 */
export const saveArticleClassify = (data) => apiService.post('/pArticleCategory/save', data);

/**
 * 更新文章分类
 */
export const updateArticleClassify = (data) => apiService.post('/pArticleCategory/update', data);

/**
 * 删除文章分类
 */
export const deleteArticleClassify = (params) => apiService.post('/pArticleCategory/delete', params);
