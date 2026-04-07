import React, { useState, useEffect } from 'react';
import { Avatar, Dropdown, Space, Badge, Typography, ConfigProvider, theme, Modal } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
  GlobalOutlined,
  SettingOutlined,
  DashboardOutlined,
  TeamOutlined,
  SafetyOutlined,
  KeyOutlined,
  LinkOutlined,
  HolderOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ProLayout } from '@ant-design/pro-layout';
import { useAuth } from '../contexts/AuthContext';
import { menuConfig } from '../config/menuConfig';
import SettingDrawer from './SettingDrawer';
import CustomBreadcrumb from './CustomBreadcrumb';
import Watermark from './Watermark';
import { getIconComponent } from '../config/iconConfig.jsx';
import apiService from '@api/base';
import { setRouteMap } from '../router/routesConfig';

const { Text } = Typography;

const ProLayoutWrapper = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(100);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openKeys, setOpenKeys] = useState([]);  
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('antd-pro-settings');
    return savedSettings ? JSON.parse(savedSettings) : {
      theme: 'light',
      primaryColor: '#1890ff',
      layout: 'mix',
      contentWidth: 'Fluid',
      fixedHeader: true,
      fixedSider: true,
      splitMenus: false,
      colorWeak: false,
      watermarkDisabled: false,
    };
  });
  const [settingDrawerVisible, setSettingDrawerVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // 处理菜单数据，将后台返回的菜单数据转换为适用于ProLayout的格式
  const processMenuData = (menuData, parentPath = '') => {
    return menuData.map(item => {
      // 构建完整路径
      let fullPath;
      if (item.path) {
        if (item.path.startsWith('/')) {
          // 绝对路径，直接使用
          fullPath = item.path;
        } else if (parentPath) {
          // 相对路径，拼接父级路径
          fullPath = `${parentPath}/${item.path}`.replace(/\/+/g, '/');
        } else {
          // 没有父级路径，添加前导斜杠
          fullPath = `/${item.path}`;
        }
      }

      const processedItem = {
        // 先展开原始数据，保留所有字段
        ...item,
        // 然后覆盖/转换需要的字段（注意顺序！）
        key: fullPath || item.id,
        name: item.meta?.title || item.name,  // 优先使用 meta.title
        path: fullPath,
        icon: getIconComponent(item.meta?.icon),
      };

      // 处理子菜单，传递完整路径作为父级路径
      if (item.children && item.children.length > 0) {
        processedItem.children = processMenuData(item.children, fullPath);
      }

      return processedItem;
    });
  };

  // 建立路由映射：URL路径 -> component路径
  const buildRouteMapping = (routes, parentPath = '') => {
    const mapping = {};

    routes.forEach(route => {
      // 构建完整路径
      let fullPath;
      if (route.path) {
        if (route.path.startsWith('/')) {
          // 绝对路径，直接使用
          fullPath = route.path;
        } else if (parentPath) {
          // 相对路径，拼接父级路径
          fullPath = `${parentPath}/${route.path}`.replace(/\/+/g, '/');
        } else {
          // 没有父级路径，添加前导斜杠
          fullPath = `/${route.path}`;
        }

        // 如果有 component 字段且不是特殊组件，建立映射
        if (route.component &&
            route.component !== 'Layout' &&
            route.component !== 'ParentView' &&
            route.component !== 'InnerLink') {
          mapping[fullPath] = route.component;
          // console.log(`📍 路由映射: ${fullPath} -> ${route.component}`);
        }
      }

      // 递归处理子路由
      if (route.children && route.children.length > 0) {
        Object.assign(mapping, buildRouteMapping(route.children, fullPath));
      }
    });

    return mapping;
  };

  // 自定义Hook处理菜单数据加载
  useEffect(() => {
    let isMounted = true;
    const loadMenuData = async () => {
      setLoading(true);
      try {
        // 调用获取路由菜单接口，对应旧项目: /system/menu/getRouters
        const response = await apiService.get('/system/menu/getRouters');
        // const response = await apiService.get('/getUserInfo');
        if (isMounted && (response.code === 0 || response.code === 200)) {
          // 从用户信息中获取菜单列表
          const menuList = response.data;
          // const menuList = response.data?.menuList || response.data?.menu || [];

          // 建立路由映射
          const routeMapping = buildRouteMapping(menuList);
          setRouteMap(routeMapping);

          // 处理菜单数据，将后台数据转换为适用于ProLayout的格式
          const processedMenuItems = processMenuData(menuList);

          // 创建dashboard菜单项
          const dashboardMenuItem = {
            key: 'dashboard',
            name: 'Dashboard',
            path: '/dashboard',
            icon: <DashboardOutlined />
          };

          // 将dashboard放在最前面，然后是处理后的菜单项，最后是menuConfig
          const finalMenuItems = [dashboardMenuItem, ...processedMenuItems, ...menuConfig];

          console.log('=== 菜单数据加载 ===');
          console.log('原始菜单数据 (menuList):', menuList);
          console.log('处理后的菜单项 (processedMenuItems):', processedMenuItems);
          console.log('最终菜单项 (finalMenuItems):', finalMenuItems);
          console.log('==================');
          setMenuItems(finalMenuItems);
        } else {
          // 出错时使用默认菜单配置并添加dashboard
          const dashboardMenuItem = {
            key: 'dashboard',
            name: 'Dashboard',
            path: '/dashboard',
            icon: <DashboardOutlined />
          };
          
          const finalMenuItems = [dashboardMenuItem, ...menuConfig];
          setMenuItems(finalMenuItems);
        }
      } catch (error) {
        if (isMounted) {
          console.error('获取用户信息和菜单数据失败:', error);
          // 出错时使用默认菜单配置并添加dashboard
          const dashboardMenuItem = {
            key: 'dashboard',
            name: 'Dashboard',
            path: '/dashboard',
            icon: <DashboardOutlined />
          };
          
          const finalMenuItems = [dashboardMenuItem, ...menuConfig];
          setMenuItems(finalMenuItems);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadMenuData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // 获取未读通知数量
  useEffect(() => {
    let isMounted = true;
    
    
    
    return () => {
      isMounted = false;
    };
  }, []);

  // 保存设置到localStorage
  useEffect(() => {
    localStorage.setItem('antd-pro-settings', JSON.stringify(settings));
  }, [settings]);

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'setting',
      icon: <SettingOutlined />,
      label: '系统设置',
      onClick: () => setSettingDrawerVisible(true),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => {
        Modal.confirm({
          title: '确认退出登录',
          content: '确定要退出当前登录账户吗？',
          okText: '确认',
          cancelText: '取消',
          onOk: () => {
            logout();
            // 登出后的导航将在App.jsx的路由保护组件中处理
          },
        });
      },
    },
  ];

  // 处理通知中心点击
  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  // 处理设置变化
  const handleSettingChange = (newSettings) => {
    setSettings(newSettings);
  };

  // 根据设置获取主题配置
  const getProLayoutTheme = () => {
    if (settings.theme === 'dark') {
      return 'realDark';
    }
    return 'light';
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: settings.primaryColor,
        },
        algorithm: settings.theme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <div style={settings.colorWeak ? { filter: 'invert(80%)' } : {}}>
         {/* className={`custom-sider-theme custom-sider-${settings.siderTheme}`} */}
        <ProLayout

          contentStyle={{
            padding: '16px 20px', // 上下 16px，左右 20px（可根据需求调整）
            background: 'transparent',
          }}
          title=""
          logo={
            <svg viewBox="0 0 160 40" fill="none" width="160" height="40" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="logoPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#1890ff', stopOpacity: 1 }} />
                  <stop offset="50%" style={{ stopColor: '#096dd9', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#0050b3', stopOpacity: 1 }} />
                </linearGradient>
                <linearGradient id="logoAccent" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: '#52c41a', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#73d13d', stopOpacity: 1 }} />
                </linearGradient>
                <linearGradient id="logoGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#1890ff', stopOpacity: 0.3 }} />
                  <stop offset="100%" style={{ stopColor: '#52c41a', stopOpacity: 0.3 }} />
                </linearGradient>
                <filter id="logoShadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#1890ff" floodOpacity="0.2"/>
                </filter>
              </defs>

              {/* Logo图标部分 - 左侧 */}
              <g filter="url(#logoShadow)">
                {/* 背景圆形 */}
                <circle cx="20" cy="20" r="18" fill="url(#logoGlow)" />

                {/* 上升趋势箭头 */}
                <path d="M8 26 L14 18 L18 22 L24 12 L32 12 L32 28 L8 28 Z" fill="url(#logoPrimary)" opacity="0.9"/>

                {/* 上涨K线蜡烛图 */}
                <rect x="22" y="14" width="3" height="10" fill="url(#logoAccent)" />
                <line x1="23.5" y1="11" x2="23.5" y2="26" stroke="url(#logoAccent)" strokeWidth="1.5" />

                <rect x="27" y="10" width="3" height="14" fill="url(#logoAccent)" />
                <line x1="28.5" y1="8" x2="28.5" y2="26" stroke="url(#logoAccent)" strokeWidth="1.5" />

                {/* 装饰点 */}
                <circle cx="12" cy="12" r="2" fill="#52c41a" opacity="0.8" />
                <circle cx="32" cy="8" r="1.5" fill="#52c41a" opacity="0.6" />
              </g>

              {/* BOVO文字部分 - 右侧 */}
              <g transform="translate(45, 25)">
                {/* BOVO 主文字 */}
                <text x="0" y="0" fontFamily="Arial, sans-serif" fontSize="22" fontWeight="bold" fill="url(#logoPrimary)" letterSpacing="1">
                  BOVO
                </text>

                {/* 交易所副标题 */}
                <text x="2" y="8" fontFamily="Arial, sans-serif" fontSize="6" fontWeight="500" fill="#8c8c8c" letterSpacing="2">
                  EXCHANGE
                </text>

                {/* 装饰线条 */}
                <line x1="2" y1="-10" x2="60" y2="-10" stroke="url(#logoAccent)" strokeWidth="1.5" opacity="0.6" />
                <circle cx="62" cy="-10" r="2" fill="url(#logoAccent)" />
              </g>

              {/* 右侧状态指示器 */}
              <g transform="translate(125, 8)">
                <circle cx="0" cy="0" r="4" fill="#52c41a">
                  <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="0" cy="0" r="6" fill="#52c41a" opacity="0.3">
                  <animate attributeName="r" values="4;8;4" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
                </circle>
              </g>
            </svg>
          }
          layout={settings.layout}
          theme={getProLayoutTheme()}
          contentWidth={settings.contentWidth}
          fixedHeader={settings.fixedHeader}
          fixSiderbar={settings.fixedSider}
          splitMenus={settings.splitMenus}
          collapsed={collapsed}
          onCollapse={setCollapsed}
          location={{
            pathname: location.pathname,
          }}
          menuDataRender={() => menuItems}
          openKeys={openKeys}
          onOpenChange={(keys) => {
            // 手风琴效果：只展开最新点击的菜单项
            const latestKey = keys.find(key => !openKeys.includes(key));
            if (latestKey) {
              setOpenKeys([latestKey]);
            } else {
              setOpenKeys(keys);
            }
          }}

          // 使用 token 进行更精细的控制
          token={{
            sider: {
              colorMenuBackground: '#001529', // 菜单背景色
              colorMenuItemDivider: '#002140', // 菜单项分割线颜色
              colorTextMenu: 'rgba(255, 255, 255, 0.65)', // 菜单文字颜色
              colorTextMenuSelected: '#fff', // 选中菜单文字颜色
              colorTextMenuActive: '#fff', // 激活菜单文字颜色
              colorBgMenuItemSelected: '#1890ff', // 选中菜单项背景色
              colorBgMenuItemHover: '#1890ff33', // 菜单项悬停背景色
            },
          }}
          menuProps={{
            loading: loading ? true : undefined
          }}
          
          menuItemRender={(item, dom) => (
            <div
              onClick={() => {
                if (item.path) {
                  // 处理外部链接
                  if (item.path.startsWith('http')) {
                    window.open(item.path, '_blank');
                  } else {
                    // 处理内部路由，确保路径以/开头
                    const normalizedPath = item.path.startsWith('/') ? item.path : `/${item.path}`;
                    navigate(normalizedPath);
                  }
                }
              }}
            >
              {dom}
            </div>
          )}
          avatarProps={{
            src: user?.avatar,
            title: user?.name,
            render: (props, dom) => (
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
                <Space style={{ cursor: 'pointer' }}>
                  <Avatar src={user?.avatar} icon={<UserOutlined />} />
                  <span>{user?.name}</span>
                </Space>
              </Dropdown>
            ),
          }}
          headerTitleRender={(logo, title, props) => {
            return (
              <div style={{ display: 'flex', alignItems: 'center', minHeight: '50px', flex: 1 }}>
                {logo}
                {title}
                <div style={{ marginLeft: '40px'  }}>
                  {/* <CustomBreadcrumb /> */}
                </div>
              </div>
            );
          }}
          actionsRender={(props) => {
            return [
              <Badge count={unreadCount} size="small" key="notification">
                <BellOutlined 
                  style={{ fontSize: '18px', cursor: 'pointer' }} 
                  onClick={handleNotificationClick}
                />
              </Badge>,
              // <GlobalOutlined key="language" style={{ fontSize: '18px', cursor: 'pointer' }} />,
              <SettingOutlined 
                key="settings" 
                style={{ fontSize: '18px', cursor: 'pointer' }} 
                onClick={() => setSettingDrawerVisible(true)} 
              />,
            ];
          }}
          breadcrumbRender={(routers = []) => [
            {
              path: '/',
              breadcrumbName: '首页',
            },
            ...routers,
          ]}
        >
          <Watermark
            content={user?.username ? `${user.username} - BOVO管理端` : 'BOVO管理端'}
            disabled={settings.watermarkDisabled}
          >
            <div style={{ padding: '0 px' }}>
              <Outlet />
            </div>
          </Watermark>
        </ProLayout>

        <SettingDrawer
          visible={settingDrawerVisible}
          onClose={() => setSettingDrawerVisible(false)}
          settings={settings}
          onSettingChange={handleSettingChange}
        />
      </div>
    </ConfigProvider>
  );
};

export default ProLayoutWrapper;