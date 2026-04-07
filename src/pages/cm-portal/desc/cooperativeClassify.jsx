import React, { useState } from 'react';
import { message, Form, Input, InputNumber } from 'antd';
import CmBasePage from '@components/CmBasePage';
import DataForm from '@components/DataForm';
import { getPCooperativeCategoryList, savePCooperativeCategory, updatePCooperativeCategory, deletePCooperativeCategory } from '@api';

const { TextArea } = Input;

/**
 * 合作企业分类管理页面
 */
const CooperativeClassifyPage = () => {
  const [formVisible, setFormVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState(false);

  const handleAdd = () => {
    setEditingRecord(null);
    setViewMode(false);
    setFormVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setViewMode(false);
    setFormVisible(true);
  };

  const handleView = (record) => {
    setEditingRecord(record);
    setViewMode(true);
    setFormVisible(true);
  };

  const handleDelete = async (record) => {
    try {
      const response = await deletePCooperativeCategory({ id: record.id });
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
      const response = editingRecord
        ? await updatePCooperativeCategory(values)
        : await savePCooperativeCategory(values);

      if (response.code === 0 || response.code === 200) {
        message.success(editingRecord ? '更新成功' : '创建成功');
        setFormVisible(false);
        document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
          new CustomEvent('reload')
        );
      } else {
        message.error(response.msg || '操作失败');
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
      dataIndex: 'name',
      key: 'name',
      width: 250,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 300,
    },
    {
      title: '排序号码',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 120,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
    },
  ];

  const searchFieldList = [
    {
      title: '分类名称',
      dataIndex: 'name',
      key: 'SEARCH_LIKE_name',
      type: 'text',
    },
  ];

  return (
    <div style={{ textAlign: 'left' }}>
      <CmBasePage
        columns={columns}
        apiEndpoint="/pCooperativeCategory/getList"
        apiMethod="get"
        searchFieldList={searchFieldList}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        rowKey="id"
      />

      <DataForm
        visible={formVisible}
        title={viewMode ? '查看合作企业分类' : (editingRecord ? '编辑合作企业分类' : '新增合作企业分类')}
        initialValues={editingRecord || {}}
        extraValues={{ id: editingRecord?.id }}
        onCancel={() => setFormVisible(false)}
        onSubmit={handleSubmit}
        onClosed={() => setEditingRecord(null)}
        loading={loading}
        disabled={viewMode}
      >
        <Form.Item
          name="name"
          label="分类名称"
          rules={[{ required: true, message: '请输入分类名称' }]}
        >
          <Input placeholder="请输入分类名称" />
        </Form.Item>

        <Form.Item
          name="description"
          label="描述"
        >
          <TextArea rows={4} placeholder="请输入描述" />
        </Form.Item>

        <Form.Item
          name="orderNo"
          label="排序号码"
          rules={[{ required: true, message: '请输入排序号码' }]}
        >
          <InputNumber placeholder="请输入排序号码" style={{ width: '100%' }} />
        </Form.Item>
      </DataForm>
    </div>
  );
};

export default CooperativeClassifyPage;
