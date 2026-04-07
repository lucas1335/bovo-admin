# ============================================
# Stage 1: Build stage
# ============================================
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 定义构建参数
ARG BUILD_ENV=production
ARG VITE_API_BASE_URL=http://47.250.175.7:8080

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci && \
    npm cache clean --force

# 复制源代码
COPY . .

# 复制对应环境的 .env 文件为 .env.production（Vite 构建时读取）
RUN if [ "$BUILD_ENV" = "test" ]; then \
        cp .env.test .env.production; \
    elif [ "$BUILD_ENV" = "staging" ]; then \
        cp .env.staging .env.production; \
    else \
        cp .env.production .env.production; \
    fi

# 如果指定了 API_BASE_URL，覆盖配置
RUN if [ -n "$VITE_API_BASE_URL" ]; then \
        echo "VITE_API_BASE_URL=$VITE_API_BASE_URL" > .env.production; \
    fi

# 显示构建环境信息
RUN echo "Build Environment: $BUILD_ENV" && \
    echo "API Base URL: $(cat .env.production)"

# 构建生产版本
RUN npm run build

# ============================================
# Stage 2: Production stage
# ============================================
FROM nginx:alpine AS production

# 定义构建参数（用于标签）
ARG BUILD_ENV=production
ARG VITE_API_BASE_URL

# 安装 tzdata 设置时区
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone && \
    apk del tzdata

# 删除默认的 nginx 配置
RUN rm /etc/nginx/conf.d/default.conf

# 复制自定义 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 从构建阶段复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 添加环境信息标签（方便查看）
LABEL build.env="${BUILD_ENV}"
LABEL build.version="${BUILD_ENV}"

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# 启动 nginx（前台运行）
CMD ["nginx", "-g", "daemon off;"]
