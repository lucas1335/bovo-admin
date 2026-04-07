/**
 * 监控模块 API
 */
import apiService from '../base';

// ==================== 服务监控 ====================

/**
 * 获取服务器信息
 */
export const getServer = () => {
  return apiService.get('/monitor/server/info');
};

// ==================== 缓存监控 ====================

/**
 * 获取缓存信息
 */
export const getCache = () => {
  return apiService.get('/monitor/cache/info');
};

/**
 * 获取缓存名称列表
 */
export const listCacheName = () => {
  return apiService.post('/monitor/cache/listCacheName');
};

/**
 * 获取缓存名称列表（别名）
 */
export const getCacheNames = listCacheName;

/**
 * 获取缓存键名列表
 */
export const listCacheKey = (cacheName) => {
  return apiService.get(`/monitor/cache/listCacheKey/${cacheName}`);
};

/**
 * 获取缓存键名列表（别名）
 */
export const getCacheKeys = listCacheKey;

/**
 * 获取缓存内容
 */
export const getCacheValue = (cacheName, cacheKey) => {
  return apiService.post('/monitor/cache/getCacheValue', { cacheName, cacheKey });
};

/**
 * 清理指定名称缓存
 */
export const clearCacheName = (cacheName) => {
  return apiService.post('/monitor/cache/clearCacheName', { cacheName });
};

/**
 * 清理指定键名缓存
 */
export const clearCacheKey = (cacheKey) => {
  return apiService.post('/monitor/cache/clearCacheKey', { cacheKey });
};

/**
 * 清理全部缓存
 */
export const clearCacheAll = () => {
  return apiService.post('/monitor/cache/clearCacheAll', {});
};

// ==================== 定时任务管理 ====================

/**
 * 查询定时任务调度列表
 */
export const listJob = (params) => apiService.get('/monitor/job/list', { params });

/**
 * 查询定时任务调度列表（别名）
 */
export const getJobList = listJob;

/**
 * 查询定时任务调度详细
 */
export const getJob = (jobId) => apiService.get(`/monitor/job/${jobId}`);

/**
 * 新增定时任务调度
 */
export const addJob = (data) => apiService.post('/monitor/job', data);

/**
 * 新增定时任务调度（别名）
 */
export const saveJob = addJob;

/**
 * 修改定时任务调度
 */
export const updateJob = (data) => apiService.put('/monitor/job', data);

/**
 * 删除定时任务调度
 */
export const delJob = (jobId) => apiService.delete(`/monitor/job/${jobId}`);

/**
 * 删除定时任务调度（别名）
 */
export const deleteJob = delJob;

/**
 * 任务状态修改
 */
export const changeJobStatus = (jobId, status) => apiService.put('/monitor/job/changeStatus', { jobId, status });

/**
 * 定时任务立即执行一次
 */
export const runJob = (jobId, jobGroup) => apiService.put('/monitor/job/run', { jobId, jobGroup });

// ==================== 定时任务日志管理 ====================

/**
 * 查询调度日志列表
 */
export const listJobLog = (params) => apiService.get('/monitor/jobLog/list', { params });

/**
 * 删除调度日志
 */
export const delJobLog = (jobLogId) => apiService.delete(`/monitor/jobLog/${jobLogId}`);

/**
 * 清空调度日志
 */
export const cleanJobLog = () => apiService.delete('/monitor/jobLog/clean');

// ==================== 登录日志管理 ====================

/**
 * 查询登录日志列表
 */
export const listLogininfor = (params) => apiService.get('/monitor/logininfor/list', { params });

/**
 * 查询登录日志列表（别名）
 */
export const getLogininforList = listLogininfor;

/**
 * 删除登录日志
 */
export const delLogininfor = (infoId) => apiService.delete(`/monitor/logininfor/${infoId}`);

/**
 * 删除登录日志（别名）
 */
export const deleteLogininfor = delLogininfor;

/**
 * 解锁用户登录状态
 */
export const unlockLogininfor = (userName) => apiService.get(`/monitor/logininfor/unlock/${userName}`);

/**
 * 清空登录日志
 */
export const cleanLogininfor = () => apiService.delete('/monitor/logininfor/clean');

// ==================== 在线用户管理 ====================

/**
 * 查询在线用户列表
 */
export const listOnline = (params) => apiService.get('/monitor/online/list', { params });

/**
 * 强退用户
 */
export const forceLogout = (tokenId) => apiService.delete(`/monitor/online/${tokenId}`);

// ==================== 操作日志管理 ====================

/**
 * 查询操作日志列表
 */
export const listOperlog = (params) => apiService.get('/monitor/operlog/list', { params });

/**
 * 删除操作日志
 */
export const delOperlog = (operId) => apiService.delete(`/monitor/operlog/${operId}`);

/**
 * 清空操作日志
 */
export const cleanOperlog = () => apiService.delete('/monitor/operlog/clean');
