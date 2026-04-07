# 组件使用指南

## 核心组件库

本项目提供了一套核心组件库，用于快速构建后台管理页面。

## 1. CmBasePage - 通用列表页面组件

### 功能特性
- ✅ 列表数据展示
- ✅ 搜索过滤
- ✅ 分页功能
- ✅ 排序功能
- ✅ CRUD 操作按钮
- ✅ 工具栏自定义
- ✅ 树形表格支持
- ✅ 自动数据加载

### 基础用法

#### API 模式（自动加载数据）

```jsx
import CmBasePage from '@components/CmBasePage';

const UserPage = () => {
  const columns = [
    { title: '用户名', dataIndex: 'username', key: 'username', width: 150 },
    { title: '姓名', dataIndex: 'realname', key: 'realname', width: 120 },
  ];

  return (
    <CmBasePage
      columns={columns}
      apiEndpoint="/sysUsers/getList"
      apiMethod="post"
      rowKey="id"
    />
  );
};
```

#### 自定义数据加载模式

```jsx
const UserPage = () => {
  const loadData = async (params, sorter, filter) => {
    // 自定义数据加载逻辑
    const response = await customApi(params);
    return {
      data: response.data.list,
      success: true,
      total: response.data.total
    };
  };

  return (
    <CmBasePage
      columns={columns}
      onLoadData={loadData}
      rowKey="id"
    />
  );
};
```

### 完整配置示例

```jsx
<CmBasePage
  // === 基础配置 ===
  columns={columns}              // 列配置（必需）
  rowKey="id"                    // 行数据的唯一标识（必需）

  // === API 配置 ===
  apiEndpoint="/sysUsers/getList"  // API 端点
  apiMethod="post"                 // 请求方法：'get' | 'post'
  extraParams={{ type: 1 }}        // 额外的固定参数

  // === 搜索配置 ===
  searchVisible={true}            // 是否显示搜索区域
  searchFieldList={searchFieldList}  // 搜索字段配置

  // === 事件处理 ===
  onAdd={handleAdd}               // 新增按钮点击
  onEdit={handleEdit}             // 编辑按钮点击
  onDelete={handleDelete}         // 删除按钮点击
  onView={handleView}             // 查看按钮点击

  // === 操作按钮配置 ===
  actionButtons={{
    view: true,                   // 是否显示查看按钮
    edit: true,                   // 是否显示编辑按钮
    delete: true,                 // 是否显示删除按钮
  }}

  // === 工具栏配置 ===
  toolBarExtraButtons={[          // 额外的工具栏按钮
    <Button key="export">导出</Button>
  ]}

  // === 树形表格 ===
  expandable={{
    defaultExpandAllRows: true,
    childrenColumnName: 'children'
  }}
/>
```

### 列配置详解

```jsx
const columns = [
  {
    title: '用户名',           // 列标题
    dataIndex: 'username',    // 数据字段名
    key: 'username',          // 唯一标识
    width: 150,               // 列宽度
    align: 'center',          // 对齐方式：'left' | 'center' | 'right'
    sorter: true,             // 是否启用排序
    fixed: 'left',            // 固定列：'left' | 'right'

    // 自定义渲染
    render: (text, record, index) => {
      return <span>{text}</span>;
    },
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

### 搜索字段配置详解

```jsx
const searchFieldList = [
  {
    title: '用户名',              // 字段标签
    dataIndex: 'username',        // 数据字段名
    key: 'SEARCH_LIKE_username', // 搜索参数名
    type: 'text',                // 字段类型
  },
  {
    title: '状态',
    dataIndex: 'state',
    key: 'SEARCH_EQ_state',
    type: 'select',
    options: [                   // 选项（type: 'select' 时使用）
      { label: '正常', value: '0' },
      { label: '停用', value: '1' }
    ]
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'SEARCH_GTE_createTime',
    type: 'date',               // 日期类型：'date' | 'dateTime'
  },
  {
    title: '年龄',
    dataIndex: 'age',
    key: 'SEARCH_EQ_age',
    type: 'digit',              // 数字类型
  },
];
```

### 搜索字段命名规范

搜索参数名使用以下格式：

- `SEARCH_LIKE_字段名` - 模糊查询
- `SEARCH_EQ_字段名` - 精确查询
- `SEARCH_GTE_字段名` - 大于等于
- `SEARCH_LTE_字段名` - 小于等于

### 刷新表格

```jsx
// 触发表格刷新
document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
  new CustomEvent('reload')
);
```

## 2. DataForm - 通用表单组件

### 功能特性
- ✅ Modal 和 Drawer 两种形式
- ✅ 自动表单验证
- ✅ 支持查看模式（禁用）
- ✅ 自动状态管理
- ✅ 自定义表单内容

### 基础用法

```jsx
import DataForm from '@components/DataForm';

