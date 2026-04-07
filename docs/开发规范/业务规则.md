# 业务实现规则总结

本文档总结了从代码分析中提取的关键业务实现规则，后续开发应遵循这些规则。

## 1. 列表页面实现规则

### 1.1 标准列表结构

所有列表页面应遵循以下结构：

```jsx
import React, { useState } from 'react';
import { message } from 'antd';
import CmBasePage from '@components/CmBasePage';
import DataForm from '@components/DataForm';
import { apiMethods } from '@api';

const PageName = () => {
  // 1. 状态管理（按固定顺序）
  const [formVisible, setFormVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);

  // 2. 列配置
  const columns = [/* 列定义 */];

  // 3. 搜索配置
  const searchFieldList = [/* 搜索字段 */];

  // 4. 事件处理
  const handleAdd = () => { /* 新增逻辑 */ };
  const handleEdit = (record) => { /* 编辑逻辑 */ };
  const handleDelete = async (record) => { /* 删除逻辑 */ };
  const handleSubmit = async (values) => { /* 提交逻辑 */ };

  // 5. 渲染
  return (
    <div>
      <CmBasePage />
      <DataForm />
    </div>
  );
};
```

### 1.2 列配置规则

- **必须包含**：`title`, `dataIndex`, `key`
- **推荐配置**：`width`（固定宽度）
- **排序配置**：`sorter: true`
- **渲染函数**：复杂显示使用 `render`

```jsx
const columns = [
  {
    title: '用户名',
    dataIndex: 'username',
    key: 'username',
    width: 150,
    sorter: true,  // 启用排序
  },
  {
    title: '状态',
    dataIndex: 'state',
    key: 'state',
    width: 100,
    render: (state) => {
      const stateMap = {
        '0': { color: 'green', text: '正常' },
        '1': { color: 'orange', text: '停用' },
      };
      const status = stateMap[state] || { color: 'default', text: '未知' };
      return <Tag color={status.color}>{status.text}</Tag>;
    },
  },
];
```

### 1.3 搜索字段配置规则

搜索字段 key 必须使用 `SEARCH_操作类型_字段名` 格式：

```jsx
const searchFieldList = [
  {
    title: '用户名',
    dataIndex: 'username',
    key: 'SEARCH_LIKE_username',  // 模糊查询
    type: 'text',
  },
  {
    title: '状态',
    dataIndex: 'state',
    key: 'SEARCH_EQ_state',  // 精确查询
    type: 'select',
    options: [
      { label: '正常', value: '0' },
      { label: '停用', value: '1' }
    ]
  },
];
```

**搜索操作类型**：
- `SEARCH_LIKE_` - 模糊查询
- `SEARCH_EQ_` - 精确查询
- `SEARCH_GTE_` - 大于等于
- `SEARCH_LTE_` - 小于等于

### 1.4 事件处理规则

#### 新增/编辑按钮
```jsx
const handleAdd = () => {
  setEditingRecord(null);  // 清空编辑记录
  setFormVisible(true);    // 显示表单
};

const handleEdit = (record) => {
  setEditingRecord(record);  // 设置编辑记录
  setFormVisible(true);      // 显示表单
};
```

#### 删除操作
```jsx
const handleDelete = async (record) => {
  try {
    const response = await deleteApi({ id: record.id });
    if (response.code === 0 || response.code === 200) {
      message.success('删除成功');
      refreshTable();  // 刷新表格
    } else {
      message.error(response.msg || '删除失败');
    }
  } catch (error) {
    message.error('删除失败: ' + error.message);
  }
};
```

#### 刷新表格
```jsx
const refreshTable = () => {
  document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
    new CustomEvent('reload')
  );
};
```

## 2. 表单实现规则

### 2.1 DataForm 配置规则

```jsx
<DataForm
  visible={formVisible}                      // 必需：显示状态
  title={editingRecord ? '编辑' : '新增'}    // 必需：标题
  initialValues={editingRecord || {}}        // 必需：初始值
  extraValues={{ id: editingRecord?.id }}    // 隐藏字段（如 id）
  onCancel={() => setFormVisible(false)}     // 必需：取消回调
  onSubmit={handleSubmit}                     // 必需：提交回调
  onClosed={() => setEditingRecord(null)}    // 必需：关闭后清理
  loading={loading}                          // 必需：加载状态
  formType="drawer"                          // 可选：modal | drawer
  disabled={false}                           // 可选：查看模式
>
```

