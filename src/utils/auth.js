import Cookies from 'js-cookie';

const TokenKey = 'Admin-Token'; // 与旧项目保持一致

/**
 * 获取Token
 * 优先从Cookie获取（兼容旧项目），其次从localStorage
 * @returns {string|null} Token
 */
export function getToken() {
  return Cookies.get(TokenKey) || localStorage.getItem('token');
}

/**
 * 设置Token
 * 同时存储到Cookie和localStorage（确保兼容性）
 * @param {string} token - Token值
 */
export function setToken(token) {
  // 存储到Cookie，与旧项目保持一致
  Cookies.set(TokenKey, token);
  // 同时存储到localStorage，作为备用
  localStorage.setItem('token', token);
}

/**
 * 移除Token
 * 同时清除Cookie和localStorage
 */
export function removeToken() {
  Cookies.remove(TokenKey);
  localStorage.removeItem('token');
}

/**
 * 获取用户信息
 * @returns {object|null} 用户信息
 */
export function getUser() {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('解析用户信息失败:', error);
    return null;
  }
}

/**
 * 设置用户信息
 * @param {object} user - 用户信息
 */
export function setUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

/**
 * 移除用户信息
 */
export function removeUser() {
  localStorage.removeItem('user');
}

/**
 * 获取用户角色
 * @returns {array} 角色列表
 */
export function getRoles() {
  try {
    const roles = localStorage.getItem('roles');
    return roles ? JSON.parse(roles) : [];
  } catch (error) {
    console.error('解析角色信息失败:', error);
    return [];
  }
}

/**
 * 设置用户角色
 * @param {array} roles - 角色列表
 */
export function setRoles(roles) {
  localStorage.setItem('roles', JSON.stringify(roles));
}

/**
 * 获取用户权限
 * @returns {array} 权限列表
 */
export function getPermissions() {
  try {
    const permissions = localStorage.getItem('permissions');
    return permissions ? JSON.parse(permissions) : [];
  } catch (error) {
    console.error('解析权限信息失败:', error);
    return [];
  }
}

/**
 * 设置用户权限
 * @param {array} permissions - 权限列表
 */
export function setPermissions(permissions) {
  localStorage.setItem('permissions', JSON.stringify(permissions));
}

/**
 * 清除所有认证信息
 */
export function clearAuth() {
  removeToken();
  removeUser();
  localStorage.removeItem('roles');
  localStorage.removeItem('permissions');
}

/**
 * 检查是否已认证
 * @returns {boolean} 是否已认证
 */
export function isAuthenticated() {
  return !!getToken();
}

/**
 * 检查是否有指定权限
 * @param {string} permission - 权限标识
 * @returns {boolean} 是否有权限
 */
export function hasPermission(permission) {
  const permissions = getPermissions();
  return permissions.includes(permission);
}

/**
 * 检查是否有指定角色
 * @param {string} role - 角色标识
 * @returns {boolean} 是否有角色
 */
export function hasRole(role) {
  const roles = getRoles();
  return roles.includes(role);
}
