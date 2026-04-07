import React, { useState, useEffect, useRef } from 'react';
import { message, Tag, Form, Input, Select, Modal, Button, Typography, Spin, Switch } from 'antd';
import CmBasePage from '@components/CmBasePage';
import DataForm from '@components/DataForm';
import {
  getUContractPositionList,
  getUContractPositionDetail,
  updateUContractPosition,
  stopUContractPosition,
  passUContractPositionReview,
  rejectUContractPositionReview,
  stopAllUContractPosition
} from '@api';
import { useSearchParams } from 'react-router-dom';

const { Text } = Typography;
const { Option } = Select;

/**
 * U本位合约持仓列表页面
 * 功能：持仓列表展示、搜索、平仓审核、平仓、爆仓、合约设置
 */
const PositionPage = () => {
  // 状态管理
  const [detailVisible, setDetailVisible] = useState(false);
  const [reviewVisible, setReviewVisible] = useState(false);
  const [configVisible, setConfigVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const timerRef = useRef(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // 获取URL参数中的userId
    const userId = searchParams.get('userId');
    if (userId) {
      // 可以在这里设置初始查询参数
      console.log('userId from URL:', userId);
    }

    // 启动自动刷新
    if (autoRefresh) {
      startAutoRefresh();
    }

    return () => {
      // 清除定时器
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [autoRefresh]);

  /**
   * 启动自动刷新
   */
  const startAutoRefresh = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      refreshTable();
      startAutoRefresh();
    }, 3000);
  };

  /**
   * 停止自动刷新
   */
  const stopAutoRefresh = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  /**
   * 切换自动刷新
   */
  const handleAutoRefreshChange = (checked) => {
    setAutoRefresh(checked);
    if (checked) {
      startAutoRefresh();
    } else {
      stopAutoRefresh();
    }
  };

  /**
   * 查看持仓详情
   */
  const handleView = (record) => {
    setCurrentRecord(record);
    setDetailVisible(true);
    stopAutoRefresh(); // 打开详情时停止自动刷新
  };

  /**
   * 打开平仓审核对话框
   */
  const handleReview = (record) => {
    setCurrentRecord(record);
    setReviewVisible(true);
    stopAutoRefresh();
  };

  /**
   * 打开合约设置对话框
   */
  const handleConfig = async (record) => {
    try {
      const response = await getUContractPositionDetail(record.id);
      if (response.code === 0 || response.code === 200) {
        setCurrentRecord(response.data);
        setConfigVisible(true);
        stopAutoRefresh();
      } else {
        message.error(response.msg || '获取详情失败');
      }
    } catch (error) {
      message.error('获取详情失败: ' + error.message);
    }
  };

  /**
   * 平仓操作
   */
  const handleStopPosition = async (record) => {
    Modal.confirm({
      title: '确认平仓',
      content: '是否确认执行平仓操作？',
      onOk: async () => {
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
      },
    });
  };

  /**
   * 一键爆仓操作
   */
  const handleBurstPosition = async (record) => {
    Modal.confirm({
      title: '确认爆仓',
      content: '是否确认执行一键爆仓操作？此操作不可逆！',
      onOk: async () => {
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
      },
    });
  };

  /**
   * 提交平仓审核
   */
  const handleReviewSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await passUContractPositionReview({
        id: currentRecord?.id,
        ...values
      });

      if (response.code === 0 || response.code === 200) {
        message.success('审核通过');
        setReviewVisible(false);
        refreshTable();
        startAutoRefresh();
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
        id: currentRecord?.id
      });

      if (response.code === 0 || response.code === 200) {
        message.success('已拒绝');
        setReviewVisible(false);
        refreshTable();
        startAutoRefresh();
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
        id: currentRecord?.id,
        ...values
      });

      if (response.code === 0 || response.code === 200) {
        message.success('设置成功');
        setConfigVisible(false);
        refreshTable();
        startAutoRefresh();
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
   * 复制订单号
   */
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      message.success('复制成功');
    }).catch(() => {
      message.error('复制失败');
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
      render: (_, record) => {
        const env = import.meta.env.VITE_APP_ENV || '';
        const isRxce = env.includes('rxce');

        return (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {!isRxce ? (
              <>
                <Button
                  size="small"
                  type="primary"
                  onClick={() => handleView(record)}
                >
                  止盈止损
                </Button>
                {record.auditStatus === 3 && (
                  <Button
                    size="small"
                    type="primary"
                    onClick={() => handleReview(record)}
                  >
                    平仓审核
                  </Button>
                )}
              </>
            ) : (
              <>
                {record.auditStatus !== 1 && (
                  <Button
                    size="small"
                    type="primary"
                    onClick={() => handleReview(record)}
                  >
                    平仓审核
                  </Button>
                )}
                {record.status !== 1 && (
                  <Button
                    size="small"
                    danger
                    onClick={() => handleStopPosition(record)}
                  >
                    平仓
                  </Button>
                )}
                <Button
                  size="small"
                  type="primary"
                  onClick={() => handleConfig(record)}
                >
                  开启平仓设置
                </Button>
                {record.status !== 1 && (
                  <Button
                    size="small"
                    danger
                    onClick={() => handleBurstPosition(record)}
                  >
                    一键爆仓
                  </Button>
                )}
              </>
            )}
          </div>
        );
      },
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
      title: '仓位编号',
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
        { label: '持仓中', value: 0 },
        { label: '已平仓', value: 1 },
        { label: '强平', value: 2 },
        { label: '爆仓', value: 3 },
      ],
    },
  ];

  return (
    <div>
      {/* 自动刷新开关 */}
      <div style={{ padding: '16px 0', marginBottom: '16px', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Text>自动刷新：</Text>
          <Switch
            checked={autoRefresh}
            onChange={handleAutoRefreshChange}
            checkedChildren="开启"
            unCheckedChildren="关闭"
          />
          <Text type="secondary" style={{ marginLeft: '8px', fontSize: '12px' }}>
            {autoRefresh ? '每3秒自动刷新' : '已关闭自动刷新'}
          </Text>
        </div>
      </div>

      {/* 持仓列表 */}
      <CmBasePage
        columns={columns}
        apiEndpoint="/contract/contractPosition/list"
        apiMethod="get"
        searchFieldList={searchFieldList}
        onView={handleView}
        actionButtons={{
          view: false,
          edit: false,
          delete: false,
        }}
        rowKey="id"
      />

      {/* 持仓详情弹窗 */}
      <Modal
        title="持仓详情"
        open={detailVisible}
        onCancel={() => {
          setDetailVisible(false);
          startAutoRefresh();
        }}
        footer={[
          <Button key="close" onClick={() => {
            setDetailVisible(false);
            startAutoRefresh();
          }}>
            关闭
          </Button>,
        ]}
        width={1000}
      >
        {currentRecord && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>用户ID：</Text>
              <Text>{currentRecord.userId}</Text>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>用户名：</Text>
              <Text>{currentRecord.userName || '-'}</Text>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>仓位编号：</Text>
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
              <Tag color={positionStatusMap[currentRecord.status]?.color}>
                {positionStatusMap[currentRecord.status]?.text}
              </Tag>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>审核状态：</Text>
              <Tag color={auditStatusMap[currentRecord.auditStatus]?.color}>
                {auditStatusMap[currentRecord.auditStatus]?.text}
              </Tag>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>币种：</Text>
              <Text>{currentRecord.symbol}</Text>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>保证金：</Text>
              <Text>{currentRecord.amount}</Text>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>杠杆：</Text>
              <Text>{currentRecord.leverage}x</Text>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>当前收益：</Text>
              <Text>{currentRecord.ureate}</Text>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>收益：</Text>
              <Text>{currentRecord.earn}</Text>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>持仓数量：</Text>
              <Text>{currentRecord.openNum}</Text>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>开仓均价：</Text>
              <Text>{currentRecord.openPrice}</Text>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>预计强平价：</Text>
              <Text>{currentRecord.closePrice}</Text>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>开仓手续费：</Text>
              <Text>{currentRecord.openFee}</Text>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>调整保证金：</Text>
              <Text>{currentRecord.adjustAmount}</Text>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>成交价：</Text>
              <Text>{currentRecord.dealPrice}</Text>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>成交量：</Text>
              <Text>{currentRecord.dealNum}</Text>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>成交时间：</Text>
              <Text>{currentRecord.dealTime}</Text>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>卖出手续费：</Text>
              <Text>{currentRecord.sellFee}</Text>
            </div>
          </div>
        )}
      </Modal>

      {/* 平仓审核表单 */}
      <DataForm
        visible={reviewVisible}
        title="平仓审核"
        initialValues={{
          type: currentRecord?.type,
          delegateType: currentRecord?.delegateType,
          orderNo: currentRecord?.orderNo,
          symbol: currentRecord?.symbol,
          openNum: currentRecord?.openNum,
          openPrice: currentRecord?.openPrice,
          dealPrice: currentRecord?.dealPrice,
        }}
        extraValues={{ id: currentRecord?.id }}
        onCancel={() => {
          setReviewVisible(false);
          startAutoRefresh();
        }}
        onSubmit={handleReviewSubmit}
        onClosed={() => setCurrentRecord(null)}
        loading={loading}
        formType="modal"
        width={800}
        footer={[
          <Button key="cancel" onClick={() => {
            setReviewVisible(false);
            startAutoRefresh();
          }}>
            取消
          </Button>,
          <Button key="reject" danger onClick={handleReviewReject}>
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
          <Input disabled />
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
          <Input />
        </Form.Item>

        <Form.Item
          name="openNum"
          label="持仓数量"
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="openPrice"
          label="开仓均价"
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="dealPrice"
          label="成交价"
        >
          <Input />
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
        onCancel={() => {
          setConfigVisible(false);
          startAutoRefresh();
        }}
        onSubmit={handleConfigSubmit}
        onClosed={() => setCurrentRecord(null)}
        loading={loading}
        formType="modal"
        width={600}
      >
        <Form.Item
          name="deliveryDays"
          label="平仓天数"
          rules={[{ required: true, message: '请输入平仓天数' }]}
        >
          <Input type="number" placeholder="请输入平仓天数" />
        </Form.Item>

        <Form.Item
          name="earnRate"
          label="止盈率"
          rules={[{ required: true, message: '请输入止盈率' }]}
        >
          <Input placeholder="请输入止盈率" />
        </Form.Item>

        <Form.Item
          name="lossRate"
          label="止损率"
          rules={[{ required: true, message: '请输入止损率' }]}
        >
          <Input placeholder="请输入止损率" />
        </Form.Item>
      </DataForm>
    </div>
  );
};

export default PositionPage;
