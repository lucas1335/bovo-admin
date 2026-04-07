import React, { useState } from 'react';
import { message, Tag, Form, Select, Descriptions, Modal, Button } from 'antd';
import CmBasePage from '@components/CmBasePage';
import DataForm from '@components/DataForm';
import {
  getUContractOrderList,
  getUContractPositionList,
  stopUContractPosition,
  stopAllUContractPosition,
  passUContractPositionReview,
  rejectUContractPositionReview,
  updateUContractPosition
} from '@api';

const { Option } = Select;

/**
 * U本位合约订单管理页面
 * 功能：合约订单列表展示、搜索、订单详情查看、持仓管理、强平管理
 */
const UContractOrderPage = () => {
  // 状态管理
  const [detailVisible, setDetailVisible] = useState(false);
  const [reviewVisible, setReviewVisible] = useState(false);
  const [configVisible, setConfigVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [activeTab, setActiveTab] = useState('order'); // 'order' | 'position'
  const [loading, setLoading] = useState(false);

  /**
   * 查看订单详情
   */
  const handleView = (record) => {
    setCurrentRecord(record);
    setDetailVisible(true);
  };

  /**
   * 打开平仓审核对话框
   */
  const handleReview = (record) => {
    setCurrentRecord(record);
    setReviewVisible(true);
  };

  /**
   * 打开合约设置对话框
   */
  const handleConfig = (record) => {
    setCurrentRecord(record);
    setConfigVisible(true);
  };

  /**
   * 平仓操作
   */
  const handleStopPosition = async (record) => {
    try {
      const response = await stopUContractPosition({ id: record.id });
      if (response.code === 0 || response.code === 200) {
        message.success('平仓成功');
        refreshTable();
      } else {
        message.error(response.msg || '平仓失败');
      }
    } catch (error) {
      message.error('平仓失败: ' + error.message);
    }
  };

  /**
   * 一键爆仓操作
   */
  const handleBurstPosition = async (record) => {
    try {
      const response = await stopAllUContractPosition({ id: record.id });
      if (response.code === 0 || response.code === 200) {
        message.success('爆仓成功');
        refreshTable();
      } else {
        message.error(response.msg || '爆仓失败');
      }
    } catch (error) {
      message.error('爆仓失败: ' + error.message);
    }
  };

  /**
   * 提交平仓审核
   */
  const handleReviewSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await passUContractPositionReview({
        id: currentRecord.id,
        ...values
      });

      if (response.code === 0 || response.code === 200) {
        message.success('审核通过');
        setReviewVisible(false);
        refreshTable();
      } else {
        message.error(response.msg || '审核失败');
      }
    } catch (error) {
      message.error('审核失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 拒绝平仓审核
   */
  const handleReviewReject = async () => {
    setLoading(true);
    try {
      const response = await rejectUContractPositionReview({
        id: currentRecord.id
      });

      if (response.code === 0 || response.code === 200) {
        message.success('已拒绝');
        setReviewVisible(false);
        refreshTable();
      } else {
        message.error(response.msg || '操作失败');
      }
    } catch (error) {
      message.error('操作失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 提交合约设置
   */
  const handleConfigSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await updateUContractPosition({
        id: currentRecord.id,
        ...values
      });

      if (response.code === 0 || response.code === 200) {
        message.success('设置成功');
        setConfigVisible(false);
        refreshTable();
      } else {
        message.error(response.msg || '设置失败');
      }
    } catch (error) {
      message.error('设置失败: ' + error.message);
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

  // 持仓状态映射
  const positionStatusMap = {
    0: { color: 'processing', text: '持仓中' },
    1: { color: 'default', text: '已平仓' },
    2: { color: 'red', text: '强平' },
    3: { color: 'orange', text: '爆仓' },
  };

  // 审核状态映射
  const auditStatusMap = {
    0: { color: 'default', text: '待审核' },
    1: { color: 'green', text: '已通过' },
    2: { color: 'red', text: '已拒绝' },
    3: { color: 'orange', text: '审核中' },
  };

  /**
   * 合约订单列配置
   */
  const orderColumns = [
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
   * 合约持仓列配置
   */
  const positionColumns = [
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 120,
      sorter: true,
    },
    {
      title: '用户名',
      dataIndex: 'userName',
      key: 'userName',
      width: 120,
    },
    {
      title: '仓位编号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 180,
      sorter: true,
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
        const item = positionStatusMap[status] || { color: 'default', text: '未知' };
        return <Tag color={item.color}>{item.text}</Tag>;
      },
    },
    {
      title: '审核状态',
      dataIndex: 'auditStatus',
      key: 'auditStatus',
      width: 100,
      render: (status) => {
        const item = auditStatusMap[status] || { color: 'default', text: '未知' };
        return <Tag color={item.color}>{item.text}</Tag>;
      },
    },
    {
      title: '币种',
      dataIndex: 'symbol',
      key: 'symbol',
      width: 120,
    },
    {
      title: '保证金',
      dataIndex: 'amount',
      key: 'amount',
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
      title: '当前收益',
      dataIndex: 'ureate',
      key: 'ureate',
      width: 120,
    },
    {
      title: '收益',
      dataIndex: 'earn',
      key: 'earn',
      width: 120,
    },
    {
      title: '持仓数量',
      dataIndex: 'openNum',
      key: 'openNum',
      width: 120,
    },
    {
      title: '开仓均价',
      dataIndex: 'openPrice',
      key: 'openPrice',
      width: 120,
    },
    {
      title: '预计强平价',
      dataIndex: 'closePrice',
      key: 'closePrice',
      width: 120,
    },
    {
      title: '开仓手续费',
      dataIndex: 'openFee',
      key: 'openFee',
      width: 120,
    },
    {
      title: '调整保证金',
      dataIndex: 'adjustAmount',
      key: 'adjustAmount',
      width: 120,
    },
    {
      title: '成交价',
      dataIndex: 'dealPrice',
      key: 'dealPrice',
      width: 120,
    },
    {
      title: '成交量',
      dataIndex: 'dealNum',
      key: 'dealNum',
      width: 120,
    },
    {
      title: '成交时间',
      dataIndex: 'dealTime',
      key: 'dealTime',
      width: 180,
    },
    {
      title: '卖出手续费',
      dataIndex: 'sellFee',
      key: 'sellFee',
      width: 120,
    },
    {
      title: '操作',
      key: 'action',
      width: 300,
      fixed: 'right',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Button
            size="small"
            type="primary"
            onClick={() => handleView(record)}
          >
            查看详情
          </Button>
          {record.auditStatus === 3 && (
            <Button
              size="small"
              type="default"
              onClick={() => handleReview(record)}
            >
              平仓审核
            </Button>
          )}
          {record.status !== 1 && (
            <Button
              size="small"
              type="primary"
              danger
              onClick={() => handleStopPosition(record)}
            >
              平仓
            </Button>
          )}
          {record.status !== 1 && (
            <Button
              size="small"
              type="primary"
              danger
              onClick={() => handleBurstPosition(record)}
            >
              一键爆仓
            </Button>
          )}
          <Button
            size="small"
            type="default"
            onClick={() => handleConfig(record)}
          >
            合约设置
          </Button>
        </div>
      ),
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
    {
      title: '交易类型',
      dataIndex: 'type',
      key: 'SEARCH_EQ_type',
      type: 'select',
      options: [
        { label: '买多', value: 0 },
        { label: '卖空', value: 1 },
      ],
    },
    {
      title: '委托类型',
      dataIndex: 'delegateType',
      key: 'SEARCH_EQ_delegateType',
      type: 'select',
      options: [
        { label: '限价委托', value: 0 },
        { label: '市价委托', value: 1 },
      ],
    },
  ];

  return (
    <div>
      {/* 合约订单列表 */}
      <CmBasePage
        columns={activeTab === 'order' ? orderColumns : positionColumns}
        apiEndpoint={activeTab === 'order' ? '/contract/contractOrder/list' : '/contract/contractPosition/list'}
        apiMethod="get"
        searchFieldList={searchFieldList}
        onView={handleView}
        actionButtons={{
          view: activeTab === 'order',
          edit: false,
          delete: false,
        }}
        rowKey="id"
        toolBarExtraButtons={[
          <Button
            key="toggleTab"
            type={activeTab === 'order' ? 'primary' : 'default'}
            onClick={() => setActiveTab(activeTab === 'order' ? 'position' : 'order')}
          >
            {activeTab === 'order' ? '切换到持仓管理' : '切换到订单管理'}
          </Button>,
        ]}
      />

      {/* 订单/持仓详情弹窗 */}
      <Modal
        title={activeTab === 'order' ? '订单详情' : '持仓详情'}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>,
        ]}
        width={1000}
      >
        {currentRecord && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="用户ID" span={1}>
              {currentRecord.userId}
            </Descriptions.Item>
            <Descriptions.Item label="用户名" span={1}>
              {currentRecord.userName || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="订单编号" span={2}>
              {currentRecord.orderNo}
            </Descriptions.Item>
            <Descriptions.Item label="交易类型">
              <Tag color={tradeTypeMap[currentRecord.type]?.color}>
                {tradeTypeMap[currentRecord.type]?.text}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="委托类型">
              <Tag color={delegateTypeMap[currentRecord.delegateType]?.color}>
                {delegateTypeMap[currentRecord.delegateType]?.text}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={activeTab === 'order' ? orderStatusMap[currentRecord.status]?.color : positionStatusMap[currentRecord.status]?.color}>
                {activeTab === 'order' ? orderStatusMap[currentRecord.status]?.text : positionStatusMap[currentRecord.status]?.text}
              </Tag>
            </Descriptions.Item>
            {activeTab === 'position' && (
              <Descriptions.Item label="审核状态">
                <Tag color={auditStatusMap[currentRecord.auditStatus]?.color}>
                  {auditStatusMap[currentRecord.auditStatus]?.text}
                </Tag>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="交易币种">
              {currentRecord.symbol}
            </Descriptions.Item>
            <Descriptions.Item label="杠杆">
              {currentRecord.leverage}x
            </Descriptions.Item>
            {activeTab === 'order' ? (
              <>
                <Descriptions.Item label="委托总量">
                  {currentRecord.delegateTotal}
                </Descriptions.Item>
                <Descriptions.Item label="委托价格">
                  {currentRecord.delegatePrice}
                </Descriptions.Item>
                <Descriptions.Item label="委托价值">
                  {currentRecord.delegateValue}
                </Descriptions.Item>
                <Descriptions.Item label="已成交量">
                  {currentRecord.dealNum}
                </Descriptions.Item>
                <Descriptions.Item label="成交价">
                  {currentRecord.dealPrice}
                </Descriptions.Item>
                <Descriptions.Item label="成交价值">
                  {currentRecord.dealValue}
                </Descriptions.Item>
                <Descriptions.Item label="手续费" span={2}>
                  {currentRecord.fee}
                </Descriptions.Item>
                <Descriptions.Item label="委托时间">
                  {currentRecord.delegateTime}
                </Descriptions.Item>
                <Descriptions.Item label="成交时间">
                  {currentRecord.dealTime}
                </Descriptions.Item>
              </>
            ) : (
              <>
                <Descriptions.Item label="保证金">
                  {currentRecord.amount}
                </Descriptions.Item>
                <Descriptions.Item label="当前收益">
                  {currentRecord.ureate}
                </Descriptions.Item>
                <Descriptions.Item label="收益">
                  {currentRecord.earn}
                </Descriptions.Item>
                <Descriptions.Item label="持仓数量">
                  {currentRecord.openNum}
                </Descriptions.Item>
                <Descriptions.Item label="开仓均价">
                  {currentRecord.openPrice}
                </Descriptions.Item>
                <Descriptions.Item label="预计强平价">
                  {currentRecord.closePrice}
                </Descriptions.Item>
                <Descriptions.Item label="开仓手续费">
                  {currentRecord.openFee}
                </Descriptions.Item>
                <Descriptions.Item label="调整保证金">
                  {currentRecord.adjustAmount}
                </Descriptions.Item>
                <Descriptions.Item label="成交价">
                  {currentRecord.dealPrice}
                </Descriptions.Item>
                <Descriptions.Item label="成交量">
                  {currentRecord.dealNum}
                </Descriptions.Item>
                <Descriptions.Item label="成交时间" span={2}>
                  {currentRecord.dealTime}
                </Descriptions.Item>
                <Descriptions.Item label="卖出手续费">
                  {currentRecord.sellFee}
                </Descriptions.Item>
              </>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* 平仓审核表单 */}
      <DataForm
        visible={reviewVisible}
        title="平仓审核"
        initialValues={{
          type: currentRecord?.type,
          status: currentRecord?.delegateType,
        }}
        extraValues={{ id: currentRecord?.id }}
        onCancel={() => setReviewVisible(false)}
        onSubmit={handleReviewSubmit}
        onClosed={() => setCurrentRecord(null)}
        loading={loading}
        formType="modal"
        footer={[
          <Button key="cancel" onClick={() => setReviewVisible(false)}>
            取消
          </Button>,
          <Button key="reject" type="default" danger onClick={handleReviewReject}>
            不通过
          </Button>,
          <Button key="submit" type="primary" onClick={handleReviewSubmit}>
            通过
          </Button>,
        ]}
      >
        <Form.Item
          name="orderNo"
          label="仓位编号"
        >
          <Select disabled>
            <Option value={currentRecord?.orderNo}>{currentRecord?.orderNo}</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="type"
          label="交易类型"
          rules={[{ required: true, message: '请选择交易类型' }]}
        >
          <Select placeholder="请选择交易类型">
            <Option value={0}>买多</Option>
            <Option value={1}>卖空</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="delegateType"
          label="委托类型"
          rules={[{ required: true, message: '请选择委托类型' }]}
        >
          <Select placeholder="请选择委托类型">
            <Option value={0}>限价委托</Option>
            <Option value={1}>市价委托</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="symbol"
          label="币种"
        >
          <Select disabled>
            <Option value={currentRecord?.symbol}>{currentRecord?.symbol}</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="openNum"
          label="持仓数量"
        >
          <Select disabled>
            <Option value={currentRecord?.openNum}>{currentRecord?.openNum}</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="openPrice"
          label="开仓均价"
        >
          <Select disabled>
            <Option value={currentRecord?.openPrice}>{currentRecord?.openPrice}</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="dealPrice"
          label="成交价"
        >
          <Select disabled>
            <Option value={currentRecord?.dealPrice}>{currentRecord?.dealPrice}</Option>
          </Select>
        </Form.Item>
      </DataForm>

      {/* 合约设置表单 */}
      <DataForm
        visible={configVisible}
        title="合约设置"
        initialValues={{
          deliveryDays: currentRecord?.deliveryDays,
          earnRate: currentRecord?.earnRate,
          lossRate: currentRecord?.lossRate,
        }}
        extraValues={{ id: currentRecord?.id }}
        onCancel={() => setConfigVisible(false)}
        onSubmit={handleConfigSubmit}
        onClosed={() => setCurrentRecord(null)}
        loading={loading}
        formType="modal"
      >
        <Form.Item
          name="deliveryDays"
          label="平仓天数"
          rules={[{ required: true, message: '请输入平仓天数' }]}
        >
          <Select placeholder="请输入平仓天数">
            <Option value={7}>7天</Option>
            <Option value={15}>15天</Option>
            <Option value={30}>30天</Option>
            <Option value={60}>60天</Option>
            <Option value={90}>90天</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="earnRate"
          label="止盈率(%)"
          rules={[{ required: true, message: '请输入止盈率' }]}
        >
          <Select placeholder="请输入止盈率">
            <Option value={10}>10%</Option>
            <Option value={20}>20%</Option>
            <Option value={30}>30%</Option>
            <Option value={50}>50%</Option>
            <Option value={100}>100%</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="lossRate"
          label="止损率(%)"
          rules={[{ required: true, message: '请输入止损率' }]}
        >
          <Select placeholder="请输入止损率">
            <Option value={10}>10%</Option>
            <Option value={20}>20%</Option>
            <Option value={30}>30%</Option>
            <Option value={50}>50%</Option>
            <Option value={80}>80%</Option>
          </Select>
        </Form.Item>
      </DataForm>
    </div>
  );
};

export default UContractOrderPage;
