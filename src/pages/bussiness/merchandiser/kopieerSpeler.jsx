import React, { useState, useEffect } from 'react';
import { message, Button, Form, Input, Select, Modal, InputNumber } from 'antd';
import CmBasePage from '@components/CmBasePage';
import { followList, cancelFollow } from '@api/modules/merchandiser';

/**
 * 玩家跟单列表页面
 * 功能：展示玩家对跟单员的跟单记录，支持批量取消跟单
 */
const FollowListPage = () => {
  const [form] = Form.useForm();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [loading, setLoading] = useState(false);

  // 刷新表格
  const refreshTable = () => {
    document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
      new CustomEvent('reload')
    );
  };

  // 批量取消跟单
  const handleBatchCancel = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要取消的跟单记录');
      return;
    }

    Modal.confirm({
      title: '确认批量取消跟单？',
      content: `确定要取消选中的 ${selectedRowKeys.length} 条跟单记录吗？`,
      onOk: async () => {
        try {
          const response = await cancelFollow({ ids: selectedRowKeys });
          if (response.code === 0 || response.code === 200) {
            message.success('批量取消跟单成功');
            setSelectedRowKeys([]);
            refreshTable();
          } else {
            message.error(response.msg || '批量取消跟单失败');
          }
        } catch (error) {
          message.error('批量取消跟单失败: ' + error.message);
        }
      }
    });
  };

  // 单个取消跟单
  const handleDelete = (record) => {
    Modal.confirm({
      title: '确认取消跟单？',
      content: `确定要取消玩家 "${record.userName}" 的跟单吗？`,
      onOk: async () => {
        try {
          const response = await cancelFollow({ ids: [record.id] });
          if (response.code === 0 || response.code === 200) {
            message.success('取消跟单成功');
            refreshTable();
          } else {
            message.error(response.msg || '取消跟单失败');
          }
        } catch (error) {
          message.error('取消跟单失败: ' + error.message);
        }
      }
    });
  };

  // 数据加载
  const loadData = async (params) => {
    try {
      const requestParams = {
        pageNum: params.current || 1,
        pageSize: params.pageSize || 200,
        ...params
      };

      const response = await followList(requestParams);

      if (response.code === 0 || response.code === 200) {
        return {
          data: response.rows || [],
          success: true,
          total: response.total || 0
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

  // 跟单类型映射
  const tranTypeMap = {
    0: { color: 'green', text: '期权' },
    1: { color: 'orange', text: '合约' }
  };

  // 用户类型映射
  const userTypeMap = {
    0: { color: 'blue', text: '正式用户' },
    1: { color: 'purple', text: '测试用户' }
  };

  // 保本跟单映射
  const fullCompMap = {
    1: { color: 'red', text: '是' },
    2: { color: 'default', text: '否' }
  };

  // 列配置
  const columns = [
    {
      title: '玩家ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 120
    },
    {
      title: '玩家用户名',
      dataIndex: 'userName',
      key: 'userName',
      width: 150
    },
    {
      title: '玩家资产',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      render: (text) => text ? Number(text).toFixed(2) : '-'
    },
    {
      title: '跟单员ID',
      dataIndex: 'merchandiserUserId',
      key: 'merchandiserUserId',
      width: 120
    },
    {
      title: '跟单员用户名',
      dataIndex: 'merchandiserUserName',
      key: 'merchandiserUserName',
      width: 150
    },
    {
      title: '用户类型',
      dataIndex: 'isTest',
      key: 'isTest',
      width: 100,
      render: (type) => {
        const item = userTypeMap[type] || { color: 'default', text: '未知' };
        return <span style={{ color: item.color === 'blue' ? '#1890ff' : item.color === 'purple' ? '#722ed1' : '#999' }}>
          {item.text}
        </span>;
      }
    },
    {
      title: '跟单类型',
      dataIndex: 'tranType',
      key: 'tranType',
      width: 100,
      render: (type) => {
        const item = tranTypeMap[type] || { color: 'default', text: '未知' };
        return <span style={{ color: item.color === 'green' ? '#52c41a' : '#fa8c16' }}>
          {item.text}
        </span>;
      }
    },
    {
      title: '是否保本跟单',
      dataIndex: 'fullCompEnable',
      key: 'fullCompEnable',
      width: 120,
      render: (type) => {
        const item = fullCompMap[type] || { color: 'default', text: '未知' };
        return <span style={{ color: item.color === 'red' ? '#f5222d' : '#999' }}>
          {item.text}
        </span>;
      }
    },
    {
      title: '跟单员订单号',
      dataIndex: 'merchandiserUserOrderNo',
      key: 'merchandiserUserOrderNo',
      width: 200,
      ellipsis: true
    },
    {
      title: '跟单订单号',
      dataIndex: 'merchandiserFollowOrderNo',
      key: 'merchandiserFollowOrderNo',
      width: 200,
      ellipsis: true
    },
    {
      title: '订单时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          danger
          onClick={() => handleDelete(record)}
        >
          取消跟单
        </Button>
      )
    }
  ];

  // 搜索字段配置
  const searchFieldList = [
    {
      title: '玩家ID',
      dataIndex: 'userId',
      key: 'SEARCH_EQ_userId',
      type: 'digit'
    },
    {
      title: '玩家用户名',
      dataIndex: 'userName',
      key: 'SEARCH_LIKE_userName',
      type: 'text'
    },
    {
      title: '跟单员ID',
      dataIndex: 'merchandiserUserId',
      key: 'SEARCH_EQ_merchandiserUserId',
      type: 'digit'
    },
    {
      title: '跟单员用户名',
      dataIndex: 'merchandiserUserName',
      key: 'SEARCH_LIKE_merchandiserUserName',
      type: 'text'
    },
    {
      title: '代理uid',
      dataIndex: 'agentId',
      key: 'SEARCH_EQ_agentId',
      type: 'digit'
    },
    {
      title: '用户类型',
      dataIndex: 'isTest',
      key: 'SEARCH_EQ_isTest',
      type: 'select',
      options: [
        { label: '正式用户', value: '0' },
        { label: '测试用户', value: '1' }
      ]
    },
    {
      title: '跟单类型',
      dataIndex: 'tranType',
      key: 'SEARCH_EQ_tranType',
      type: 'select',
      options: [
        { label: '期权', value: '0' },
        { label: '合约', value: '1' }
      ]
    },
    {
      title: '是否保本跟单',
      dataIndex: 'fullCompEnable',
      key: 'SEARCH_EQ_fullCompEnable',
      type: 'select',
      options: [
        { label: '是', value: '1' },
        { label: '否', value: '2' }
      ]
    }
  ];

  // 自定义工具栏按钮
  const toolBarExtraButtons = [
    <Button
      key="batchCancel"
      type="primary"
      danger
      disabled={selectedRowKeys.length === 0}
      onClick={handleBatchCancel}
    >
      批量取消跟单 ({selectedRowKeys.length})
    </Button>
  ];

  return (
    <div>
      <CmBasePage
        columns={columns}
        onLoadData={loadData}
        searchFieldList={searchFieldList}
        toolBarExtraButtons={toolBarExtraButtons}
        actionButtons={{
          view: false,
          edit: false,
          delete: false
        }}
        rowKey="id"
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys
        }}
      />
    </div>
  );
};

export default FollowListPage;
