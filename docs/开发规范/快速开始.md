# 快速开始指南

## 环境准备

### 前置要求

- Node.js >= 16.0.0
- npm >= 8.0.0 或 yarn >= 1.22.0

### 安装依赖

```bash
# 使用 npm
npm install

# 或使用 yarn
yarn install
```

## 启动项目

### 开发模式

```bash
npm run dev
```

启动后自动打开浏览器：http://localhost:3000

### 生产构建

```bash
npm run build
```

构建产物在 `dist` 目录。

### 预览构建

```bash
npm run preview
```

## 项目配置

### API 代理配置

开发环境下，API 请求会被代理到后端服务器。

编辑 [vite.config.js](../vite.config.js)：

```javascript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://172.16.102.105:4002/',  // 修改为你的后端地址
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/')
      }
    }
  }
});
```

### 端口配置

修改开发服务器端口：

```javascript
export default defineConfig({
  server: {
    port: 3000,  // 修改为其他端口
    // ...
  }
});
```

## 开发流程

### 1. 创建新页面

#### 步骤 1：创建页面文件

在 `src/pages/` 下创建页面组件：

```jsx
// src/pages/cm-system/dept.jsx
import React from 'react';
import CmBasePage from '@components/CmBasePage';

const DeptPage = () => {
  const columns = [
    { title: '部门名称', dataIndex: 'name', key: 'name', width: 200 },
    { title: '部门编码', dataIndex: 'code', key: 'code', width: 150 },
  ];

  return (
    <CmBasePage
      columns={columns}
      apiEndpoint="/sysDept/getList"
      apiMethod="post"
      rowKey="id"
    />
  );
};

export default DeptPage;
```

#### 步骤 2：配置路由

**静态路由**：在 [routesConfig.js](../src/router/routesConfig.js) 中注册：

```javascript
export const staticRoutes = {
  'dept-management': {
    path: '/cm-system/dept',
    component: lazy(() => import('../pages/cm-system/dept.jsx')),
  },
};
```

**动态路由**：无需注册，在后台菜单管理中添加即可。

#### 步骤 3：配置菜单

**本地菜单**：在 [menuConfig.jsx](../src/config/menuConfig.jsx) 中添加：

```javascript
{
  key: '/cm-system/dept',
  name: '部门管理',
  path: '/cm-system/dept',
  icon: <ApartmentOutlined />
}
```

**后台菜单**：在系统管理 -> 菜单管理中添加菜单项。

### 2. 添加 API 接口

在 `src/api/modules/` 下创建或编辑 API 文件：

```javascript
// src/api/modules/system.js
import apiService from '../base';

/**
 * 获取部门列表
 */
export const getSysDeptList = (params) => apiService.post('/sysDept/getList', params);

/**
 * 新增部门
 */
export const saveSysDept = (data) => apiService.post('/sysDept/save', data);

/**
 * 更新部门
 */
export const updateSysDept = (data) => apiService.post('/sysDept/update', data);

/**
 * 删除部门
 */
export const deleteSysDept = (params) => apiService.post('/sysDept/delete', params);
```

在页面中使用：

```javascript
import { getSysDeptList, saveSysDept, updateSysDept, deleteSysDept } from '@api';
```

### 3. 完整的 CRUD 页面

```jsx
import React, { useState } from 'react';
import { message, Form, Input } from 'antd';
import CmBasePage from '@components/CmBasePage';
import DataForm from '@components/DataForm';
import { getSysDeptList, saveSysDept, updateSysDept, deleteSysDept } from '@api';

const DeptPage = () => {
  const [formVisible, setFormVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);

  const columns = [
    { title: '部门名称', dataIndex: 'name', key: 'name', width: 200 },
    { title: '部门编码', dataIndex: 'code', key: 'code', width: 150 },
  ];

  const searchFieldList = [
    {
      title: '部门名称',
      dataIndex: 'name',
      key: 'SEARCH_LIKE_name',
      type: 'text',
    },
  ];

  const handleAdd = () => {
    setEditingRecord(null);
    setFormVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormVisible(true);
  };

  const handleDelete = async (record) => {
    try {
      const response = await deleteSysDept({ id: record.id });
      if (response.code === 0 || response.code === 200) {
        message.success('删除成功');
        refreshTable();
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = editingRecord
        ? await updateSysDept(values)
        : await saveSysDept(values);

      if (response.code === 0 || response.code === 200) {
        message.success('保存成功');
        setFormVisible(false);
        refreshTable();
      }
    } catch (error) {
      message.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  const refreshTable = () => {
    document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
      new CustomEvent('reload')
    );
  };

  return (
    <div>
      <CmBasePage
        columns={columns}
        apiEndpoint="/sysDept/getList"
        apiMethod="post"
        searchFieldList={searchFieldList}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        rowKey="id"
      />

      <DataForm
        visible={formVisible}
        title={editingRecord ? '编辑部门' : '新增部门'}
        initialValues={editingRecord || {}}
        extraValues={{ id: editingRecord?.id }}
        onCancel={() => setFormVisible(false)}
        onSubmit={handleSubmit}
        onClosed={() => setEditingRecord(null)}
        loading={loading}
        formType="drawer"
      >
        <Form.Item
          name="name"
          label="部门名称"
          rules={[{ required: true, message: '请输入部门名称' }]}
        >
          <Input placeholder="请输入部门名称" />
        </Form.Item>

        <Form.Item
          name="code"
          label="部门编码"
          rules={[{ required: true, message: '请输入部门编码' }]}
        >
          <Input placeholder="请输入部门编码" />
        </Form.Item>
      </DataForm>
    </div>
  );
};

export default DeptPage;
```

