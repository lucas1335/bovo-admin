import React from 'react';
import { Breadcrumb } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { menuConfig } from '../config/menuConfig';

// 根据菜单配置查找面包屑名称
const findBreadcrumbName = (path, menuItems) => {
  console.log('findBreadcrumbName', path, menuItems);
  for (const item of menuItems) {
    console.log('item', item , path , item.path == path);
    if (item.path == path) {
      return item.name;
    }
    if (item.children) {
      const childName = findBreadcrumbName(path, item.children);
      if (childName) {
        return childName;
      }
    }
  }
  return null;
};

// 获取所有父级路径
const getParentPaths = (path, paths = []) => {
  const parentPath = path.substring(0, path.lastIndexOf('/'));
  if (parentPath && parentPath !== '/') {
    paths.push(parentPath);
    return getParentPaths(parentPath, paths);
  }
  return paths;
};

const CustomBreadcrumb = () => {
  const location = useLocation();
  const pathSnippets = location.pathname.split('/').filter(i => i);
  
  // 构建面包屑项
  const breadcrumbItems = pathSnippets.map((_, index) => {
    const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
    const breadcrumbName = findBreadcrumbName(url, menuConfig);
    console.log('breadcrumbName', breadcrumbName, url);
    return {
      key: url,
      title: breadcrumbName || url,
    };
  });
  
  // 添加首页
  const breadcrumbItemsWithHome = [
    {
      key: '/',
      title: '首页',
    },
    ...breadcrumbItems,
  ];

  // 处理面包屑项的链接
  const finalBreadcrumbItems = breadcrumbItemsWithHome.map((item, index) => {
    if (index === breadcrumbItemsWithHome.length - 1) {
      return {
        key: item.key,
        title: item.title,
      };
    }
    return {
      key: item.key,
      title: <Link to={item.key}>{item.title}</Link>,
    };
  });

  return (
    <Breadcrumb 
      items={finalBreadcrumbItems}
      style={{ margin: '16px 0' , fontSize: '20px'}}
    />
  );
};

export default CustomBreadcrumb;