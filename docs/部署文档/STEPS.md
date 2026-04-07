# 分步骤部署指南

本文档将部署过程分解为独立步骤，方便逐步执行和调试。

## 前提条件

- ✅ Docker 已安装并运行
- ✅ kubectl 已配置（如果部署到 K8s）
- ✅ 阿里云镜像仓库访问凭证

---

## 步骤 1：登录镜像仓库

### 1.1 获取登录凭证

1. 访问 [阿里云容器镜像服务](https://cr.console.aliyun.com/)
2. 选择「新加坡」地域
3. 点击「访问凭证」
4. 获取用户名和密码

### 1.2 执行登录

```bash
# 替换 your-aliyun-account 为你的阿里云账号
docker login --username=your-aliyun-account one-registry.ap-southeast-3.cr.aliyuncs.com

# 输入密码后，看到 "Login Succeeded" 表示成功
```

**验证登录状态：**
```bash
# 查看已登录的仓库
cat ~/.docker/config.json | grep one-registry
```

---

## 步骤 2：构建镜像

### 2.1 构建测试环境镜像

```bash
# 查看构建参数（不会实际构建）
./deploy.sh build test | head -20

# 正式构建
./deploy.sh build test
```

**构建输出示例：**
```
========================================
  Bovo Admin Docker 部署脚本
========================================
环境: test
API地址: http://47.250.175.7:8080
镜像: one-registry.ap-southeast-3.cr.aliyuncs.com/one-test/onepiece-bovo-admin
标签: latest
========================================
[1/4] 构建 Docker 镜像...
✓ 找到环境文件: .env.test
✓ 镜像构建成功
```

### 2.2 验证镜像

```bash
# 查看本地镜像
docker images | grep onepiece-bovo-admin

# 预期输出
# one-registry.ap-southeast-3.cr.aliyuncs.com/one-test/onepiece-bovo-admin   latest   abc123   1 minute ago   25MB
```

### 2.3 本地测试镜像（可选）

```bash
# 本地运行测试
docker run -d -p 8080:80 \
  one-registry.ap-southeast-3.cr.aliyuncs.com/one-test/onepiece-bovo-admin:latest

# 访问测试
curl http://localhost:8080/health

# 停止容器
docker stop $(docker ps -q --filter "ancestor=one-registry.ap-southeast-3.cr.aliyuncs.com/one-test/onepiece-bovo-admin:latest")
```

---

## 步骤 3：打版本标签（可选）

如果你需要为镜像打版本标签：

```bash
# 基于现有 latest 镜像打标签
docker tag \
  one-registry.ap-southeast-3.cr.aliyuncs.com/one-test/onepiece-bovo-admin:latest \
  one-registry.ap-southeast-3.cr.aliyuncs.com/one-test/onepiece-bovo-admin:v1.0.0

# 查看标签
docker images | grep onepiece-bovo-admin
```

---

## 步骤 4：推送镜像

### 4.1 推送 latest 标签

```bash
docker push one-registry.ap-southeast-3.cr.aliyuncs.com/one-test/onepiece-bovo-admin:latest
```

**推送进度示例：**
```
The push refers to repository [one-registry.ap-southeast-3.cr.aliyuncs.com/one-test/onepiece-bovo-admin]
latest: digest: sha256:abc123... size: 1234
```

### 4.2 推送版本标签（如果打了标签）

```bash
docker push one-registry.ap-southeast-3.cr.aliyuncs.com/one-test/onepiece-bovo-admin:v1.0.0
```

### 4.3 验证推送

```bash
# 方式一：在阿里云控制台查看
# 访问：https://cr.console.aliyun.com/
# 进入「镜像仓库」->「one-test」->「onepiece-bovo-admin」->「镜像版本」

# 方式二：拉取镜像验证（在另一台机器或删除本地镜像后）
docker pull one-registry.ap-southeast-3.cr.aliyuncs.com/one-test/onepiece-bovo-admin:latest
```

---

## 步骤 5：准备 Kubernetes 配置

### 5.1 检查 K8s 连接

```bash
# 查看当前上下文
kubectl config current-context

# 查看集群节点
kubectl get nodes

# 查看命名空间
kubectl get ns
```

### 5.2 更新 K8s 配置

编辑 `k8s/deployment.yaml`，修改镜像地址：

```bash
# 备份原文件
cp k8s/deployment.yaml k8s/deployment.yaml.bak

# 使用 sed 替换镜像地址（Linux/Mac）
sed -i 's|image: .*|image: one-registry.ap-southeast-3.cr.aliyuncs.com/one-test/onepiece-bovo-admin:latest|g' k8s/deployment.yaml

# Windows PowerShell 替换
(Get-Content k8s/deployment.yaml) -replace 'image: .*', 'image: one-registry.ap-southeast-3.cr.aliyuncs.com/one-test/onepiece-bovo-admin:latest' | Set-Content k8s/deployment.yaml
```

### 5.3 验证配置

```bash
# 查看修改后的镜像地址
grep "image:" k8s/deployment.yaml

# 预期输出
# image: one-registry.ap-southeast-3.cr.aliyuncs.com/one-test/onepiece-bovo-admin:latest
```

---

## 步骤 6：部署到 Kubernetes

### 6.1 创建命名空间

```bash
kubectl apply -f k8s/namespace.yaml

# 验证
kubectl get ns bovo-admin
```

### 6.2 创建配置

```bash
kubectl apply -f k8s/configmap.yaml

# 验证
kubectl get configmap -n bovo-admin
```

### 6.3 创建 Service

```bash
kubectl apply -f k8s/service.yaml

# 验证
kubectl get svc -n bovo-admin
```

### 6.4 部署 Deployment

```bash
kubectl apply -f k8s/deployment.yaml

# 实时查看 Pod 状态
kubectl get pods -n bovo-admin -w
```

**预期输出：**
```
NAME                          READY   STATUS    RESTARTS   AGE
bovo-admin-7f8d9c6b5-xkv2q    1/1     Running   0          10s
bovo-admin-7f8d9c6b5-mn8pq    1/1     Running   0          10s
```

### 6.5 部署 Ingress（可选）

```bash
kubectl apply -f k8s/ingress.yaml

# 验证
kubectl get ingress -n bovo-admin
```

### 6.6 配置自动扩缩容（可选）

```bash
kubectl apply -f k8s/hpa.yaml

# 验证
kubectl get hpa -n bovo-admin
```

---

## 步骤 7：验证部署

### 7.1 检查 Pod 状态

```bash
# 查看 Pod 详情
kubectl get pods -n bovo-admin

# 查看 Pod 日志
kubectl logs -n bovo-admin -l app=bovo-admin --tail=50

# 进入 Pod 调试
kubectl exec -it -n bovo-admin $(kubectl get pod -n bovo-admin -o jsonpath='{.items[0].metadata.name}') -- sh
```

### 7.2 测试服务

```bash
# 端口转发测试
kubectl port-forward -n bovo-admin svc/bovo-admin 8080:80

# 在另一个终端测试
curl http://localhost:8080/health

# 预期输出
# healthy
```

### 7.3 查看 Ingress 访问

```bash
# 查看 Ingress 地址
kubectl get ingress -n bovo-admin

# 如果配置了域名，修改 hosts 文件或 DNS
# 然后访问
curl http://admin.yourdomain.com/health
```

---

## 步骤 8：监控和日志

### 8.1 实时监控

```bash
# 监控 Pod 状态
kubectl get pods -n bovo-admin -w

# 监控资源使用
kubectl top pods -n bovo-admin

# 监控 HPA
kubectl get hpa -n bovo-admin -w
```

### 8.2 查看日志

```bash
# 实时日志
kubectl logs -f -n bovo-admin -l app=bovo-admin

# 查看最近 100 行
kubectl logs --tail=100 -n bovo-admin -l app=bovo-admin

# 查看特定 Pod 的日志
kubectl logs -n bovo-admin <pod-name>
```

---

## 回滚操作

### 回滚镜像

```bash
# 查看历史版本
kubectl rollout history deployment/bovo-admin -n bovo-admin

# 回滚到上一版本
kubectl rollout undo deployment/bovo-admin -n bovo-admin

# 回滚到指定版本
kubectl rollout undo deployment/bovo-admin --to-revision=2 -n bovo-admin
```

### 删除部署

```bash
# 删除单个资源
kubectl delete deployment bovo-admin -n bovo-admin
kubectl delete service bovo-admin -n bovo-admin
kubectl delete ingress bovo-admin -n bovo-admin

# 删除所有资源
kubectl delete -f k8s/

# 删除命名空间（会删除命名空间下所有资源）
kubectl delete namespace bovo-admin
```

---

## 故障排查

### Pod 无法启动

```bash
# 查看 Pod 详情
kubectl describe pod <pod-name> -n bovo-admin

# 常见问题：
# - ImagePullBackOff: 镜像拉取失败，检查镜像地址和登录凭证
# - CrashLoopBackOff: 容器启动失败，查看日志
# - Pending: 资源不足或调度问题
```

### 镜像拉取失败

```bash
# 创建镜像拉取密钥
kubectl create secret docker-registry regcred \
  --docker-server=one-registry.ap-southeast-3.cr.aliyuncs.com \
  --username=your-aliyun-account \
  --password=your-password \
  --namespace=bovo-admin

# 在 deployment.yaml 中添加 imagePullSecrets
```

### 服务无法访问

```bash
# 测试 Service 连通性
kubectl run -it --rm debug --image=busybox --restart=Never -n bovo-admin -- \
  wget -O- http://bovo-admin/health

# 检查 Endpoints
kubectl get endpoints -n bovo-admin
```

---

## 快速参考

### 常用命令

```bash
# 构建
./deploy.sh build test

# 本地运行
./deploy.sh local test

# 推送
docker push one-registry.ap-southeast-3.cr.aliyuncs.com/one-test/onepiece-bovo-admin:latest

# 部署
kubectl apply -f k8s/

# 查看状态
kubectl get pods -n bovo-admin

# 查看日志
kubectl logs -f -n bovo-admin -l app=bovo-admin

# 回滚
kubectl rollout undo deployment/bovo-admin -n bovo-admin
```

### 环境切换

```bash
# 测试环境
./deploy.sh build test

# 预发布环境
./deploy.sh build staging

# 生产环境
./deploy.sh build production
```
