# 路由配置指南

## 路由架构

本项目采用 React Router v6，支持静态路由和动态路由两种模式。

### 路由目录结构

```
src/router/
├── index.jsx            # 路由主入口
├── routesConfig.js      # 路由映射表
└── guards.jsx           # 路由守卫
```

## 静态路由配置

### 路由映射表

```javascript
// src/router/routesConfig.js

// 静态路由配置
export const staticRoutes = {
  // 公开路由
  login: {
    path: '/login',
    component: lazy(() => import('../pages/Login')),
  },

  // 受保护路由
  dashboard: {
    path: '/dashboard',
    component: lazy(() => import('../pages/Dashboard')),
  },

  // 系统设置模块
  profile: {
    path: '/profile',
    component: lazy(() => import('../pages/system-setting/Profile.jsx')),
  },
  system: {
    path: '/system',
    component: lazy(() => import('../pages/system-setting/SystemManagement.jsx')),
  },
  notifications: {
    path: '/notifications',
    component: lazy(() => import('../pages/system-setting/NotificationCenter.jsx')),
  },

  // 示例模块
  'form-demo': {
    path: '/form-demo',
    component: lazy(() => import('../pages/example/FormDemo.jsx')),
  },
  'role-management': {
    path: '/role-management',
    component: lazy(() => import('../pages/example/RoleManagement.jsx')),
  },
};
```

### 路由注册

```javascript
// src/router/index.jsx

export const AppRoutes = () => {
  return (
    <Routes>
      {/* 登录页路由 - 公开路由 */}
      <Route
        path={staticRoutes.login.path}
        element={
          <LoginRoute>
            <Suspense fallback={<div>Loading...</div>}>
              <staticRoutes.login.component />
            </Suspense>
          </LoginRoute>
        }
      />

      {/* 受保护的路由 - 主应用 */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <ProLayoutWrapper />
          </ProtectedRoute>
        }
      >
        {/* 默认重定向 */}
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* 静态路由 */}
        {Object.entries(staticRoutes)
          .filter(([key]) => key !== 'login')
          .map(([key, route]) => (
            <Route
              key={key}
              path={route.path.replace(/^\//, '')}
              element={
                <Suspense fallback={<div>Loading...</div>}>
                  <route.component />
                </Suspense>
              }
            />
          ))}

        {/* 动态路由 */}
        <Route path="*" element={<DynamicRouteHandler />} />
      </Route>
    </Routes>
  );
};
```

## 动态路由配置

### 动态组件加载

```javascript
// src/router/routesConfig.js

// 使用 import.meta.glob 预加载所有页面组件
const pageModules = import.meta.glob('../pages/**/*.jsx', {
  eager: false
});

// 动态路由加载函数
export const loadDynamicComponent = async (path) => {
  // 将路径转换为组件路径
  // 例如: 'cm-system/user' -> '../pages/cm-system/user.jsx'
  const componentPath = `../pages/${path}.jsx`;

  // 检查模块是否存在
  if (pageModules[componentPath]) {
    const module = await pageModules[componentPath]();
    return module.default;
  }

  throw new Error(`Component not found: ${componentPath}`);
};
```

### 动态路由处理器

```javascript
// src/router/index.jsx

export const DynamicRouteHandler = () => {
  const location = useLocation();
  const [Component, setComponent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // 移除前导斜杠并获取路径
  const path = location.pathname.substring(1);

  useEffect(() => {
    const loadComponent = async () => {
      try {
        setLoading(true);
        setError(false);

        // 动态加载组件
        const LoadedComponent = await loadDynamicComponent(path);

        if (LoadedComponent) {
          setComponent(() => LoadedComponent);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Failed to load component:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadComponent();
  }, [path]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error || !Component) {
    // 显示开发中页面
    return <DynamicPage />;
  }

  return <Component />;
};
```

## 路由守卫

### 认证守卫

```javascript
// src/router/guards.jsx

import { Navigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';

// 受保护的路由守卫
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    // 未登录，重定向到登录页
    return <Navigate to="/login" replace />;
  }

  return children;
};

// 登录路由守卫（已登录用户不能访问登录页）
export const LoginRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    // 已登录，重定向到首页
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
```