### 2.2 表单提交规则

```jsx
const handleSubmit = async (values) => {
  setLoading(true);
  try {
    const response = editingRecord
      ? await updateData(values)    // 编辑：调用更新接口
      : await saveData(values);     // 新增：调用保存接口

    if (response.code === 0 || response.code === 200) {
      message.success(editingRecord ? '更新成功' : '创建成功');
      setFormVisible(false);         // 关闭表单
      refreshTable();                // 刷新列表
    } else {
      message.error(response.msg || '操作失败');
    }
  } catch (error) {
    message.error('操作失败: ' + error.message);
  } finally {
    setLoading(false);               // 无论成功失败都重置加载状态
  }
};
```

### 2.3 表单字段规则

- **必填字段**：添加 `rules={[{ required: true, message: '...' }]}`
- **下拉选择**：使用 `Select` 组件，提供 `options`
- **开关类型**：使用 `Switch`，配置 `valuePropName="checked"`
- **富文本**：使用 `CmEditor` 组件
- **图片上传**：使用 `CmUpload` 组件

```jsx
// 文本输入
<Form.Item
  name="username"
  label="用户名"
  rules={[{ required: true, message: '请输入用户名' }]}
>
  <Input placeholder="请输入用户名" />
</Form.Item>

// 下拉选择
<Form.Item
  name="state"
  label="状态"
  rules={[{ required: true, message: '请选择状态' }]}
>
  <Select placeholder="请选择状态">
    <Select.Option value={0}>正常</Select.Option>
    <Select.Option value={1}>停用</Select.Option>
  </Select>
</Form.Item>

// 开关
<Form.Item
  name="mainFlag"
  label="首页标识"
  valuePropName="checked"
  getValueProps={(value) => ({ checked: value === 1 })}
  getValueFromEvent={(checked) => (checked ? 1 : 0)}
>
  <Switch checkedChildren="是" unCheckedChildren="否" />
</Form.Item>

// 图片上传
<Form.Item
  name="coverImage"
  label="封面图"
  rules={[{ required: true, message: '请上传封面图' }]}
>
  <CmUpload />
</Form.Item>
```

## 3. API 调用规则

### 3.1 API 定义规则

```javascript
// API 命名规范
export const get模块名List = (params) => apiService.get('/endpoint/getList', { params });
export const save模块名 = (data) => apiService.post('/endpoint/save', data);
export const update模块名 = (data) => apiService.post('/endpoint/update', data);
export const delete模块名 = (params) => apiService.post('/endpoint/delete', params);
```

### 3.2 列表查询规则

```javascript
// 列表查询参数结构
{
  pageNum: 1,                      // 当前页码
  pageSize: 10,                    // 每页数量
  searchParam: JSON.stringify({    // 搜索条件（JSON 字符串）
    SEARCH_LIKE_field: 'value',
    SEARCH_EQ_field: 'value'
  }),
  fieldName: true,                 // 排序字段（true: 升序, false: 降序）
}

// 响应数据处理
const list = response.data?.records || response.data?.list || response.data || [];
const total = response.data?.total || 0;
```

### 3.3 错误处理规则

```javascript
// 统一的成功判断
if (response.code === 0 || response.code === 200) {
  // 成功处理
} else {
  message.error(response.msg || '操作失败');
}

// try-catch 包装
try {
  const response = await apiCall(params);
  // 处理响应
} catch (error) {
  message.error('操作失败: ' + error.message);
}
```

## 4. 数据展示规则

### 4.1 状态映射规则

```javascript
// 使用对象映射显示状态
const stateMap = {
  '0': { color: 'green', text: '正常' },
  '1': { color: 'orange', text: '停用' },
  '2': { color: 'red', text: '删除' },
};
const status = stateMap[state] || { color: 'default', text: '未知' };
return <Tag color={status.color}>{status.text}</Tag>;
```

### 4.2 日期显示规则

```javascript
{
  title: '创建时间',
  dataIndex: 'createTime',
  key: 'createTime',
  width: 180,
  // 直接显示，CmBasePage 会自动格式化
}
```

### 4.3 图片显示规则

```javascript
import CmImage from '@components/CmImage';

{
  title: '封面图',
  dataIndex: 'coverImage',
  key: 'coverImage',
  width: 120,
  render: (text) => <CmImage src={text} width={100} height={60} />
}
```

