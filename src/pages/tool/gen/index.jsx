import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Input, DatePicker, Space, Modal, Tabs, message, Popconfirm, Row, Col } from 'antd';
import { SearchOutlined, ReloadOutlined, DownloadOutlined, UploadOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { listTable, previewTable, delTable, genCode, synchDb, batchGenCode } from '@/api/modules/tool';
import hljs from 'highlight.js/lib/core';
import 'highlight.js/styles/github.css';
import java from 'highlight.js/lib/languages/java';
import xml from 'highlight.js/lib/languages/xml';
import javascript from 'highlight.js/lib/languages/javascript';
import sql from 'highlight.js/lib/languages/sql';

hljs.registerLanguage('java', java);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('vue', xml);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('sql', sql);

const { RangePicker } = DatePicker;

const GenIndex = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [tableList, setTableList] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [showSearch, setShowSearch] = useState(true);
  const [previewModal, setPreviewModal] = useState(false);
  const [previewData, setPreviewData] = useState({});
  const [activeTab, setActiveTab] = useState('domain.java');
  const [dateRange, setDateRange] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 200,
  });

  useEffect(() => {
    getList();
  }, [pagination.current, pagination.pageSize]);

  const getList = () => {
    setLoading(true);
    const params = {
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      ...form.getFieldsValue(),
    };
    listTable(params).then(res => {
      setTableList(res.rows || []);
      setTotal(res.total || 0);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  };

  const handleQuery = () => {
    setPagination({ ...pagination, current: 1 });
    getList();
  };

  const resetQuery = () => {
    form.resetFields();
    setDateRange([]);
    setPagination({ ...pagination, current: 1 });
    getList();
  };

  const handleGenTable = (row) => {
    const tableName = row ? row.tableName : selectedRows.map(item => item.tableName).join(',');
    if (!tableName) {
      message.error('请选择要生成的数据');
      return;
    }
    if (row && row.genType === '1') {
      genCode(row.tableName).then(() => {
        message.success('成功生成到自定义路径：' + row.genPath);
      });
    } else {
      window.location.href = batchGenCode(tableName);
    }
  };

  const handleSynchDb = (row) => {
    synchDb(row.tableName).then(() => {
      message.success('同步成功');
      getList();
    });
  };

  const handlePreview = (row) => {
    previewTable(row.tableId).then(res => {
      setPreviewData(res.data || {});
      setActiveTab('domain.java');
      setPreviewModal(true);
    });
  };

  const handleEdit = (row) => {
    const tableId = row.tableId || selectedRowKeys[0];
    const tableName = row.tableName || selectedRows[0].tableName;
    // TODO: 实现编辑功能，跳转到编辑页面
    message.info('跳转到编辑页面：' + tableName);
  };

  const handleDelete = (row) => {
    const tableIds = row.tableId || selectedRowKeys;
    delTable(tableIds).then(() => {
      message.success('删除成功');
      getList();
    });
  };

  const highlightedCode = (code, key) => {
    const vmName = key.substring(key.lastIndexOf('/') + 1, key.indexOf('.vm'));
    const language = vmName.substring(vmName.indexOf('.') + 1);
    const result = hljs.highlight(language, code || '', true);
    return result.value || ' ';
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      message.success('复制成功');
    });
  };

  const columns = [
    {
      title: '序号',
      dataIndex: 'index',
      width: 50,
      align: 'center',
      render: (text, record, index) => (
        <span>{(pagination.current - 1) * pagination.pageSize + index + 1}</span>
      ),
    },
    {
      title: '表名称',
      dataIndex: 'tableName',
      align: 'center',
      width: 120,
      ellipsis: true,
    },
    {
      title: '表描述',
      dataIndex: 'tableComment',
      align: 'center',
      width: 120,
      ellipsis: true,
    },
    {
      title: '实体',
      dataIndex: 'className',
      align: 'center',
      width: 120,
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      align: 'center',
      width: 160,
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      align: 'center',
      width: 160,
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      width: 300,
      fixed: 'right',
      render: (text, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handlePreview(record)}>
            预览
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除吗？" onConfirm={() => handleDelete(record)}>
            <Button type="link" size="small" icon={<DeleteOutlined />} danger>
              删除
            </Button>
          </Popconfirm>
          <Button type="link" size="small" icon={<ReloadOutlined />} onClick={() => handleSynchDb(record)}>
            同步
          </Button>
          <Button type="link" size="small" icon={<DownloadOutlined />} onClick={() => handleGenTable(record)}>
            生成代码
          </Button>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys, rows) => {
      setSelectedRowKeys(keys);
      setSelectedRows(rows);
    },
  };

  return (
    <div className="app-container">
      {showSearch && (
        <Form
          form={form}
          layout="inline"
          style={{ marginBottom: 16 }}
        >
          <Form.Item label="表名称" name="tableName">
            <Input placeholder="请输入表名称" onPressEnter={handleQuery} allowClear />
          </Form.Item>
          <Form.Item label="表描述" name="tableComment">
            <Input placeholder="请输入表描述" onPressEnter={handleQuery} allowClear />
          </Form.Item>
          <Form.Item label="创建时间">
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates)}
              style={{ width: 240 }}
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleQuery}>
                搜索
              </Button>
              <Button icon={<ReloadOutlined />} onClick={resetQuery}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      )}

      <Row gutter={10} style={{ marginBottom: 16 }}>
        <Col span={1.5}>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            disabled={selectedRowKeys.length === 0}
            onClick={() => handleGenTable()}
          >
            生成
          </Button>
        </Col>
        <Col span={1.5}>
          <Button type="default" icon={<UploadOutlined />}>
            导入
          </Button>
        </Col>
        <Col span={1.5}>
          <Button
            type="default"
            icon={<EditOutlined />}
            disabled={selectedRowKeys.length !== 1}
            onClick={() => handleEdit()}
          >
            修改
          </Button>
        </Col>
        <Col span={1.5}>
          <Popconfirm title="确定要删除选中的数据吗？" onConfirm={() => handleDelete()}>
            <Button
              type="default"
              icon={<DeleteOutlined />}
              disabled={selectedRowKeys.length === 0}
              danger
            >
              删除
            </Button>
          </Popconfirm>
        </Col>
      </Row>

      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={tableList}
        loading={loading}
        rowKey="tableId"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (page, pageSize) => {
            setPagination({ current: page, pageSize });
          },
        }}
        scroll={{ x: 1200 }}
      />

      <Modal
        title="代码预览"
        open={previewModal}
        onCancel={() => setPreviewModal(false)}
        width="80%"
        style={{ top: 20 }}
        footer={null}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={Object.keys(previewData).map(key => ({
            key: key.substring(key.lastIndexOf('/') + 1, key.indexOf('.vm')),
            label: (
              <span>
                {key.substring(key.lastIndexOf('/') + 1, key.indexOf('.vm'))}
                <Button
                  type="text"
                  size="small"
                  onClick={() => copyToClipboard(previewData[key])}
                  style={{ float: 'right' }}
                >
                  复制
                </Button>
              </span>
            ),
            children: (
              <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 4, overflow: 'auto' }}>
                <code
                  dangerouslySetInnerHTML={{
                    __html: highlightedCode(previewData[key], key)
                  }}
                />
              </pre>
            ),
          }))}
        />
      </Modal>
    </div>
  );
};

export default GenIndex;
