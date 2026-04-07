import React, { useState, useRef } from 'react';
import {
  Table,
  Form,
  Input,
  Button,
  Modal,
  Select,
  Space,
  Popconfirm,
  Tag,
  Image,
  message,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  getSymbolManageList,
  getCoinList,
  getSymbolManageDetail,
  addSymbolManage,
  updateSymbolManage,
  deleteSymbolManage,
  batchAddCoin,
} from '@api/modules/symbolManage';

const { Option } = Select;

/**
 * 币种管理页面
 * 功能：币种列表展示、搜索、新增、修改、删除、一键新增
 */
const SymbolmanagePage = () => {
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [batchForm] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [total, setTotal] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [batchModalVisible, setBatchModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  const [coinList, setCoinList] = useState([]);
  const [batchCoinList, setBatchCoinList] = useState([]);
  const [currentMarket, setCurrentMarket] = useState(null);

  const queryParams = useRef({
    pageNum: 1,
    pageSize: 200,
    symbol: null,
    minChargeNum: null,
    maxChargeNum: null,
    sort: null,
    enable: null,
  });

  /**
   * 获取币种列表
   */
  const fetchList = async () => {
    try {
      setLoading(true);
      const response = await getSymbolManageList(queryParams.current);
      if (response.code === 200) {
        setDataSource(response.rows || []);
        setTotal(response.total || 0);
      } else {
        message.error(response.msg || '获取列表失败');
      }
    } catch (error) {
      message.error('获取列表失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 获取可添加币种列表
   */
  const fetchCoinList = async () => {
    try {
      const response = await getCoinList();
      if (response.code === 200) {
        const list = (response.rows || []).map((item) => ({
          ...item,
          label: `${item.symbol}-${item.market}`,
        }));
        setCoinList(list);
        setBatchCoinList(list);
      }
    } catch (error) {
      message.error('获取币种列表失败: ' + error.message);
    }
  };

  /**
   * 搜索
   */
  const handleSearch = () => {
    const values = searchForm.getFieldsValue();

    // 只有当 commissionMin 或 commissionMax 有值时才添加 params
    const hasCommissionMin = values.params?.commissionMin !== undefined && values.params?.commissionMin !== null && values.params?.commissionMin !== '';
    const hasCommissionMax = values.params?.commissionMax !== undefined && values.params?.commissionMax !== null && values.params?.commissionMax !== '';

    const newQueryParams = {
      ...queryParams.current,
      ...values,
      pageNum: 1,
    };

    // 只有当至少有一个值时才添加 params
    if (hasCommissionMin || hasCommissionMax) {
      newQueryParams.params = {};
      if (hasCommissionMin) {
        newQueryParams.params.commissionMin = values.params.commissionMin;
      }
      if (hasCommissionMax) {
        newQueryParams.params.commissionMax = values.params.commissionMax;
      }
    } else {
      // 如果都没有值，删除 params 字段
      delete newQueryParams.params;
    }

    queryParams.current = newQueryParams;
    fetchList();
  };

  /**
   * 重置搜索
   */
  const handleReset = () => {
    searchForm.resetFields();
    queryParams.current = {
      pageNum: 1,
      pageSize: 200,
      symbol: null,
      minChargeNum: null,
      maxChargeNum: null,
      sort: null,
      enable: null,
    };
    // 不包含 params 字段
    fetchList();
  };

  /**
   * 打开新增弹窗
   */
  const handleAdd = () => {
    setIsEdit(false);
    setModalTitle('添加币种管理');
    form.resetFields();
    fetchCoinList();
    setModalVisible(true);
  };

  /**
   * 打开编辑弹窗
   */
  const handleEdit = async (record) => {
    try {
      setIsEdit(true);
      setModalTitle('修改币种管理');
      form.resetFields();
      const response = await getSymbolManageDetail(record.id);
      if (response.code === 200) {
        form.setFieldsValue(response.data);
        setModalVisible(true);
      } else {
        message.error(response.msg || '获取详情失败');
      }
    } catch (error) {
      message.error('获取详情失败: ' + error.message);
    }
  };

  /**
   * 删除
   */
  const handleDelete = async (record) => {
    try {
      const ids = record?.id || selectedRowKeys;
      const response = await deleteSymbolManage(ids);
      if (response.code === 200) {
        message.success('删除成功');
        setSelectedRowKeys([]);
        fetchList();
      } else {
        message.error(response.msg || '删除失败');
      }
    } catch (error) {
      message.error('删除失败: ' + error.message);
    }
  };

  /**
   * 提交表单
   */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      let response;
      if (isEdit) {
        response = await updateSymbolManage(values);
      } else {
        const submitData = {
          ...values,
          symbol: currentMarket?.symbol,
          market: currentMarket?.market,
        };
        response = await addSymbolManage(submitData);
      }

      if (response.code === 200) {
        message.success(isEdit ? '修改成功' : '新增成功');
        setModalVisible(false);
        fetchList();
      } else {
        message.error(response.msg || '操作失败');
      }
    } catch (error) {
      if (error.errorFields) {
        return;
      }
      message.error('操作失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 币种选择变化
   */
  const handleCoinChange = (value) => {
    const market = coinList.find((item) => item.id === value);
    setCurrentMarket(market);
  };

  /**
   * 打开一键新增弹窗
   */
  const handleBatchAdd = () => {
    setBatchModalVisible(true);
    fetchCoinList();
  };

  /**
   * 批量选择变化
   */
  const handleBatchSelectionChange = (selectedRows) => {
    const symbols = selectedRows.map((item) => item.symbol.toLowerCase()).join(',');
    batchForm.setFieldsValue({ symbols });
  };

  /**
   * 提交一键新增
   */
  const handleBatchSubmit = async () => {
    try {
      const values = await batchForm.validateFields();
      setLoading(true);
      const response = await batchAddCoin({ symbols: values.symbols });
      if (response.code === 200) {
        message.success(response.msg || '批量新增成功');
        setBatchModalVisible(false);
        fetchList();
      } else {
        message.error(response.msg || '批量新增失败');
      }
    } catch (error) {
      if (error.errorFields) {
        return;
      }
      message.error('批量新增失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 表格分页变化
   */
  const handleTableChange = (pagination) => {
    queryParams.current.pageNum = pagination.current;
    queryParams.current.pageSize = pagination.pageSize;
    fetchList();
  };

  const columns = [
    {
      title: '图标',
      dataIndex: 'logo',
      key: 'logo',
      width: 80,
      render: (logo) => <Image src={logo} width={30} height={30} />,
    },
    {
      title: '币种',
      dataIndex: 'symbol',
      key: 'symbol',
      width: 120,
    },
    {
      title: '兑换数量(最小)',
      dataIndex: 'minChargeNum',
      key: 'minChargeNum',
      width: 150,
    },
    {
      title: '兑换数量(最大)',
      dataIndex: 'maxChargeNum',
      key: 'maxChargeNum',
      width: 150,
    },
    {
      title: '手续费(%)',
      dataIndex: 'commission',
      key: 'commission',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'enable',
      key: 'enable',
      width: 100,
      render: (enable) => (
        <Tag color={enable == 1 ? 'success' : 'default'}>
          {enable == 1 ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
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
          <Popconfirm
            title="删除确认"
            description="确定要删除选中的币种吗？"
            onConfirm={() => handleDelete(record)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  React.useEffect(() => {
    fetchList();
  }, []);

  return (
    <div style={{ padding: '8px 12px' }}>
      {/* 搜索表单 */}
      <Form
        form={searchForm}
        layout="inline"
        style={{ marginBottom: '16px' }}
        initialValues={queryParams.current}
      >
        <Form.Item label="币种" name="symbol">
          <Input placeholder="请输入币种" allowClear style={{ width: 200 }} />
        </Form.Item>
        <Form.Item label="金额">
          <Input.Group compact>
            <Form.Item name={['params', 'commissionMin']} noStyle>
              <Input placeholder="最小金额" allowClear style={{ width: 120 }} />
            </Form.Item>
            <span
              style={{
                display: 'inline-block',
                width: '30px',
                textAlign: 'center',
                lineHeight: '32px',
              }}
            >
              -
            </span>
            <Form.Item name={['params', 'commissionMax']} noStyle>
              <Input placeholder="最大金额" allowClear style={{ width: 120 }} />
            </Form.Item>
          </Input.Group>
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
            style={{ marginRight: 8 }}
          >
            搜索
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            重置
          </Button>
        </Form.Item>
      </Form>

      {/* 操作按钮 */}
      <Space style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          新增
        </Button>
        <Popconfirm
          title="删除确认"
          description="确定要删除选中的币种吗？"
          onConfirm={handleDelete}
          disabled={selectedRowKeys.length === 0}
          okText="确定"
          cancelText="取消"
        >
          <Button
            danger
            icon={<DeleteOutlined />}
            disabled={selectedRowKeys.length === 0}
          >
            删除
          </Button>
        </Popconfirm>
      </Space>

      {/* 表格 */}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        scroll={{ x: 1200, y: 'calc(100vh - 360px)' }}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
        }}
        pagination={{
          total,
          current: queryParams.current.pageNum,
          pageSize: queryParams.current.pageSize,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        onChange={handleTableChange}
      />

      {/* 新增/编辑弹窗 */}
      <Modal
        title={modalTitle}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        confirmLoading={loading}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ enable: '1' }}
        >
          <Form.Item
            label="币种"
            name="currentId"
            rules={[{ required: true, message: '请选择币种' }]}
          >
            <Select
              placeholder="请选择币种"
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
              onChange={handleCoinChange}
              disabled={isEdit}
            >
              {coinList.map((coin) => (
                <Option key={coin.id} value={coin.id}>
                  {coin.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="最小兑换数量"
            name="minChargeNum"
            rules={[{ required: true, message: '最小兑换量不能为空' }]}
          >
            <Input placeholder="请输入最小兑换数量" />
          </Form.Item>
          <Form.Item
            label="最大兑换数量"
            name="maxChargeNum"
            rules={[{ required: true, message: '最大兑换量不能为空' }]}
          >
            <Input placeholder="请输入最大兑换数量" />
          </Form.Item>
          <Form.Item
            label="手续费(%)"
            name="commission"
            rules={[{ required: true, message: '手续费不能为空' }]}
          >
            <Input placeholder="请输入手续费" />
          </Form.Item>
          <Form.Item label="排序" name="sort">
            <Input placeholder="请输入排序" />
          </Form.Item>
          <Form.Item
            label="状态"
            name="enable"
            rules={[{ required: true, message: '状态不能为空' }]}
          >
            <Select>
              <Option value="1">启用</Option>
              <Option value="2">禁用</Option>
            </Select>
          </Form.Item>
          <Form.Item label="备注" name="remark">
            <Input.TextArea rows={3} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 一键新增弹窗 */}
      <Modal
        title="一键新增"
        open={batchModalVisible}
        onOk={handleBatchSubmit}
        onCancel={() => setBatchModalVisible(false)}
        confirmLoading={loading}
        width={800}
      >
        <Form form={batchForm}>
          <Form.Item name="symbols" hidden>
            <Input />
          </Form.Item>
          <Table
            rowKey="id"
            columns={[
              {
                title: '币种名称',
                dataIndex: 'symbol',
                key: 'symbol',
              },
            ]}
            dataSource={batchCoinList}
            rowSelection={{
              onChange: (_, selectedRows) => handleBatchSelectionChange(selectedRows),
            }}
            pagination={false}
            size="small"
          />
        </Form>
      </Modal>
    </div>
  );
};

export default SymbolmanagePage;
