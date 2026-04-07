import React, { useState } from 'react';
import { message, Button, Popconfirm, Form, Input, InputNumber, Drawer } from 'antd';
import CmBasePage from '@components/CmBasePage';
import DataForm from '@components/DataForm';
import CmUpload from '@components/CmUpload';
import CmImage from '@components/CmImage';
import { getQProductCategoryList, saveQProductCategory, updateQProductCategory, deleteQProductCategory } from '@api';
import { EditOutlined, DeleteOutlined, PlusOutlined, ExpandOutlined, CompressOutlined, AppstoreOutlined } from '@ant-design/icons';
import { ProductListByCategory } from './product';

const { TextArea } = Input;

/**
 * 产品分类管理页面（树形结构）
 */
const ProductClassifyPage = () => {
  const [formVisible, setFormVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [parentRecord, setParentRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [allKeys, setAllKeys] = useState([]);
  const [viewMode, setViewMode] = useState(false);

  // 产品维护相关状态
  const [productDrawerVisible, setProductDrawerVisible] = useState(false);
  const [currentCategoryId, setCurrentCategoryId] = useState(null);
  const [currentCategoryName, setCurrentCategoryName] = useState('');

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
      const response = await deleteQProductCategory({ id: record.id });
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
        ? await updateQProductCategory(submitValues)
        : await saveQProductCategory(submitValues);

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
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: '分类名称',
      dataIndex: 'title',
      key: 'title',
      width: 250,
      align: 'left',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 300,
      ellipsis: true,
    },
    {
      title: '排序',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 350,
      render: (_, record) => (
        <>
          <Button
            type="link"
            size="small"
            icon={<AppstoreOutlined />}
            onClick={() => handleOpenProductDrawer(record)}
            style={{ color: '#1890ff' }}
          >
            产品维护
          </Button>
          <Button
            type="link"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => handleAddChild(record)}
          >
            添加子级
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
          <Button
            type="link"
            size="small"
            onClick={() => handleView(record)}
          >
            查看
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
      const response = await getQProductCategoryList(params);
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
      return `添加子分类 (${parentRecord.title})`;
    }
    return '添加分类';
  };

  // 打开产品维护抽屉
  const handleOpenProductDrawer = (record) => {
    setCurrentCategoryId(record.id);
    setCurrentCategoryName(record.title);
    setProductDrawerVisible(true);
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
        loading={loading}
        disabled={viewMode}
      >
        <Form.Item
          name="title"
          label="分类名称"
          rules={[{ required: true, message: '请输入分类名称' }]}
        >
          <Input placeholder="请输入分类名称" disabled={viewMode} />
        </Form.Item>

        <Form.Item
          name="description"
          label="描述"
        >
          <Input.TextArea rows={3} placeholder="请输入描述" disabled={viewMode} />
        </Form.Item>

        <Form.Item
          name="orderNo"
          label="排序号码"
          rules={[{ required: true, message: '请输入排序号码' }]}
        >
          <InputNumber placeholder="请输入排序号码" style={{ width: '100%' }} disabled={viewMode} />
        </Form.Item>
      </DataForm>

      {/* 产品维护抽屉 */}
      <Drawer
        title={`产品维护 - ${currentCategoryName}`}
        placement="right"
        width="80%"
        open={productDrawerVisible}
        onClose={() => setProductDrawerVisible(false)}
        destroyOnClose
      >
        <ProductListByCategory
          categoryId={currentCategoryId}
          categoryName={currentCategoryName}
        />
      </Drawer>
    </div>
  );
};

export default ProductClassifyPage;
