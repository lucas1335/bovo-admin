# API 接口规范

## API 架构

本项目使用统一的 API 管理方案，基于 axios 封装。

### 目录结构

```
src/api/
├── base.js              # axios 实例和基础 CRUD
├── index.js             # API 统一导出
└── modules/             # API 模块
    ├── auth.js          # 认证相关
    ├── system.js        # 系统管理
    ├── article.js       # 文章管理
    └── portal.js        # 门户内容
```

## axios 配置

### 基础配置

```javascript
// src/api/base.js
const apiService = axios.create({
  baseURL: '/api',           // API 基础路径
  timeout: 100000,           // 请求超时时间
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### 请求拦截器

自动添加 Token 和处理数据格式：

```javascript
apiService.interceptors.request.use(
  (config) => {
    // 添加 Token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `${token}`;
    }

    // 处理 form-data 格式
    if (config.useFormData && config.method === 'post' && config.data) {
      const formData = new URLSearchParams();
      Object.keys(config.data).forEach(key => {
        const value = config.data[key];
        if (value !== null && value !== undefined) {
          if (Array.isArray(value) || typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value);
          }
        }
      });
      config.data = formData;
      config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    return config;
  }
);
```

### 响应拦截器

统一处理响应和错误：

```javascript
apiService.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res.code === 0 || res.code === 200) {
      return res;
    } else {
      message.error(res.msg || '服务器内部错误');
      return Promise.reject(res);
    }
  },
  (error) => {
    const { response } = error;

    if (response) {
      switch (response.status) {
        case 400:
          message.error('请求参数错误');
          break;
        case 401:
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          message.error('登录已过期，请重新登录');
          window.location.href = '/login';
          break;
        case 403:
          message.error('权限不足');
          break;
        case 404:
          message.error('接口不存在：' + response.config?.url);
          break;
        case 500:
          message.error('服务器内部错误');
          break;
        default:
          message.error(`请求失败: ${response.statusText}`);
          break;
      }
    } else {
      message.error('网络连接异常，请检查网络');
    }

    return Promise.reject(error);
  }
);
```

## API 定义规范

### 模块化组织

按业务模块组织 API：

```javascript
// src/api/modules/system.js
import apiService from '../base';

// ==================== 用户管理 ====================

/**
 * 获取用户列表
 */
export const getSysUserList = (params) => apiService.get('/sysUsers/getList', { params });

/**
 * 获取用户详情
 */
export const getSysUserDetail = (params) => apiService.get('/sysUsers/getUserInfoById', { params });

/**
 * 新增用户
 */
export const saveSysUser = (data) => apiService.post('/sysUsers/save', data);

/**
 * 更新用户
 */
export const updateSysUser = (data) => apiService.post('/sysUsers/update', data);

/**
 * 删除用户
 */
export const deleteSysUser = (params) => apiService.post('/sysUsers/delete', params);
```

### 命名规范

#### 函数命名
- **获取列表**：`get + 模块名 + List`
  - 示例：`getSysUserList`
- **获取详情**：`get + 模块名 + Detail`
  - 示例：`getSysUserDetail`
- **新增**：`save + 模块名` 或 `add + 模块名`
  - 示例：`saveSysUser`
- **更新**：`update + 模块名`
  - 示例：`updateSysUser`
- **删除**：`delete + 模块名`
  - 示例：`deleteSysUser`

#### URL 路径
- **获取列表**：`/模块/getList`
- **获取详情**：`/模块/getDetail` 或 `/模块/getInfoById`
- **新增**：`/模块/save`
- **更新**：`/模块/update`
- **删除**：`/模块/delete`

## 请求方式

### GET 请求

```javascript
// 方式 1：查询参数
export const getSysUserList = (params) => apiService.get('/sysUsers/getList', { params });

// 使用
const response = await getSysUserList({ pageNum: 1, pageSize: 10 });
```

### POST 请求

```javascript
// 方式 1：JSON 格式（默认）
export const saveSysUser = (data) => apiService.post('/sysUsers/save', data);

// 方式 2：form-data 格式
export const saveSysUser = (data) => apiService.post('/sysUsers/save', data, { useFormData: true });

