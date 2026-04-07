/**
 * 图标映射配置
 * 将后端返回的图标类名映射到 Ant Design Icons
 */

import {
  DashboardOutlined,
  TeamOutlined,
  SafetyOutlined,
  KeyOutlined,
  SettingOutlined,
  UserOutlined,
  HolderOutlined,
  MenuOutlined,
} from '@ant-design/icons';

/**
 * 图标映射表
 * 键: 后端返回的图标类名
 * 值: 对应的 Ant Design Icon 组件
 */
export const iconMap = {
  'icon-home': DashboardOutlined,
  'icon-tupian': TeamOutlined,
  'icon-news': SafetyOutlined,
  'icon-log': KeyOutlined,
  'icon-setting': SettingOutlined,
  'icon-user': UserOutlined,
  'icon-menu': MenuOutlined,
};

/**
 * 根据图标类名获取对应的图标组件
 * @param {string} iconName - 后端返回的图标类名
 * @returns {JSX.Element} 图标组件元素
 */
export const getIconComponent = (iconName) => {
  if (!iconName) {
    return <HolderOutlined />;
  }

  const IconComponent = iconMap[iconName] || HolderOutlined;
  return <IconComponent />;
};

export default iconMap;
