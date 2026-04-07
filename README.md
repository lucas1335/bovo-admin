# 墨小帮后台管理系统

基于 React + Ant Design + Vite 的企业级后台管理系统

## 📖 项目文档

**完整的开发文档已整理完成，请查看 [docs/](./docs) 目录：**

- **[文档中心](./docs/README.md)** - 文档导航和快速索引
- **[项目概述](./docs/PROJECT_OVERVIEW.md)** - 项目简介、技术栈、目录结构
- **[快速开始](./docs/QUICK_START.md)** - 环境准备、项目启动、开发流程
- **[开发规范](./docs/DEVELOPMENT_GUIDE.md)** - 代码规范、组件使用、业务开发规范
- **[组件使用指南](./docs/Component_GUIDE.md)** - 核心组件使用方法和示例
- **[API 接口规范](./docs/API_SPECIFICATION.md)** - API 定义规范、请求响应格式
- **[路由配置指南](./docs/ROUTING_GUIDE.md)** - 路由配置、动态路由、菜单管理
- **[业务实现规则](./docs/BUSINESS_RULES.md)** - 核心业务实现规则总结

## 功能特性

- 🔐 用户认证与授权
- 📊 数据仪表盘
- 👤 个人中心管理
- ⚙️ 系统设置管理
- 👥 用户管理
- 🎭 角色管理
- 🔑 权限管理
- 🎨 现代化UI设计
- 📱 响应式布局
- ⚡ Vite快速构建
- 🔗 菜单路由统一配置（支持API调用）
- 🌐 外部链接跳转功能
- 🔔 通知中心（带角标）
- 📋 动态菜单加载
- 📝 通用表单组件（支持弹出层和抽屉两种形式）

## 技术栈

- **React 18** - 前端框架
- **Ant Design 5** - UI组件库
- **Vite** - 快速构建工具
- **React Router 6** - 路由管理
- **Axios** - HTTP客户端
- **Day.js** - 日期处理

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

### 环境变量配置

项目支持通过环境变量进行配置。创建 `.env` 文件：

```bash
# API配置
VITE_API_URL=http://localhost:8080/api

# 应用配置
VITE_APP_TITLE=JAVA-CM Admin
VITE_APP_VERSION=1.0.0
```

## 项目结构

```
src/
├── components/          # 公共组件
│   ├── Layout.jsx      # 主布局组件
│   ├── DataGrid.jsx    # 通用数据表格组件
│   └── DataForm.jsx    # 通用表单组件
├── config/             # 配置文件
│   └── menuConfig.jsx  # 菜单配置
├── contexts/           # React Context
│   └── AuthContext.jsx  # 认证上下文
├── pages/              # 页面组件
│   ├── Login.jsx       # 登录页
│   ├── Dashboard.jsx   # 仪表盘
│   ├── Profile.jsx     # 个人中心
│   ├── SystemManagement.jsx  # 系统管理
│   ├── UserManagement.jsx    # 用户管理
│   ├── RoleManagement.jsx    # 角色管理
│   ├── PermissionManagement.jsx  # 权限管理
│   ├── NotificationCenter.jsx # 通知中心
│   └── FormDemo.jsx          # 表单演示
├── services/           # API服务
│   └── menuService.js  # 菜单和通知服务
├── App.jsx             # 主应用组件
├── main.jsx            # 应用入口
└── index.css           # 全局样式
```

## 页面说明

### 登录页 (`/login`)
- 用户登录界面
- 表单验证
- 记住登录状态

### 仪表盘 (`/dashboard`)
- 数据统计展示
- 图表和进度条
- 最近活动记录

### 个人中心 (`/profile`)
- 个人信息编辑
- 密码修改
- 头像上传

### 系统管理 (`/system`)
- 基本设置
- 安全设置
- 邮件配置
- 数据设置

### 用户管理 (`/users`)
- 用户列表展示
- 高级搜索功能
- 添加/编辑/删除用户
- 用户状态管理

### 角色管理 (`/roles`)
- 角色列表管理
- 角色权限分配
- 角色状态控制
- 角色用户统计

### 权限管理 (`/permissions`)
- 权限列表管理
- 权限类型分类
- 权限模块管理
- 权限状态控制

## 公共组件

### DataGrid 组件
通用的数据表格组件，支持以下功能：
- 可配置的列定义
- 搜索功能
- 新增/编辑/删除操作
- 分页功能
- 加载状态
- 自定义操作按钮

### DataForm 组件
通用的表单组件，支持以下功能：
- 多种表单字段类型（输入框、选择器、开关等）
- 表单验证
- 两种展示形式：弹出层和抽屉
- 可配置的表单字段
- 支持多种抽屉位置和尺寸

#### 使用示例：

```jsx
// 弹出层形式（默认）
<DataForm
  visible={formVisible}
  title="表单标题"
  fields={formFields}
  formType="modal"
  width={600}
  onCancel={handleCancel}
  onSubmit={handleSubmit}
/>

// 抽屉形式
<DataForm
  visible={formVisible}
  title="表单标题"
  fields={formFields}
  formType="drawer"
  drawerPlacement="right"
  drawerSize="large"
  onCancel={handleCancel}
  onSubmit={handleSubmit}
/>
```

## 默认账户

- **用户名**: admin
- **密码**: admin123

## 开发说明

### 添加新页面

1. 在 `src/pages/` 目录下创建新组件
2. 在 `src/App.jsx` 中添加路由配置
3. 在 `src/components/Layout.jsx` 中添加菜单项

### 使用公共组件

```jsx
import DataGrid from '../components/DataGrid';
import DataForm from '../components/DataForm';

// 使用DataGrid
<DataGrid
  title="数据列表"
  columns={columns}
  dataSource={data}
  searchFields={searchFields}
  onAdd={handleAdd}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>

// 使用DataForm
<DataForm
  visible={formVisible}
  title="表单标题"
  fields={formFields}
  onCancel={handleCancel}
  onSubmit={handleSubmit}
/>
```

### 自定义主题

可以通过修改 Ant Design 的主题配置来自定义样式：

```javascript
import { ConfigProvider } from 'antd';

<ConfigProvider
  theme={{
    token: {
      colorPrimary: '#1890ff',
    },
  }}
>
  {/* 你的应用 */}
</ConfigProvider>
```

## 构建优化

使用 Vite 构建工具，提供：
- 快速的开发服务器启动
- 热模块替换 (HMR)
- 优化的生产构建
- 更好的开发体验

## 部署

### 构建项目

```bash
npm run build
```

### 部署到服务器

将 `dist` 目录下的文件部署到你的Web服务器即可。

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！ 