// 使用
const response = await saveSysUser({
  username: 'admin',
  realname: '管理员'
});
```

### PUT 请求

```javascript
export const updateSysUser = (id, data) => apiService.put(`/sysUsers/${id}`, data);
```

### DELETE 请求

```javascript
export const deleteSysUser = (id) => apiService.delete(`/sysUsers/${id}`);
```

## 响应数据格式

### 标准响应格式

```javascript
{
  "code": 0,              // 状态码：0 或 200 表示成功
  "msg": "成功",          // 消息
  "data": {               // 数据
    "records": [],        // 列表数据
    "total": 100,         // 总数
    "pageNum": 1,         // 当前页
    "pageSize": 10        // 每页数量
  }
}
```

### 列表数据格式

```javascript
{
  "code": 0,
  "msg": "成功",
  "data": {
    "records": [          // 或使用 list、content
      { "id": 1, "name": "项目1" },
      { "id": 2, "name": "项目2" }
    ],
    "total": 100
  }
}
```

### 详情数据格式

```javascript
{
  "code": 0,
  "msg": "成功",
  "data": {
    "id": 1,
    "username": "admin",
    "realname": "管理员"
  }
}
```

## 请求参数规范

### 列表查询参数

```javascript
{
  "pageNum": 1,                    // 当前页码
  "pageSize": 10,                  // 每页数量
  "searchParam": JSON.stringify({  // 搜索条件
    "SEARCH_LIKE_username": "admin",
    "SEARCH_EQ_state": "0"
  }),
  "username": true,                // 排序（字段名: 排序方向）
  "createTime": false              // true: 升序, false: 降序
}
```

### 搜索参数命名规范

- `SEARCH_LIKE_字段名` - 模糊查询
- `SEARCH_EQ_字段名` - 精确查询
- `SEARCH_GTE_字段名` - 大于等于
- `SEARCH_LTE_字段名` - 小于等于
- `SEARCH_GT_字段名` - 大于
- `SEARCH_LT_字段名` - 小于

示例：
```javascript
const searchParam = {
  "SEARCH_LIKE_username": "admin",    // 用户名模糊查询
  "SEARCH_EQ_state": "0",              // 状态精确查询
  "SEARCH_GTE_createTime": "2024-01-01", // 创建时间大于等于
  "SEARCH_LTE_createTime": "2024-12-31", // 创建时间小于等于
};
```

### 新增/更新参数

```javascript
{
  "id": 1,              // 更新时需要传入 id
  "username": "admin",
  "realname": "管理员",
  "state": 0
}
```

### 删除参数

```javascript
// 单个删除
{
  "id": 1
}

// 批量删除
{
  "ids": [1, 2, 3]
}
```

## 统一 CRUD 封装

### 基础 CRUD API

```javascript
// src/api/base.js
export const baseApi = {
  /**
   * 获取列表数据
   */
  getList: (url, params = {}) => {
    return apiService.post(url, params);
  },

  /**
   * 获取详情
   */
  getDetail: (url, id) => {
    return apiService.get(`${url}/${id}`);
  },

  /**
   * 新增数据
   */
  create: (url, data = {}) => {
    return apiService.post(url, data);
  },

  /**
   * 更新数据
   */
  update: (url, id, data = {}) => {
    return apiService.put(`${url}/${id}`, data);
  },

  /**
   * 删除数据
   */
  delete: (url, id) => {
    return apiService.delete(`${url}/${id}`);
  },

  /**
   * 批量删除
   */
  batchDelete: (url, ids = []) => {
    return apiService.post(url, { ids });
  },
};
```

## 使用示例

### 导入 API

```javascript
// 方式 1：按需导入（推荐）
import { getSysUserList, saveSysUser } from '@api';

// 方式 2：导入整个模块
import * as SystemApi from '@api/modules/system';
```

### 在组件中使用

```javascript
import { message } from 'antd';
import { getSysUserList, saveSysUser, updateSysUser, deleteSysUser } from '@api';

