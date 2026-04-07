import {
  UserOutlined,
  SettingOutlined,
  LinkOutlined,
  BellOutlined,
  FormOutlined,
  TeamOutlined,
} from '@ant-design/icons';

// 菜单配置（默认菜单，当后端菜单加载失败时使用）
export const menuConfig = [
  // {
  //   key: '/dashboard',
  //   icon: <DashboardOutlined />,
  //   name: '仪表盘',
  //   path: '/dashboard'
  // },
  // {
  //   key: 'system-setting',
  //   icon: <SettingOutlined />,
  //   name: '系统管理',
  //   children: [
  //     {
  //       key: '/system',
  //       icon: <SettingOutlined />,
  //       name: '系统设置',
  //       path: '/system'
  //     },
  //     {
  //       key: '/notifications',
  //       icon: <BellOutlined />,
  //       name: '通知中心',
  //       path: '/notifications'
  //     },
  //     {
  //       key: '/profile',
  //       icon: <UserOutlined />,
  //       name: '个人中心',
  //       path: '/profile'
  //     }
  //   ]
  // },
  // {
  //   key: 'examples',
  //   icon: <FormOutlined />,
  //   name: '示例页面',
  //   children: [
  //     {
  //       key: '/form-demo',
  //       icon: <FormOutlined />,
  //       name: '表单演示',
  //       path: '/form-demo'
  //     },
  //     {
  //       key: '/role-management',
  //       icon: <TeamOutlined />,
  //       name: '角色管理示例',
  //       path: '/role-management'
  //     }
  //   ]
  // },
  // {
  //   key: '/external-link',
  //   icon: <LinkOutlined />,
  //   name: '外部链接',
  //   path: 'https://www.baidu.com',
  //   external: true
  // }
];

// 获取菜单项（用于API调用）
export const getMenuItems = () => {
  return menuConfig.map(item => ({
    key: item.key,
    icon: item.icon,
    label: item.label,
    path: item.path,
    external: item.external || false,
    children: item.children ? item.children.map(child => ({
      key: child.key,
      icon: child.icon,
      label: child.label,
      path: child.path,
      external: child.external || false
    })) : undefined
  }));
};

// 根据路径获取菜单项
export const getMenuItemByPath = (path) => {
  const findItem = (items) => {
    for (const item of items) {
      if (item.path === path) {
        return item;
      }
      if (item.children) {
        const found = findItem(item.children);
        if (found) return found;
      }
    }
    return null;
  };

  return findItem(menuConfig);
};
