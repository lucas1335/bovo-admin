# 开发规范文档

## 代码规范

### 1. 文件命名规范

#### 组件文件
- **页面组件**：使用 PascalCase，如 `UserManagement.jsx`
- **通用组件**：使用 PascalCase，以 `Cm` 前缀开头，如 `CmUpload.jsx`
- **工具函数**：使用 camelCase，如 `formatDate.js`

#### 目录结构
```
pages/
├── cm-system/          # 系统管理模块
│   ├── user.jsx        # 用户管理
│   ├── role.jsx        # 角色管理
│   └── components/     # 模块私有组件
│       └── UserForm.jsx
```

### 2. 组件开发规范

#### 2.1 函数式组件
使用 React Hooks，避免类组件：

```jsx
// ✅ 推荐 - 函数式组件 + Hooks
const UserPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  return <div>{/* 渲染内容 */}</div>;
};

// ❌ 不推荐 - 类组件
class UserPage extends React.Component {
  // ...
}
```

#### 2.2 组件结构
按照以下顺序组织组件代码：

```jsx
const MyComponent = ({ prop1, prop2 }) => {
  // 1. 状态声明
  const [state, setState] = useState(null);

  // 2. 引用
  const ref = useRef(null);

  // 3. 副作用
  useEffect(() => {
    // 副作用逻辑
  }, []);

  // 4. 派生状态/计算值
  const computedValue = useMemo(() => {
    return state * 2;
  }, [state]);

  // 5. 事件处理函数
  const handleClick = () => {
    // 处理逻辑
  };

  const handleSubmit = async (values) => {
    // 提交逻辑
  };

  // 6. 渲染函数
  return (
    <div>
      {/* JSX */}
    </div>
  );
};
```

### 3. 状态管理规范

#### 3.1 useState 使用
```jsx
// ✅ 推荐 - 明确的状态命名
const [formVisible, setFormVisible] = useState(false);
const [editingRecord, setEditingRecord] = useState(null);

// ❌ 不推荐 - 模糊的状态命名
const [visible, setVisible] = useState(false);
const [data, setData] = useState(null);
```

#### 3.2 useEffect 使用
```jsx
// ✅ 推荐 - 明确的依赖数组
useEffect(() => {
  fetchData();
}, [categoryId]); // categoryId 变化时重新执行

// ❌ 不推荐 - 空依赖数组但使用了外部变量
useEffect(() => {
  console.log(categoryId); // 缺少依赖
}, []);
```

### 4. API 调用规范

#### 4.1 导入 API
```jsx
// ✅ 推荐 - 按需导入
import { getSysUserList, saveSysUser } from '@api';

// ❌ 不推荐 - 导入整个模块
import * as Api from '@api/modules/system';
```

#### 4.2 异步处理
```jsx
// ✅ 推荐 - async/await + 错误处理
const handleSubmit = async (values) => {
  setLoading(true);
  try {
    const response = await saveSysUser(values);
    if (response.code === 0 || response.code === 200) {
      message.success('保存成功');
      // 后续处理
    } else {
      message.error(response.msg || '保存失败');
    }
  } catch (error) {
    message.error('操作失败: ' + error.message);
  } finally {
    setLoading(false);
  }
};

// ❌ 不推荐 - 缺少错误处理
const handleSubmit = async (values) => {
  const response = await saveSysUser(values);
  message.success('保存成功');
};
```

### 5. 路径别名规范

使用配置的路径别名，避免相对路径：

```jsx
// ✅ 推荐 - 使用路径别名
import { getSysUserList } from '@api';
import CmBasePage from '@components/CmBasePage';
import DataForm from '@components/DataForm';

// ❌ 不推荐 - 使用相对路径
import { getSysUserList } from '../../api/modules/system';
import CmBasePage from '../../components/CmBasePage';
```

## 组件使用规范

### 1. CmBasePage 使用规范

#### 1.1 基础使用（API 模式）
```jsx
<CmBasePage
  columns={columns}
  apiEndpoint="/sysUsers/getList"
  apiMethod="post"  // 或 'get'
  searchFieldList={searchFieldList}
  onAdd={handleAdd}
  onEdit={handleEdit}
  onDelete={handleDelete}
  rowKey="id"
/>
```

#### 1.2 自定义数据加载
```jsx
<CmBasePage
  columns={columns}
  onLoadData={loadData}
  searchFieldList={searchFieldList}
  // ...
/>
```

