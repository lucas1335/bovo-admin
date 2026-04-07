/**
 * 路由模块主入口
 * 统一管理所有路由配置
 */

import { Suspense, useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { staticRoutes, loadDynamicComponent, getComponentPath } from './routesConfig';
import { ProtectedRoute, LoginRoute } from './guards';
import ProLayoutWrapper from '../components/ProLayout';

// 动态页面组件 - 用于渲染没有预定义组件的路由
const DynamicPage = () => {
  const location = useLocation();

  return (
    <div style={{ padding: '24px' }}>
      <h2>页面开发中</h2>
      <p>路径: {location.pathname}</p>
      <p>该页面尚未实现具体功能</p>
    </div>
  );
};

// 动态路由处理器组件
export const DynamicRouteHandler = () => {
  const location = useLocation();
  const [Component, setComponent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  console.log('🎯 DynamicRouteHandler 被渲染，当前路径:', location.pathname);

  // 移除前导斜杠并获取路径
  const path = location.pathname.substring(1);

  useEffect(() => {
    console.log('🚀 useEffect 触发，开始加载组件:', location.pathname);

    const loadComponent = async () => {
      try {
        setLoading(true);
        setError(false);

        // 根据URL路径获取对应的component路径
        const componentPath = getComponentPath(location.pathname);

        if (!componentPath) {
          console.warn(`No component mapping for: ${location.pathname}`);
          setError(true);
          return;
        }

        console.log(`🔍 Loading: ${location.pathname} -> ${componentPath}`);

        // 使用component路径加载组件
        const LoadedComponent = await loadDynamicComponent(componentPath);

        if (LoadedComponent) {
          setComponent(() => LoadedComponent);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Failed to load component:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadComponent();
  }, [location.pathname]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error || !Component) {
    // 如果加载失败（组件不存在），显示开发中页面
    return <DynamicPage />;
  }

  // 渲染加载的组件
  return <Component />;
};

// 应用路由配置组件
export const AppRoutes = () => {
  return (
    <Routes>
      {/* 登录页路由 - 公开路由 */}
      <Route
        path={staticRoutes.login.path}
        element={
          <LoginRoute>
            <Suspense fallback={<div>Loading...</div>}>
              <staticRoutes.login.component />
            </Suspense>
          </LoginRoute>
        }
      />

      {/* 受保护的路由 - 主应用 */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <ProLayoutWrapper />
          </ProtectedRoute>
        }
      >
        {/* 默认重定向到控制台 */}
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* 静态路由 - 系统页面 */}
        {Object.entries(staticRoutes)
          .filter(([key]) => key !== 'login') // 排除登录路由
          .map(([key, route]) => (
            <Route
              key={key}
              path={route.path.replace(/^\//, '')} // 移除前导斜杠
              element={
                <Suspense fallback={<div>Loading...</div>}>
                  <route.component />
                </Suspense>
              }
            />
          ))}

        {/* 动态路由 - 根据后台返回的路径动态渲染组件 */}
        <Route path="*" element={<DynamicRouteHandler />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
