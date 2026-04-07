/**
 * 精确计算工具函数
 * 用于处理浮点数运算的精度问题
 */

/**
 * 加法
 */
export const _add = (a, b) => {
  const aDecimals = (a.toString().split('.')[1] || '').length;
  const bDecimals = (b.toString().split('.')[1] || '').length;
  const maxDecimals = Math.max(aDecimals, bDecimals);
  const factor = Math.pow(10, maxDecimals);
  return (Math.round(a * factor) + Math.round(b * factor)) / factor;
};

/**
 * 减法
 */
export const _sub = (a, b) => {
  const aDecimals = (a.toString().split('.')[1] || '').length;
  const bDecimals = (b.toString().split('.')[1] || '').length;
  const maxDecimals = Math.max(aDecimals, bDecimals);
  const factor = Math.pow(10, maxDecimals);
  return (Math.round(a * factor) - Math.round(b * factor)) / factor;
};

/**
 * 乘法
 */
export const _mul = (a, b) => {
  const aDecimals = (a.toString().split('.')[1] || '').length;
  const bDecimals = (b.toString().split('.')[1] || '').length;
  const factor = Math.pow(10, aDecimals + bDecimals);
  return (Math.round(a * Math.pow(10, aDecimals)) * Math.round(b * Math.pow(10, bDecimals))) / factor;
};

/**
 * 除法
 */
export const _div = (a, b) => {
  const aDecimals = (a.toString().split('.')[1] || '').length;
  const bDecimals = (b.toString().split('.')[1] || '').length;
  const factor = Math.pow(10, Math.max(aDecimals, bDecimals));
  return (Math.round(a * factor) / Math.round(b * factor));
};

/**
 * 保留小数位
 */
export const _toFixed = (num, decimals = 2) => {
  return Number(num.toFixed(decimals));
};
