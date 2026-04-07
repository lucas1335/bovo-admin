# Kubernetes 部署指南

## 目录结构

```
k8s/
├── namespace.yaml      # 命名空间
├── deployment.yaml     # 部署配置
├── service.yaml        # 服务配置
├── ingress.yaml        # 入口配置
├── configmap.yaml      # 配置文件
└── hpa.yaml           # 自动扩缩容配置
```

## 部署步骤

### 1. 构建 Docker 镜像

```bash
# 构建镜像
docker build -t your-registry/bovo-admin:v1.0.0 .

# 如果使用私有镜像仓库，先登录
# docker login your-registry

# 推送镜像到仓库
docker push your-registry/bovo-admin:v1.0.0
```

### 2. 创建命名空间

```bash
kubectl apply -f k8s/namespace.yaml
```

### 3. 部署应用

```bash
# 方式一：逐个部署
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/hpa.yaml
kubectl apply -f k8s/ingress.yaml

# 方式二：一次性部署整个目录
kubectl apply -f k8s/
```

### 4. 验证部署

```bash
# 查看 Pod 状态
kubectl get pods -n bovo-admin

# 查看 Service
kubectl get svc -n bovo-admin

# 查看 Ingress
kubectl get ingress -n bovo-admin

# 查看日志
kubectl logs -f -n bovo-admin deployment/bovo-admin

# 进入 Pod 调试
kubectl exec -it -n bovo-admin <pod-name> -- sh
```

### 5. 更新部署

```bash
# 更新镜像版本
kubectl set image deployment/bovo-admin \
  bovo-admin=your-registry/bovo-admin:v1.0.1 \
  -n bovo-admin

# 或者编辑 deployment
kubectl edit deployment bovo-admin -n bovo-admin
```

### 6. 回滚部署

```bash
# 查看历史版本
kubectl rollout history deployment/bovo-admin -n bovo-admin

# 回滚到上一版本
kubectl rollout undo deployment/bovo-admin -n bovo-admin

# 回滚到指定版本
kubectl rollout undo deployment/bovo-admin --to-revision=2 -n bovo-admin
```

## 配置说明

### Ingress 域名配置

修改 `k8s/ingress.yaml` 中的域名：

```yaml
spec:
  rules:
  - host: admin.yourdomain.com  # 修改为你的域名
```

### 后端 API 代理

如果需要通过 Nginx 代理后端 API，确保：
1. 后端 Service 已创建并正常运行
2. 修改 `nginx.conf` 中的 `proxy_pass` 地址
3. 或者删除 `nginx.conf` 中的 API 代理配置，使用独立的 Ingress

### 资源配置

根据实际负载调整 `k8s/deployment.yaml` 中的资源配置：

```yaml
resources:
  requests:
    memory: "128Mi"   # 最小内存
    cpu: "100m"       # 最小 CPU
  limits:
    memory: "256Mi"   # 最大内存
    cpu: "500m"       # 最大 CPU
```

## 监控和日志

### 查看监控指标

```bash
# 查看 HPA 状态
kubectl get hpa -n bovo-admin

# 查看 Pod 资源使用
kubectl top pods -n bovo-admin
```

### 查看日志

```bash
# 实时日志
kubectl logs -f -n bovo-admin deployment/bovo-admin

# 查看最近 100 行日志
kubectl logs --tail=100 -n bovo-admin deployment/bovo-admin

# 查看所有 Pod 的日志
kubectl logs -f -n bovo-admin -l app=bovo-admin --all-containers=true
```

## 故障排查

### Pod 无法启动

```bash
# 查看 Pod 详细信息
kubectl describe pod <pod-name> -n bovo-admin

# 查看 Pod 事件
kubectl get events -n bovo-admin --sort-by='.lastTimestamp'
```

### 无法访问服务

```bash
# 测试 Service 连通性
kubectl run -it --rm debug --image=busybox --restart=Never -n bovo-admin -- \
  wget -O- http://bovo-admin

# 测试 Ingress
kubectl run -it --rm debug --image=busybox --restart=Never -n bovo-admin -- \
  wget -O- http://bovo-admin/health
```

## 清理资源

```bash
# 删除所有资源
kubectl delete -f k8s/

# 或者删除命名空间（会删除命名空间下所有资源）
kubectl delete namespace bovo-admin
```
