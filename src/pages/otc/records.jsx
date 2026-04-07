import React, { useState, useRef } from 'react';
import { message, Tag, Form, Input, Button, Space, Modal, Row, Col, Descriptions, Divider } from 'antd';
import { ExclamationCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import CmBasePage from '@components/CmBasePage';
import CmImage from '@components/CmImage';
import {
  getOtcRecordList,
  getOtcRecordDetail,
  getOtcStatistics,
  markOtcOrder,
  handleOtcAppeal,
  cancelOtcOrder,
  completeOtcOrder,
} from '@api/modules/otc';

const { confirm } = Modal;

/**
 * OTC交易记录管理页面
 * 功能：交易记录列表展示、搜索、详情查看、标记管理、申诉处理
 */
const OtcRecordsPage = () => {
  // 状态管理（按固定顺序）
  const [detailVisible, setDetailVisible] = useState(false);
  const [appealVisible, setAppealVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailData, setDetailData] = useState(null);

  // 统计数据
  const [statistics, setStatistics] = useState({
    totalAmount: 0,
    totalQuantity: 0,
  });

  const [appealForm] = Form.useForm();

  // 使用 ref 存储最新的查询参数，用于统计数据
  const queryRef = useRef({
    tradeType: null,
    beginTime: null,
    endTime: null
  });

  /**
   * 加载统计数据
   */
  const fetchStatistics = async (searchParams) => {
    try {
      const searchParam = searchParams || {};

      // 更新查询参数ref
      queryRef.current = {
        tradeType: searchParam.SEARCH_EQ_tradeType || null,
        beginTime: searchParam.SEARCH_GTE_createTime || null,
        endTime: searchParam.SEARCH_LTE_createTime || null
      };

      const requestParams = {
        type: queryRef.current.tradeType,
        startTime: queryRef.current.beginTime,
        endTime: queryRef.current.endTime
      };

      const response = await getOtcStatistics(requestParams);
      if (response.code === 0 || response.code === 200) {
        setStatistics({
          totalAmount: response.data?.totalAmount || 0,
          totalQuantity: response.data?.totalQuantity || 0,
        });
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
    }
  };

  /**
   * 加载列表数据
   */
  const loadData = async (params, sorter, filter) => {
    // 处理排序参数
    let orderParam = {};
    if (sorter && Object.keys(sorter).length > 0) {
      Object.keys(sorter).forEach(sortField => {
        const sortOrder = sorter[sortField];
        if (sortOrder) {
          orderParam[sortField] = sortOrder === 'ascend';
        }
      });
    }

    // 构造请求参数
    const requestParams = {
      pageNum: params.current || 1,
      pageSize: params.pageSize || 10,
      searchParam: params.searchParam || '{}',
      orderByColumn: 'createTime',
      isAsc: false,
      ...orderParam
    };

    // 加载统计数据
    try {
      const searchParam = JSON.parse(requestParams.searchParam);
      await fetchStatistics(searchParam);
    } catch (e) {
      // 忽略解析错误
    }

    // 调用API
    const response = await getOtcRecordList(requestParams);

    if (response.code === 0 || response.code === 200) {
      return {
        data: response.data?.records || response.data?.list || [],
        success: true,
        total: response.data?.total || 0
      };
    } else {
      message.error(response.msg || '获取数据失败');
      return {
        data: [],
        success: false,
        total: 0
      };
    }
  };

  /**
   * 查看订单详情
   */
  const handleView = async (record) => {
    setLoading(true);
    try {
      const response = await getOtcRecordDetail({ id: record.id });
      if (response.code === 0 || response.code === 200) {
        setDetailData(response.data);
        setCurrentRecord(response.data);
        setDetailVisible(true);
      } else {
        message.error(response.msg || '获取订单详情失败');
      }
    } catch (error) {
      message.error('获取订单详情失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 标记/取消标记订单
   */
  const handleMark = async (record) => {
    const isMarked = record.isMarked === 1;
    const markType = isMarked ? 0 : 1; // 0-取消标记，1-标记

    confirm({
      title: isMarked ? '确认解除标记?' : '确认标记订单?',
      icon: <ExclamationCircleOutlined />,
      content: isMarked ? '确定要解除该订单的标记吗？' : '确定要标记该订单吗？',
      onOk: async () => {
        try {
          setLoading(true);
          const response = await markOtcOrder({
            id: record.id,
            markType: markType
          });

          if (response.code === 0 || response.code === 200) {
            message.success(isMarked ? '已解除标记' : '标记成功');
            refreshTable();
          } else {
            message.error(response.msg || '操作失败');
          }
        } catch (error) {
          message.error('操作失败: ' + error.message);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  /**
   * 打开申诉处理对话框
   */
  const handleAppeal = async (record) => {
    setLoading(true);
    try {
      const response = await getOtcRecordDetail({ id: record.id });
      if (response.code === 0 || response.code === 200) {
        setDetailData(response.data);
        setCurrentRecord(response.data);
        appealForm.setFieldsValue({
          appealResult: '',
          remark: ''
        });
        setAppealVisible(true);
      } else {
        message.error(response.msg || '获取订单详情失败');
      }
    } catch (error) {
      message.error('获取订单详情失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 提交申诉处理
   */
  const handleSubmitAppeal = async () => {
    try {
      const values = await appealForm.validateFields();
      setLoading(true);

      const submitData = {
        id: currentRecord?.id,
        appealResult: values.appealResult,
        remark: values.remark
      };

      const response = await handleOtcAppeal(submitData);

      if (response.code === 0 || response.code === 200) {
        message.success('申诉处理成功');
        setAppealVisible(false);
        refreshTable();
      } else {
        message.error(response.msg || '操作失败');
      }
    } catch (error) {
      if (error.errorFields) {
        message.warning('请填写必填项');
      } else {
        message.error('操作失败: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * 取消订单
   */
  const handleCancel = (record) => {
    confirm({
      title: '确认取消订单?',
      icon: <ExclamationCircleOutlined />,
      content: '确定要取消该订单吗？此操作不可撤销。',
      onOk: async () => {
        try {
          setLoading(true);
          const response = await cancelOtcOrder({
            id: record.id,
            reason: '管理员取消'
          });

          if (response.code === 0 || response.code === 200) {
            message.success('订单已取消');
            refreshTable();
          } else {
            message.error(response.msg || '操作失败');
          }
        } catch (error) {
          message.error('操作失败: ' + error.message);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  /**
   * 完成订单（放币）
   */
  const handleComplete = (record) => {
    confirm({
      title: '确认完成订单?',
      icon: <CheckCircleOutlined />,
      content: '确定要完成该订单并释放币种吗？此操作不可撤销。',
      onOk: async () => {
        try {
          setLoading(true);
          const response = await completeOtcOrder({ id: record.id });

          if (response.code === 0 || response.code === 200) {
            message.success('订单已完成');
            refreshTable();
          } else {
            message.error(response.msg || '操作失败');
          }
        } catch (error) {
          message.error('操作失败: ' + error.message);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  /**
   * 刷新表格
   */
  const refreshTable = () => {
    document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
      new CustomEvent('reload')
    );
  };

  // 交易状态映射
  const statusMap = {
    '-2': { color: 'red', text: '取消订单' },
    '-1': { color: 'default', text: '订单过期' },
    '0': { color: 'processing', text: '买家正在付款' },
    '1': { color: 'warning', text: '买家已标记付款' },
    '2': { color: 'success', text: '交易成功' },
    '3': { color: 'error', text: '提出申诉' },
  };

  // 交易类型映射
  const tradeTypeMap = {
    '0': { color: 'cyan', text: '出金' },
    '1': { color: 'blue', text: '入金' },
  };

  // 标记状态映射
  const markStatusMap = {
    '0': { color: 'default', text: '未标记' },
    '1': { color: 'red', text: '已标记' },
  };

  // 列配置
  const columns = [
    {
      title: '订单信息',
      key: 'orderInfo',
      width: 200,
      render: (_, record) => (
        <div>
          <div>广告ID: {record.advertiseId || '-'}</div>
          <div>订单号: <span style={{ color: '#777', fontWeight: 700, fontSize: 14 }}>{record.orderSerial || record.id}</span></div>
        </div>
      ),
    },
    {
      title: '购买方信息',
      key: 'buyerInfo',
      width: 280,
      render: (_, record) => (
        <div style={{ fontSize: 12 }}>
          <div>用户昵称: {record.buyerNickname || '-'}</div>
          <div>用户实名: <strong style={{ color: '#777' }}>{record.buyerRealName || '-'}</strong></div>
          <div>用户UID: {record.buyerUid || '-'}</div>
          <div>用户手机: {record.buyerPhone || '-'}</div>
          <div>机构码: {record.buyerOrgCode || '-'}</div>
          <div style={{ color: '#69AA46' }}>正在购买</div>
          <div>开户名: <span style={{ color: '#FF892A' }}>{record.buyerAccountName || '-'}</span></div>
          <div>银行卡号: <span style={{ color: '#FF892A' }}>{record.buyerBankCard || '-'}</span></div>
          <div>银行名称: <span style={{ color: '#FF892A' }}>{record.buyerBankName || '-'}</span></div>
        </div>
      ),
    },
    {
      title: '出售方信息',
      key: 'sellerInfo',
      width: 280,
      render: (_, record) => (
        <div style={{ fontSize: 12 }}>
          <div>商家昵称: {record.sellerNickname || '-'}</div>
          <div>商家实名: <strong style={{ color: '#777' }}>{record.sellerRealName || '-'}</strong></div>
          <div>商家UID: {record.sellerUid || '-'}</div>
          <div>商家手机: {record.sellerPhone || '-'}</div>
          <div>机构码: {record.sellerOrgCode || '-'}</div>
          <div style={{ color: '#69AA46' }}>正在出售</div>
          <div>开户名: <span style={{ color: '#FF892A' }}>{record.sellerAccountName || '-'}</span></div>
          <div>银行卡号: <span style={{ color: '#FF892A' }}>{record.sellerBankCard || '-'}</span></div>
          <div>银行名称: <span style={{ color: '#FF892A' }}>{record.sellerBankName || '-'}</span></div>
        </div>
      ),
    },
    {
      title: '金额信息',
      key: 'amountInfo',
      width: 200,
      render: (_, record) => (
        <div style={{ fontSize: 12 }}>
          <div>总额: <span style={{ fontSize: 16, color: '#478FCA', fontWeight: 'bold' }}>{record.totalAmount ? Number(record.totalAmount).toFixed(2) : '-'}</span></div>
          <div>总量: {record.totalQuantity || '-'}</div>
          <div>单价: {record.unitPrice ? Number(record.unitPrice).toFixed(2) : '-'}/元</div>
          <div>下单时间: {record.createTime || '-'}</div>
          <div>完成时间: {record.completeTime || '-'}</div>
        </div>
      ),
    },
    {
      title: '转账凭证',
      dataIndex: 'transferProof',
      key: 'transferProof',
      width: 120,
      render: (text) => text ? <CmImage src={text} width={80} height={60} /> : '-',
    },
    {
      title: '标记状态',
      dataIndex: 'isMarked',
      key: 'isMarked',
      width: 100,
      render: (marked) => {
        const status = markStatusMap[marked] || markStatusMap['0'];
        return <Tag color={status.color}>{status.text}</Tag>;
      },
    },
    {
      title: '交易状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const item = statusMap[status] || { color: 'default', text: '未知' };
        return <Tag color={item.color}>{item.text}</Tag>;
      },
    },
    {
      title: '交易类型',
      dataIndex: 'tradeType',
      key: 'tradeType',
      width: 100,
      render: (type) => {
        const item = tradeTypeMap[type] || { color: 'default', text: '未知' };
        return <Tag color={item.color}>{item.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => {
        return (
          <Space size="small">
            <Button
              type="link"
              size="small"
              onClick={() => handleView(record)}
            >
              查看
            </Button>

            {/* 标记/取消标记按钮 */}
            <Button
              type="link"
              size="small"
              onClick={() => handleMark(record)}
              style={{ color: record.isMarked === 1 ? '#52c41a' : '#ff4d4f' }}
            >
              {record.isMarked === 1 ? '解除标记' : '标记'}
            </Button>

            {/* 申诉状态显示申诉处理按钮 */}
            {record.status === '3' && (
              <Button
                type="link"
                size="small"
                style={{ color: '#faad14' }}
                onClick={() => handleAppeal(record)}
              >
                处理申诉
              </Button>
            )}

            {/* 待付款状态可以取消订单 */}
            {(record.status === '0' || record.status === '1') && (
              <Button
                type="link"
                size="small"
                danger
                onClick={() => handleCancel(record)}
              >
                取消
              </Button>
            )}

            {/* 买家已标记付款，管理员可以完成订单 */}
            {record.status === '1' && (
              <Button
                type="link"
                size="small"
                style={{ color: '#52c41a' }}
                onClick={() => handleComplete(record)}
              >
                完成
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  // 搜索字段配置
  const searchFieldList = [
    {
      title: '订单ID',
      dataIndex: 'id',
      key: 'SEARCH_EQ_id',
      type: 'digit',
    },
    {
      title: '用户UID',
      dataIndex: 'userId',
      key: 'SEARCH_EQ_userId',
      type: 'digit',
    },
    {
      title: '用户开户银行名',
      dataIndex: 'accountName',
      key: 'SEARCH_LIKE_accountName',
      type: 'text',
    },
    {
      title: '订单号',
      dataIndex: 'orderSerial',
      key: 'SEARCH_LIKE_orderSerial',
      type: 'text',
    },
    {
      title: '交易状态',
      dataIndex: 'status',
      key: 'SEARCH_EQ_status',
      type: 'select',
      options: [
        { label: '买家正在付款', value: '0' },
        { label: '买家已标记付款', value: '1' },
        { label: '交易成功', value: '2' },
        { label: '提出申诉', value: '3' },
        { label: '订单过期', value: '-1' },
        { label: '取消订单', value: '-2' },
      ],
    },
    {
      title: '交易类型',
      dataIndex: 'tradeType',
      key: 'SEARCH_EQ_tradeType',
      type: 'select',
      options: [
        { label: '出金', value: '0' },
        { label: '入金', value: '1' },
      ],
    },
    {
      title: '标记状态',
      dataIndex: 'isMarked',
      key: 'SEARCH_EQ_isMarked',
      type: 'select',
      options: [
        { label: '未标记', value: '0' },
        { label: '已标记', value: '1' },
      ],
    },
    {
      title: '起始时间',
      dataIndex: 'beginTime',
      key: 'SEARCH_GTE_createTime',
      type: 'dateTime',
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'SEARCH_LTE_createTime',
      type: 'dateTime',
    },
  ];

  // 自定义工具栏按钮（显示统计信息）
  const toolBarExtraButtons = [
    <Button key="totalAmount" type="default" disabled>
      总金额: {Number(statistics.totalAmount).toFixed(2)} 元
    </Button>,
    <Button key="totalQuantity" type="default" disabled>
      总数量: {Number(statistics.totalQuantity).toFixed(2)}
    </Button>,
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
          delete: false,
        }}
        rowKey="id"
      />

      {/* 查看详情弹窗 */}
      <Modal
        title="OTC交易详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>
        ]}
        width={900}
      >
        {detailData && (
          <div>
            <Divider orientation="left">订单信息</Divider>
            <Descriptions column={2} size="small">
              <Descriptions.Item label="订单ID">{detailData.id}</Descriptions.Item>
              <Descriptions.Item label="订单号">{detailData.orderSerial || '-'}</Descriptions.Item>
              <Descriptions.Item label="广告ID">{detailData.advertiseId || '-'}</Descriptions.Item>
              <Descriptions.Item label="交易状态">
                <Tag color={statusMap[detailData.status]?.color}>
                  {statusMap[detailData.status]?.text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="交易类型">
                <Tag color={tradeTypeMap[detailData.tradeType]?.color}>
                  {tradeTypeMap[detailData.tradeType]?.text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="标记状态">
                <Tag color={markStatusMap[detailData.isMarked]?.color}>
                  {markStatusMap[detailData.isMarked]?.text}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">金额信息</Divider>
            <Descriptions column={2} size="small">
              <Descriptions.Item label="总额">
                <span style={{ fontSize: 16, color: '#478FCA', fontWeight: 'bold' }}>
                  {detailData.totalAmount ? Number(detailData.totalAmount).toFixed(2) : '-'}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="总量">{detailData.totalQuantity || '-'}</Descriptions.Item>
              <Descriptions.Item label="单价">{detailData.unitPrice ? Number(detailData.unitPrice).toFixed(2) : '-'}/元</Descriptions.Item>
              <Descriptions.Item label="手续费">{detailData.fee ? Number(detailData.fee).toFixed(2) : '-'}</Descriptions.Item>
              <Descriptions.Item label="下单时间">{detailData.createTime || '-'}</Descriptions.Item>
              <Descriptions.Item label="完成时间">{detailData.completeTime || '-'}</Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">购买方信息</Divider>
            <Descriptions column={2} size="small">
              <Descriptions.Item label="用户昵称">{detailData.buyerNickname || '-'}</Descriptions.Item>
              <Descriptions.Item label="用户实名">{detailData.buyerRealName || '-'}</Descriptions.Item>
              <Descriptions.Item label="用户UID">{detailData.buyerUid || '-'}</Descriptions.Item>
              <Descriptions.Item label="用户手机">{detailData.buyerPhone || '-'}</Descriptions.Item>
              <Descriptions.Item label="开户名">{detailData.buyerAccountName || '-'}</Descriptions.Item>
              <Descriptions.Item label="银行卡号">{detailData.buyerBankCard || '-'}</Descriptions.Item>
              <Descriptions.Item label="银行名称">{detailData.buyerBankName || '-'}</Descriptions.Item>
              <Descriptions.Item label="机构码">{detailData.buyerOrgCode || '-'}</Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">出售方信息</Divider>
            <Descriptions column={2} size="small">
              <Descriptions.Item label="商家昵称">{detailData.sellerNickname || '-'}</Descriptions.Item>
              <Descriptions.Item label="商家实名">{detailData.sellerRealName || '-'}</Descriptions.Item>
              <Descriptions.Item label="商家UID">{detailData.sellerUid || '-'}</Descriptions.Item>
              <Descriptions.Item label="商家手机">{detailData.sellerPhone || '-'}</Descriptions.Item>
              <Descriptions.Item label="开户名">{detailData.sellerAccountName || '-'}</Descriptions.Item>
              <Descriptions.Item label="银行卡号">{detailData.sellerBankCard || '-'}</Descriptions.Item>
              <Descriptions.Item label="银行名称">{detailData.sellerBankName || '-'}</Descriptions.Item>
              <Descriptions.Item label="机构码">{detailData.sellerOrgCode || '-'}</Descriptions.Item>
            </Descriptions>

            {detailData.transferProof && (
              <>
                <Divider orientation="left">转账凭证</Divider>
                <CmImage src={detailData.transferProof} width={300} height={200} />
              </>
            )}

            {detailData.appealReason && (
              <>
                <Divider orientation="left">申诉信息</Divider>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="申诉原因">{detailData.appealReason}</Descriptions.Item>
                  <Descriptions.Item label="申诉时间">{detailData.appealTime || '-'}</Descriptions.Item>
                  {detailData.appealResult && (
                    <Descriptions.Item label="申诉结果">{detailData.appealResult}</Descriptions.Item>
                  )}
                </Descriptions>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* 申诉处理弹窗 */}
      <Modal
        title="处理申诉"
        open={appealVisible}
        onCancel={() => setAppealVisible(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        {detailData && (
          <Form
            form={appealForm}
            layout="vertical"
            preserve={false}
          >
            <div style={{ marginBottom: 16 }}>
              <Divider orientation="left">申诉信息</Divider>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="订单号">{detailData.orderSerial || detailData.id}</Descriptions.Item>
                <Descriptions.Item label="申诉原因">{detailData.appealReason || '-'}</Descriptions.Item>
                <Descriptions.Item label="申诉人">{detailData.appealUser || '-'}</Descriptions.Item>
                <Descriptions.Item label="申诉时间">{detailData.appealTime || '-'}</Descriptions.Item>
              </Descriptions>
            </div>

            <Form.Item
              name="appealResult"
              label="申诉处理结果"
              rules={[{ required: true, message: '请输入申诉处理结果' }]}
            >
              <Input.TextArea
                placeholder="请输入申诉处理结果"
                rows={3}
              />
            </Form.Item>

            <Form.Item
              name="remark"
              label="备注"
              rules={[{ required: true, message: '请输入备注' }]}
            >
              <Input.TextArea
                placeholder="请输入备注"
                rows={3}
              />
            </Form.Item>

            <Form.Item label="操作">
              <Space>
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={handleSubmitAppeal}
                  loading={loading}
                >
                  提交处理
                </Button>
                <Button onClick={() => setAppealVisible(false)}>
                  取消
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default OtcRecordsPage;
