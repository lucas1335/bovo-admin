import React, { useState, useRef } from 'react';
import { Button, Form, Input, Space, Tag, Modal, message, Image } from 'antd';
import { SearchOutlined, ReloadOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import CmBasePage from '@components/CmBasePage';
import { getLoanOrderList, getLoanOrderDetail, passLoanOrder, refuseLoanOrder, repayLoanOrder } from '@api/modules/loan';

const { TextArea } = Input;

/**
 * 借贷订单管理页面
 * 功能：借贷订单列表展示、搜索、审核、还款
 */
const LoanOrderPage = () => {
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [showSearch, setShowSearch] = useState(true);
  const tableRef = useRef(null);

  // 查询参数
  const [queryParams, setQueryParams] = useState({
    pageNum: 1,
    pageSize: 200,
    proId: null,
    userId: null,
    params: { amountMin: '', amountMax: '' },
    rate: null,
    interest: null,
    status: null,
    finalRepayTime: null,
    disburseTime: null,
    returnTime: null,
    disburseAmount: null,
    adminParentIds: null,
    cardUrl: null,
    cardBackUrl: null,
    capitalUrl: null,
    licenseUrl: null,
    orderNo: null,
    cycleType: null,
    searchValue: null,
  });

  /**
   * 刷新表格
   */
  const refreshTable = () => {
    if (tableRef.current) {
      tableRef.current.reload();
    }
  };

  /**
   * 查询列表
   */
  const getList = async (params = {}) => {
    setLoading(true);
    try {
      const response = await getLoanOrderList({ ...queryParams, ...params });
      setLoading(false);
      return {
        data: response.rows || [],
        total: response.total || 0,
        success: true,
      };
    } catch (error) {
      setLoading(false);
      return {
        data: [],
        total: 0,
        success: false,
      };
    }
  };

  /**
   * 搜索
   */
  const handleSearch = () => {
    const values = searchForm.getFieldsValue();
    const newParams = {
      ...queryParams,
      userId: values.userId || null,
      params: {
        amountMin: values.amountMin || '',
        amountMax: values.amountMax || '',
      },
    };
    setQueryParams(newParams);
    setTimeout(() => refreshTable(), 0);
  };

  /**
   * 重置搜索
   */
  const handleReset = () => {
    searchForm.resetFields();
    const newParams = {
      ...queryParams,
      userId: null,
      params: { amountMin: '', amountMax: '' },
    };
    setQueryParams(newParams);
    setTimeout(() => refreshTable(), 0);
  };

  /**
   * 审核/查看
   */
  const handleReview = async (record) => {
    try {
      const response = await getLoanOrderDetail(record.id);
      if (response.code === 200) {
        setEditingRecord(response.data);
        form.setFieldsValue(response.data);
        setModalVisible(true);
      }
    } catch (error) {
      message.error('获取详情失败');
    }
  };

  /**
   * 还款
   */
  const handleRepayment = (record) => {
    Modal.confirm({
      title: '确认还款',
      content: '确定要结清订单吗',
      onOk: async () => {
        try {
          const response = await repayLoanOrder({ id: record.id });
          if (response.code === 200) {
            message.success('还款成功');
            refreshTable();
          } else {
            message.error(response.msg || '还款失败');
            refreshTable();
          }
        } catch (error) {
          message.error('还款失败');
          refreshTable();
        }
      },
    });
  };

  /**
   * 审核通过
   */
  const handlePass = async () => {
    try {
      const values = await form.validateFields();

      if (!values.disburseAmount) {
        message.error('审批金额不能为空');
        return;
      }

      const data = {
        id: values.id,
        rate: values.rate,
        proId: values.proId,
        userId: values.userId,
        amount: values.amount,
        disburseAmount: values.disburseAmount,
        interest: values.interest,
        cycleType: values.cycleType,
      };

      const response = await passLoanOrder(data);
      if (response.code === 200) {
        message.success(response.msg || '审核通过');
        setModalVisible(false);
        refreshTable();
      } else {
        message.error(response.msg || '审核失败');
      }
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  /**
   * 审核不通过
   */
  const handleRefuse = async () => {
    try {
      const values = form.getFieldsValue();
      const data = {
        id: values.id,
        remark: values.remark,
      };

      await refuseLoanOrder(data);
      setModalVisible(false);
    } catch (error) {
      console.error('审核失败:', error);
    }
  };

  /**
   * 关闭弹窗
   */
  const handleCancel = () => {
    setModalVisible(false);
    form.resetFields();
  };

  /**
   * 仅关闭弹窗
   */
  const handleJustClose = () => {
    setModalVisible(false);
  };

  // 状态渲染
  const renderStatus = (status) => {
    const statusMap = {
      0: { color: 'warning', text: '待审核' },
      1: { color: 'success', text: '成功' },
      2: { color: 'default', text: '失败' },
      3: { color: 'success', text: '已结清' },
      4: { color: 'default', text: '已逾期' },
    };
    const config = statusMap[status] || { color: 'default', text: '-' };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 时间格式化
  const formatTime = (time) => {
    return time ? moment(time).format('YYYY-MM-DD HH:mm:ss') : '-';
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
      title: '贷款商品ID',
      dataIndex: 'proId',
      key: 'proId',
      width: 120,
    },
    {
      title: '贷款金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 100,
    },
    {
      title: '贷款利率%',
      dataIndex: 'rate',
      key: 'rate',
      width: 100,
    },
    {
      title: '利息',
      dataIndex: 'interest',
      key: 'interest',
      width: 100,
    },
    {
      title: '周期',
      dataIndex: 'cycleType',
      key: 'cycleType',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: renderStatus,
    },
    {
      title: '放款日期',
      dataIndex: 'disburseTime',
      key: 'disburseTime',
      width: 180,
      render: formatTime,
    },
    {
      title: '最后还款日',
      dataIndex: 'finalRepayTime',
      key: 'finalRepayTime',
      width: 180,
      render: formatTime,
    },
    {
      title: '审批金额',
      dataIndex: 'disburseAmount',
      key: 'disburseAmount',
      width: 100,
    },
    {
      title: '手持身份证',
      dataIndex: 'cardUrl',
      key: 'cardUrl',
      width: 100,
      render: (url) => (
        url ? (
          <Image
            src={url}
            width={50}
            height={50}
            style={{ objectFit: 'contain' }}
            preview={{ src: url }}
          />
        ) : '-'
      ),
    },
    {
      title: '身份证正面',
      dataIndex: 'cardBackUrl',
      key: 'cardBackUrl',
      width: 100,
      render: (url) => (
        url ? (
          <Image
            src={url}
            width={50}
            height={50}
            style={{ objectFit: 'contain' }}
            preview={{ src: url }}
          />
        ) : '-'
      ),
    },
    {
      title: '身份证反面',
      dataIndex: 'capitalUrl',
      key: 'capitalUrl',
      width: 100,
      render: (url) => (
        url ? (
          <Image
            src={url}
            width={50}
            height={50}
            style={{ objectFit: 'contain' }}
            preview={{ src: url }}
          />
        ) : '-'
      ),
    },
    {
      title: '用户备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 150,
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          {record.status === 0 && (
            <Button
              type="primary"
              size="small"
              onClick={() => handleReview(record)}
            >
              审核
            </Button>
          )}
          {record.status === 3 && (
            <Button
              type="primary"
              size="small"
              onClick={() => handleReview(record)}
            >
              查看
            </Button>
          )}
          {record.status === 1 && (
            <Button
              type="primary"
              size="small"
              onClick={() => handleRepayment(record)}
            >
              还款
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // 搜索表单
  const searchContent = (
    <Form
      form={searchForm}
      layout="inline"
      style={{ marginBottom: 16 }}
    >
      <Form.Item label="用户ID" name="userId">
        <Input
          placeholder="请输入用户ID"
          style={{ width: 150 }}
          onPressEnter={handleSearch}
        />
      </Form.Item>
      <Form.Item label="贷款金额">
        <Input.Group compact>
          <Form.Item name="amountMin" noStyle>
            <Input
              placeholder="最小金额"
              style={{ width: 100 }}
              onPressEnter={handleSearch}
            />
          </Form.Item>
          <span style={{ padding: '0 8px', lineHeight: '32px' }}>-</span>
          <Form.Item name="amountMax" noStyle>
            <Input
              placeholder="最大金额"
              style={{ width: 100 }}
              onPressEnter={handleSearch}
            />
          </Form.Item>
        </Input.Group>
      </Form.Item>
      <Form.Item>
        <Space>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
          >
            搜索
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            重置
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );

  // 根据状态决定弹窗标题和按钮
  const isReview = editingRecord && editingRecord.status === 0;
  const modalTitle = isReview ? '贷款订单审核' : '订单详情';

  return (
    <>
      <CmBasePage
        columns={columns}
        request={getList}
        loading={loading}
        rowKey="id"
        search={showSearch}
        searchContent={searchContent}
        tableRef={tableRef}
        scroll={{ x: 1800 }}
        pagination={{
          defaultPageSize: 200,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
      />

      <Modal
        title={modalTitle}
        open={modalVisible}
        onCancel={handleJustClose}
        width={500}
        destroyOnClose
        footer={
          <Space>
            {isReview && (
              <>
                <Button type="primary" icon={<CheckCircleOutlined />} onClick={handlePass}>
                  通过
                </Button>
                <Button onClick={handleJustClose}>
                  关闭
                </Button>
                <Button danger icon={<CloseCircleOutlined />} onClick={handleRefuse}>
                  不通过
                </Button>
              </>
            )}
            {!isReview && (
              <Button onClick={handleJustClose}>
                关闭
              </Button>
            )}
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          preserve={false}
        >
          <Form.Item label="贷款商品" name="proId">
            <Input disabled />
          </Form.Item>

          <Form.Item label="用户ID" name="userId">
            <Input disabled />
          </Form.Item>

          <Form.Item label="贷款金额" name="amount">
            <Input disabled={isReview} />
          </Form.Item>

          <Form.Item label="贷款利率" name="rate">
            <Input disabled={isReview} />
          </Form.Item>

          <Form.Item label="利息" name="interest">
            <Input disabled={isReview} />
          </Form.Item>

          <Form.Item
            label="审批金额"
            name="disburseAmount"
            rules={isReview ? [{ required: true, message: '审批金额不能为空' }] : []}
          >
            <Input disabled={!isReview} placeholder="请输入审批金额" />
          </Form.Item>

          <Form.Item label="用户备注" name="remark">
            <TextArea disabled={!isReview} placeholder="请输入内容" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default LoanOrderPage;