## 5. 分类管理规则

### 5.1 左侧分类树结构

```jsx
<div className="page-container">
  {/* 左侧分类树 */}
  {!sidebarCollapsed && (
    <div className="page-sidebar">
      <CategoryTree
        value={selectedCategoryId}
        onSelect={handleCategorySelect}
      />
    </div>
  )}

  {/* 展开/收起按钮 */}
  <div
    className="sidebar-toggle-btn"
    onClick={handleToggleSidebar}
    style={{ left: sidebarCollapsed ? 0 : 280 }}
  >
    {sidebarCollapsed ? '»' : '«'}
  </div>

  {/* 右侧内容区 */}
  <div className="page-content">
    <CmBasePage />
  </div>
</div>
```

### 5.2 分类筛选规则

```jsx
// 使用 ref 存储最新的分类ID
const categoryIdRef = useRef(null);

// 当选择分类时更新
const handleCategorySelect = (categoryId) => {
  setSelectedCategoryId(categoryId);
  // 触发表格刷新
  setTimeout(() => {
    document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
      new CustomEvent('reload')
    );
  }, 0);
};

// 在数据加载函数中使用分类ID
const loadData = async (params) => {
  const currentCategoryId = categoryIdRef.current;
  if (currentCategoryId) {
    const searchParam = requestParams.searchParam
      ? JSON.parse(requestParams.searchParam)
      : {};
    searchParam.SEARCH_EQ_categoryId = currentCategoryId;
    requestParams.searchParam = JSON.stringify(searchParam);
  }
  // ...
};
```

## 6. 树形数据规则

### 6.1 树形数据清理

```javascript
// 清理树形数据中的空 children 字段
const cleanTreeData = (data) => {
  if (!Array.isArray(data)) return [];
  return data.map(item => {
    const newItem = { ...item };
    if (item.children && Array.isArray(item.children) && item.children.length > 0) {
      newItem.children = cleanTreeData(item.children);
    } else {
      delete newItem.children;  // 移除空的 children
    }
    return newItem;
  });
};
```

### 6.2 树形表格配置

```jsx
<CmBasePage
  expandable={{
    defaultExpandAllRows: true,
    childrenColumnName: 'children'
  }}
  // ...
/>
```

## 7. 组件使用规范

### 7.1 CmBasePage 使用规范

```jsx
<CmBasePage
  columns={columns}                    // 必需
  apiEndpoint="/api/endpoint"          // 二选一：使用 API 模式
  onLoadData={loadData}                // 二选一：使用自定义加载
  apiMethod="post"                     // API 模式时必需
  searchFieldList={searchFieldList}    // 可选
  onAdd={handleAdd}                    // 可选
  onEdit={handleEdit}                  // 可选
  onDelete={handleDelete}              // 可选
  rowKey="id"                          // 必需
  actionButtons={{                     // 可选
    view: true,
    edit: true,
    delete: true,
  }}
/>
```

### 7.2 DataForm 使用规范

```jsx
<DataForm
  visible={visible}                    // 必需
  title="标题"                         // 必需
  initialValues={data}                 // 必需
  extraValues={{ id: 1 }}              // 推荐：隐藏字段
  onCancel={handleCancel}              // 必需
  onSubmit={handleSubmit}              // 必需
  onClosed={handleClosed}              // 推荐：清理状态
  loading={loading}                    // 必需
  formType="drawer"                    // 可选：modal | drawer
  width="80%"                          // 可选
  disabled={false}                     // 可选：查看模式
>
  {/* 表单字段 */}
</DataForm>
```

## 8. 状态管理规范

### 8.1 状态声明顺序

```jsx
// 1. 表单显示状态
const [formVisible, setFormVisible] = useState(false);

// 2. 编辑记录状态
const [editingRecord, setEditingRecord] = useState(null);

// 3. 加载状态
const [loading, setLoading] = useState(false);

// 4. 其他业务状态
const [selectedCategoryId, setSelectedCategoryId] = useState(null);

// 5. 使用 ref 存储不需要触发重渲染的数据
const categoryIdRef = useRef(null);
```

### 8.2 useEffect 使用规范

```jsx
// 单次执行
useEffect(() => {
  fetchData();
}, []);

// 依赖特定值
useEffect(() => {
  if (formVisible) {
    fetchOptions();
  }
}, [formVisible]);

// 同步更新 ref
useEffect(() => {
  categoryIdRef.current = selectedCategoryId;
}, [selectedCategoryId]);
```

