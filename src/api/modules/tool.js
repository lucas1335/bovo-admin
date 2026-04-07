/**
 * 工具模块 API
 */
import { baseApi } from '../base';

const BASE_URL = '/tool/gen';

/**
 * 代码生成 - 查询表列表
 */
export const listTable = (params) => {
  return baseApi.getList(BASE_URL + '/list', params);
};

/**
 * 代码生成 - 预览代码
 */
export const previewTable = (tableId) => {
  return baseApi.getDetail(BASE_URL, tableId);
};

/**
 * 代码生成 - 删除表
 */
export const delTable = (tableIds) => {
  return baseApi.batchDelete(BASE_URL, tableIds);
};

/**
 * 代码生成 - 生成代码
 */
export const genCode = (tableName) => {
  return baseApi.create(BASE_URL + '/genCode', { tableName });
};

/**
 * 代码生成 - 同步数据库
 */
export const synchDb = (tableName) => {
  return baseApi.create(BASE_URL + '/synchDb', { tableName });
};

/**
 * 代码生成 - 批量生成代码下载
 */
export const batchGenCode = (tables) => {
  return `${BASE_URL}/batchGenCode?tables=${tables}`;
};
