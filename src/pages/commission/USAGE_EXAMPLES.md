# 佣金管理模块使用示例

## 路由配置示例

```javascript
// 在路由配置文件中添加佣金管理路由
{
  path: '/cm-moxb/commission',
  component: lazy(() => import('@/pages/cm-moxb/commission')),
  meta: {
    title: '佣金管理',
    icon: 'MoneyCollectOutlined',
    requireAuth: true,
  },
  children: [
    {
      path: '/cm-moxb/commission/records',
      component: lazy(() => import('@/pages/cm-moxb/commission/records')),
      meta: {
        title: '佣金记录',
        requireAuth: true,
      },
    },
  ],
}
```

## 菜单配置示例

```javascript
// 在菜单配置中添加佣金管理菜单
{
  key: 'cm-moxb-commission',
  path: '/cm-moxb/commission',
  name: '佣金管理',
  icon: 'MoneyCollectOutlined',
  children: [
    {
      key: 'cm-moxb-commission-config',
      path: '/cm-moxb/commission',
      name: '佣金配置',
    },
    {
      key: 'cm-moxb-commission-records',
      path: '/cm-moxb/commission/records',
      name: '佣金记录',
    },
  ],
}
```

## 权限配置示例

```javascript
// 在权限管理中配置佣金管理相关权限
{
  module: 'commission',
  permissions: [
    { key: 'commission:config:view', name: '查看佣金配置' },
    { key: 'commission:config:edit', name: '编辑佣金配置' },
    { key: 'commission:record:view', name: '查看佣金记录' },
    { key: 'commission:settlement:view', name: '查看结算记录' },
    { key: 'commission:settlement:audit', name: '审核结算' },
  ],
}
```

## API调用示例

### 1. 获取和保存佣金配置

```javascript
import { getCommissionConfig, saveCommissionConfig } from '@api';
import { message } from 'antd';

// 获取充值返佣配置
const fetchRechargeConfig = async () => {
  try {
    const response = await getCommissionConfig('RECHARGE_REBATE_SETTING');
    if (response.code === 0 || response.code === 200) {
      const config = response.data;
      console.log('充值返佣配置:', config);
      return config;
    }
  } catch (error) {
    message.error('获取配置失败');
  }
};

// 保存充值返佣配置
const saveRechargeConfig = async (config) => {
  try {
    const response = await saveCommissionConfig(
      'RECHARGE_REBATE_SETTING',
      JSON.stringify(config)
    );
    if (response.code === 0 || response.code === 200) {
      message.success('配置保存成功');
      return true;
    }
  } catch (error) {
    message.error('保存失败');
    return false;
  }
};

// 使用示例
const config = {
  ratio: 5.00,
  rebateMaxAmount: 1000.00,
  isOpen: true,
};

await saveRechargeConfig(config);
```

### 2. 查询佣金记录

```javascript
import { getCommissionRecordList } from '@api';

// 查询佣金记录
const fetchCommissionRecords = async () => {
  const params = {
    pageNum: 1,
    pageSize: 10,
    searchParam: JSON.stringify({
      SEARCH_LIKE_userName: '张三',
      SEARCH_EQ_commissionType: 1,
      SEARCH_GTE_createTime: '2024-01-01',
    }),
  };

  const response = await getCommissionRecordList(params);
  if (response.code === 0 || response.code === 200) {
    const records = response.data?.records || [];
    const total = response.data?.total || 0;
    console.log('佣金记录:', records);
    console.log('总数:', total);
  }
};
```

### 3. 查询结算记录

```javascript
import { getCommissionSettlementList } from '@api';

// 查询结算记录
const fetchSettlementRecords = async () => {
  const params = {
    pageNum: 1,
    pageSize: 10,
    searchParam: JSON.stringify({
      SEARCH_EQ_status: 0, // 待审核
      SEARCH_GTE_applyTime: '2024-01-01',
    }),
  };

  const response = await getCommissionSettlementList(params);
  if (response.code === 0 || response.code === 200) {
    const records = response.data?.records || [];
    const total = response.data?.total || 0;
    console.log('结算记录:', records);
  }
};
```

### 4. 获取统计数据

```javascript
import { getCommissionStatistics } from '@api';

// 获取佣金统计
const fetchStatistics = async () => {
  const response = await getCommissionStatistics({});
  if (response.code === 0 || response.code === 200) {
    const statistics = response.data;
    console.log('今日佣金:', statistics.todayTotal);
    console.log('本月佣金:', statistics.monthTotal);
    console.log('待结算佣金:', statistics.pendingTotal);
    console.log('累计佣金:', statistics.totalTotal);
  }
};
```

