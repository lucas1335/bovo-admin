import React, { useState } from 'react';
import { message, Tag, Form, Input, Select, DatePicker, Descriptions, Modal, Button } from 'antd';
import CmBasePage from '@components/CmBasePage';
import DataForm from '@components/DataForm';
import { getOrderList, updateOrderStatus } from '@api/modules/order';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

/**
 * 订单管理页面
 * 功能：订单列表展示、搜索、详情查看、状态管理
 */
const OrderPage = () => {
  const [detailVisible, setDetailVisible] = useState(false);
  const [statusVisible, setStatusVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [loading, setLoading] = useState(false);

  /**
   * 查看订单详情
   */
  const handleView = (record) => {
    setCurrentRecord(record);
    setDetailVisible(true);
  };

  /**
   * 打开状态更新对话框
   */
  const handleUpdateStatus = (record) => {
    setCurrentRecord(record);
    setStatusVisible(true);
  };

  /**
   * 提交状态更新
   */
  const handleStatusSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await updateOrderStatus({
        id: currentRecord.id,
        ...values
      });

      if (response.code === 0 || response.code === 200) {
        message.success('状态更新成功');
        setStatusVisible(false);
        refreshTable();
      } else {
        message.error(response.msg || '状态更新失败');
      }
    } catch (error) {
      message.error('状态更新失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 刷新表格数据
   */
  const refreshTable = () => {
    document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
      new CustomEvent('reload')
    );
  };

  // 订单类型映射
  const orderTypeMap = {
    1: { color: 'blue', text: '仓储订单' },
    2: { color: 'green', text: '运输订单' },
    3: { color: 'orange', text: '综合订单' },
  };

  // 订单状态映射
  const orderStatusMap = {
    0: { color: 'default', text: '待支付' },
    1: { color: 'processing', text: '待接单' },
    2: { color: 'blue', text: '进行中' },
    3: { color: 'purple', text: '待验收' },
    4: { color: 'green', text: '已完成' },
    5: { color: 'red', text: '已取消' },
    6: { color: 'orange', text: '退款中' },
    7: { color: 'volcano', text: '已退款' },
  };

  // 支付状态映射
  const payStatusMap = {
    0: { color: 'default', text: '未支付' },
    1: { color: 'green', text: '已支付' },
    2: { color: 'red', text: '支付失败' },
  };

  /**
   * 列配置定义
   */
  const columns = [
    {
      title: '订单号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 180,
      sorter: true,
    },
    {
      title: '用户名',
      dataIndex: 'userName',
      key: 'userName',
      width: 120,
      sorter: true,
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
    },
    {
      title: '订单类型',
      dataIndex: 'orderType',
      key: 'orderType',
      width: 100,
      render: (type) => {
        const status = orderTypeMap[type] || { color: 'default', text: '未知' };
        return <Tag color={status.color}>{status.text}</Tag>;
      },
    },
    {
      title: '订单金额',
      dataIndex: 'orderAmount',
      key: 'orderAmount',
      width: 100,
      render: (amount) => `¥${Number(amount || 0).toFixed(2)}`,
    },
    {
      title: '支付状态',
      dataIndex: 'payStatus',
      key: 'payStatus',
      width: 100,
      render: (status) => {
        const item = payStatusMap[status] || { color: 'default', text: '未知' };
        return <Tag color={item.color}>{item.text}</Tag>;
      },
    },
    {
      title: '订单状态',
      dataIndex: 'orderStatus',
      key: 'orderStatus',
      width: 100,
      render: (status) => {
        const item = orderStatusMap[status] || { color: 'default', text: '未知' };
        return <Tag color={item.color}>{item.text}</Tag>;
      },
    },
    {
      title: '下单时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      sorter: true,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 150,
      ellipsis: true,
    },
  ];

  /**
   * 搜索字段配置
   */
  const searchFieldList = [
    {
      title: '用户名',
      dataIndex: 'userName',
      key: 'SEARCH_LIKE_userName',
      type: 'text',
    },
    {
      title: '订单号',
      dataIndex: 'orderNo',
      key: 'SEARCH_LIKE_orderNo',
      type: 'text',
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'SEARCH_LIKE_phone',
      type: 'text',
    },
    {
      title: '订单类型',
      dataIndex: 'orderType',
      key: 'SEARCH_EQ_orderType',
      type: 'select',
      options: [
        { label: '仓储订单', value: 1 },
        { label: '运输订单', value: 2 },
        { label: '综合订单', value: 3 },
      ],
    },
    {
      title: '订单状态',
      dataIndex: 'orderStatus',
      key: 'SEARCH_EQ_orderStatus',
      type: 'select',
      options: [
        { label: '待支付', value: 0 },
        { label: '待接单', value: 1 },
        { label: '进行中', value: 2 },
        { label: '待验收', value: 3 },
        { label: '已完成', value: 4 },
        { label: '已取消', value: 5 },
        { label: '退款中', value: 6 },
        { label: '已退款', value: 7 },
      ],
    },
    {
      title: '支付状态',
      dataIndex: 'payStatus',
      key: 'SEARCH_EQ_payStatus',
      type: 'select',
      options: [
        { label: '未支付', value: 0 },
        { label: '已支付', value: 1 },
        { label: '支付失败', value: 2 },
      ],
    },
    {
      title: '下单时间',
      dataIndex: 'createTime',
      key: 'SEARCH_GTE_createTime',
      type: 'date',
    },
  ];

  return (
    <div>
      {/* 订单列表 */}
      <CmBasePage
        columns={columns}
        apiEndpoint="/contract/currencyOrder/list"
        apiMethod="get"
        searchFieldList={searchFieldList}
        onView={handleView}
        actionButtons={{
          view: true,
          edit: false,
          delete: false,
        }}
        rowKey="id"
        toolBarExtraButtons={[
          <Button
            key="updateStatus"
            type="primary"
            onClick={handleUpdateStatus}
          >
            更新状态
          </Button>,
        ]}
      />

      {/* 订单详情弹窗 */}
      <Modal
        title="订单详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </button>,
        ]}
        width={800}
      >
        {currentRecord && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="订单号" span={2}>
              {currentRecord.orderNo}
            </Descriptions.Item>
            <Descriptions.Item label="用户名">
              {currentRecord.userName}
            </Descriptions.Item>
            <Descriptions.Item label="联系电话">
              {currentRecord.phone}
            </Descriptions.Item>
            <Descriptions.Item label="订单类型">
              <Tag color={orderTypeMap[currentRecord.orderType]?.color}>
                {orderTypeMap[currentRecord.orderType]?.text}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="订单金额">
              ¥{Number(currentRecord.orderAmount || 0).toFixed(2)}
            </Descriptions.Item>
            <Descriptions.Item label="支付状态">
              <Tag color={payStatusMap[currentRecord.payStatus]?.color}>
                {payStatusMap[currentRecord.payStatus]?.text}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="订单状态">
              <Tag color={orderStatusMap[currentRecord.orderStatus]?.color}>
                {orderStatusMap[currentRecord.orderStatus]?.text}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="下单时间" span={2}>
              {currentRecord.createTime}
            </Descriptions.Item>
            <Descriptions.Item label="收货地址" span={2}>
              {currentRecord.address || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="订单备注" span={2}>
              {currentRecord.remark || '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* 状态更新表单 */}
      <DataForm
        visible={statusVisible}
        title="更新订单状态"
        initialValues={{
          orderStatus: currentRecord?.orderStatus,
        }}
        extraValues={{ id: currentRecord?.id }}
        onCancel={() => setStatusVisible(false)}
        onSubmit={handleStatusSubmit}
        onClosed={() => setCurrentRecord(null)}
        loading={loading}
        formType="modal"
      >
        <Form.Item
          name="orderStatus"
          label="订单状态"
          rules={[{ required: true, message: '请选择订单状态' }]}
        >
          <Select placeholder="请选择订单状态">
            <Option value={0}>待支付</Option>
            <Option value={1}>待接单</Option>
            <Option value={2}>进行中</Option>
            <Option value={3}>待验收</Option>
            <Option value={4}>已完成</Option>
            <Option value={5}>已取消</Option>
            <Option value={6}>退款中</Option>
            <Option value={7}>已退款</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="remark"
          label="状态变更备注"
        >
          <TextArea placeholder="请输入状态变更备注" rows={3} />
        </Form.Item>
      </DataForm>
    </div>
  );
};

export default OrderPage;
