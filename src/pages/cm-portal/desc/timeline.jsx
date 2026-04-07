import React, { useState } from 'react';
import { message, Tag, Form, Input, Radio, InputNumber, DatePicker } from 'antd';
import dayjs from 'dayjs';
import CmBasePage from '@components/CmBasePage';
import DataForm from '@components/DataForm';
import { getQTimeLineList, saveQTimeLine, updateQTimeLine, deleteQTimeLine } from '@api';

const { TextArea } = Input;

/**
 * 时间轴信息管理页面
 */
const TimeLinePage = () => {
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
      const response = await deleteQTimeLine({ id: record.id });
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
        ? await updateQTimeLine(values)
        : await saveQTimeLine(values);

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
      title: '时间',
      key: 'time',
      width: 150,
      render: (_, record) => `${record.year || ''}${record.month ? '-' + record.month : ''}`,
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: 250,
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      width: 400,
      ellipsis: true,
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
        apiEndpoint="/qTimeLine/getList"
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
        title={viewMode ? '查看时间轴' : (editingRecord ? '编辑时间轴' : '新增时间轴')}
        initialValues={editingRecord || {}}
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
          name="year"
          label="年份"
          rules={[{ required: true, message: '请选择年份' }]}
          getValueProps={(value) => ({ value: value ? dayjs(value, 'YYYY') : null })}
          getValueFromEvent={(value) => value && value.format('YYYY')}
        >
          <DatePicker picker="year" style={{ width: '100%' }} placeholder="请选择年份" />
        </Form.Item>

        <Form.Item
          name="month"
          label="月份"
          rules={[{ required: true, message: '请选择月份' }]}
          getValueProps={(value) => ({ value: value ? dayjs(value, 'YYYY-MM') : null })}
          getValueFromEvent={(value) => value && value.format('YYYY-MM')}
        >
          <DatePicker picker="month" style={{ width: '100%' }} placeholder="请选择月份" />
        </Form.Item>

        <Form.Item
          name="content"
          label="内容"
          rules={[{ required: true, message: '请输入内容' }]}
        >
          <TextArea rows={4} placeholder="请输入内容" />
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
          label="排序"
          rules={[{ required: true, message: '请输入排序' }]}
        >
          <InputNumber placeholder="请输入排序" style={{ width: '100%' }} />
        </Form.Item>
      </DataForm>
    </div>
  );
};

export default TimeLinePage;
