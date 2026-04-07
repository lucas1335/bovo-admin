import React, { useState } from 'react';
import { message, Modal } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import CmBasePage from '@components/CmBasePage';
import { getOnlineList, forceLogoutUser } from '@api/modules/system';

/**
 * 在线用户监控页面
 * 功能：查看在线用户列表、强制退出用户、批量强制退出
 */
const OnlinePage = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [loading, setLoading] = useState(false);

  /**
   * 刷新表格
   */
  const refreshTable = () => {
    document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
      new CustomEvent('reload')
    );
  };

  /**
   * 强退单个用户
   * @param {Object} record - 用户记录
   */
  const handleForceLogout = (record) => {
    Modal.confirm({
      title: '强退确认',
      content: `是否确认强退名称为"${record.userName}"的用户？`,
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          setLoading(true);
          const response = await forceLogoutUser(record.tokenId);
          if (response.code === 0 || response.code === 200) {
            message.success('强退成功');
            refreshTable();
            // 清空选中项
            setSelectedRowKeys([]);
          } else {
            message.error(response.msg || '强退失败');
          }
        } catch (error) {
          message.error('强退失败: ' + error.message);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  /**
   * 批量强退用户
   */
  const handleBatchForceLogout = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要强退的用户');
      return;
    }

    Modal.confirm({
      title: '批量强退确认',
      content: `是否确认强退选中的 ${selectedRowKeys.length} 个用户？`,
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          setLoading(true);
          // 批量调用强退接口
          const promises = selectedRowKeys.map(tokenId => forceLogoutUser(tokenId));
          await Promise.all(promises);
          message.success('批量强退成功');
          refreshTable();
          setSelectedRowKeys([]);
        } catch (error) {
          message.error('批量强退失败: ' + error.message);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  /**
   * 表格列配置
   */
  const columns = [
    {
      title: '序号',
      key: 'index',
      width: 80,
      render: (_, __, index) => index + 1,
      align: 'center',
    },
    {
      title: '会话编号',
      dataIndex: 'tokenId',
      key: 'tokenId',
      width: 200,
      ellipsis: true,
      align: 'center',
    },
    {
      title: '登录名称',
      dataIndex: 'userName',
      key: 'userName',
      width: 150,
      ellipsis: true,
      align: 'center',
    },
    {
      title: '部门名称',
      dataIndex: 'deptName',
      key: 'deptName',
      width: 150,
      align: 'center',
    },
    {
      title: '主机',
      dataIndex: 'ipaddr',
      key: 'ipaddr',
      width: 150,
      ellipsis: true,
      align: 'center',
    },
    {
      title: '登录地点',
      dataIndex: 'loginLocation',
      key: 'loginLocation',
      width: 200,
      ellipsis: true,
      align: 'center',
    },
    {
      title: '浏览器',
      dataIndex: 'browser',
      key: 'browser',
      width: 150,
      align: 'center',
    },
    {
      title: '操作系统',
      dataIndex: 'os',
      key: 'os',
      width: 150,
      align: 'center',
    },
    {
      title: '登录时间',
      dataIndex: 'loginTime',
      key: 'loginTime',
      width: 180,
      align: 'center',
      sorter: true,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleForceLogout(record)}
        >
          强退
        </Button>
      ),
    },
  ];

  /**
   * 搜索字段配置
   */
  const searchFieldList = [
    {
      title: '登录地址',
      dataIndex: 'ipaddr',
      key: 'SEARCH_LIKE_ipaddr',
      type: 'text',
    },
    {
      title: '用户名称',
      dataIndex: 'userName',
      key: 'SEARCH_LIKE_userName',
      type: 'text',
    },
  ];

  /**
   * 自定义加载函数
   * 处理在线用户列表的特殊数据结构
   */
  const loadData = async (params, sorter, filter) => {
    try {
      // 构建搜索参数
      const searchParam = {};
      if (searchFieldList && searchFieldList.length > 0) {
        searchFieldList.forEach(field => {
          const { key, dataIndex } = field;
          const fieldName = key || dataIndex;
          if (params[fieldName] !== undefined && params[fieldName] !== null && params[fieldName] !== '') {
            searchParam[fieldName] = params[fieldName];
          }
        });
      }

      // 构造请求参数
      const requestParams = {
        pageNum: params.current || 1,
        pageSize: params.pageSize || 10,
        ...searchParam
      };

      const response = await getOnlineList(requestParams);

      if (response.code === 0 || response.code === 200) {
        return {
          data: response.rows || response.data?.rows || response.data?.records || response.data || [],
          success: true,
          total: response.total || response.data?.total || 0
        };
      } else {
        message.error(response.msg || '获取数据失败');
        return {
          data: [],
          success: false,
          total: 0
        };
      }
    } catch (error) {
      message.error('获取数据失败: ' + error.message);
      return {
        data: [],
        success: false,
        total: 0
      };
    }
  };

  return (
    <div style={{ textAlign: 'left' }}>
      <CmBasePage
        columns={columns}
        onLoadData={loadData}
        searchFieldList={searchFieldList}
        rowKey="tokenId"
        actionButtons={{
          view: false,
          edit: false,
          delete: false,
        }}
        // 启用行选择
        rowSelection={{
          selectedRowKeys,
          onChange: (selectedKeys) => {
            setSelectedRowKeys(selectedKeys);
          },
        }}
        // 自定义工具栏按钮
        toolBarExtraButtons={[
          <Button
            key="batchForceLogout"
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={handleBatchForceLogout}
            disabled={selectedRowKeys.length === 0}
          >
            批量强退
          </Button>
        ]}
        loading={loading}
      />
    </div>
  );
};

export default OnlinePage;
