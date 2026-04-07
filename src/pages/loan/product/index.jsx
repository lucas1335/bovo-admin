import React, { useState, useRef } from 'react';
import { Button, Form, Input, Switch, Select, Space, Tag, Modal, message } from 'antd';
import { SearchOutlined, PlusOutlined, ReloadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import CmBasePage from '@components/CmBasePage';
import { getLoanProductList, getLoanProductDetail, saveLoanProduct, updateLoanProduct, deleteLoanProduct } from '@api/modules/loan';

const { TextArea } = Input;

/**
 * 借贷产品管理页面
 * 功能：借贷产品列表展示、搜索、新增、编辑、删除
 */
const LoanProductPage = () => {
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
    params: { amountMin: '', amountMax: '' },
    cycleType: null,
    repayType: null,
    searchValue: null,
    odds: null,
    repayOrg: null,
    status: null,
    isFreeze: null,
  });

  // 还款类型字典
  const repayTypeDict = [
    { label: '到期一次还本息', value: '0' },
    { label: '分期还款', value: '1' },
  ];

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
      const response = await getLoanProductList({ ...queryParams, ...params });
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
      params: { amountMin: '', amountMax: '' },
    };
    setQueryParams(newParams);
    setTimeout(() => refreshTable(), 0);
  };

  /**
   * 新增
   */
  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  /**
   * 编辑
   */
  const handleEdit = async (record) => {
    try {
      const response = await getLoanProductDetail({ id: record.id });
      if (response.code === 200) {
        setEditingRecord(response.data);
        form.setFieldsValue({
          ...response.data,
          status: response.data.status === 1,
          isFreeze: response.data.isFreeze === '2',
        });
        setModalVisible(true);
      }
    } catch (error) {
      message.error('获取详情失败');
    }
  };

  /**
   * 删除
   */
  const handleDelete = (record) => {
    Modal.confirm({
      title: '确认删除',
      content: `是否确认删除借贷产品编号为"${record.id}"的数据项？`,
      onOk: async () => {
        try {
          const response = await deleteLoanProduct({ id: record.id });
          if (response.code === 200) {
            message.success('删除成功');
            refreshTable();
          } else {
            message.error(response.msg || '删除失败');
          }
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  /**
   * 提交表单
   */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formData = {
        ...values,
        status: values.status ? 1 : 0,
        isFreeze: values.isFreeze ? '2' : '1',
      };

      const response = editingRecord
        ? await updateLoanProduct(formData)
        : await saveLoanProduct(formData);

      if (response.code === 200) {
        message.success(editingRecord ? '修改成功' : '新增成功');
        setModalVisible(false);
        refreshTable();
      } else {
        message.error(response.msg || '操作失败');
      }
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  /**
   * 取消弹窗
   */
  const handleCancel = () => {
    setModalVisible(false);
    form.resetFields();
  };

  // 状态渲染
  const renderStatus = (status) => {
    if (status === '0') {
      return <Tag color="default">未开启</Tag>;
    } else if (status === '1') {
      return <Tag color="blue">已开启</Tag>;
    }
    return <Tag>-</Tag>;
  };

  // 是否冻结渲染
  const renderFreeze = (isFreeze) => {
    if (isFreeze === '2') {
      return <Tag color="default">是</Tag>;
    } else if (isFreeze === '1') {
      return <Tag color="blue">否</Tag>;
    }
    return <Tag>-</Tag>;
  };

  // 还款类型渲染
  const renderRepayType = (repayType) => {
    if (repayType == 0) {
      return '到期一次还本息';
    }
    return '-';
  };

  // 列配置
  const columns = [
    {
      title: '主键',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '最小贷款额度(USDT)',
      dataIndex: 'amountMin',
      key: 'amountMin',
      width: 150,
    },
    {
      title: '最大贷款额度(USDT)',
      dataIndex: 'amountMax',
      key: 'amountMax',
      width: 150,
    },
    {
      title: '周期类型',
      dataIndex: 'cycleType',
      key: 'cycleType',
      width: 100,
    },
    {
      title: '还款类型',
      dataIndex: 'repayType',
      key: 'repayType',
      width: 150,
      render: renderRepayType,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: renderStatus,
    },
    {
      title: '日利率',
      dataIndex: 'odds',
      key: 'odds',
      width: 100,
    },
    {
      title: '还款机构',
      dataIndex: 'repayOrg',
      key: 'repayOrg',
      width: 150,
      ellipsis: true,
    },
    {
      title: '是否冻结',
      dataIndex: 'isFreeze',
      key: 'isFreeze',
      width: 100,
      render: renderFreeze,
    },
    {
      title: '备注',
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
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            修改
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
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
      <Form.Item label="贷款额度">
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

  // 工具栏
  const toolbar = (
    <Button
      type="primary"
      icon={<PlusOutlined />}
      onClick={handleAdd}
    >
      新增
    </Button>
  );

  return (
    <>
      <CmBasePage
        columns={columns}
        request={getList}
        loading={loading}
        rowKey="id"
        search={showSearch}
        searchContent={searchContent}
        toolbar={toolbar}
        tableRef={tableRef}
        scroll={{ x: 1200 }}
        pagination={{
          defaultPageSize: 200,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
      />

      <Modal
        title={editingRecord ? '修改借贷产品' : '添加借贷产品'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        width={500}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          preserve={false}
        >
          <Form.Item
            label="最小贷款额度"
            name="amountMin"
            rules={[{ required: true, message: '请输入最小贷款额度' }]}
          >
            <Input placeholder="请输入最小贷款额度" />
          </Form.Item>

          <Form.Item
            label="最大贷款额度"
            name="amountMax"
            rules={[{ required: true, message: '请输入最大贷款额度' }]}
          >
            <Input placeholder="请输入最大贷款额度" />
          </Form.Item>

          <Form.Item
            label="日利率"
            name="odds"
            rules={[{ required: true, message: '请输入日利率' }]}
          >
            <Input placeholder="请输入日利率" />
          </Form.Item>

          <Form.Item
            label="还款类型"
            name="repayType"
            rules={[{ required: true, message: '请选择还款类型' }]}
          >
            <Select placeholder="请选择还款类型" style={{ width: '100%' }}>
              {repayTypeDict.map(item => (
                <Select.Option key={item.value} value={item.value}>
                  {item.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="还款机构"
            name="repayOrg"
            rules={[{ required: true, message: '请输入还款机构' }]}
          >
            <TextArea placeholder="请输入还款机构" rows={3} />
          </Form.Item>

          <Form.Item
            label="贷款周期"
            name="cycleType"
            rules={[{ required: true, message: '请输入贷款周期' }]}
          >
            <Input placeholder="请输入贷款周期" />
          </Form.Item>

          <Form.Item
            label="状态"
            name="status"
            valuePropName="checked"
          >
            <Switch checkedChildren="开启" unCheckedChildren="关闭" />
          </Form.Item>

          <Form.Item
            label="是否冻结"
            name="isFreeze"
            valuePropName="checked"
          >
            <Switch checkedChildren="是" unCheckedChildren="否" />
          </Form.Item>

          <Form.Item
            label="用户备注"
            name="remark"
          >
            <TextArea placeholder="请输入用户备注" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default LoanProductPage;
