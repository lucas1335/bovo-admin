/**
 * API 模块统一导出
 *
 * 使用方式:
 * 1. 导入单个方法: import { getSysUserList, saveArticle } from '@api';
 * 2. 导入整个模块: import * as SystemApi from '@api';
 */

import apiService from './base';

// ==================== 认证模块 API ====================
export * from './modules/auth';

// ==================== 系统模块 API ====================
export * from './modules/system';

// ==================== 文章模块 API ====================
export * from './modules/article';

// ==================== Portal模块 API ====================
export * from './modules/portal';

// ==================== 墨小帮业务模块 API ====================
export * from './modules/moxb';

// ==================== 订单模块 API ====================
export * from './modules/order';

// ==================== 币种管理模块 API ====================
export * from './modules/coin';

// ==================== 帮助中心模块 API ====================
export * from './modules/help';

// ==================== 资产管理模块 API ====================
export * from './modules/asset';
// ==================== 充值订单模块 API ====================
export * from './modules/recharge';

// ==================== 提现订单模块 API ====================
export * from './modules/withdraw';


// ==================== 银行卡管理模块 API ====================
export * from './modules/bank';

// ==================== 理财产品模块 API ====================
export * from './modules/financial';

// ==================== 交易对配置模块 API ====================
export * from './modules/trading';

// ==================== U本位合约管理模块 API ====================
export * from './modules/ucontract';

// ==================== 抵押借贷模块 API ====================
export * from './modules/pledge';

// ==================== 认证管理模块 API ====================
export * from './modules/certified';

// ==================== 佣金管理模块 API ====================
export * from './modules/commission';

// ==================== NFT管理模块 API ====================
export * from './modules/nft';

// ==================== 新币认购模块 API ====================
export * from './modules/newcoin';

// ==================== 借贷管理模块 API ====================
export * from './modules/loan';

// ==================== 闪兑订单模块 API ====================
export * from './modules/quickly';

// ==================== OTC广告管理模块 API ====================
export * from './modules/otc';

// ==================== 社区管理模块 API ====================
export * from './modules/community';

// ==================== 自发币管理模块 API ====================
export * from './modules/spontaneousCoin';

// ==================== 数据统计模块 API ====================
export * from './modules/data';

// ==================== 工具模块 API ====================
export * from './modules/tool';

// ==================== 玩家管理模块 API ====================
export * from './modules/bussinessUser';

// ==================== 账变记录模块 API ====================
export * from './modules/record';

// ==================== 归集订单模块 API ====================
export * from './modules/collect';

// ==================== 钱包地址授权模块 API ====================
export * from './modules/info';

// ==================== 用户充值地址模块 API ====================
export * from './modules/userRecharge';

// ==================== 监控模块 API ====================
export * from './modules/monitor';

// ==================== DEFI管理模块 API ====================
export * from './modules/defi';

// ==================== 币种管理模块 API ====================
export * from './modules/symbolManage';
export * from './modules/klineSymbol';

// ==================== 控盘机器人模块 API ====================
export * from './modules/tradeRobot';

// ==================== 商户管理模块 API ====================
export * from './modules/merchandiser';

// ==================== 菜单管理模块 API ====================
export * from './modules/menu';

// ==================== 合约订单模块 API ====================
export * from './modules/contractOrder';

// ==================== 秒合约配置模块 API ====================
export * from './modules/secondPeriod';

// ==================== 秒合约订单模块 API ====================
export * from './modules/secondContractOrder';

// ==================== 取消跟单记录模块 API ====================
export * from './modules/cancelFollowLog';

// ==================== 代理管理模块 API ====================
export * from './modules/agent';

// ==================== 系统配置模块 API ====================
export * from './modules/config';

// ==================== 字典管理模块 API ====================
export * from './modules/dictType';
export * from './modules/dictData';

// ==================== 规则说明模块 API ====================
export * from './modules/setter';

// ==================== 基础 API 实例 ====================
export { apiService };

// ==================== 默认导出（兼容旧代码） ====================
export default {
  // 基础方法
  get: (url, params = {}) => apiService.get(url, { params }),
  post: (url, data = {}) => apiService.post(url, data),
  put: (url, data = {}) => apiService.put(url, data),
  delete: (url, params) => apiService.delete(url, params),
  patch: (url, data = {}) => apiService.patch(url, data),

  // axios 实例
  apiService,
};
