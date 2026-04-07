/**
 * App.jsx - 应用主入口
 * 使用路由模块统一管理所有路由配置
 */

import { BrowserRouter as Router } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import { AuthProvider } from './contexts/AuthContext';
import { AppRoutes } from './router';

/**
 * 主应用组件
 */
const App = () => {
  return (
    <ConfigProvider>
      <AntdApp>
        <AuthProvider>
          <Router>
            <AppRoutes />
          </Router>
        </AuthProvider>
      </AntdApp>
    </ConfigProvider>
  );
};

export default App;
