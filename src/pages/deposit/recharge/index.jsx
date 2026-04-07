import React, { useState, useEffect, useRef } from 'react';
import { message, Tag, Form, Input, InputNumber, Button, Space, Modal, Row, Col } from 'antd';
import { CheckOutlined, CloseOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import CmBasePage from '@components/CmBasePage';
import CmImage from '@components/CmImage';
import {
  getRechargeOrderList,
  getRechargeOrderDetail,
  passRechargeOrder,
  rejectRechargeOrder,
  getRechargeTotalAmount,
  getRechargeConfig
} from '@api';

const { confirm } = Modal;

/**
 * 充值订单管理页面
 * 功能：订单列表展示、搜索、详情查看、审核（通过/拒绝）
 */
const RechargeOrderPage = () => {
  // 状态管理（按固定顺序）
  const [detailVisible, setDetailVisible] = useState(false);
  const [reviewVisible, setReviewVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0); // 充值总金额统计
  const [rechargeTypeList, setRechargeTypeList] = useState([]); // 充值类型列表
  const [detailData, setDetailData] = useState(null);

  const [reviewForm] = Form.useForm();

  // 使用 ref 存储最新的查询参数，用于统计金额
  const queryRef = useRef({
    orderType: 1, // 默认订单类型：1-充值，2-彩金
    beginTime: null,
    endTime: null
  });

  // 加载充值类型配置
  useEffect(() => {
    fetchRechargeConfig();
  }, []);

  /**
   * 加载充值类型配置
   */
  const fetchRechargeConfig = async () => {
    try {
      const response = await getRechargeConfig('ASSET_COIN');
      if (response.code === 0 || response.code === 200) {
        setRechargeTypeList(response.data || []);
      }
    } catch (error) {
      console.error('获取充值配置失败:', error);
    }
  };

  /**
   * 加载统计数据
   */
  const fetchStatistics = async (searchParams) => {
    try {
      const searchParam = searchParams || {};

      // 更新查询参数ref
      queryRef.current = {
        orderType: searchParam.SEARCH_EQ_orderType || 1,
        beginTime: searchParam.SEARCH_GTE_createTime || null,
        endTime: searchParam.SEARCH_LTE_createTime || null
      };

      const requestParams = {
        type: queryRef.current.orderType === 2 ? 3 : queryRef.current.orderType,
        startTime: queryRef.current.beginTime,
        endTime: queryRef.current.endTime
      };

      const response = await getRechargeTotalAmount(requestParams);
      if (response.code === 0 || response.code === 200) {
        setTotalAmount(response.data || 0);
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
      isAsc: 'desc',
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
    const response = await getRechargeOrderList(requestParams);

    if (response.code === 0 || response.code === 200) {
      return {
        data: response.rows || response.data?.records || response.data?.list || [],
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
      const response = await getRechargeOrderDetail({ id: record.id });
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
   * 打开审核对话框
   */
  const handleReview = async (record) => {
    setLoading(true);
    try {
      const response = await getRechargeOrderDetail({ id: record.id });
      if (response.code === 0 || response.code === 200) {
        setDetailData(response.data);
        setCurrentRecord(response.data);
        reviewForm.setFieldsValue({
          realAmount: response.data.realAmount,
          rechargeRemark: response.data.rechargeRemark || '',
          remark: response.data.remark || ''
        });
        setReviewVisible(true);
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
   * 审核通过
   */
  const handlePass = async () => {
    try {
      const values = await reviewForm.validateFields();
      setLoading(true);

      const submitData = {
        id: currentRecord?.id,
        realAmount: values.realAmount,
        rechargeRemark: values.rechargeRemark,
        remark: values.remark
      };

      const response = await passRechargeOrder(submitData);

      if (response.code === 0 || response.code === 200) {
        message.success('审核通过成功');
        setReviewVisible(false);
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
   * 审核拒绝
   */
  const handleReject = () => {
    reviewForm.validateFields(['remark']).then(() => {
      confirm({
        title: '确认拒绝?',
        icon: <ExclamationCircleOutlined />,
        content: '确定要拒绝此充值订单吗？',
        onOk: async () => {
          try {
            const values = reviewForm.getFieldsValue();
            setLoading(true);

            const submitData = {
              id: currentRecord?.id,
              realAmount: values.realAmount,
              rechargeRemark: values.rechargeRemark,
              remark: values.remark
            };

            const response = await rejectRechargeOrder(submitData);

            if (response.code === 0 || response.code === 200) {
              message.success('已拒绝该充值订单');
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
        },
      });
    }).catch(() => {
      message.warning('请填写拒绝原因（备注）');
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

  // 状态映射（充值订单状态）
  const statusMap = {
    0: { color: 'orange', text: '待审核' },
    1: { color: 'green', text: '成功' },
    2: { color: 'red', text: '失败' },
  };

  // 用户类型映射
  const userTypeMap = {
    0: { color: 'blue', text: '正常用户' },
    1: { color: 'purple', text: '测试用户' },
  };

  // 订单类型映射
  const orderTypeMap = {
    1: { color: 'blue', text: '充值' },
    2: { color: 'cyan', text: '彩金' },
  };

  // 列配置
  const columns = [
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 100,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 120,
    },
    {
      title: '充值金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (text) => text ? `${Number(text).toFixed(2)}` : '-',
    },
    {
      title: '实际到账',
      dataIndex: 'realAmount',
      key: 'realAmount',
      width: 120,
      render: (text) => text ? `${Number(text).toFixed(2)}` : '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const item = statusMap[status] || { color: 'default', text: '未知' };
        return <Tag color={item.color}>{item.text}</Tag>;
      },
    },
    {
      title: '用户类型',
      dataIndex: 'isTest',
      key: 'isTest',
      width: 100,
      render: (type) => {
        const item = userTypeMap[type] || { color: 'default', text: '未知' };
        return <Tag color={item.color}>{item.text}</Tag>;
      },
    },
    {
      title: '订单号',
      dataIndex: 'serialId',
      key: 'serialId',
      width: 180,
      ellipsis: true,
    },
    {
      title: '订单类型',
      dataIndex: 'orderType',
      key: 'orderType',
      width: 100,
      render: (type) => {
        const item = orderTypeMap[type] || { color: 'default', text: '未知' };
        return <Tag color={item.color}>{item.text}</Tag>;
      },
    },
    {
      title: '充值类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
    },
    {
      title: '充值地址',
      dataIndex: 'address',
      key: 'address',
      width: 150,
      ellipsis: true,
    },
    {
      title: '币种',
      dataIndex: 'coin',
      key: 'coin',
      width: 80,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 150,
      ellipsis: true,
    },
    {
      title: '凭证图片',
      dataIndex: 'fileName',
      key: 'fileName',
      width: 100,
      render: (text) => text ? <CmImage src={text} width={50} height={50} /> : '-',
    },
    {
      title: '充值时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      sorter: true,
    },
    {
      title: '操作时间',
      dataIndex: 'operateTime',
      key: 'operateTime',
      width: 180,
      sorter: true,
    },
    {
      title: '固定手续费',
      dataIndex: 'fixedFee',
      key: 'fixedFee',
      width: 120,
      render: (text) => text ? `${Number(text).toFixed(2)}` : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => {
        // 已审核完成的订单显示查看按钮
        if (record.status === 1 || record.status === 2) {
          return (
            <Button
              type="link"
              size="small"
              onClick={() => handleView(record)}
            >
              查看
            </Button>
          );
        }
        // 待审核订单显示审核按钮
        return (
          <Button
            type="link"
            size="small"
            style={{ color: '#faad14' }}
            onClick={() => handleReview(record)}
          >
            审核
          </Button>
        );
      },
    },
  ];

  // 搜索字段配置
  const searchFieldList = [
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'SEARCH_EQ_userId',
      type: 'digit',
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'SEARCH_LIKE_username',
      type: 'text',
    },
    {
      title: '订单号',
      dataIndex: 'serialId',
      key: 'SEARCH_LIKE_serialId',
      type: 'text',
    },
    {
      title: '充值地址',
      dataIndex: 'address',
      key: 'SEARCH_LIKE_address',
      type: 'text',
    },
    {
      title: '审核状态',
      dataIndex: 'status',
      key: 'SEARCH_EQ_status',
      type: 'select',
      options: [
        { label: '待审核', value: 0 },
        { label: '成功', value: 1 },
        { label: '失败', value: 2 },
      ],
    },
    {
      title: '用户类型',
      dataIndex: 'isTest',
      key: 'SEARCH_EQ_isTest',
      type: 'select',
      options: [
        { label: '正常用户', value: 0 },
        { label: '测试用户', value: 1 },
      ],
    },
    {
      title: '订单类型',
      dataIndex: 'orderType',
      key: 'SEARCH_EQ_orderType',
      type: 'select',
      options: [
        { label: '充值', value: 1 },
        { label: '彩金', value: 2 },
      ],
    },
    {
      title: '充值类型',
      dataIndex: 'type',
      key: 'SEARCH_EQ_type',
      type: 'select',
      options: rechargeTypeList.map(item => ({
        label: item.coinName,
        value: item.coinName
      })),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'SEARCH_GTE_createTime',
      type: 'dateTime',
    },
  ];

  // 自定义工具栏按钮（显示统计信息）
  const toolBarExtraButtons = [
    <Button key="total" type="default" disabled>
      总金额: {Number(totalAmount).toFixed(2)}
    </Button>
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
        title="充值订单详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>
        ]}
        width={700}
      >
        {detailData && (
          <Form layout="vertical" disabled>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="用户ID">
                  <Input value={detailData.userId} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="用户名">
                  <Input value={detailData.username} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="充值金额">
                  <Input value={detailData.amount ? Number(detailData.amount).toFixed(2) : '-'} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="实际到账金额">
                  <Input value={detailData.realAmount ? Number(detailData.realAmount).toFixed(2) : '-'} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="充值币种">
                  <Input value={detailData.coin} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="充值类型">
                  <Input value={detailData.type} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="订单号">
                  <Input value={detailData.serialId} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="充值地址">
                  <Input value={detailData.address} />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item label="充值说明">
              <Input.TextArea value={detailData.rechargeRemark} rows={2} />
            </Form.Item>
            <Form.Item label="备注">
              <Input.TextArea value={detailData.remark} rows={2} />
            </Form.Item>
            {detailData.fileName && (
              <Form.Item label="凭证图片">
                <CmImage src={detailData.fileName} width={200} height={200} />
              </Form.Item>
            )}
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="充值时间">
                  <Input value={detailData.createTime} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="操作时间">
                  <Input value={detailData.operateTime || '-'} />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
      </Modal>

      {/* 审核弹窗 */}
      <Modal
        title="审核充值订单"
        open={reviewVisible}
        onCancel={() => setReviewVisible(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        {detailData && (
          <Form
            form={reviewForm}
            layout="vertical"
            preserve={false}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="充值币种">
                  <Input value={detailData.coin} disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="充值金额">
                  <Input value={detailData.amount ? Number(detailData.amount).toFixed(2) : '-'} disabled />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="realAmount"
                  label="实际到账金额"
                  rules={[{ required: true, message: '请输入实际到账金额' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="请输入实际到账金额"
                    min={0}
                    precision={2}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="固定手续费">
                  <Input value={detailData.fixedFee ? Number(detailData.fixedFee).toFixed(2) : '-'} disabled />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="rechargeRemark"
              label="充值说明"
            >
              <Input.TextArea
                placeholder="请输入充值说明"
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

            {detailData.fileName && (
              <Form.Item label="凭证图片">
                <CmImage src={detailData.fileName} width={150} height={150} />
              </Form.Item>
            )}

            <Form.Item label="审核操作">
              <Space>
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={handlePass}
                  loading={loading}
                >
                  通过
                </Button>
                <Button
                  danger
                  icon={<CloseOutlined />}
                  onClick={handleReject}
                  loading={loading}
                >
                  拒绝
                </Button>
                <Button onClick={() => setReviewVisible(false)}>
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

export default RechargeOrderPage;
