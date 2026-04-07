/**
 * 路由守卫组件
 * 提供路由保护功能：认证检查、权限检查等
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * 受保护的路由组件
 * 用于需要认证才能访问的路由
 * @param {Object} props - 组件属性
 * @param {ReactNode} props.children - 子组件
 * @param {string} props.requiredPermission - 需要的权限（可选）
 */
export const ProtectedRoute = ({ children, requiredPermission }) => {
  const { isAuthenticated, loading, user } = useAuth();

  // 如果还在检查认证状态，显示加载状态
  if (loading) {
    return <div>Loading...</div>;
  }

  // 如果未认证，重定向到登录页
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 如果需要权限检查且用户没有该权限，重定向到403页面
  if (requiredPermission && !user?.permissions?.includes(requiredPermission)) {
    return <Navigate to="/403" replace />;
  }

  return children;
};

/**
 * 登录路由组件
 * 用于登录页面，已登录用户访问时会重定向到首页
 * @param {Object} props - 组件属性
 * @param {ReactNode} props.children - 子组件
 */
export const LoginRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // 如果还在检查认证状态，显示加载状态
  if (loading) {
    return <div>Loading...</div>;
  }

  // 如果已认证，重定向到首页
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

/**
 * 公开路由组件
 * 不需要认证即可访问的路由
 * @param {Object} props - 组件属性
 * @param {ReactNode} props.children - 子组件
 */
export const PublicRoute = ({ children }) => {
  return children;
};
