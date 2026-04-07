import React, { useState } from 'react';
import { message, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import CmBasePage from '@components/CmBasePage';
import {
  getDefiOrderList,
  deleteDefiOrder,
} from '@api';

/**
 * DEFI订单列表页面
 * 功能：订单列表展示、搜索、删除
 */
const DefiOrderPage = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  /**
   * 刷新表格
   */
  const refreshTable = () => {
    document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
      new CustomEvent('reload')
    );
  };

  /**
   * 删除订单
   */
  const handleDelete = async (record) => {
    try {
      const id = record.id || (selectedRowKeys.length > 0 ? selectedRowKeys[0] : null);
      if (!id) {
        message.warning('请选择要删除的记录');
        return;
      }
      const response = await deleteDefiOrder(id);
      if (response.code === 0 || response.code === 200) {
        message.success('删除成功');
        setSelectedRowKeys([]);
        refreshTable();
      } else {
        message.error(response.msg || '删除失败');
      }
    } catch (error) {
      message.error('删除失败: ' + error.message);
    }
  };

  /**
   * 批量删除
   */
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的记录');
      return;
    }
    try {
      // 批量删除，逐个调用删除接口
      for (let i = 0; i < selectedRowKeys.length; i++) {
        await deleteDefiOrder(selectedRowKeys[i]);
      }
      message.success('删除成功');
      setSelectedRowKeys([]);
      refreshTable();
    } catch (error) {
      message.error('删除失败: ' + error.message);
    }
  };

  // 表格列配置
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 120,
    },
    {
      title: '收益金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 130,
      render: (amount) => amount ? Number(amount).toFixed(8) : '0.00000000',
    },
    {
      title: '钱包金额',
      dataIndex: 'totleAmount',
      key: 'totleAmount',
      width: 130,
      render: (amount) => amount ? Number(amount).toFixed(8) : '0.00000000',
    },
    {
      title: '收益率',
      dataIndex: 'rate',
      key: 'rate',
      width: 100,
      render: (rate) => rate ? `${Number(rate).toFixed(2)}%` : '0.00%',
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 150,
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Popconfirm
          title="删除确认"
          description="确定要删除这条订单记录吗？"
          onConfirm={() => handleDelete(record)}
          okText="确定"
          cancelText="取消"
        >
          <button
            type="button"
            style={{
              border: 'none',
              background: 'none',
              color: '#ff4d4f',
              cursor: 'pointer',
              padding: '4px 8px',
            }}
          >
            <DeleteOutlined /> 删除
          </button>
        </Popconfirm>
      ),
    },
  ];

  // 搜索字段配置
  const searchFieldList = [
    {
      title: '收益金额',
      dataIndex: 'amount',
      key: 'SEARCH_EQ_amount',
      type: 'text',
    },
    {
      title: '钱包金额',
      dataIndex: 'totleAmount',
      key: 'SEARCH_EQ_totleAmount',
      type: 'text',
    },
    {
      title: '收益率',
      dataIndex: 'rate',
      key: 'SEARCH_EQ_rate',
      type: 'text',
    },
  ];

  return (
    <CmBasePage
      columns={columns}
      apiEndpoint="/contract/defiOrder/list"
      apiMethod="get"
      searchFieldList={searchFieldList}
      actionButtons={{ view: false, edit: false, delete: false, add: false }}
      rowKey="id"
      rowSelection={{
        selectedRowKeys,
        onChange: (keys) => setSelectedRowKeys(keys),
      }}
      toolbarExtraButtons={[
        {
          label: '批量删除',
          icon: <DeleteOutlined />,
          onClick: handleBatchDelete,
          disabled: selectedRowKeys.length === 0,
          danger: true,
        },
      ]}
    />
  );
};

export default DefiOrderPage;
