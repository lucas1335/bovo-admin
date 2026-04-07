# 部署指南

## 环境配置

| 环境 | API 地址 | 镜像名称 |
|------|----------|---------|
| test | http://47.250.175.7:8080 | one-registry.ap-southeast-3.cr.aliyuncs.com/one-test/onepiece-bovo-admin |
| staging | http://staging-api.example.com | bovo-admin-staging |
| production | http://47.250.175.7:8080 | bovo-admin |

---

## 完整构建和推送步骤

### 1. 登录镜像仓库

```bash
docker login --username=your-aliyun-account one-registry.ap-southeast-3.cr.aliyuncs.com
```

### 2. 构建镜像

```bash
# 构建测试环境镜像
./deploy.sh build test

# 构建生产环境镜像
./deploy.sh build production
```

### 3. 验证镜像

```bash
docker images | grep onepiece-bovo-admin
```

### 4. 推送镜像

```bash
# 推送 latest 标签
docker push one-registry.ap-southeast-3.cr.aliyuncs.com/one-test/onepiece-bovo-admin:latest

# 打版本标签并推送
docker tag one-registry.ap-southeast-3.cr.aliyuncs.com/one-test/onepiece-bovo-admin:latest \
          one-registry.ap-southeast-3.cr.aliyuncs.com/one-test/onepiece-bovo-admin:v1.0.0
docker push one-registry.ap-southeast-3.cr.aliyuncs.com/one-test/onepiece-bovo-admin:v1.0.0
```

### 5. 更新 K8s 配置

编辑 [k8s/deployment.yaml](k8s/deployment.yaml) 第 27 行：

```yaml
image: one-registry.ap-southeast-3.cr.aliyuncs.com/one-test/onepiece-bovo-admin:v1.0.0
```

### 6. 部署到 Kubernetes

```bash
# 一键部署所有资源
kubectl apply -f k8s/

# 查看部署状态
kubectl get pods -n bovo-admin
```

### 7. 验证部署

```bash
# 查看日志
kubectl logs -f -n bovo-admin -l app=bovo-admin

# 端口转发测试
kubectl port-forward -n bovo-admin svc/bovo-admin 8080:80
# 访问 http://localhost:8080/health
```

---

## 本地测试

```bash
# 运行测试环境
./deploy.sh local test

# 访问 http://localhost:8080
```

---

## 常用命令

### 镜像操作

```bash
# 构建
./deploy.sh build test

# 本地运行
./deploy.sh local test

# 推送
docker push one-registry.ap-southeast-3.cr.aliyuncs.com/one-test/onepiece-bovo-admin:latest
```

### K8s 操作

```bash
# 查看状态
kubectl get pods -n bovo-admin
kubectl get svc -n bovo-admin

# 查看日志
kubectl logs -f -n bovo-admin -l app=bovo-admin

# 更新镜像
kubectl set image deployment/bovo-admin \
  bovo-admin=your-image:v1.0.1 \
  -n bovo-admin

# 回滚
kubectl rollout undo deployment/bovo-admin -n bovo-admin
```

### 清理资源

```bash
# 清理 K8s 资源
kubectl delete -f k8s/

# 清理本地镜像
docker rmi one-registry.ap-southeast-3.cr.aliyuncs.com/one-test/onepiece-bovo-admin:latest
```

---

## 配置修改

### 修改域名

编辑 [k8s/ingress.yaml](k8s/ingress.yaml)：

```yaml
- host: admin.yourdomain.com  # 修改为你的域名
```

### 修改 API 地址

编辑 [nginx.conf](nginx.conf)：

```nginx
proxy_pass http://your-backend:8080/;
```

### 调整资源配置

编辑 [k8s/deployment.yaml](k8s/deployment.yaml)：

```yaml
resources:
  requests:
    memory: "128Mi"
    cpu: "100m"
  limits:
    memory: "256Mi"
    cpu: "500m"
```

---

## 故障排查

### Pod 无法启动

```bash
kubectl describe pod <pod-name> -n bovo-admin
kubectl logs <pod-name> -n bovo-admin
```

### 镜像拉取失败

创建镜像拉取密钥：

```bash
kubectl create secret docker-registry regcred \
  --docker-server=one-registry.ap-southeast-3.cr.aliyuncs.com \
  --username=your-username \
  --password=your-password \
  --namespace=bovo-admin
```

---

## 技术栈

- React 18 + Vite 5 + Ant Design 5
- Nginx (Alpine)
- Docker + Kubernetes
