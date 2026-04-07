#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
IMAGE_NAME="${IMAGE_NAME:-bovo-admin}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
REGISTRY="${REGISTRY:-your-registry}"
NAMESPACE="${NAMESPACE:-bovo-admin}"
BUILD_ENV="${BUILD_ENV:-production}"
VITE_API_BASE_URL="${VITE_API_BASE_URL:-}"

# 环境对应的 API 地址
declare -A ENV_API_URLS=(
    [test]="http://47.250.175.7:8080"
    [staging]="http://staging-api.example.com"
    [production]="http://47.250.175.7:8080"
)

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo -e "${RED}错误: Docker 未安装${NC}"
    exit 1
fi

# 检查 kubectl 是否安装（如果需要部署到 K8s）
if [ "$1" == "k8s" ] && ! command -v kubectl &> /dev/null; then
    echo -e "${RED}错误: kubectl 未安装${NC}"
    exit 1
fi

# 检查环境文件是否存在
check_env_file() {
    local env_file=".env.${BUILD_ENV}"
    if [ ! -f "$env_file" ]; then
        echo -e "${RED}错误: 环境文件 $env_file 不存在${NC}"
        echo -e "${YELLOW}可用的环境文件:${NC}"
        ls -1 .env.* 2>/dev/null || echo "  无"
        exit 1
    fi
    echo -e "${GREEN}✓ 找到环境文件: $env_file${NC}"
}

# 构建 Docker 镜像
build() {
    echo -e "${YELLOW}[1/4] 构建 Docker 镜像...${NC}"
    check_env_file

    # 确定 API URL
    local api_url="$VITE_API_BASE_URL"
    if [ -z "$api_url" ]; then
        api_url="${ENV_API_URLS[$BUILD_ENV]}"
    fi

    echo -e "${BLUE}构建参数:${NC}"
    echo -e "  BUILD_ENV=${BUILD_ENV}"
    echo -e "  VITE_API_BASE_URL=${api_url}"

    docker build \
        --build-arg BUILD_ENV=${BUILD_ENV} \
        --build-arg VITE_API_BASE_URL="${api_url}" \
        -t ${IMAGE_NAME}:${IMAGE_TAG} \
        -f Dockerfile \
        .

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ 镜像构建成功${NC}"

        # 显示镜像信息
        echo -e "\n${BLUE}镜像信息:${NC}"
        local env_label=$(docker inspect ${IMAGE_NAME}:${IMAGE_TAG} --format='{{.Config.Labels.build.env}}' 2>/dev/null || echo "${BUILD_ENV}")
        echo -e "  环境: ${env_label}"
        echo -e "  镜像: ${IMAGE_NAME}:${IMAGE_TAG}"
    else
        echo -e "${RED}✗ 镜像构建失败${NC}"
        exit 1
    fi
}

# 推送镜像到仓库
push() {
    if [ -z "${REGISTRY}" ] || [ "${REGISTRY}" == "your-registry" ]; then
        echo -e "${YELLOW}警告: 未配置镜像仓库，跳过推送步骤${NC}"
        return
    fi

    echo -e "${YELLOW}[2/4] 打标签并推送镜像...${NC}"

    local full_image="${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"

    docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${full_image}
    docker push ${full_image}

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ 镜像推送成功: ${full_image}${NC}"
    else
        echo -e "${RED}✗ 镜像推送失败${NC}"
        exit 1
    fi
}

# 本地运行（使用 Docker Compose）
run_local() {
    echo -e "${YELLOW}[3/4] 使用 Docker Compose 启动服务...${NC}"

    # 创建临时 docker-compose 文件
    local compose_file="docker-compose.${BUILD_ENV}.yaml"
    cat > ${compose_file} <<EOF
version: '3.8'

services:
  bovo-admin:
    image: ${IMAGE_NAME}:${IMAGE_TAG}
    container_name: bovo-admin-${BUILD_ENV}
    restart: unless-stopped
    ports:
      - "8080:80"
    environment:
      - TZ=Asia/Shanghai
      - BUILD_ENV=${BUILD_ENV}
    networks:
      - bovo-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 10s
    labels:
      - "build.env=${BUILD_ENV}"

networks:
  bovo-network:
    driver: bridge
EOF

    if command -v docker-compose &> /dev/null; then
        docker-compose -f ${compose_file} up -d
    else
        docker compose -f ${compose_file} up -d
    fi

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ 服务启动成功${NC}"
        echo -e "${GREEN}访问地址: http://localhost:8080${NC}"
        echo -e "${YELLOW}使用 'docker compose -f ${compose_file} logs -f' 查看日志${NC}"
    else
        echo -e "${RED}✗ 服务启动失败${NC}"
        rm -f ${compose_file}
        exit 1
    fi
}