## 核心组件使用

### CmBasePage - 列表页面

```jsx
<CmBasePage
  columns={columns}              // 列配置
  apiEndpoint="/api/endpoint"    // API 端点
  apiMethod="post"               // 请求方法
  searchFieldList={searchList}   // 搜索字段
  onAdd={handleAdd}              // 新增回调
  onEdit={handleEdit}            // 编辑回调
  onDelete={handleDelete}        // 删除回调
  rowKey="id"                    // 行键
/>
```

### DataForm - 表单

```jsx
<DataForm
  visible={visible}              // 是否显示
  title="表单标题"               // 标题
  initialValues={data}           // 初始值
  onSubmit={handleSubmit}         // 提交回调
  onCancel={handleCancel}        // 取消回调
  loading={loading}              // 加载状态
>
  <Form.Item name="field" label="字段">
    <Input />
  </Form.Item>
</DataForm>
```

### CmUpload - 图片上传

```jsx
<Form.Item name="image" label="图片">
  <CmUpload />
</Form.Item>
```

### CmEditor - 富文本编辑器

```jsx
<Form.Item name="content" label="内容">
  <CmEditor height={500} />
</Form.Item>
```

## 常见问题

### 1. 端口被占用

```bash
# 修改 vite.config.js 中的端口
server: {
  port: 3001  // 改为其他端口
}
```

### 2. API 请求失败

- 检查后端服务是否启动
- 检查 vite.config.js 中的代理配置
- 检查浏览器控制台的网络请求

### 3. 登录后跳转错误

检查路由守卫配置和登录逻辑：

```javascript
// AuthContext.jsx
const login = async (loginData) => {
  const response = await apiService.post("/login", {
    username: loginData.username,
    password: loginData.password,
    userType: "systemUser",
  });

  if (response.code === 0 || response.code === 200) {
    const { access_token } = response.data;
    localStorage.setItem("token", access_token);
    // ...
  }
};
```

### 4. 组件不刷新

使用自定义事件刷新表格：

```javascript
document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
  new CustomEvent('reload')
);
```

## 开发工具

### VS Code 推荐

推荐安装以下插件：
- ESLint
- Prettier
- Auto Rename Tag
- Path Intellisense

### 浏览器插件

- React Developer Tools
- Redux DevTools（如果使用 Redux）

## 代码规范

### 命名规范

- **组件文件**：PascalCase，如 `UserPage.jsx`
- **工具文件**：camelCase，如 `formatDate.js`
- **组件名**：PascalCase，如 `UserPage`
- **函数名**：camelCase，如 `handleSubmit`

### 导入顺序

```javascript
// 1. React 相关
import React, { useState, useEffect } from 'react';

// 2. 第三方库
import { Button, Form } from 'antd';
import { useNavigate } from 'react-router-dom';

// 3. 组件
import CmBasePage from '@components/CmBasePage';
import DataForm from '@components/DataForm';

// 4. API
import { getSysUserList } from '@api';

// 5. 工具函数
import { formatDate } from '@utils/formatDate';

// 6. 样式
import './UserPage.css';
```

## 调试技巧

### 1. 使用 React Developer Tools

检查组件状态和 props：

```javascript
// 在组件中添加调试信息
useEffect(() => {
  console.log('Component rendered');
  console.log('Current state:', state);
}, [state]);
```

### 2. 网络请求调试

```javascript
// 在响应拦截器中添加日志
apiService.interceptors.response.use(
  (response) => {
    console.log('API Response:', response);
    return response;
  }
);
```

### 3. 路由调试

```javascript
// 查看当前路由信息
const location = useLocation();
console.log('Current path:', location.pathname);
```

## 性能优化

### 1. 使用懒加载

```javascript
// ✅ 推荐
const UserPage = lazy(() => import('./pages/UserPage'));

// ❌ 不推荐
import UserPage from './pages/UserPage';
```

### 2. 避免不必要的渲染

```javascript
// 使用 useMemo 缓存计算结果
const treeData = useMemo(() => {
  return normalizeTreeData(data);
}, [data]);

// 使用 useCallback 缓存函数
const handleClick = useCallback(() => {
  // 处理逻辑
}, [dependency]);
```

### 3. 代码分割

Vite 会自动进行代码分割，确保每个页面组件是独立的 chunk。

## 部署

### 构建生产版本

```bash
npm run build
```

### 配置 base 路径

如果部署到子路径，修改 `vite.config.js`：

```javascript
export default defineConfig({
  base: '/admin/',  // 子路径
  // ...
});
```

### 环境变量

创建 `.env.production` 文件：

```
VITE_API_BASE_URL=https://api.example.com
```

在代码中使用：

```javascript
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
```

## 下一步

- 阅读完整文档：[docs/](./)
- 查看组件指南：[Component_GUIDE.md](./Component_GUIDE.md)
- 了解 API 规范：[API_SPECIFICATION.md](./API_SPECIFICATION.md)
- 学习路由配置：[ROUTING_GUIDE.md](./ROUTING_GUIDE.md)

## 获取帮助

- 查看项目文档
- 查看示例代码：`src/pages/example/`
- 查看现有页面实现
- 联系团队成员
