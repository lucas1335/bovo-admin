# 系统配置API调用规范

## 概述
系统配置类页面（如字典、通知、系统参数等）的API调用规范和迁移规则。

## API调用规范

### 1. 列表查询接口

**正确方式：使用 `onLoadData` 函数**
```javascript
const loadData = async (params) => {
  const response = await listXxx({
    pageNum: params.current || 1,
    pageSize: params.pageSize || 10,
    ...params
  });
  
  return {
    data: response.rows || [],
    success: true,
    total: response.total || 0
  };
};
```

**错误方式：使用 `apiEndpoint` 属性**
```javascript
// ❌ 不推荐
<CmBasePage
  apiEndpoint="/system/config/list"
  apiMethod="get"
/>
```

### 2. API响应数据结构

**标准响应结构**：
```javascript
{
  code: 0,          // 状态码：0=成功, 其他=失败
  msg: "success",   // 消息
  rows: [],         // 列表数据（注意：不是 response.data.rows）
  total: 0         // 总数（注意：不是 response.data.total）
}
```

**常见错误**：
- ❌ `response.data.rows` 
- ✅ `response.rows`

### 3. API函数命名规范

**对应关系**：
- 列表查询：`listXxx(params)`
- 新增：`addXxx(data)` 或 `saveXxx(data)`
- 修改：`updateXxx(data)`
- 删除：`delXxx(id)` 或 `deleteXxx(id)`

### 4. 字典类型管理（/system/dict）

**API模块**：`@api/modules/dictType.js`, `@api/modules/dictData.js`

**调用示例**：
```javascript
import { listType, addType, updateType, delType } from '@api/modules/dictType';
import { listData, addData, updateData, delData } from '@api/modules/dictData';
```

**字段映射**：
- dictId: 字典ID
- dictName: 字典名称
- dictType: 字典类型
- status: 状态（0=正常, 1=停用）

### 5. 通知公告管理（/system/notice）

**API模块**：`@api/modules/notice.js`

**调用示例**：
```javascript
import { listNotice, addNotice, updateNotice, delNotice, getTabList } from '@api/modules/notice';
```

**标签页逻辑**：
```javascript
// 1. 获取标签列表
const tabList = await getTabList();

// 2. 查询时传递key参数
const response = await listNotice({
  pageNum: 1,
  pageSize: 200,
  key: 'INFORMATION_NOTICE'  // 当前标签的key
});
```

**字段映射**：
- noticeId: 公告ID
- noticeTitle: 公告标题
- noticeType: 公告类型（1=通知, 2=公告）
- status: 状态（0=正常, 1=关闭）

### 6. 系统配置管理（/system/config）

**API模块**：`@api/modules/config.js`

**调用示例**：
```javascript
import { listConfig, addConfig, updateConfig, delConfig } from '@api/modules/config';
```

**字段映射**：
- configId: 参数ID
- configName: 参数名称
- configKey: 参数键名
- configValue: 参数键值

### 7. 菜单管理（/system/menu）

**API模块**：`@api/modules/menu.js`

**树形数据处理**：
```javascript
// 平行数据转树形结构
const handleTree = (data, id = 'menuId', parentId = 'parentId', children = 'children') => {
  // ... 实现见代码
};
```

**字段映射**：
- menuId: 菜单ID
- menuName: 菜单名称
- dictType: 菜单类型（M=目录, C=菜单, F=按钮）

### 8. 数据处理规范

#### 树形数据处理
```javascript
// 使用 handleTree 或类似函数处理平行数据
const treeData = handleTree(flatData, 'id', 'parentId', 'children');
```

#### 分页数据处理
```javascript
const loadData = async (params) => {
  const requestParams = {
    pageNum: params.current || 1,
    pageSize: params.pageSize || 10,
    ...params
  };
  // ...
};
```

## 常见错误和修复

### 错误1：导入的API函数不存在
**错误示例**：
```javascript
import { getSysConfigList, saveSysConfig } from '@api';
```

**修复方式**：
```javascript
// 正确导入
import { listConfig, addConfig } from '@api/modules/config';
```

### 错误2：数据路径错误
**错误示例**：
```javascript
data: response.data?.rows  // ❌
total: response.data?.total  // ❌
```

**修复方式**：
```javascript
data: response.rows  // ✅
total: response.total  // ✅
```

### 错误3：使用已废弃的apiEndpoint
**错误示例**：
```javascript
<CmBasePage apiEndpoint="/system/config/list" />
```

**修复方式**：
```javascript
<CmBasePage 
  onLoadData={(params) => loadData(params)}
/>
```

## 迁移检查清单

- [ ] 检查API导入是否正确（从 `@api/modules/xxx` 导入）
- [ ] 确认使用 `onLoadData` 而不是 `apiEndpoint`
- [ ] 验证响应数据路径使用 `response.rows` 而不是 `response.data.rows`
- [ ] 检查字段名是否与旧项目API一致
- [ ] 树形数据需要调用 `handleTree` 转换

## 相关文件

- `/system/dict` - 字典管理
- `/system/notice` - 通知公告
- `/system/config` - 系统配置
- `/system/menu` - 菜单管理
