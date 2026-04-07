import React, { useState } from 'react';
import { message, Tag, Form, Input, Radio, InputNumber } from 'antd';
import CmBasePage from '@components/CmBasePage';
import DataForm from '@components/DataForm';
import CmUpload from '@components/CmUpload';
import CmImage from '@components/CmImage';
import { getPBannerInfoList, savePBannerInfo, updatePBannerInfo, deletePBannerInfo } from '@api';

const { TextArea } = Input;

/**
 * Banner轮播管理页面
 */
const BannerPage = () => {
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
      const response = await deletePBannerInfo({ id: record.id });
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
        ? await updatePBannerInfo(values)
        : await savePBannerInfo(values);

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
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: 200,
    },
    {
      title: '封面图',
      dataIndex: 'coverImage',
      key: 'coverImage',
      width: 180,
      render: (text) => <CmImage src={text} width={120} height={60} />,
    },
    {
      title: '封面图(手机)',
      dataIndex: 'coverImageM',
      key: 'coverImageM',
      width: 180,
      render: (text) => <CmImage src={text} width={80} height={60} />,
    },
    {
      title: '状态',
      dataIndex: 'state',
      key: 'state',
      width: 100,
      render: (state) => {
        const stateMap = {
          '1': { text: '展示', color: 'success' },
          '0': { text: '隐藏', color: 'error' },
        };
        const s = stateMap[state] || { text: '未知', color: 'default' };
        return <Tag color={s.color}>{s.text}</Tag>;
      }
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
      title: '标题',
      dataIndex: 'title',
      key: 'SEARCH_LIKE_title',
      type: 'text',
    },
    {
      title: '状态',
      dataIndex: 'state',
      key: 'SEARCH_EQ_state',
      type: 'select',
      options: [
        { label: '展示', value: '1' },
        { label: '隐藏', value: '0' }
      ]
    },
  ];

  return (
    <div style={{ textAlign: 'left' }}>
      <CmBasePage
        columns={columns}
        apiEndpoint="/pBannerInfo/getList"
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
        title={viewMode ? '查看Banner' : (editingRecord ? '编辑Banner' : '新增Banner')}
        initialValues={editingRecord || { state: 1, orderNo: 1 }}
        extraValues={{ id: editingRecord?.id }}
        onCancel={() => setFormVisible(false)}
        onSubmit={handleSubmit}
        onClosed={() => setEditingRecord(null)}
        loading={loading}
        disabled={viewMode}
      >
        <Form.Item
          name="title"
          label="标题"
          rules={[{ required: true, message: '请输入标题' }]}
        >
          <Input placeholder="请输入标题" />
        </Form.Item>

        <Form.Item
          name="coverImage"
          label="封面图"
          rules={[{ required: true, message: '请上传封面图' }]}
        >
          <CmUpload />
        </Form.Item>

        <Form.Item
          name="coverImageM"
          label="封面图(手机站)"
        >
          <CmUpload />
        </Form.Item>

        <Form.Item
          name="state"
          label="状态"
          rules={[{ required: true, message: '请选择状态' }]}
        >
          <Radio.Group>
            <Radio value={1}>展示</Radio>
            <Radio value={0}>隐藏</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="orderNo"
          label="排序号码"
          rules={[{ required: true, message: '请输入排序号码' }]}
        >
          <InputNumber placeholder="请输入排序号码" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="label1"
          label="图片文本1"
        >
          <Input placeholder="请输入图片文本1" />
        </Form.Item>

        <Form.Item
          name="label2"
          label="图片文本2"
        >
          <Input placeholder="请输入图片文本2" />
        </Form.Item>

        <Form.Item
          name="label3"
          label="图片文本3"
        >
          <Input placeholder="请输入图片文本3" />
        </Form.Item>

        <Form.Item
          name="extField1"
          label="扩展字段1"
        >
          <Input placeholder="请输入扩展字段1" />
        </Form.Item>

        <Form.Item
          name="extField2"
          label="扩展字段2"
        >
          <Input placeholder="请输入扩展字段2" />
        </Form.Item>

        <Form.Item
          name="linkUrl"
          label="跳转地址"
        >
          <Input placeholder="请输入跳转地址" />
        </Form.Item>

        <Form.Item
          name="remark"
          label="备注"
        >
          <TextArea rows={3} placeholder="请输入备注" />
        </Form.Item>
      </DataForm>
    </div>
  );
};

export default BannerPage;
