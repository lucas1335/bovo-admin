import React, { useState, useEffect } from 'react';
import { message, Tag } from 'antd';
import CmBasePage from '@components/CmBasePage';
import { useSearchParams } from 'react-router-dom';

/**
 * U本位合约止盈止损列表页面
 * 功能：止盈止损列表展示、搜索
 */
const OrderListPage = () => {
  const [searchParams] = useSearchParams();
  const positionId = searchParams.get('id');

  useEffect(() => {
    if (positionId) {
      console.log('Position ID from URL:', positionId);
    }
  }, [positionId]);

  // 交易类型映射（0: 买多, 1: 卖空）
  const tradeTypeMap = {
    0: { color: 'red', text: '买多' },
    1: { color: 'green', text: '卖空' },
  };

  // 委托类型映射（0: 限价, 1: 市价）
  const delegateTypeMap = {
    0: { color: 'blue', text: '限价委托' },
    1: { color: 'orange', text: '市价委托' },
  };

  /**
   * 列配置定义
   */
  const columns = [
    {
      title: '币种',
      dataIndex: 'symbol',
      key: 'symbol',
      width: 120,
    },
    {
      title: '委托类型',
      dataIndex: 'delegateType',
      key: 'delegateType',
      width: 120,
      render: (type) => {
        const status = delegateTypeMap[type] || { color: 'default', text: '未知' };
        return <Tag color={status.color}>{status.text}</Tag>;
      },
    },
    {
      title: '交易类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type) => {
        const status = tradeTypeMap[type] || { color: 'default', text: '未知' };
        return <Tag color={status.color}>{status.text}</Tag>;
      },
    },
    {
      title: '止盈触发价',
      dataIndex: 'earnPrice',
      key: 'earnPrice',
      width: 120,
    },
    {
      title: '止盈委托价',
      dataIndex: 'earnDelegatePrice',
      key: 'earnDelegatePrice',
      width: 120,
    },
    {
      title: '止盈数量',
      dataIndex: 'earnNumber',
      key: 'earnNumber',
      width: 120,
    },
    {
      title: '止损触发价',
      dataIndex: 'losePrice',
      key: 'losePrice',
      width: 120,
    },
    {
      title: '止损委托价',
      dataIndex: 'loseDelegatePrice',
      key: 'loseDelegatePrice',
      width: 120,
    },
    {
      title: '止损数量',
      dataIndex: 'loseNumber',
      key: 'loseNumber',
      width: 120,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
    },
  ];

  /**
   * 搜索字段配置
   */
  const searchFieldList = [];

  return (
    <div>
      {/* 止盈止损列表 */}
      <CmBasePage
        columns={columns}
        apiEndpoint={`/contract/contractPosition/profitList/${positionId || ''}`}
        apiMethod="get"
        searchFieldList={searchFieldList}
        actionButtons={{
          view: false,
          edit: false,
          delete: false,
        }}
        rowKey="id"
      />
    </div>
  );
};

export default OrderListPage;