# 部署到 Kubernetes
deploy_k8s() {
    echo -e "${YELLOW}[4/4] 部署到 Kubernetes...${NC}"

    # 创建命名空间
    kubectl apply -f k8s/namespace.yaml

    # 更新镜像地址
    if [ -n "${REGISTRY}" ] && [ "${REGISTRY}" != "your-registry" ]; then
        local full_image="${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"

        # 备份原文件
        cp k8s/deployment.yaml k8s/deployment.yaml.bak

        # 更新镜像地址
        sed -i.bak "s|image: your-registry/bovo-admin:latest|image: ${full_image}|g" k8s/deployment.yaml

        # 添加环境标签
        sed -i "/labels:/a\        build.env: ${BUILD_ENV}" k8s/deployment.yaml
    fi

    # 部署所有资源
    kubectl apply -f k8s/

    # 等待部署完成
    echo -e "${YELLOW}等待 Pod 启动...${NC}"
    kubectl wait --for=condition=ready pod -l app=bovo-admin -n ${NAMESPACE} --timeout=60s

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Kubernetes 部署成功${NC}"
        echo -e "${GREEN}环境: ${BUILD_ENV}${NC}"
        echo -e "${YELLOW}查看状态: kubectl get pods -n ${NAMESPACE}${NC}"
        echo -e "${YELLOW}查看日志: kubectl logs -f -n ${NAMESPACE} deployment/bovo-admin${NC}"

        # 恢复备份文件
        if [ -f k8s/deployment.yaml.bak ]; then
            mv k8s/deployment.yaml.bak k8s/deployment.yaml
        fi
    else
        echo -e "${RED}✗ Kubernetes 部署失败${NC}"
        echo -e "${YELLOW}查看详情: kubectl describe pod -n ${NAMESPACE}${NC}"

        # 恢复备份文件
        if [ -f k8s/deployment.yaml.bak ]; then
            mv k8s/deployment.yaml.bak k8s/deployment.yaml
        fi
        exit 1
    fi
}

# 验证环境参数
validate_env() {
    local env="$1"
    if [[ ! "$env" =~ ^(test|staging|production)$ ]]; then
        echo -e "${RED}错误: 无效的环境 '$env'${NC}"
        echo -e "${YELLOW}可选值: test, staging, production${NC}"
        exit 1
    fi
}

# 显示使用帮助
show_help() {
    echo "用法: $0 [命令] [环境]"
    echo ""
    echo "命令:"
    echo "  build  - 仅构建 Docker 镜像"
    echo "  push   - 构建并推送镜像到仓库"
    echo "  local  - 本地运行（使用 Docker Compose）"
    echo "  k8s    - 部署到 Kubernetes 集群"
    echo ""
    echo "环境 (可选，默认: production):"
    echo "  test       - 测试环境"
    echo "  staging    - 预发布环境"
    echo "  production - 生产环境"
    echo ""
    echo "环境变量:"
    echo "  IMAGE_NAME        - 镜像名称（默认: bovo-admin）"
    echo "  IMAGE_TAG         - 镜像标签（默认: latest）"
    echo "  REGISTRY          - 镜像仓库地址"
    echo "  NAMESPACE         - K8s 命名空间（默认: bovo-admin）"
    echo "  BUILD_ENV         - 构建环境（默认: production，命令行参数优先）"
    echo "  VITE_API_BASE_URL - API 地址（覆盖环境默认值）"
    echo ""
    echo "预设环境 API 地址:"
    echo "  test       -> http://47.250.175.7:8080"
    echo "  staging    -> http://staging-api.example.com"
    echo "  production -> http://47.250.175.7:8080"
    echo ""
    echo "示例:"
    echo "  # 使用命令行参数（推荐）"
    echo "  $0 build test           # 构建测试环境"
    echo "  $0 local staging        # 本地运行预发布环境"
    echo "  $0 k8s test             # 部署测试环境到 K8s"
    echo ""
    echo "  # 使用环境变量（兼容旧用法）"
    echo "  BUILD_ENV=test $0 build"
    echo ""
    echo "  # 自定义 API 地址"
    echo "  VITE_API_BASE_URL=http://custom-api.com $0 build test"
    echo ""
    echo "  # 完整示例"
    echo "  IMAGE_TAG=v1.0.0 REGISTRY=registry.example.com $0 k8s production"
}

# 主流程
main() {
    # 解析命令：$0 [命令] [环境?]
    local cmd="$1"
    local env="${2:-${BUILD_ENV:-production}}"  # 命令行参数优先，回退到环境变量，默认 production

    # 如果是帮助命令，直接显示帮助
    if [[ "$cmd" == "help" || "$cmd" == "--help" || "$cmd" == "-h" ]]; then
        show_help
        exit 0
    fi

    # 验证环境值
    validate_env "$env"

    # 更新 BUILD_ENV 变量供后续使用
    export BUILD_ENV="$env"

    # 显示当前配置
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  Bovo Admin Docker 部署脚本${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo -e "${BLUE}环境: ${YELLOW}${BUILD_ENV}${NC}"
    if [ -n "$VITE_API_BASE_URL" ]; then
        echo -e "${BLUE}API地址: ${YELLOW}${VITE_API_BASE_URL}${NC}"
    else
        echo -e "${BLUE}API地址: ${YELLOW}${ENV_API_URLS[$BUILD_ENV]}${NC}"
    fi
    echo -e "${GREEN}========================================${NC}"

    # 执行命令
    case "$cmd" in
        build)
            build
            ;;
        push)
            build
            push
            ;;
        local)
            build
            run_local
            ;;
        k8s)
            build
            push
            deploy_k8s
            ;;
        *)
            echo -e "${RED}错误: 未知命令 '$cmd'${NC}"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

main "$@"