## 9. 命名规范

### 9.1 组件命名

```jsx
// 页面组件：使用 PascalCase
const UserPage = () => { };

// 子组件：使用 PascalCase
const UserForm = () => { };

// 导出
export default UserPage;
```

### 9.2 变量命名

```javascript
// 状态变量：使用 camelCase，以 set 开头
const [formVisible, setFormVisible] = useState(false);

// 事件处理函数：使用 handle 开头
const handleAdd = () => { };
const handleSubmit = async (values) => { };

// 数据获取函数：使用 fetch 开头
const fetchUsers = async () => { };

// 布尔变量：使用 is/has 开头
const isVisible = true;
const hasPermission = false;
```

### 9.3 文件命名

```
// 页面组件：PascalCase.jsx
UserManagement.jsx
RoleManagement.jsx

// 通用组件：Cm + PascalCase.jsx
CmBasePage.jsx
CmUpload.jsx

// 工具文件：camelCase.js
formatDate.js
request.js
```

## 10. 代码组织规范

### 10.1 导入顺序

```javascript
// 1. React 相关
import React, { useState, useEffect } from 'react';

// 2. 第三方库
import { message, Form, Input } from 'antd';
import { useNavigate } from 'react-router-dom';

// 3. 通用组件
import CmBasePage from '@components/CmBasePage';
import DataForm from '@components/DataForm';

// 4. 业务组件
import CategoryTree from './components/CategoryTree';

// 5. API
import { getSysUserList, saveSysUser } from '@api';

// 6. 工具函数
import { formatDate } from '@utils/formatDate';

// 7. 样式
import './UserPage.css';
```

### 10.2 组件内部顺序

```jsx
const ComponentName = ({ props }) => {
  // 1. Hooks（useState, useRef, 等）
  const [state, setState] = useState(null);

  // 2. useEffect
  useEffect(() => { }, []);

  // 3. 派生状态（useMemo, useCallback）
  const computedValue = useMemo(() => { }, [deps]);

  // 4. 事件处理函数
  const handleClick = () => { };

  // 5. 渲染函数
  return <div>{/* JSX */}</div>;
};
```

## 11. 错误处理规范

### 11.1 API 错误处理

```javascript
// 标准 try-catch 模式
const handleSubmit = async (values) => {
  setLoading(true);
  try {
    const response = await apiCall(values);
    if (response.code === 0 || response.code === 200) {
      message.success('操作成功');
      // 后续处理
    } else {
      message.error(response.msg || '操作失败');
    }
  } catch (error) {
    message.error('操作失败: ' + error.message);
  } finally {
    setLoading(false);
  }
};
```

### 11.2 数据验证

```javascript
// 在发送请求前验证数据
const handleSubmit = async (values) => {
  if (!values.username) {
    message.error('请输入用户名');
    return;
  }

  // 继续处理
};
```

## 12. 性能优化规范

### 12.1 使用 useMemo

```javascript
// 缓存计算结果
const treeData = useMemo(() => {
  return normalizeTreeData(classifyList);
}, [classifyList]);

// 缓存选项
const options = useMemo(() => {
  return list.map(item => ({
    label: item.name,
    value: item.id
  }));
}, [list]);
```

### 12.2 使用 useCallback

```javascript
// 缓存事件处理函数
const handleSelect = useCallback((id) => {
  setSelectedId(id);
}, []);
```

### 12.3 避免不必要的重渲染

```javascript
// 使用 ref 存储值，避免闭包问题
const categoryIdRef = useRef(null);
useEffect(() => {
  categoryIdRef.current = categoryId;
}, [categoryId]);
```

## 总结

以上规则总结了项目中的核心业务实现规范。在开发新功能时，请严格遵循这些规则：

1. **列表页面**：使用 CmBasePage，遵循标准结构
2. **表单处理**：使用 DataForm，遵循事件处理规则
3. **API 调用**：统一错误处理，遵循命名规范
4. **状态管理**：按固定顺序声明状态，正确使用 useEffect
5. **代码组织**：遵循导入顺序和组件内部顺序
6. **性能优化**：合理使用 useMemo 和 useCallback

遵循这些规则可以确保代码的一致性、可维护性和可读性。
