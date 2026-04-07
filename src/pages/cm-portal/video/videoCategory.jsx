import React, { useState } from 'react';
import { message, Tag, Button, Popconfirm, Form, Input, Switch } from 'antd';
import CmBasePage from '@components/CmBasePage';
import DataForm from '@components/DataForm';
import CmUpload from '@components/CmUpload';
import CmImage from '@components/CmImage';
import { savePVideoCategory, updatePVideoCategory, deletePVideoCategory } from '@api';
import { EditOutlined, DeleteOutlined, PlusOutlined, ExpandOutlined, CompressOutlined } from '@ant-design/icons';

const { TextArea } = Input;

/**
 * 视频分类管理页面（树形结构）
 */
const VideoCategoryPage = () => {
  const [formVisible, setFormVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [parentRecord, setParentRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [allKeys, setAllKeys] = useState([]);
  const [viewMode, setViewMode] = useState(false);

  const handleAdd = () => {
    setEditingRecord(null);
    setParentRecord(null);
    setViewMode(false);
    setFormVisible(true);
  };

  const handleAddChild = (record) => {
    setEditingRecord(null);
    setParentRecord(record);
    setViewMode(false);
    setFormVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setParentRecord(null);
    setViewMode(false);
    setFormVisible(true);
  };

  const handleView = (record) => {
    setEditingRecord(record);
    setParentRecord(null);
    setViewMode(true);
    setFormVisible(true);
  };

  const handleDelete = async (record) => {
    try {
      const response = await deletePVideoCategory({ id: record.id });
      if (response.code === 0 || response.code === 200) {
        message.success('删除成功');
        document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
          new CustomEvent('reload')
        );
      } else {
        message.error(response.msg || '删除失败');
      }
    } catch (error) {
      message.error('删除失败: ' + error.message);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const submitValues = {
        ...values,
        pid: parentRecord ? parentRecord.id : (editingRecord?.pid ?? values.pid ?? '0'),
      };

      const response = editingRecord
        ? await updatePVideoCategory(submitValues)
        : await savePVideoCategory(submitValues);

      if (response.code === 0 || response.code === 200) {
        message.success(editingRecord ? '更新成功' : '创建成功');
        setFormVisible(false);
        document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
          new CustomEvent('reload')
        );
      } else {
        message.error(response.msg || '操作失败');
        setLoading(false);
        return;
      }
    } catch (error) {
      message.error('操作失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      align: 'left',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 200,
      ellipsis: true,
    },
    {
      title: '封面图',
      dataIndex: 'imageInfo',
      key: 'imageInfo',
      width: 120,
      render: (text) => <CmImage src={text} width={100} height={60} />,
    },
    {
      title: '编码',
      dataIndex: 'code',
      key: 'code',
      width: 150,
    },
    {
      title: '状态',
      dataIndex: 'state',
      key: 'state',
      width: 100,
      render: (state) => {
        const stateMap = {
          '1': { text: '上架', color: 'success' },
          '0': { text: '下架', color: 'error' },
        };
        const s = stateMap[state] || { text: '未知', color: 'default' };
        return <Tag color={s.color}>{s.text}</Tag>;
      }
    },
    {
      title: '排序',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 80,
    },
    {
      title: '是否外链',
      dataIndex: 'linkFlag',
      key: 'linkFlag',
      width: 100,
      render: (flag) => (
        <Tag color={flag == 1 ? 'green' : 'red'}>
          {flag == 1 ? '是' : '否'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 280,
      render: (_, record) => (
        <>
          <Button
            type="link"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => handleAddChild(record)}
          >
            添加下级
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => handleView(record)}
          >
            查看
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{ color: '#faad14' }}
          >
            编辑
          </Button>
          <Popconfirm
            title="删除确认"
            description="确定要删除这条数据吗？"
            onConfirm={() => handleDelete(record)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  // 自定义数据加载函数，用于处理树形结构数据
  const loadData = async (params) => {
    try {
      const response = await fetch(`/api/pVideoCategory/getList?${new URLSearchParams(params)}`).then(res => res.json());
      if (response.code === 0 || response.code === 200) {
        // 处理树形数据，确保每个节点都有唯一key
        const allKeysList = [];
        const processData = (data) => {
          if (!Array.isArray(data)) return [];
          return data.map(item => {
            allKeysList.push(item.id);
            return {
              ...item,
              children: item.children ? processData(item.children) : undefined
            };
          });
        };

        const processedData = processData(response.data || []);
        setAllKeys(allKeysList);

        return {
          data: processedData,
          success: true,
          total: processedData.length
        };
      } else {
        message.error(response.msg || '获取数据失败');
        return {
          data: [],
          success: false,
          total: 0
        };
      }
    } catch (error) {
      message.error('获取数据失败: ' + error.message);
      return {
        data: [],
        success: false,
        total: 0
      };
    }
  };

  // 切换展开/收起所有
  const handleToggleExpand = () => {
    const isExpanded = expandedRowKeys.length === allKeys.length;
    setExpandedRowKeys(isExpanded ? [] : allKeys);
  };

  // 工具栏额外按钮
  const toolBarExtraButtons = [
    <Button
      key="toggleExpand"
      icon={expandedRowKeys.length === allKeys.length ? <CompressOutlined /> : <ExpandOutlined />}
      onClick={handleToggleExpand}
      disabled={allKeys.length === 0}
    >
      {expandedRowKeys.length === allKeys.length ? '收起全部' : '展开全部'}
    </Button>
  ];

  const getInitialValues = () => {
    if (editingRecord) {
      return editingRecord;
    }
    if (parentRecord) {
      return { pid: parentRecord.id };
    }
    return {};
  };

  const getFormTitle = () => {
    if (viewMode) {
      return '查看分类';
    }
    if (editingRecord) {
      return '编辑分类';
    }
    if (parentRecord) {
      return `添加子分类 (${parentRecord.name})`;
    }
    return '添加分类';
  };

  return (
    <div style={{ textAlign: 'left' }}>
      <CmBasePage
        columns={columns}
        onLoadData={loadData}
        searchVisible={false}
        onAdd={handleAdd}
        toolBarExtraButtons={toolBarExtraButtons}
        rowKey="id"
        pagination={false}
        tableLayout="fixed"
        expandable={{
          expandedRowKeys: expandedRowKeys,
          onExpandedRowsChange: setExpandedRowKeys,
          childrenColumnName: 'children',
        }}
      />

      <DataForm
        visible={formVisible}
        title={getFormTitle()}
        initialValues={getInitialValues()}
        extraValues={{ id: editingRecord ? editingRecord.id : undefined }}
        onCancel={() => setFormVisible(false)}
        onSubmit={handleSubmit}
        onClosed={() => {
          setEditingRecord(null);
          setParentRecord(null);
        }}
        loading={loading}
        disabled={viewMode}
      >
        <Form.Item
          name="name"
          label="名称"
          rules={[{ required: true, message: '请输入名称' }]}
        >
          <Input placeholder="请输入名称" />
        </Form.Item>

        <Form.Item
          name="description"
          label="描述"
        >
          <TextArea rows={3} placeholder="请输入描述" />
        </Form.Item>

        <Form.Item
          name="imageInfo"
          label="封面图"
        >
          <CmUpload />
        </Form.Item>

        <Form.Item
          name="code"
          label="编码"
          rules={[{ required: true, message: '请输入编码' }]}
        >
          <Input placeholder="请输入编码" />
        </Form.Item>

        <Form.Item
          name="state"
          label="状态"
          rules={[{ required: true, message: '请选择状态' }]}
          valuePropName="checked"
          getValueProps={(value) => ({ checked: value === 1 })}
          getValueFromEvent={(checked) => (checked ? 1 : 0)}
        >
          <Switch checkedChildren="上架" unCheckedChildren="下架" />
        </Form.Item>

        <Form.Item
          name="orderNo"
          label="排序号码"
          rules={[{ required: true, message: '请输入排序号码' }]}
        >
          <Input type="number" placeholder="请输入排序号码" />
        </Form.Item>

        <Form.Item
          name="linkFlag"
          label="是否外链"
          valuePropName="checked"
          getValueProps={(value) => ({ checked: value === 1 })}
          getValueFromEvent={(checked) => (checked ? 1 : 0)}
        >
          <Switch checkedChildren="是" unCheckedChildren="否" />
        </Form.Item>

        <Form.Item
          name="linkUrl"
          label="外链地址"
        >
          <Input placeholder="请输入外链地址" />
        </Form.Item>
      </DataForm>
    </div>
  );
};

export default VideoCategoryPage;
