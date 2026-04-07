import React, { useState } from 'react';
import { message, Tag, Form, Input, InputNumber, DatePicker, Button } from 'antd';
import dayjs from 'dayjs';
import CmBasePage from '@components/CmBasePage';
import DataForm from '@components/DataForm';
import { getPledgeOrderList, savePledgeOrder, updatePledgeOrder, deletePledgeOrder } from '@api/modules/pledge';

/**
 * 质押订单管理页面
 * 功能：订单列表展示、搜索、删除
 */
const PledgeOrderPage = () => {
  const [formVisible, setFormVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);

  /**
   * 删除订单
   */
  const handleDelete = async (record) => {
    try {
      const response = await deletePledgeOrder({ id: record.id });
      if (response.code === 0 || response.code === 200) {
        message.success('删除成功');
        refreshTable();
      } else {
        message.error(response.msg || '删除失败');
      }
    } catch (error) {
      message.error('删除失败: ' + error.message);
    }
  };

  /**
   * 复制订单编号成功
   */
  const handleCopySuccess = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      message.success('复制成功');
    });
  };

  /**
   * 刷新表格数据
   */
  const refreshTable = () => {
    document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
      new CustomEvent('reload')
    );
  };

  // 订单状态映射
  const statusMap = {
    0: { color: 'green', text: '收益' },
    1: { color: 'default', text: '结算' },
  };

  /**
   * 时间格式化
   */
  const formatTime = (time) => {
    if (!time) return '-';
    return dayjs(time).format('YYYY-MM-DD HH:mm:ss');
  };

  /**
   * 列配置定义
   */
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: true,
    },
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 100,
      sorter: true,
    },
    {
      title: '投资金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (amount) => `¥${(parseFloat(amount || 0)).toFixed(2)}`,
    },
    {
      title: '投资期限',
      dataIndex: 'days',
      key: 'days',
      width: 100,
      render: (days) => `${days}天`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusInfo = statusMap[status] || { color: 'default', text: '未知' };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
    },
    {
      title: '项目id',
      dataIndex: 'planId',
      key: 'planId',
      width: 100,
    },
    {
      title: '项目名称',
      dataIndex: 'planTitle',
      key: 'planTitle',
      width: 150,
      ellipsis: true,
    },
    {
      title: '订单编号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 180,
      render: (orderNo) => (
        <Button
          type="link"
          size="small"
          onClick={() => handleCopySuccess(orderNo)}
          style={{ padding: 0 }}
        >
          {orderNo}
        </Button>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      render: formatTime,
    },
    {
      title: '到期时间',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 180,
      render: formatTime,
    },
    {
      title: '结算时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 180,
      render: formatTime,
    },
    {
      title: '累计收益',
      dataIndex: 'accumulaEarn',
      key: 'accumulaEarn',
      width: 120,
      render: (earn) => `¥${(parseFloat(earn || 0)).toFixed(2)}`,
    },
    {
      title: '最小利率',
      dataIndex: 'minOdds',
      key: 'minOdds',
      width: 100,
      render: (odds) => `${(parseFloat(odds || 0)).toFixed(2)}%`,
    },
    {
      title: '最大利率',
      dataIndex: 'maxOdds',
      key: 'maxOdds',
      width: 100,
      render: (odds) => `${(parseFloat(odds || 0)).toFixed(2)}%`,
    },
  ];

  /**
   * 搜索字段配置
   */
  const searchFieldList = [
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'SEARCH_EQ_userId',
      type: 'text',
    },
    {
      title: '项目id',
      dataIndex: 'planId',
      key: 'SEARCH_EQ_planId',
      type: 'text',
    },
    {
      title: '项目名称',
      dataIndex: 'planTitle',
      key: 'SEARCH_LIKE_planTitle',
      type: 'text',
    },
    {
      title: '订单编号',
      dataIndex: 'orderNo',
      key: 'SEARCH_LIKE_orderNo',
      type: 'text',
    },
  ];

  return (
    <div>
      {/* 订单列表 */}
      <CmBasePage
        columns={columns}
        apiEndpoint="/contract/mingOrder/list"
        apiMethod="get"
        searchFieldList={searchFieldList}
        onDelete={handleDelete}
        actionButtons={{
          view: false,
          edit: false,
          delete: true,
        }}
        rowKey="id"
        toolbar={{
          add: false,
        }}
      />
    </div>
  );
};

export default PledgeOrderPage;