#### 1.3 列配置规范
```jsx
const columns = [
  {
    title: '用户名',
    dataIndex: 'username',
    key: 'username',
    width: 150,
    sorter: true,  // 启用排序
    align: 'center',  // 对齐方式
  },
  {
    title: '状态',
    dataIndex: 'state',
    key: 'state',
    width: 100,
    render: (state) => {
      // 自定义渲染
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

#### 1.4 搜索字段配置规范
```jsx
const searchFieldList = [
  {
    title: '用户名',
    dataIndex: 'username',
    key: 'SEARCH_LIKE_username',  // 搜索字段标识
    type: 'text',  // 字段类型
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
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'SEARCH_GTE_createTime',
    type: 'date',
  },
];
```

### 2. DataForm 使用规范

#### 2.1 基础使用
```jsx
<DataForm
  visible={formVisible}
  title={editingRecord ? '编辑用户' : '添加用户'}
  initialValues={editingRecord || {}}
  extraValues={{ id: editingRecord?.id }}
  onCancel={() => setFormVisible(false)}
  onSubmit={handleSubmit}
  onClosed={() => setEditingRecord(null)}
  loading={loading}
  formType="drawer"  // 或 'modal'
>
  <Form.Item
    name="username"
    label="用户名"
    rules={[{ required: true, message: '请输入用户名' }]}
  >
    <Input placeholder="请输入用户名" />
  </Form.Item>
</DataForm>
```

#### 2.2 查看模式
```jsx
<DataForm
  visible={viewVisible}
  title="查看用户"
  initialValues={record}
  disabled={true}  // 禁用所有表单项
  // ...
/>
```

### 3. 自定义组件使用规范

#### 3.1 CmUpload - 图片上传
```jsx
<Form.Item
  name="coverImage"
  label="封面图"
  rules={[{ required: true, message: '请上传封面图' }]}
>
  <CmUpload />
</Form.Item>

// 多图上传
<Form.Item
  name="pictures"
  label="图集"
>
  <CmUploadMore />
</Form.Item>
```

#### 3.2 CmEditor - 富文本编辑器
```jsx
<Form.Item
  name="content"
  label="文章内容"
>
  <CmEditor height={500} />
</Form.Item>
```

## 业务开发规范

### 1. 列表页面开发流程

#### 步骤 1：定义列配置
```jsx
const columns = [
  { title: '字段1', dataIndex: 'field1', key: 'field1', width: 150 },
  { title: '字段2', dataIndex: 'field2', key: 'field2', width: 150 },
  // ...
];
```

#### 步骤 2：定义搜索字段
```jsx
const searchFieldList = [
  {
    title: '搜索字段',
    dataIndex: 'searchField',
    key: 'SEARCH_LIKE_searchField',
    type: 'text',
  },
  // ...
];
```

#### 步骤 3：定义事件处理
```jsx
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
    const response = await deleteApi({ id: record.id });
    if (response.code === 0 || response.code === 200) {
      message.success('删除成功');
      // 触发表格刷新
      document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
        new CustomEvent('reload')
      );
    }
  } catch (error) {
    message.error('删除失败: ' + error.message);
  }
};
```

#### 步骤 4：渲染页面
```jsx
return (
  <div>
    <CmBasePage
      columns={columns}
      apiEndpoint="/api/endpoint"
      searchFieldList={searchFieldList}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
    <DataForm>{/* 表单内容 */}</DataForm>
  </div>
);
```

### 2. 表单提交规范

```jsx
const handleSubmit = async (values) => {
  setLoading(true);
  try {
    const response = editingRecord
      ? await updateData(values)
      : await saveData(values);

    if (response.code === 0 || response.code === 200) {
      message.success(editingRecord ? '更新成功' : '创建成功');
      setFormVisible(false);
      // 刷新列表
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
```

### 3. 状态码处理规范

```jsx
// ✅ 统一的成功判断
if (response.code === 0 || response.code === 200) {
  // 成功处理
}

// ✅ 统一的错误处理
else {
  message.error(response.msg || '操作失败');
}
```

## 性能优化规范

### 1. 使用 useMemo 缓存计算结果
```jsx
const treeData = useMemo(() => {
  return normalizeTreeData(classifyList);
}, [classifyList]);
```

### 2. 使用 useCallback 缓存函数
```jsx
const handleSelect = useCallback((id) => {
  setSelectedId(id);
}, []);
```

### 3. 避免不必要的渲染
```jsx
// ✅ 使用 ref 避免闭包陷阱
const categoryIdRef = useRef(null);
useEffect(() => {
  categoryIdRef.current = categoryId;
}, [categoryId]);
```

## 注释规范

### 1. 组件注释
```jsx
/**
 * 用户管理页面
 * 功能：用户列表、新增、编辑、删除
 */
const UserPage = () => {
  // ...
};
```

### 2. 函数注释
```jsx
/**
 * 处理表单提交
 * @param {Object} values - 表单数据
 */
const handleSubmit = async (values) => {
  // ...
};
```

### 3. 复杂逻辑注释
```jsx
// 构建分类Map用于显示分类名称
const map = new Map();
const buildMap = (items) => {
  items.forEach(item => {
    map.set(item.id, item);
    if (item.children && item.children.length > 0) {
      buildMap(item.children);
    }
  });
};
```

## 代码格式化

项目使用 ESLint 进行代码检查，运行以下命令：

```bash
npm run lint
```

确保代码符合规范后再提交。
