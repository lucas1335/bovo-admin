import Cookies from 'js-cookie';

/**
 * 设置Cookie
 * @param {string} name - Cookie名称
 * @param {string} value - Cookie值
 * @param {number} expires - 过期时间（天）
 */
export function setCookie(name, value, expires = 30) {
  return Cookies.set(name, value, { expires });
}

/**
 * 获取Cookie
 * @param {string} name - Cookie名称
 * @returns {string|undefined} Cookie值
 */
export function getCookie(name) {
  return Cookies.get(name);
}

/**
 * 删除Cookie
 * @param {string} name - Cookie名称
 */
export function removeCookie(name) {
  return Cookies.remove(name);
}

/**
 * 清除所有登录相关的Cookie
 */
export function clearAuthCookies() {
  Cookies.remove('username');
  Cookies.remove('password');
  Cookies.remove('rememberMe');
}

export default Cookies;
