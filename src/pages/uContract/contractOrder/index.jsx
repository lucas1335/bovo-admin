import React, { useState } from 'react';
import { message, Tag, Form, Input, Select, Modal, Button, Typography } from 'antd';
import CmBasePage from '@components/CmBasePage';

const { Text } = Typography;
const { Option } = Select;

/**
 * U本位合约委托列表页面
 * 功能：合约订单列表展示、搜索、订单详情查看
 */
const ContractOrderPage = () => {
  // 状态管理
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);

  /**
   * 查看订单详情
   */
  const handleView = (record) => {
    setCurrentRecord(record);
    setDetailVisible(true);
  };

  /**
   * 复制订单号
   */
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      message.success('复制成功');
    }).catch(() => {
      message.error('复制失败');
    });
  };

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

  // 订单状态映射
  const orderStatusMap = {
    0: { color: 'default', text: '未成交' },
    1: { color: 'processing', text: '部分成交' },
    2: { color: 'green', text: '完全成交' },
    3: { color: 'red', text: '已撤销' },
  };

  /**
   * 列配置定义
   */
  const columns = [
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 120,
      sorter: true,
    },
    {
      title: '订单编号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 180,
      sorter: true,
      render: (orderNo) => (
        <Text
          copyable={{ text: orderNo, onCopy: () => handleCopy(orderNo) }}
          style={{ cursor: 'pointer' }}
        >
          {orderNo}
        </Text>
      ),
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
      title: '委托类型',
      dataIndex: 'delegateType',
      key: 'delegateType',
      width: 100,
      render: (type) => {
        const status = delegateTypeMap[type] || { color: 'default', text: '未知' };
        return <Tag color={status.color}>{status.text}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const item = orderStatusMap[status] || { color: 'default', text: '未知' };
        return <Tag color={item.color}>{item.text}</Tag>;
      },
    },
    {
      title: '交易币种',
      dataIndex: 'symbol',
      key: 'symbol',
      width: 120,
    },
    {
      title: '杠杆',
      dataIndex: 'leverage',
      key: 'leverage',
      width: 80,
      render: (leverage) => `${leverage}x`,
    },
    {
      title: '委托总量',
      dataIndex: 'delegateTotal',
      key: 'delegateTotal',
      width: 120,
    },
    {
      title: '委托价格',
      dataIndex: 'delegatePrice',
      key: 'delegatePrice',
      width: 120,
    },
    {
      title: '委托价值',
      dataIndex: 'delegateValue',
      key: 'delegateValue',
      width: 120,
    },
    {
      title: '已成交量',
      dataIndex: 'dealNum',
      key: 'dealNum',
      width: 120,
    },
    {
      title: '成交价',
      dataIndex: 'dealPrice',
      key: 'dealPrice',
      width: 120,
    },
    {
      title: '成交价值',
      dataIndex: 'dealValue',
      key: 'dealValue',
      width: 120,
    },
    {
      title: '手续费',
      dataIndex: 'fee',
      key: 'fee',
      width: 120,
    },
    {
      title: '委托时间',
      dataIndex: 'delegateTime',
      key: 'delegateTime',
      width: 180,
    },
    {
      title: '成交时间',
      dataIndex: 'dealTime',
      key: 'dealTime',
      width: 180,
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
      title: '订单编号',
      dataIndex: 'orderNo',
      key: 'SEARCH_LIKE_orderNo',
      type: 'text',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'SEARCH_EQ_status',
      type: 'select',
      options: [
        { label: '未成交', value: 0 },
        { label: '部分成交', value: 1 },
        { label: '完全成交', value: 2 },
        { label: '已撤销', value: 3 },
      ],
    },
  ];

  return (
    <div>
      {/* 委托列表 */}
      <CmBasePage
        columns={columns}
        apiEndpoint="/contract/contractOrder/list"
        apiMethod="get"
        searchFieldList={searchFieldList}
        onView={handleView}
        actionButtons={{
          view: true,
          edit: false,
          delete: false,
        }}
        rowKey="id"
      />

      {/* 订单详情弹窗 */}
      <Modal
        title="订单详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        {currentRecord && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>用户ID：</Text>
              <Text>{currentRecord.userId}</Text>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>订单编号：</Text>
              <Text
                copyable={{ text: currentRecord.orderNo }}
                style={{ cursor: 'pointer' }}
              >
                {currentRecord.orderNo}
              </Text>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>交易类型：</Text>
              <Tag color={tradeTypeMap[currentRecord.type]?.color}>
                {tradeTypeMap[currentRecord.type]?.text}
              </Tag>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>委托类型：</Text>
              <Tag color={delegateTypeMap[currentRecord.delegateType]?.color}>
                {delegateTypeMap[currentRecord.delegateType]?.text}
              </Tag>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>状态：</Text>
              <Tag color={orderStatusMap[currentRecord.status]?.color}>
                {orderStatusMap[currentRecord.status]?.text}
              </Tag>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>交易币种：</Text>
              <Text>{currentRecord.symbol}</Text>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>杠杆：</Text>
              <Text>{currentRecord.leverage}x</Text>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>委托总量：</Text>
              <Text>{currentRecord.delegateTotal}</Text>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>委托价格：</Text>
              <Text>{currentRecord.delegatePrice}</Text>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>委托价值：</Text>
              <Text>{currentRecord.delegateValue}</Text>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>已成交量：</Text>
              <Text>{currentRecord.dealNum}</Text>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>成交价：</Text>
              <Text>{currentRecord.dealPrice}</Text>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>成交价值：</Text>
              <Text>{currentRecord.dealValue}</Text>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>手续费：</Text>
              <Text>{currentRecord.fee}</Text>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>委托时间：</Text>
              <Text>{currentRecord.delegateTime}</Text>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>成交时间：</Text>
              <Text>{currentRecord.dealTime || '-'}</Text>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ContractOrderPage;