const UserPage = () => {
  // 获取列表
  const fetchUsers = async () => {
    try {
      const response = await getSysUserList({
        pageNum: 1,
        pageSize: 10,
        searchParam: JSON.stringify({
          SEARCH_LIKE_username: 'admin'
        })
      });

      if (response.code === 0 || response.code === 200) {
        const list = response.data?.records || response.data?.list || response.data || [];
        console.log('用户列表:', list);
      }
    } catch (error) {
      message.error('获取用户列表失败');
    }
  };

  // 新增用户
  const handleAdd = async (values) => {
    try {
      const response = await saveSysUser(values);
      if (response.code === 0 || response.code === 200) {
        message.success('新增成功');
      } else {
        message.error(response.msg || '新增失败');
      }
    } catch (error) {
      message.error('新增失败');
    }
  };

  // 更新用户
  const handleUpdate = async (values) => {
    try {
      const response = await updateSysUser(values);
      if (response.code === 0 || response.code === 200) {
        message.success('更新成功');
      }
    } catch (error) {
      message.error('更新失败');
    }
  };

  // 删除用户
  const handleDelete = async (id) => {
    try {
      const response = await deleteSysUser({ id });
      if (response.code === 0 || response.code === 200) {
        message.success('删除成功');
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  return <div>{/* 页面内容 */}</div>;
};
```

## API 模块划分

### 认证模块 (auth.js)

```javascript
/**
 * 用户登录
 */
export const login = (data) => apiService.post('/login', data);

/**
 * 获取验证码
 */
export const getCaptcha = () => apiService.get('/captcha');

/**
 * 用户登出
 */
export const logout = () => apiService.post('/logout');
```

### 系统管理模块 (system.js)

```javascript
// 用户管理
export const getSysUserList = (params) => apiService.get('/sysUsers/getList', { params });
export const saveSysUser = (data) => apiService.post('/sysUsers/save', data);
export const updateSysUser = (data) => apiService.post('/sysUsers/update', data);
export const deleteSysUser = (params) => apiService.post('/sysUsers/delete', params);

// 角色管理
export const getSysRoleList = (params) => apiService.get('/sysRoles/getList', { params });
export const saveSysRole = (data) => apiService.post('/sysRoles/save', data);
export const updateSysRole = (data) => apiService.post('/sysRoles/update', data);
export const deleteSysRole = (params) => apiService.post('/sysRoles/delete', params);

// 菜单管理
export const getSysMenuTree = (params) => apiService.get('/sysMenus/getMenuTree', { params });
export const saveSysMenu = (data) => apiService.post('/sysMenus/save', data);
export const updateSysMenu = (data) => apiService.post('/sysMenus/update', data);
export const deleteSysMenu = (params) => apiService.post('/sysMenus/delete', params);
```

### 文章管理模块 (article.js)

```javascript
export const getPArticleList = (params) => apiService.post('/pArticleInfo/getList', params);
export const getPArticleDetail = (params) => apiService.get('/pArticleInfo/getDetail', { params });
export const savePArticleInfo = (data) => apiService.post('/pArticleInfo/save', data);
export const updatePArticleInfo = (data) => apiService.post('/pArticleInfo/update', data);
export const deletePArticleInfo = (params) => apiService.post('/pArticleInfo/delete', params);
```

### 门户内容模块 (portal.js)

```javascript
// 产品管理
export const getProductList = (params) => apiService.post('/pProduct/getList', params);
export const saveProduct = (data) => apiService.post('/pProduct/save', data);

// 视频管理
export const getVideoList = (params) => apiService.post('/pVideo/getList', params);
export const saveVideo = (data) => apiService.post('/pVideo/save', data);

// 留言管理
export const getLeaveMessageList = (params) => apiService.post('/pLeaveMessage/getList', params);
```

## 文件上传

### 上传接口

```javascript
// 上传地址
const uploadAction = '/api/system/upload';

// 使用 Upload 组件
<Upload
  action={uploadAction}
  headers={{
    Authorization: `Bearer ${token}`,
  }}
>
  <Button icon={<UploadOutlined />}>点击上传</Button>
</Upload>
```

### 上传响应格式

```javascript
{
  "code": 0,
  "msg": "上传成功",
  "data": {
    "path": "/uploads/image20240101.png"  // 文件路径
  }
}
```

## 错误处理

### 统一错误处理

响应拦截器已统一处理错误，包括：
- 400：请求参数错误
- 401：登录过期，自动跳转登录页
- 403：权限不足
- 404：接口不存在
- 500：服务器内部错误

### 自定义错误处理

```javascript
try {
  const response = await apiCall();
  // 成功处理
} catch (error) {
  // 自定义错误处理
  if (error.response) {
    // 服务器返回错误
    console.error('Error:', error.response.data);
  } else if (error.request) {
    // 请求已发出但没有收到响应
    console.error('Network Error');
  } else {
    // 其他错误
    console.error('Error:', error.message);
  }
}
```

## 最佳实践

### 1. API 定义集中管理
```javascript
// ✅ 推荐 - 在 modules/ 中集中定义
export const getSysUserList = (params) => apiService.get('/sysUsers/getList', { params });

// ❌ 不推荐 - 在组件中直接调用
const response = await apiService.get('/sysUsers/getList', { params });
```

### 2. 错误处理
```javascript
// ✅ 推荐 - 完整的错误处理
const handleSubmit = async (values) => {
  try {
    const response = await saveData(values);
    if (response.code === 0 || response.code === 200) {
      message.success('保存成功');
    } else {
      message.error(response.msg || '保存失败');
    }
  } catch (error) {
    message.error('操作失败');
  }
};
```

### 3. 参数传递
```javascript
// ✅ 推荐 - 明确的参数结构
const response = await getList({
  pageNum: 1,
  pageSize: 10,
  searchParam: JSON.stringify(searchConditions)
});

// ❌ 不推荐 - 扁平的参数结构
const response = await getList({ ...searchConditions, pageNum: 1, pageSize: 10 });
```

## 开发环境配置

### API 代理配置

开发环境下，API 请求会被代理到后端服务器：

```javascript
// vite.config.js
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://172.16.102.105:4002/',  // 后端服务器地址
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/')
      }
    }
  }
});
```

修改后端服务器地址时，只需更新 `target` 配置。