const UserPage = () => {
  const [formVisible, setFormVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = editingRecord
        ? await updateData(values)
        : await saveData(values);

      if (response.code === 0 || response.code === 200) {
        message.success('保存成功');
        setFormVisible(false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CmBasePage onAdd={() => setFormVisible(true)} />

      <DataForm
        visible={formVisible}
        title={editingRecord ? '编辑用户' : '新增用户'}
        initialValues={editingRecord || {}}
        extraValues={{ id: editingRecord?.id }}
        onCancel={() => setFormVisible(false)}
        onSubmit={handleSubmit}
        onClosed={() => setEditingRecord(null)}
        loading={loading}
      >
        <Form.Item
          name="username"
          label="用户名"
          rules={[{ required: true, message: '请输入用户名' }]}
        >
          <Input placeholder="请输入用户名" />
        </Form.Item>
      </DataForm>
    </>
  );
};
```

### 完整配置

```jsx
<DataForm
  // === 基础配置 ===
  visible={formVisible}           // 是否显示（必需）
  title="表单标题"                // 标题

  // === 数据配置 ===
  initialValues={editingRecord}   // 初始值
  extraValues={{ id: 1 }}        // 额外的隐藏字段

  // === 事件处理 ===
  onCancel={handleCancel}         // 取消回调
  onSubmit={handleSubmit}         // 提交回调
  onClosed={handleClosed}         // 关闭后回调（清理状态）

  // === 状态配置 ===
  loading={loading}               // 提交中状态
  disabled={false}                // 是否禁用（查看模式）

  // === 样式配置 ===
  formType="drawer"               // 形式：'modal' | 'drawer'
  width="80%"                     // 宽度
  drawerPlacement="right"         // 抽屉位置：'left' | 'right' | 'top' | 'bottom'
>
  {/* 表单内容 */}
</DataForm>
```

### 查看模式

```jsx
<DataForm
  visible={viewVisible}
  title="查看用户"
  initialValues={record}
  disabled={true}              // 禁用所有表单项
  onCancel={() => setViewVisible(false)}
  onClosed={() => setSelectedRecord(null)}
>
  {/* 表单内容将被禁用 */}
</DataForm>
```

## 3. CmUpload - 图片上传组件

### 功能特性
- ✅ 单图/多图上传
- ✅ 图片预览
- ✅ 图片删除
- ✅ 自动 Token 认证
- ✅ 自定义尺寸

### 基础用法

```jsx
import CmUpload from '@components/CmUpload';

<Form.Item
  name="coverImage"
  label="封面图"
  rules={[{ required: true, message: '请上传封面图' }]}
>
  <CmUpload />
</Form.Item>
```

### 完整配置

```jsx
<CmUpload
  multiple={false}           // 是否支持多图上传
  limit={5}                  // 最多上传数量
  width={148}                // 显示宽度
  height={148}               // 显示高度
  accept="image/jpeg,image/gif,image/png"  // 接受的文件类型
/>
```

### 多图上传

使用 `CmUploadMore` 组件：

```jsx
import CmUploadMore from '@components/CmUploadMore';

<Form.Item
  name="pictures"
  label="图集信息"
>
  <CmUploadMore />
</Form.Item>
```

### 上传地址配置

上传地址在组件内部配置：`/api/system/upload`

如需修改，请编辑 [CmUpload.jsx](../src/components/CmUpload.jsx) 文件。

## 4. CmEditor - 富文本编辑器

### 功能特性
- ✅ 富文本编辑
- ✅ 图片上传
- ✅ 视频插入
- ✅ 自定义工具栏
- ✅ 自定义高度

### 基础用法

```jsx
import CmEditor from '@components/CmEditor';

<Form.Item
  name="content"
  label="文章内容"
>
  <CmEditor height={500} />
</Form.Item>
```

### 配置

```jsx
<CmEditor
  height={500}              // 编辑器高度
  // 其他配置...
/>
```

## 5. CmImage - 图片组件

### 功能特性
- ✅ 图片预览
- ✅ 自定义尺寸
- ✅ 懒加载
- ✅ 错误处理

### 基础用法

```jsx
import CmImage from '@components/CmImage';

// 在表格列中使用
{
  title: '封面图',
  dataIndex: 'coverImage',
  render: (text) => <CmImage src={text} width={100} height={60} />
}
```

### 配置

```jsx
<CmImage
  src="image_url"           // 图片地址
  width={100}               // 宽度
  height={60}               // 高度
  preview={true}            // 是否可预览
/>
```

## 6. ProLayout - 布局组件

### 功能特性
- ✅ 顶部导航
- ✅ 侧边菜单
- ✅ 面包屑
- ✅ 主题切换
- ✅ 响应式布局

### 使用

布局组件在路由配置中自动使用，无需手动配置。

详见 [ProLayout.jsx](../src/components/ProLayout.jsx)

## 组合使用示例

### 完整的 CRUD 页面

```jsx
import React, { useState } from 'react';
import { message, Form, Input, Select } from 'antd';
import CmBasePage from '@components/CmBasePage';
import DataForm from '@components/DataForm';
import { getSysUserList, saveSysUser, updateSysUser, deleteSysUser } from '@api';

const UserPage = () => {
  const [formVisible, setFormVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);

  // 列配置
  const columns = [
    { title: '用户名', dataIndex: 'username', key: 'username', width: 150 },
    { title: '姓名', dataIndex: 'realname', key: 'realname', width: 120 },
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

  // 搜索字段配置
  const searchFieldList = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'SEARCH_LIKE_username',
      type: 'text',
    },
    {
      title: '状态',
      dataIndex: 'state',
      key: 'SEARCH_EQ_state',
      type: 'select',
      options: [
        { label: '正常', value: '0' },
        { label: '停用', value: '1' }
      ]
    },
  ];

  // 事件处理
  const handleAdd = () => {
    setEditingRecord(null);
    setFormVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormVisible(true);
  };

  const handleDelete = async (record) => {
    try {
      const response = await deleteSysUser({ id: record.id });
      if (response.code === 0 || response.code === 200) {
        message.success('删除成功');
        document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
          new CustomEvent('reload')
        );
      }
    } catch (error) {
      message.error('删除失败: ' + error.message);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = editingRecord
        ? await updateSysUser(values)
        : await saveSysUser(values);

      if (response.code === 0 || response.code === 200) {
        message.success(editingRecord ? '更新成功' : '创建成功');
        setFormVisible(false);
        document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
          new CustomEvent('reload')
        );
      } else {
        message.error(response.msg || '操作失败');
      }
    } catch (error) {
      message.error('操作失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <CmBasePage
        columns={columns}
        apiEndpoint="/sysUsers/getList"
        apiMethod="post"
        searchFieldList={searchFieldList}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        rowKey="id"
      />

      <DataForm
        visible={formVisible}
        title={editingRecord ? '编辑用户' : '新增用户'}
        initialValues={editingRecord || {}}
        extraValues={{ id: editingRecord?.id }}
        onCancel={() => setFormVisible(false)}
        onSubmit={handleSubmit}
        onClosed={() => setEditingRecord(null)}
        loading={loading}
        formType="drawer"
      >
        <Form.Item
          name="username"
          label="用户名"
          rules={[{ required: true, message: '请输入用户名' }]}
        >
          <Input placeholder="请输入用户名" />
        </Form.Item>

        <Form.Item
          name="realname"
          label="姓名"
          rules={[{ required: true, message: '请输入姓名' }]}
        >
          <Input placeholder="请输入姓名" />
        </Form.Item>

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
      </DataForm>
    </div>
  );
};

export default UserPage;
```

## 最佳实践

### 1. 状态管理
```jsx
// ✅ 推荐 - 使用多个状态
const [formVisible, setFormVisible] = useState(false);
const [editingRecord, setEditingRecord] = useState(null);
const [loading, setLoading] = useState(false);

// ❌ 不推荐 - 使用复杂对象状态
const [state, setState] = useState({
  formVisible: false,
  editingRecord: null,
  loading: false
});
```

### 2. 事件处理
```jsx
// ✅ 推荐 - 每个操作独立处理
const handleAdd = () => {
  setEditingRecord(null);
  setFormVisible(true);
};

const handleEdit = (record) => {
  setEditingRecord(record);
  setFormVisible(true);
};

// ❌ 不推荐 - 合并处理
const handleOpenForm = (record = null) => {
  setEditingRecord(record);
  setFormVisible(true);
};
```

### 3. 刷新列表
```jsx
// ✅ 推荐 - 封装为函数
const refreshTable = () => {
  document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
    new CustomEvent('reload')
  );
};

// 使用
refreshTable();
```

## 常见问题

### 1. 表格不刷新
确保使用正确的选择器：
```jsx
document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
  new CustomEvent('reload')
);
```

### 2. 表单不回显
确保在 DataForm 打开时设置 initialValues：
```jsx
<DataForm
  visible={formVisible}
  initialValues={editingRecord || {}}
  // ...
/>
```

### 3. 图片上传失败
检查 Token 是否正确配置，确保 axios 拦截器正常工作。

### 4. 搜索功能不工作
确保 searchFieldList 配置正确，key 格式为 `SEARCH_类型_字段名`。