## 路由使用规范

### 页面文件命名

页面文件路径应与路由路径对应：

```
路由路径: /cm-system/user
文件路径: src/pages/cm-system/user.jsx

路由路径: /cm-portal/article/articleList
文件路径: src/pages/cm-portal/article/articleList.jsx
```

### 添加静态路由

#### 步骤 1：创建页面组件

```jsx
// src/pages/cm-system/user.jsx
import React from 'react';

const UserPage = () => {
  return <div>用户管理页面</div>;
};

export default UserPage;
```

#### 步骤 2：在 routesConfig.js 中注册

```javascript
// src/router/routesConfig.js
export const staticRoutes = {
  // ...其他路由
  'user-management': {
    path: '/cm-system/user',
    component: lazy(() => import('../pages/cm-system/user.jsx')),
  },
};
```

#### 步骤 3：在菜单中配置

```javascript
// src/config/menuConfig.jsx 或从后台获取菜单数据
{
  key: '/cm-system/user',
  icon: <UserOutlined />,
  name: '用户管理',
  path: '/cm-system/user'
}
```

### 添加动态路由

动态路由不需要手动注册，只需：

#### 步骤 1：创建页面组件

```jsx
// src/pages/cm-portal/product/product.jsx
import React from 'react';

const ProductPage = () => {
  return <div>产品管理页面</div>;
};

export default ProductPage;
```

#### 步骤 2：在后台配置菜单

在系统管理 -> 菜单管理中添加菜单项：
- 路径：`/cm-portal/product/product`
- 组件路径：自动匹配 `src/pages/cm-portal/product/product.jsx`

#### 步骤 3：系统自动加载

访问路径时，系统会自动加载对应的组件。

## 菜单配置

### 本地菜单配置

```javascript
// src/config/menuConfig.jsx
import { UserOutlined, SettingOutlined } from '@ant-design/icons';

export const menuConfig = [
  {
    key: 'system-management',
    icon: <SettingOutlined />,
    name: '系统管理',
    children: [
      {
        key: '/cm-system/user',
        icon: <UserOutlined />,
        name: '用户管理',
        path: '/cm-system/user'
      },
      {
        key: '/cm-system/role',
        icon: <TeamOutlined />,
        name: '角色管理',
        path: '/cm-system/role'
      }
    ]
  }
];
```

### 后台菜单配置

系统支持从后台获取菜单数据，菜单数据结构：

```javascript
{
  "code": 0,
  "msg": "成功",
  "data": [
    {
      "id": 1,
      "name": "系统管理",
      "path": "/system",
      "icon": "SettingOutlined",
      "children": [
        {
          "id": 2,
          "name": "用户管理",
          "path": "/cm-system/user",
          "icon": "UserOutlined"
        }
      ]
    }
  ]
}
```

## 路由传参

### URL 参数

```javascript
// 定义路由（需要修改 routesConfig.js）
'/cm-system/user/:id'

// 获取参数
const { id } = useParams();

// 生成链接
<Link to={`/cm-system/user/${userId}`}>用户详情</Link>
```

### Query 参数

```javascript
// 设置 Query 参数
navigate('/cm-system/user?id=123');

// 获取 Query 参数
const [searchParams] = useSearchParams();
const id = searchParams.get('id');
```

### 状态传递

```javascript
// 传递状态
navigate('/cm-system/user', {
  state: { from: 'dashboard' }
});

// 获取状态
const location = useLocation();
const from = location.state?.from;
```

## 编程式导航

### useNavigate Hook

```javascript
import { useNavigate } from 'react-router-dom';

const MyComponent = () => {
  const navigate = useNavigate();

  // 导航到指定路径
  const handleClick = () => {
    navigate('/cm-system/user');
  };

  // 返回上一页
  const goBack = () => {
    navigate(-1);
  };

  // 替换当前路径
  const replacePath = () => {
    navigate('/dashboard', { replace: true });
  };

  return <button onClick={handleClick}>跳转</button>;
};
```

