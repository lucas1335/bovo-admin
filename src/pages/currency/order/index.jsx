/**
 * 币币交易订单页面
 *
 * 功能：查看币币交易订单列表
 *
 * @author System
 * @date 2026-04-02
 */

import React, { useState } from 'react';
import { Tag, message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import CmBasePage from '@components/CmBasePage';
import dayjs from 'dayjs';

/** 币币交易订单页面 */
const CurrencyOrder = () => {
  const [ids, setIds] = useState([]);

  // 格式化时间
  const parseTime = (time) => {
    if (!time) return '';
    return dayjs(time).format('YYYY-MM-DD HH:mm:ss');
  };

  // 复制到剪贴板
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      message.success('复制成功');
    });
  };

  // 订单类型映射
  const orderTypeMap = {
    0: { color: 'blue', text: '买入' },
    1: { color: 'orange', text: '卖出' },
  };

  // 委托类型映射
  const delegateTypeMap = {
    0: { color: 'orange', text: '限价' },
    1: { color: 'blue', text: '市价' },
  };

  // 状态映射
  const statusMap = {
    0: { color: 'red', text: '待成交' },
    1: { color: 'green', text: '已成交' },
    3: { color: 'default', text: '已撤销' },
  };

  // 表格列配置
  const columns = [
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 120,
      align: 'center',
    },
    {
      title: '订单编号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 180,
      align: 'center',
      render: (orderNo) => (
        <span
          style={{ cursor: 'pointer' }}
          onClick={() => copyToClipboard(orderNo)}
        >
          {orderNo} <CopyOutlined />
        </span>
      ),
    },
    {
      title: '交易币种/结算币种',
      key: 'symbol_pair',
      width: 150,
      align: 'center',
      render: (_, record) => (
        <div>{record.symbol}/{record.coin}</div>
      ),
    },
    {
      title: '订单类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      align: 'center',
      render: (type) => {
        const item = orderTypeMap[type];
        return item ? <Tag color={item.color}>{item.text}</Tag> : '-';
      },
    },
    {
      title: '委托类型',
      dataIndex: 'delegateType',
      key: 'delegateType',
      width: 100,
      align: 'center',
      render: (delegateType) => {
        const item = delegateTypeMap[delegateType];
        return item ? <Tag color={item.color}>{item.text}</Tag> : '-';
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status) => {
        const item = statusMap[status];
        return item ? <Tag color={item.color}>{item.text}</Tag> : '-';
      },
    },
    {
      title: '手续费',
      dataIndex: 'fee',
      key: 'fee',
      width: 100,
      align: 'center',
    },
    {
      title: '委托总量',
      dataIndex: 'delegateTotal',
      key: 'delegateTotal',
      width: 120,
      align: 'center',
    },
    {
      title: '委托价格',
      dataIndex: 'delegatePrice',
      key: 'delegatePrice',
      width: 120,
      align: 'center',
    },
    {
      title: '已成交量',
      dataIndex: 'dealNum',
      key: 'dealNum',
      width: 100,
      align: 'center',
    },
    {
      title: '成交价',
      dataIndex: 'dealPrice',
      key: 'dealPrice',
      width: 100,
      align: 'center',
    },
    {
      title: '委托价值',
      dataIndex: 'delegateValue',
      key: 'delegateValue',
      width: 120,
      align: 'center',
    },
    {
      title: '成交价值',
      dataIndex: 'dealValue',
      key: 'dealValue',
      width: 120,
      align: 'center',
    },
    {
      title: '委托时间',
      dataIndex: 'delegateTime',
      key: 'delegateTime',
      width: 180,
      align: 'center',
      render: (time) => <span>{parseTime(time)}</span>,
    },
    {
      title: '成交时间',
      dataIndex: 'dealTime',
      key: 'dealTime',
      width: 180,
      align: 'center',
      render: (time) => <span>{parseTime(time)}</span>,
    },
  ];

  // 搜索字段配置
  const searchFieldList = [
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'SEARCH_EQ_userId',
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
      <CmBasePage
        columns={columns}
        apiEndpoint="/contract/currencyOrder/list"
        apiMethod="get"
        searchFieldList={searchFieldList}
        rowKey="id"
        actionButtons={{
          view: false,
          edit: false,
          delete: false,
        }}
      />
    </div>
  );
};

export default CurrencyOrder;
