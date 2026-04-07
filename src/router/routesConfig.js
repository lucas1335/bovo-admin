/**
 * 路由映射表配置
 * 用于动态路由处理，将路径映射到对应的组件
 */

import { lazy } from 'react';

/**
 * 动态路由加载函数
 * 根据路径动态导入组件，不需要手动维护映射表
 * 使用方式：await loadDynamicComponent('cm-system/user')
 *
 * 注意：使用 Vite 的 import.meta.glob 特性实现真正的动态导入
 * Vite 会自动处理这些动态导入，并在构建时进行代码分割
 * @param {string} path - 页面路径（如：'cm-system/user'）
 * @returns {Promise<React.Component>} 返回一个 Promise，resolve 为加载的组件
 */

// 使用 import.meta.glob 预加载所有页面组件
// eager: false 表示懒加载，只有真正需要时才会加载
const pageModules = import.meta.glob('../pages/**/*.jsx', {
  eager: false
});

// 全局路由映射：URL路径 -> component路径
// 格式: { '/platform/record': 'bussiness/record/index' }
const ROUTE_MAP_STORAGE_KEY = 'routeComponentMap';

// 从localStorage加载路由映射
const loadRouteMapFromStorage = () => {
  try {
    const stored = localStorage.getItem(ROUTE_MAP_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

// 保存路由映射到localStorage
const saveRouteMapToStorage = (map) => {
  try {
    localStorage.setItem(ROUTE_MAP_STORAGE_KEY, JSON.stringify(map));
  } catch (error) {
    console.error('保存路由映射失败:', error);
  }
};

// 初始化路由映射（从localStorage加载）
let routeComponentMap = loadRouteMapFromStorage();

/**
 * 设置路由映射
 * @param {Object} map - 路由映射对象
 */
export const setRouteMap = (map) => {
  Object.assign(routeComponentMap, map);
  saveRouteMapToStorage(routeComponentMap);
  console.log('📋 路由映射已更新:', routeComponentMap);
};

/**
 * 根据URL路径获取component路径
 * @param {string} urlPath - URL路径（如：'/platform/record'）
 * @returns {string|null} component路径（如：'bussiness/record/index'）或null
 */
export const getComponentPath = (urlPath) => {
  const componentPath = routeComponentMap[urlPath];
  if (!componentPath) {
    console.warn(`⚠️ 未找到路由映射: ${urlPath}`);
    console.log('当前所有路由映射:', routeComponentMap);
  }
  return componentPath || null;
};

export const loadDynamicComponent = async (componentPath) => {
  console.log(`🔧 loadDynamicComponent: ${componentPath}`);

  // 处理后台返回的component路径，支持多种格式：
  // 1. 'bussiness/record/index' -> '../pages/bussiness/record/index.jsx'
  // 2. 'data/agency' -> '../pages/data/agency/index.jsx' (自动尝试添加/index)
  // 3. 'agency' -> '../pages/agency.jsx'

  // 先尝试直接路径
  let directPath = `../pages/${componentPath}.jsx`;
  console.log(`  尝试: ${directPath}`);
  if (pageModules[directPath]) {
    console.log(`  ✅ 找到模块`);
    const module = await pageModules[directPath]();
    return module.default;
  }

  // 如果路径不包含 /index，尝试添加 /index
  if (!componentPath.endsWith('/index')) {
    const indexPath = `../pages/${componentPath}/index.jsx`;
    console.log(`  尝试: ${indexPath}`);
    if (pageModules[indexPath]) {
      console.log(`  ✅ 找到模块`);
      const module = await pageModules[indexPath]();
      return module.default;
    }
  }

  // 尝试大小写不敏感匹配（处理 newCoin vs newcoin 等 Windows 文件系统问题）
  const allKeys = Object.keys(pageModules);
  const targetPath = `../pages/${componentPath}.jsx`;
  const targetIndexPath = `../pages/${componentPath}/index.jsx`;

  for (const key of allKeys) {
    if (key.toLowerCase() === targetPath.toLowerCase() || key.toLowerCase() === targetIndexPath.toLowerCase()) {
      console.log(`  ✅ 找到模块 (大小写适配): ${key}`);
      const module = await pageModules[key]();
      return module.default;
    }
  }

  // 如果都找不到，抛出错误
  console.error(`  ❌ 模块未找到`);
  throw new Error(`Component not found: ${componentPath}. Tried: ${directPath}, ../pages/${componentPath}/index.jsx`);
};

/**
 * 静态路由配置
 * 这些路由直接在 App.jsx 中配置，不需要通过动态路由处理
 */
export const staticRoutes = {
  // 公开路由
  login: {
    path: '/login',
    component: lazy(() => import('../pages/Login')),
  },

  // 受保护路由 - 系统页面
  dashboard: {
    path: '/dashboard',
    component: lazy(() => import('../pages/Dashboard')),
  },

  // system-setting 模块（个人中心、通知中心、系统配置）
  profile: {
    path: '/profile',
    component: lazy(() => import('../pages/system-setting/Profile.jsx')),
  },
  system: {
    path: '/system',
    component: lazy(() => import('../pages/system-setting/SystemManagement.jsx')),
  },
  notifications: {
    path: '/notifications',
    component: lazy(() => import('../pages/system-setting/NotificationCenter.jsx')),
  },

  // example 模块（示例页面，方便调试）
  'form-demo': {
    path: '/form-demo',
    component: lazy(() => import('../pages/example/FormDemo.jsx')),
  },
  'role-management': {
    path: '/role-management',
    component: lazy(() => import('../pages/example/RoleManagement.jsx')),
  },
};