### Link 组件

```javascript
import { Link } from 'react-router-dom';

// 基础使用
<Link to="/cm-system/user">用户管理</Link>

// 带状态
<Link to="/cm-system/user" state={{ id: 123 }}>
  用户详情
</Link>

// 替换模式
<Link to="/dashboard" replace>
  返回首页
</Link>
```

## 常见问题

### 1. 页面刷新后 404

**问题**：访问动态路由后刷新页面，出现 404 错误。

**解决方案**：
- 确保页面文件存在且路径正确
- 检查文件命名是否与路由路径匹配

### 2. 菜单不显示

**问题**：后台配置菜单后，前端不显示。

**解决方案**：
- 检查菜单数据格式是否正确
- 确认路由路径与页面文件路径对应
- 检查用户权限配置

### 3. 动态路由加载失败

**问题**：访问动态路由时显示"页面开发中"。

**解决方案**：
- 确认页面文件已创建
- 检查文件路径是否正确
- 查看浏览器控制台错误信息

### 4. 路由跳转不生效

**问题**：使用 navigate 跳转无效。

**解决方案**：
```javascript
// ✅ 正确使用
const navigate = useNavigate();
navigate('/path');

// ❌ 错误使用
const navigate = useNavigate();
navigate('/path', { push: true });  // v6 不支持 push 选项
```

## 最佳实践

### 1. 路由分层

```javascript
// ✅ 推荐 - 按模块分层
/cm-system/user
/cm-system/role
/cm-portal/article
/cm-portal/product

// ❌ 不推荐 - 扁平结构
/user
/role
/article
/product
```

### 2. 路由命名

```javascript
// ✅ 推荐 - 语义化
/cm-system/user         // 用户管理
/cm-portal/article/list // 文章列表

// ❌ 不推荐 - 无意义
/page1
/page2
```

### 3. 懒加载

```javascript
// ✅ 推荐 - 使用懒加载
component: lazy(() => import('../pages/UserPage'))

// ❌ 不推荐 - 直接导入
import UserPage from '../pages/UserPage'
```

### 4. 路由守卫

```javascript
// ✅ 推荐 - 使用路由守卫保护敏感页面
<Route path="/profile" element={
  <ProtectedRoute>
    <ProfilePage />
  </ProtectedRoute>
} />

// ❌ 不推荐 - 不使用守卫
<Route path="/profile" element={<ProfilePage />} />
```

## 开发流程

### 1. 创建新页面

```bash
# 1. 创建页面文件
touch src/pages/cm-system/dept.jsx

# 2. 编写页面组件
# 编辑 dept.jsx

# 3. 如果是静态路由，在 routesConfig.js 中注册
# 如果是动态路由，只需在后台配置菜单即可

# 4. 配置菜单（本地或后台）
```

### 2. 测试路由

```javascript
// 访问路由
http://localhost:3000/cm-system/dept

// 检查
- 页面是否正常加载
- 菜单是否正确显示
- 权限是否生效
```

### 3. 调试技巧

```javascript
// 在路由配置中添加日志
export const loadDynamicComponent = async (path) => {
  console.log('Loading component for path:', path);
  const componentPath = `../pages/${path}.jsx`;
  console.log('Component path:', componentPath);

  // ...
};
```

## 迁移指南

### 从 React Router v5 迁移到 v6

主要变化：

1. `<Switch>` 改为 `<Routes>`
2. `<Route component={...}>` 改为 `<Route element={...}>`
3. `useHistory()` 改为 `useNavigate()`
4. `<Redirect>` 改为 `<Navigate>`
5. 路由匹配算法改变，精确匹配需要显式指定

示例：

```javascript
// v5
<Switch>
  <Route path="/user" component={UserPage} />
  <Redirect from="/old" to="/new" />
</Switch>

// v6
<Routes>
  <Route path="/user" element={<UserPage />} />
  <Route path="/old" element={<Navigate to="/new" replace />} />
</Routes>
```
