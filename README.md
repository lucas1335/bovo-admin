# BOVO 交易所后台管理系统

基于 React + Ant Design + Vite 的企业级后台管理系统

## ✨ 特性

- 🔐 **用户认证** - 完整的登录/登出流程
- 📊 **数据管理** - 丰富的数据表格和表单组件
- 🎨 **现代化UI** - Ant Design 5 组件库
- ⚡ **快速构建** - Vite 构建，开发体验极佳
- 🐳 **容器化部署** - 支持 Docker + Kubernetes
- 📱 **响应式布局** - 适配各种屏幕尺寸
- 🔔 **通知中心** - 实时消息通知
- 🌐 **多环境支持** - test / staging / production

## 🛠 技术栈

- **React 18** - 前端框架
- **Ant Design 5** - UI 组件库
- **Vite 5** - 构建工具
- **React Router 6** - 路由管理
- **Axios** - HTTP 客户端
- **Day.js** - 日期处理
- **Docker** - 容器化
- **Kubernetes** - 编排平台

## 📚 文档

### 开发文档

| 文档 | 说明 |
|------|------|
| [项目概述](docs/开发规范/项目概述.md) | 项目简介、技术栈、目录结构 |
| [快速开始](docs/开发规范/快速开始.md) | 环境准备、项目启动、开发流程 |
| [开发规范](docs/开发规范/开发规范.md) | 代码规范、组件使用规范 |
| [组件指南](docs/开发规范/组件指南.md) | 核心组件使用方法和示例 |
| [API规范](docs/开发规范/API规范.md) | API定义规范、请求响应格式 |
| [路由配置](docs/开发规范/路由配置.md) | 路由配置、动态路由、菜单管理 |
| [业务规则](docs/开发规范/业务规则.md) | 核心业务实现规则总结 |
| [接口返回结构](docs/开发规范/接口返回结构.md) | 后端接口返回结构说明 |

### 部署文档

| 文档 | 说明 |
|------|------|
| [部署指南](docs/部署文档/DEPLOY.md) | Docker + K8s 部署 |
| [分步指南](docs/部署文档/STEPS.md) | 详细部署步骤 |

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发环境

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
```

## ⚙️ 环境配置

| 环境 | API 地址 | 说明 |
|------|----------|------|
| development | /api | 使用代理，开发环境 |
| test | http://47.250.175.7:8080 | 测试环境 |
| staging | http://staging-api.example.com | 预发布环境 |
| production | http://47.250.175.7:8080 | 生产环境 |

## 📦 部署

### 快速部署

```bash
# 测试环境
./deploy.sh build test

# 生产环境
./deploy.sh build production
```

### Docker 部署

```bash
# 构建
docker build --build-arg BUILD_ENV=test -t bovo-admin:test .

# 运行
docker run -d -p 8080:80 bovo-admin:test
```

### Kubernetes 部署

```bash
# 1. 登录镜像仓库
docker login --username=xxx one-registry.ap-southeast-3.cr.aliyuncs.com

# 2. 构建并推送
./deploy.sh build test
docker push one-registry.ap-southeast-3.cr.aliyuncs.com/one-test/onepiece-bovo-admin:latest

# 3. 部署到 K8s
kubectl apply -f k8s/
```

详细部署文档请查看 [部署指南](docs/部署文档/DEPLOY.md)

## 📁 项目结构

```
bovo-admin/
├── src/
│   ├── api/              # API 接口
│   │   └── modules/      # API 模块
│   ├── components/       # 公共组件
│   │   ├── CmBasePage/   # 基础页面组件
│   │   ├── CmUpload/     # 上传组件
│   │   └── CmEditor/     # 编辑器组件
│   ├── config/           # 配置文件
│   ├── pages/            # 页面组件
│   │   ├── login/        # 登录
│   │   ├── dashboard/    # 仪表盘
│   │   └── system/       # 系统管理
│   ├── utils/            # 工具函数
│   ├── App.jsx           # 主应用
│   └── main.jsx          # 入口文件
├── docs/
│   ├── 开发规范/         # 开发文档
│   └── 部署文档/         # 部署文档
├── k8s/                  # Kubernetes 配置
├── deploy.sh             # 部署脚本
├── Dockerfile            # Docker 配置
├── nginx.conf            # Nginx 配置
└── vite.config.js        # Vite 配置
```

## 🧩 核心组件

### CmBasePage
通用列表页面组件，支持：
- 数据表格展示
- 搜索功能
- 新增/编辑/删除
- 分页
- 工具栏操作

### CmUpload
图片上传组件，支持：
- 多图上传
- 图片预览
- 限制数量和大小

### CmEditor
富文本编辑器，支持：
- 图片上传
- 代码高亮
- 表格编辑
- 全屏模式

## 📖 开发规范

### 添加新页面

1. 在 `src/pages/` 创建页面组件
2. 在 `src/api/modules/` 创建 API 模块
3. 配置路由和菜单

### 代码规范

- 使用 ESLint 进行代码检查
- 组件使用函数式组件 + Hooks
- API 统一放在 `src/api/modules/`
- 样式使用 Ant Design 主题定制

## 👤 默认账户

- **用户名**: admin
- **密码**: admin123

## 💻 常用命令

```bash
# 开发
npm run dev

# 构建
npm run build

# 预览
npm run preview

# 代码检查
npm run lint

# 部署
./deploy.sh build test
```

## 📄 许可证

MIT License
