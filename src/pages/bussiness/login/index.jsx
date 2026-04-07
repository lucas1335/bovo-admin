import React from 'react';
import CmBasePage from '@components/CmBasePage';

/**
 * 登录日志页面
 */
const LoginPage = () => {
  // ==================== 列配置 ====================

  const columns = [
    {
      title: '主键ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 120,
    },
    {
      title: '访问IP',
      dataIndex: 'ipaddr',
      key: 'ipaddr',
      width: 150,
    },
    {
      title: '访问位置',
      dataIndex: 'loginLocation',
      key: 'loginLocation',
      width: 150,
    },
    {
      title: '浏览器',
      dataIndex: 'browser',
      key: 'browser',
      width: 150,
    },
    {
      title: '系统OS',
      dataIndex: 'os',
      key: 'os',
      width: 120,
    },
    {
      title: '登录状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
    },
    {
      title: '登录时间',
      dataIndex: 'loginTime',
      key: 'loginTime',
      width: 180,
    },
  ];

  // ==================== 搜索配置 ====================

  const searchFieldList = [
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'SEARCH_LIKE_userId',
      type: 'text',
    },
    {
      title: 'IP',
      dataIndex: 'ipaddr',
      key: 'SEARCH_LIKE_ipaddr',
      type: 'text',
    },
    {
      title: '登陆地点',
      dataIndex: 'loginLocation',
      key: 'SEARCH_LIKE_loginLocation',
      type: 'text',
    },
  ];

  // ==================== 渲染 ====================

  return (
    <div>
      <CmBasePage
        columns={columns}
        apiEndpoint="/asset/appUserLoginLog/list"
        apiMethod="get"
        searchFieldList={searchFieldList}
        rowKey="id"
        actionButtons={{
          edit: false,
          delete: false,
          view: false,
        }}
      />
    </div>
  );
};

export default LoginPage;
