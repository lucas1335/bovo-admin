import React, { useState } from 'react';
import { message, Form, Radio, Modal, Tag, Button, Space } from 'antd';
import CmBasePage from '@components/CmBasePage';
import DataForm from '@components/DataForm';
import {
  getQuicklyOrderList,
  getQuicklyOrder,
  updateQuicklyOrder,
  batchUpdateQuicklyOrder
} from '@api';

/**
 * 秒合约订单管理页面
 * 功能：订单列表展示、搜索、批量修改订单标记、输赢设置
 */
const QuicklyOrderPage = () => {
  // 1. 状态管理
  const [formVisible, setFormVisible] = useState(false);
  const [batchFormVisible, setBatchFormVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // 2. 预测方向映射
  const directionMap = {
    0: { color: 'red', text: '跌' },
    1: { color: 'green', text: '涨' },
  };

  // 3. 订单状态映射
  const statusMap = {
    0: { color: 'processing', text: '参与中' },
    1: { color: 'success', text: '已开奖' },
    2: { color: 'default', text: '已撤销' },
  };

  // 4. 开奖结果映射
  const openResultMap = {
    0: { color: 'red', text: '输' },
    1: { color: 'green', text: '赢' },
    2: { color: 'default', text: '平' },
  };

  // 5. 订单标记映射
  const signMap = {
    0: { color: 'default', text: '正常' },
    1: { color: 'red', text: '包赢' },
    2: { color: 'green', text: '包输' },
  };

  // 6. 人工干预映射
  const interventionMap = {
    0: { color: 'success', text: '是' },
    1: { color: 'default', text: '否' },
  };

  // 7. 事件处理
  const handleEdit = async (record) => {
    try {
      const response = await getQuicklyOrder(record.id);
      if (response.code === 0 || response.code === 200) {
        setEditingRecord(response.data);
        setFormVisible(true);
      }
    } catch (error) {
      message.error('获取详情失败');
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await updateQuicklyOrder({
        ...editingRecord,
        ...values
      });

      if (response.code === 0 || response.code === 200) {
        message.success('修改成功');
        setFormVisible(false);
        refreshTable();
      } else {
        message.error(response.msg || '修改失败');
      }
    } catch (error) {
      message.error('修改失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchUpdate = () => {
    if (selectedRows.length === 0) {
      message.warning('请选择要修改的订单');
      return;
    }
    setEditingRecord(null);
    setBatchFormVisible(true);
  };

  const handleBatchSubmit = async (values) => {
    setLoading(true);
    try {
      const updateData = selectedRows.map(row => ({
        ...row,
        sign: values.sign
      }));

      const response = await batchUpdateQuicklyOrder(updateData);

      if (response.code === 0 || response.code === 200) {
        message.success('批量修改成功');
        setBatchFormVisible(false);
        setSelectedRows([]);
        refreshTable();
      } else {
        message.error(response.msg || '批量修改失败');
      }
    } catch (error) {
      message.error('批量修改失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshTable = () => {
    document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
      new CustomEvent('reload')
    );
  };

  // 8. 时间格式化
  const formatTime = (time) => {
    if (!time) return '-';
    return new Date(time).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  // 9. 复制订单号
  const copyOrderNo = (orderNo) => {
    navigator.clipboard.writeText(orderNo).then(() => {
      message.success('复制成功');
    }).catch(() => {
      message.error('复制失败');
    });
  };

  // 10. 行选择配置
  const rowSelection = {
    selectedRowKeys: selectedRows.map(row => row.id),
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRows(selectedRows);
    },
    getCheckboxProps: (record) => ({
      disabled: record.status !== 0, // 只有参与中的订单可以批量修改
    }),
  };

  // 11. 列配置
  const columns = [
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 100,
    },
    {
      title: '订单号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 150,
      render: (orderNo) => (
        <a
          onClick={() => copyOrderNo(orderNo)}
          style={{ cursor: 'pointer', color: '#1890ff' }}
        >
          {orderNo}
        </a>
      )
    },
    {
      title: '交易对',
      dataIndex: 'symbol',
      key: 'symbol',
      width: 100,
    },
    {
      title: '周期',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type) => <span>{type} S</span>
    },
    {
      title: '预测方向',
      dataIndex: 'betContent',
      key: 'betContent',
      width: 100,
      render: (content) => {
        const item = directionMap[content] || { color: 'default', text: '未知' };
        return <Tag color={item.color}>{item.text}</Tag>;
      }
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const item = statusMap[status] || { color: 'default', text: '未知' };
        return <Tag color={item.color}>{item.text}</Tag>;
      }
    },
    {
      title: '开奖结果',
      dataIndex: 'openResult',
      key: 'openResult',
      width: 100,
      render: (result) => {
        const item = openResultMap[result] || { color: 'default', text: '未知' };
        return <Tag color={item.color}>{item.text}</Tag>;
      }
    },
    {
      title: '买入手续费',
      dataIndex: 'fee',
      key: 'fee',
      width: 100,
      render: (fee) => fee || '-'
    },
    {
      title: '投注金额',
      dataIndex: 'betAmount',
      key: 'betAmount',
      width: 100,
    },
    {
      title: '获奖金额',
      dataIndex: 'rewardAmount',
      key: 'rewardAmount',
      width: 100,
    },
    {
      title: '赔偿金额',
      dataIndex: 'compensationAmount',
      key: 'compensationAmount',
      width: 100,
    },
    {
      title: '开盘价格',
      dataIndex: 'openPrice',
      key: 'openPrice',
      width: 100,
    },
    {
      title: '关盘价格',
      dataIndex: 'closePrice',
      key: 'closePrice',
      width: 100,
    },
    {
      title: '开盘时间',
      dataIndex: 'openTime',
      key: 'openTime',
      width: 180,
      sorter: true,
      render: formatTime
    },
    {
      title: '关盘时间',
      dataIndex: 'closeTime',
      key: 'closeTime',
      width: 180,
      render: formatTime
    },
    {
      title: '交易币种/结算币种',
      key: 'coinSymbol',
      width: 150,
      render: (_, record) => (
        <span>{record.coinSymbol || '-'}/{record.baseSymbol || '-'}</span>
      )
    },
    {
      title: '订单标记',
      dataIndex: 'sign',
      key: 'sign',
      width: 100,
      render: (sign) => {
        const item = signMap[sign] || { color: 'default', text: '未知' };
        return <Tag color={item.color}>{item.text}</Tag>;
      }
    },
    {
      title: '是否人工干预',
      dataIndex: 'manualIntervention',
      key: 'manualIntervention',
      width: 120,
      render: (intervention) => {
        const item = interventionMap[intervention] || { color: 'default', text: '未知' };
        return <Tag color={item.color}>{item.text}</Tag>;
      }
    },
    {
      title: '赔率(%)',
      dataIndex: 'rate',
      key: 'rate',
      width: 100,
    },
  ];

  // 12. 搜索配置
  const searchFieldList = [
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'SEARCH_EQ_userId',
      type: 'text',
    },
    {
      title: '订单号',
      dataIndex: 'orderNo',
      key: 'SEARCH_LIKE_orderNo',
      type: 'text',
    },
  ];

  // 13. 渲染
  return (
    <div>
      <CmBasePage
        columns={columns}
        apiEndpoint="/contract/secondContractOrder/list"
        apiMethod="get"
        searchFieldList={searchFieldList}
        onEdit={handleEdit}
        actionButtons={{ edit: false, delete: false }}
        rowKey="id"
        rowSelection={rowSelection}
        toolBarExtraButtons={[
          <Button
            key="batchUpdate"
            type="primary"
            danger
            onClick={handleBatchUpdate}
            disabled={selectedRows.length === 0}
          >
            批量修改秒合约订单
          </Button>
        ]}
        options={{
          reload: true,
          density: false,
          setting: false,
        }}
      />

      {/* 单个修改表单 */}
      <DataForm
        visible={formVisible}
        title="输赢设置"
        initialValues={editingRecord || {}}
        extraValues={{ id: editingRecord?.id }}
        onCancel={() => setFormVisible(false)}
        onSubmit={handleSubmit}
        onClosed={() => {
          setEditingRecord(null);
        }}
        loading={loading}
        formType="modal"
        width={500}
      >
        <Form.Item
          name="sign"
          label="订单标记"
          rules={[{ required: true, message: '请选择订单标记' }]}
        >
          <Radio.Group>
            <Radio value={0}>正常</Radio>
            <Radio value={1}>包赢</Radio>
            <Radio value={2}>包输</Radio>
          </Radio.Group>
        </Form.Item>
      </DataForm>

      {/* 批量修改表单 */}
      <DataForm
        visible={batchFormVisible}
        title="批量修改合约订单"
        initialValues={{}}
        onCancel={() => setBatchFormVisible(false)}
        onSubmit={handleBatchSubmit}
        onClosed={() => {
          setSelectedRows([]);
        }}
        loading={loading}
        formType="modal"
        width={500}
      >
        <Form.Item
          name="sign"
          label="订单标记"
          rules={[{ required: true, message: '请选择订单标记' }]}
        >
          <Radio.Group>
            <Radio value={0}>正常</Radio>
            <Radio value={1}>包赢</Radio>
            <Radio value={2}>包输</Radio>
          </Radio.Group>
        </Form.Item>

        <div style={{ color: 'red', margin: '20px 0' }}>
          已选中 {selectedRows.length} 人
        </div>
        <div style={{ maxHeight: '100px', overflowY: 'auto' }}>
          {selectedRows.map((item, index) => (
            <span key={item.id}>
              {item.orderNo}
              {index < selectedRows.length - 1 ? ', ' : ''}
            </span>
          ))}
        </div>
      </DataForm>
    </div>
  );
};

export default QuicklyOrderPage;
