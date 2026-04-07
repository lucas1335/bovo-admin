# Docker + Kubernetes 部署指南

## 项目概述

这是一个基于 **React + Vite + Ant Design** 的管理后台系统，使用 Docker 容器化部署，支持 Kubernetes 集群运行。

## 目录结构

```
bovo-admin/
├── Dockerfile              # Docker 镜像构建文件
├── .dockerignore          # Docker 忽略文件
├── nginx.conf             # Nginx 配置文件
├── docker-compose.yaml    # Docker Compose 配置（本地测试）
├── deploy.sh              # 一键部署脚本
├── k8s/                   # Kubernetes 配置目录
│   ├── namespace.yaml     # 命名空间
│   ├── deployment.yaml    # 部署配置
│   ├── service.yaml       # 服务配置
│   ├── ingress.yaml       # Ingress 配置
│   ├── configmap.yaml     # 配置文件
│   ├── hpa.yaml          # 自动扩缩容
│   └── README.md         # K8s 部署详细文档
└── DEPLOY.md             # 本文档
```

## 快速开始

### 本地测试（Docker Compose）

```bash
# 方式一：使用部署脚本
chmod +x deploy.sh
./deploy.sh local

# 方式二：直接使用 docker-compose
docker compose up -d

# 访问应用
# http://localhost:8080
```

### 部署到 Kubernetes

```bash
# 方式一：使用部署脚本（推荐）
IMAGE_TAG=v1.0.0 REGISTRY=your-registry.com ./deploy.sh k8s

# 方式二：手动部署
# 1. 构建并推送镜像
docker build -t your-registry.com/bovo-admin:v1.0.0 .
docker push your-registry.com/bovo-admin:v1.0.0

# 2. 修改 k8s/deployment.yaml 中的镜像地址
# image: your-registry.com/bovo-admin:v1.0.0

# 3. 部署到 K8s
kubectl apply -f k8s/

# 4. 验证部署
kubectl get pods -n bovo-admin
```

## 配置说明

### 1. 修改 Ingress 域名

编辑 [k8s/ingress.yaml](k8s/ingress.yaml):

```yaml
spec:
  rules:
  - host: admin.yourdomain.com  # 修改为你的域名
```

### 2. 配置后端 API

编辑 [nginx.conf](nginx.conf) 中的 API 代理配置：

```nginx
location /api/ {
    proxy_pass http://backend-service:8080/;  # 修改为实际后端地址
    # ... 其他配置
}
```

### 3. 调整资源配置

编辑 [k8s/deployment.yaml](k8s/deployment.yaml):

```yaml
resources:
  requests:
    memory: "128Mi"  # 根据实际情况调整
    cpu: "100m"
  limits:
    memory: "256Mi"
    cpu: "500m"
```

### 4. 配置自动扩缩容

编辑 [k8s/hpa.yaml](k8s/hpa.yaml) 调整副本数和扩缩容策略。

## Docker 镜像说明

### 多阶段构建

镜像使用多阶段构建，最终镜像基于 `nginx:alpine`，体积小且安全。

- **Stage 1 (Builder)**: Node.js 环境，构建 React 应用
- **Stage 2 (Production)**: Nginx 环境，仅包含构建产物

### 镜像特性

- 基于 `nginx:alpine`，镜像体积小
- 已配置时区为 `Asia/Shanghai`
- 启用 Gzip 压缩
- 配置静态资源缓存
- 内置健康检查
- SPA 路由支持

### 镜像大小

- 最终镜像约 **20-30 MB**（取决于静态资源大小）

## Kubernetes 资源说明

| 资源类型 | 名称 | 说明 |
|---------|------|------|
| Namespace | bovo-admin | 命名空间 |
| Deployment | bovo-admin | 应用部署（2 副本） |
| Service | bovo-admin | 集群 IP 服务 |
| Service | backend-service | 后端服务（API 代理用） |
| Ingress | bovo-admin | 入口规则 |
| ConfigMap | bovo-admin-config | 配置文件 |
| HPA | bovo-admin-hpa | 自动扩缩容（2-10 副本） |

## 健康检查

应用内置健康检查端点：

```bash
# 健康检查
curl http://localhost/health

# 返回
healthy
```

Kubernetes 健康检查配置：

- **Liveness Probe**: 每 30 秒检查一次
- **Readiness Probe**: 每 10 秒检查一次

## 监控和日志

### 查看日志

```bash
# K8s Pod 日志
kubectl logs -f -n bovo-admin deployment/bovo-admin

# Docker Compose 日志
docker compose logs -f
```

### 查看监控指标

```bash
# 查看 HPA 状态
kubectl get hpa -n bovo-admin

# 查看 Pod 资源使用
kubectl top pods -n bovo-admin
```

## 更新部署

```bash
# 更新镜像版本
kubectl set image deployment/bovo-admin \
  bovo-admin=your-registry.com/bovo-admin:v1.0.1 \
  -n bovo-admin

# 查看滚动更新状态
kubectl rollout status deployment/bovo-admin -n bovo-admin

# 回滚到上一版本
kubectl rollout undo deployment/bovo-admin -n bovo-admin
```

## 环境变量

| 变量名 | 默认值 | 说明 |
|-------|--------|------|
| TZ | Asia/Shanghai | 时区设置 |

## 端口说明

| 端口 | 协议 | 说明 |
|-----|------|------|
| 80 | HTTP | Nginx 对外端口 |

## 常见问题

### 1. Pod 无法启动

```bash
# 查看 Pod 详情
kubectl describe pod <pod-name> -n bovo-admin

# 查看 Pod 日志
kubectl logs <pod-name> -n bovo-admin
```

### 2. 无法访问服务

检查 Ingress 配置和域名解析：

```bash
# 查看 Ingress
kubectl get ingress -n bovo-admin

# 测试服务连通性
kubectl run -it --rm debug --image=busybox --restart=Never -n bovo-admin -- \
  wget -O- http://bovo-admin/health
```

### 3. API 请求失败

检查后端 Service 和 Endpoints：

```bash
# 查看 Service
kubectl get svc -n bovo-admin

# 查看 Endpoints
kubectl get endpoints -n bovo-admin
```

## 清理资源

```bash
# 清理 K8s 资源
kubectl delete -f k8s/

# 清理 Docker Compose
docker compose down

# 清理镜像
docker rmi your-registry.com/bovo-admin:v1.0.0
```

## 安全建议

1. **使用私有镜像仓库**：不要将镜像推送到公共仓库
2. **启用 HTTPS**：配置 Ingress TLS
3. **限制资源**：合理设置 requests/limits
4. **使用非 root 用户**：Pod 已配置为使用 UID 101 运行
5. **只读文件系统**：容器根文件系统已配置为只读

## 技术栈

- **前端框架**: React 18
- **构建工具**: Vite 5
- **UI 框架**: Ant Design 5
- **Web 服务器**: Nginx (Alpine)
- **容器运行时**: Docker
- **编排平台**: Kubernetes

## 许可证

Copyright © 2026
