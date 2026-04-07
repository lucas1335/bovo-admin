import React, { useState, useEffect } from 'react';
import { message, Form, Input, InputNumber, Select } from 'antd';
import CmBasePage from '@components/CmBasePage';
import DataForm from '@components/DataForm';
import CmUpload from '@components/CmUpload';
import CmImage from '@components/CmImage';
import { getPCooperativeList, savePCooperative, updatePCooperative, deletePCooperative, getPCooperativeCategoryList } from '@api';

const { TextArea } = Input;

/**
 * 合作企业管理页面
 */
const CooperativePage = () => {
  const [formVisible, setFormVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [classifyList, setClassifyList] = useState([]);
  const [classifyMap, setClassifyMap] = useState(new Map());
  const [viewMode, setViewMode] = useState(false);

  // 获取合作企业分类列表
  useEffect(() => {
    const fetchClassifyList = async () => {
      try {
        const response = await getPCooperativeCategoryList({
          pageNum: 1,
          pageSize: 1000
        });
        if (response.code === 0 || response.code === 200) {
          const list = response.data?.records || response.data?.list || [];
          setClassifyList(list);

          // 构建分类Map用于显示分类名称
          const map = new Map();
          list.forEach(item => {
            map.set(item.id, item);
          });
          setClassifyMap(map);
        }
      } catch (error) {
        message.error('合作企业分类获取失败');
      }
    };
    fetchClassifyList();
  }, []);

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
      const response = await deletePCooperative({ id: record.id });
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
        ? await updatePCooperative(values)
        : await savePCooperative(values);

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

  // 查找分类名称
  const findClassifyName = (categoryId) => {
    const classify = classifyMap.get(categoryId);
    return classify ? classify.name : '-';
  };

  // 分类选项数据
  const categoryOptions = (classifyList || []).map(item => ({
    label: item.name,
    value: item.id,
  }));

  const columns = [
    {
      title: '企业名称',
      dataIndex: 'name',
      key: 'name',
      width: 250,
    },
    {
      title: '分类',
      dataIndex: 'categoryId',
      key: 'categoryId',
      width: 150,
      render: (categoryId) => findClassifyName(categoryId),
    },
    {
      title: 'Logo',
      dataIndex: 'logo',
      key: 'logo',
      width: 150,
      render: (text) => <CmImage src={text} width={100} height={60} />,
    },
    {
      title: '网址',
      dataIndex: 'website',
      key: 'website',
      width: 200,
    },
    {
      title: '排序',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 100,
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
      title: '企业名称',
      dataIndex: 'name',
      key: 'SEARCH_LIKE_name',
      type: 'text',
    },
  ];

  return (
    <div style={{ textAlign: 'left' }}>
      <CmBasePage
        columns={columns}
        apiEndpoint="/pCooperative/getList"
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
        title={viewMode ? '查看合作企业' : (editingRecord ? '编辑合作企业' : '新增合作企业')}
        initialValues={editingRecord || {}}
        extraValues={{ id: editingRecord?.id }}
        onCancel={() => setFormVisible(false)}
        onSubmit={handleSubmit}
        onClosed={() => setEditingRecord(null)}
        loading={loading}
        disabled={viewMode}
      >
        <Form.Item
          name="categoryId"
          label="企业分类"
          rules={[{ required: true, message: '请选择企业分类' }]}
        >
          <Select
            placeholder="请选择企业分类"
            options={categoryOptions}
            allowClear
            showSearch
          />
        </Form.Item>

        <Form.Item
          name="name"
          label="企业名称"
          rules={[{ required: true, message: '请输入企业名称' }]}
        >
          <Input placeholder="请输入企业名称" />
        </Form.Item>

        <Form.Item
          name="logo"
          label="Logo"
        >
          <CmUpload />
        </Form.Item>

        <Form.Item
          name="website"
          label="网址"
        >
          <Input placeholder="请输入网址" />
        </Form.Item>

        <Form.Item
          name="description"
          label="企业描述"
        >
          <TextArea rows={4} placeholder="请输入企业描述" />
        </Form.Item>

        <Form.Item
          name="orderNo"
          label="排序"
          rules={[{ required: true, message: '请输入排序' }]}
        >
          <InputNumber placeholder="请输入排序" style={{ width: '100%' }} />
        </Form.Item>
      </DataForm>
    </div>
  );
};

export default CooperativePage;