## 组件使用示例

### 1. 在其他页面中引用佣金配置页面

```javascript
import React from 'react';
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const SomePage = () => {
  const navigate = useNavigate();

  const goToCommissionConfig = () => {
    navigate('/cm-moxb/commission');
  };

  const goToCommissionRecords = () => {
    navigate('/cm-moxb/commission/records');
  };

  return (
    <div>
      <Button onClick={goToCommissionConfig}>配置佣金</Button>
      <Button onClick={goToCommissionRecords}>查看记录</Button>
    </div>
  );
};
```

### 2. 自定义佣金配置组件

```javascript
import React, { useEffect, useState } from 'react';
import { Form, InputNumber, Switch, Button, message } from 'antd';
import { getCommissionConfig, saveCommissionConfig } from '@api';

const CustomCommissionConfig = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const loadConfig = async () => {
    const response = await getCommissionConfig('RECHARGE_REBATE_SETTING');
    if (response.code === 0) {
      form.setFieldsValue(response.data);
    }
  };

  const saveConfig = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const response = await saveCommissionConfig(
        'RECHARGE_REBATE_SETTING',
        JSON.stringify(values)
      );
      if (response.code === 0) {
        message.success('保存成功');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  return (
    <Form form={form}>
      <Form.Item name="ratio" label="返点比例">
        <InputNumber />
      </Form.Item>
      <Form.Item name="isOpen" label="启用状态" valuePropName="checked">
        <Switch />
      </Form.Item>
      <Button onClick={saveConfig} loading={loading}>保存</Button>
    </Form>
  );
};
```

## 数据处理示例

### 1. 格式化金额显示

```javascript
// 格式化金额为货币格式
const formatAmount = (amount) => {
  if (amount == null) return '¥0.00';
  return `¥${Number(amount).toFixed(2)}`;
};

// 使用
const amount = 1234.5678;
console.log(formatAmount(amount)); // "¥1234.57"
```

### 2. 状态映射

```javascript
// 佣金状态映射
const commissionStatusMap = {
  0: { color: 'default', text: '待结算' },
  1: { color: 'processing', text: '结算中' },
  2: { color: 'green', text: '已结算' },
  3: { color: 'red', text: '已失效' },
};

// 使用
const getStatusTag = (status) => {
  const item = commissionStatusMap[status] || { color: 'default', text: '未知' };
  return <Tag color={item.color}>{item.text}</Tag>;
};
```

### 3. 数据验证

```javascript
// 验证返点比例
const validateRatio = (ratio) => {
  if (ratio == null || ratio === '') {
    return '请输入返点比例';
  }
  if (ratio < 0 || ratio > 100) {
    return '返点比例必须在0-100之间';
  }
  return null;
};

// 验证金额
const validateAmount = (amount) => {
  if (amount == null || amount === '') {
    return '请输入金额';
  }
  if (amount < 0) {
    return '金额不能为负数';
  }
  return null;
};
```

## 错误处理示例

```javascript
import { message } from 'antd';

// 统一的错误处理
const handleApiError = (error) => {
  console.error('API Error:', error);

  if (error.response) {
    // 服务器返回错误
    const { status, data } = error.response;
    switch (status) {
      case 400:
        message.error(data.message || '请求参数错误');
        break;
      case 401:
        message.error('未授权，请重新登录');
        break;
      case 403:
        message.error('没有权限执行此操作');
        break;
      case 500:
        message.error('服务器错误，请稍后重试');
        break;
      default:
        message.error(data.message || '操作失败');
    }
  } else if (error.request) {
    // 请求发送但没有响应
    message.error('网络错误，请检查网络连接');
  } else {
    // 其他错误
    message.error(error.message || '操作失败');
  }
};

// 使用
const fetchData = async () => {
  try {
    const response = await getCommissionConfig('RECHARGE_REBATE_SETTING');
    // 处理响应
  } catch (error) {
    handleApiError(error);
  }
};
```

## 最佳实践

1. **配置管理**
   - 修改配置前先获取当前配置
   - 保存成功后刷新本地配置
   - 记录配置变更日志

2. **数据查询**
   - 使用合适的搜索条件提高查询效率
   - 注意分页参数的设置
   - 缓存常用查询结果

3. **用户体验**
   - 加载时显示加载状态
   - 操作成功/失败给予明确提示
   - 长列表使用虚拟滚动

4. **安全考虑**
   - 配置修改需要相应权限
   - 敏感操作需要二次确认
   - 记录操作审计日志
