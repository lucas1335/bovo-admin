# 佣金管理模块

## 概述

佣金管理模块提供了完整的佣金配置和记录查询功能，包括充值返佣、理财返佣的配置管理，以及佣金记录和结算记录的查询。

## 功能特性

### 1. 佣金配置管理 (`/cm-moxb/commission`)

#### 1.1 充值返佣配置
- **返点比例**: 设置用户充值时获得的返点比例（0-100%）
- **最大值**: 设置单次充值可获得的返点金额上限
- **启用状态**: 控制充值返佣功能的开启/关闭

#### 1.2 理财返佣配置
- **一级返点比例**: 直接推荐用户购买理财产品的返点比例
- **二级返点比例**: 下级用户推荐其他人购买理财产品的返点比例
- **三级返点比例**: 三级用户推荐其他人购买理财产品的返点比例
- **启用状态**: 控制理财返佣功能的开启/关闭

#### 1.3 佣金统计
- 今日佣金总额
- 本月佣金总额
- 待结算佣金
- 累计佣金总额
- 佣金来源统计（充值、理财、交易、其他）

### 2. 佣金记录查询 (`/cm-moxb/commission/records`)

#### 2.1 佣金记录
- 用户名、手机号查询
- 佣金类型筛选（充值返佣、理财返佣、交易返佣、其他返佣）
- 佣金状态筛选（待结算、结算中、已结算、已失效）
- 创建时间范围查询
- 详细的佣金记录展示

#### 2.2 结算记录
- 用户名、手机号查询
- 结算单号查询
- 结算状态筛选（待审核、审核中、已通过、已拒绝）
- 申请时间范围查询
- 详细的结算记录展示

## 文件结构

```
src/pages/cm-moxb/commission/
├── index.jsx          # 佣金管理主页面（配置和统计）
├── index.css          # 主页面样式
├── records.jsx        # 佣金记录查询页面
├── records.css        # 记录查询页面样式
└── README.md          # 本文档
```

## API 接口

### 配置相关
```javascript
import { getCommissionConfig, saveCommissionConfig } from '@api';

// 获取充值返佣配置
const response = await getCommissionConfig('RECHARGE_REBATE_SETTING');

// 保存充值返佣配置
const response = await saveCommissionConfig('RECHARGE_REBATE_SETTING', JSON.stringify(configData));

// 获取理财返佣配置
const response = await getCommissionConfig('FINANCIAL_REBATE_SETTING');

// 保存理财返佣配置
const response = await saveCommissionConfig('FINANCIAL_REBATE_SETTING', JSON.stringify(configData));
```

### 记录查询相关
```javascript
import { getCommissionRecordList, getCommissionSettlementList } from '@api';

// 获取佣金记录列表
const response = await getCommissionRecordList({ pageNum, pageSize, searchParam });

// 获取结算记录列表
const response = await getCommissionSettlementList({ pageNum, pageSize, searchParam });
```

### 统计相关
```javascript
import { getCommissionStatistics } from '@api';

// 获取佣金统计数据
const response = await getCommissionStatistics({});
```

## 数据字段说明

### 充值返佣配置
```javascript
{
  ratio: 5.00,              // 返点比例 (%)
  rebateMaxAmount: 1000.00, // 最大返点金额
  isOpen: true              // 是否启用
}
```

### 理财返佣配置
```javascript
{
  oneRatio: 3.00,    // 一级返点比例 (%)
  twoRatio: 2.00,    // 二级返点比例 (%)
  threeRatio: 1.00,  // 三级返点比例 (%)
  isOpen: true       // 是否启用
}
```

### 佣金记录
```javascript
{
  userName: '张三',
  userPhone: '13800138000',
  commissionType: 1,        // 1:充值返佣 2:理财返佣 3:交易返佣 4:其他返佣
  commissionAmount: 50.00,  // 佣金金额
  ratio: 5.00,              // 返点比例
  status: 2,                // 0:待结算 1:结算中 2:已结算 3:已失效
  orderNo: 'ORD202401011234567890',
  createTime: '2024-01-01 12:00:00',
  settleTime: '2024-01-02 10:00:00',
  remark: '备注信息'
}
```

### 结算记录
```javascript
{
  settleNo: 'STL202401011234567890',
  userName: '张三',
  userPhone: '13800138000',
  settleAmount: 500.00,     // 结算金额
  commissionCount: 10,      // 佣金笔数
  status: 2,                // 0:待审核 1:审核中 2:已通过 3:已拒绝
  applyTime: '2024-01-01 12:00:00',
  auditTime: '2024-01-02 10:00:00',
  auditor: '管理员',
  auditRemark: '审核通过'
}
```

## 使用说明

### 1. 配置佣金
1. 访问 `/cm-moxb/commission` 页面
2. 选择对应的配置标签页（充值返佣或理财返佣）
3. 设置相应的参数
4. 点击"保存配置"按钮
5. 系统会提示保存成功并刷新配置

### 2. 查询佣金记录
1. 访问 `/cm-moxb/commission/records` 页面
2. 选择"佣金记录"或"结算记录"标签页
3. 使用搜索条件筛选数据
4. 点击"查看"按钮查看详细信息

### 3. 查看统计
1. 访问 `/cm-moxb/commission` 页面
2. 点击"佣金统计"标签页
3. 查看各类统计数据
4. 点击快捷操作按钮跳转到详细记录

## 业务规则

1. **返点比例范围**: 所有返点比例必须在 0-100% 之间
2. **最大返点金额**: 充值返点最大值不能为负数
3. **配置生效**: 配置保存后立即生效，无需重启系统
4. **状态控制**: 关闭返佣开关后，新产生的业务不会计算佣金
5. **金额精度**: 所有金额保留两位小数
6. **结算规则**: 佣金的结算周期和规则由后端业务逻辑控制

## 注意事项

1. 修改配置后，建议先在测试环境验证
2. 关闭返佣功能会影响用户体验，请谨慎操作
3. 定期查看佣金统计，及时发现异常情况
4. 保留配置修改的审计日志
5. 大额佣金结算建议人工审核

## 技术实现

- **前端框架**: React 18
- **UI组件库**: Ant Design 5.x
- **表格组件**: ProTable (Ant Design Pro)
- **状态管理**: React Hooks (useState, useEffect)
- **路由**: React Router v6
- **API请求**: Axios

## 更新日志

### v1.0.0 (2024-03-31)
- 初始版本发布
- 实现充值返佣配置功能
- 实现理财返佣配置功能
- 实现佣金记录查询功能
- 实现结算记录查询功能
- 实现佣金统计功能
