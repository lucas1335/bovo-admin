import React, { useState, useRef } from 'react';
import {
  Table,
  Form,
  InputNumber,
  Button,
  Space,
  Modal,
  message,
  Tag,
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { getAgencyActivityList, batchFreezeAgency } from '@api/modules/agent';

/**
 * 代理活跃度管理页面
 * 功能：活跃代理列表展示、搜索、单个冻结、批量冻结
 */
const AgentPage = () => {
  const [searchForm] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [total, setTotal] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [freezeModalVisible, setFreezeModalVisible] = useState(false);
  const [freezeRecord, setFreezeRecord] = useState(null);

  const queryParams = useRef({
    pageNum: 1,
    pageSize: 200,
    day: 10,
  });

  /**
   * 获取列表
   */
  const fetchList = async () => {
    try {
      setLoading(true);
      const response = await getAgencyActivityList(queryParams.current);
      if (response.code === 200) {
        setDataSource(response.rows || response.data || []);
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
   * 搜索
   */
  const handleSearch = () => {
    const values = searchForm.getFieldsValue();
    queryParams.current = {
      ...queryParams.current,
      ...values,
      pageNum: 1,
    };
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
      day: 10,
    };
    fetchList();
  };

  /**
   * 表格选择变化
   */
  const handleSelectionChange = (keys) => {
    setSelectedRowKeys(keys);
  };

  /**
   * 单个冻结
   */
  const handleFreeze = (record) => {
    setFreezeRecord(record);
    setFreezeModalVisible(true);
  };

  /**
   * 批量冻结
   */
  const handleBatchFreeze = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要冻结的代理');
      return;
    }
    setFreezeRecord(null);
    setFreezeModalVisible(true);
  };

  /**
   * 确认冻结
   */
  const handleConfirmFreeze = async () => {
    try {
      const ids = freezeRecord ? [freezeRecord.userId] : selectedRowKeys;
      const response = await batchFreezeAgency(ids);
      if (response.code === 200) {
        message.success('冻结成功');
        setFreezeModalVisible(false);
        setSelectedRowKeys([]);
        fetchList();
      } else {
        message.error(response.msg || '冻结失败');
      }
    } catch (error) {
      message.error('冻结失败: ' + error.message);
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
      title: '代理uid',
      dataIndex: 'userId',
      key: 'userId',
      width: 120,
    },
    {
      title: '名称',
      dataIndex: 'loginName',
      key: 'loginName',
      width: 150,
    },
    {
      title: '总直属人数',
      dataIndex: 'totalInvite',
      key: 'totalInvite',
      width: 150,
      sorter: true,
    },
    {
      title: '最近直属人数',
      dataIndex: 'recentInvite',
      key: 'recentInvite',
      width: 150,
      sorter: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => {
        if (record.status === 0) {
          return (
            <Button
              type="primary"
              size="small"
              onClick={() => handleFreeze(record)}
            >
              冻结
            </Button>
          );
        } else if (record.status === 1) {
          return <span style={{ color: '#F56C6C' }}>已冻结</span>;
        }
        return '-';
      },
    },
  ];

  React.useEffect(() => {
    fetchList();
  }, []);

  return (
    <div style={{ padding: '24px' }}>
      {/* 搜索表单 */}
      <Form
        form={searchForm}
        layout="inline"
        style={{ marginBottom: '16px' }}
        initialValues={queryParams.current}
      >
        <Form.Item label="查询天数" name="day">
          <InputNumber min={1} placeholder="请输入查询天数" style={{ width: 200 }} />
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
          danger
          icon={<WarningOutlined />}
          disabled={selectedRowKeys.length === 0}
          onClick={handleBatchFreeze}
        >
          批量冻结
        </Button>
      </Space>

      {/* 表格 */}
      <Table
        rowKey="userId"
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        scroll={{ x: 800, y: 'calc(100vh - 360px)' }}
        rowSelection={{
          selectedRowKeys,
          onChange: handleSelectionChange,
          getCheckboxProps: (record) => ({
            disabled: record.status === 1,
          }),
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

      {/* 冻结确认弹窗 */}
      <Modal
        title="冻结确认"
        open={freezeModalVisible}
        onOk={handleConfirmFreeze}
        onCancel={() => setFreezeModalVisible(false)}
        okText="确定"
        cancelText="取消"
      >
        <p>
          {freezeRecord
            ? `确定冻结代理用户 ${freezeRecord.loginName} 吗？`
            : '确定要批量冻结选中的代理吗？'}
        </p>
      </Modal>
    </div>
  );
};

export default AgentPage;
