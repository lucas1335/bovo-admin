import React, { useState } from 'react';
import { message, Tag, Form, Input, Radio } from 'antd';
import CmBasePage from '@components/CmBasePage';
import DataForm from '@components/DataForm';
import { getQLeaveMessageList, saveQLeaveMessage, updateQLeaveMessage, deleteQLeaveMessage } from '@api';

const { TextArea } = Input;

/**
 * 留言信息管理页面
 */
const LeaveMessagePage = () => {
  const [formVisible, setFormVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAdd = () => {
    setEditingRecord(null);
    setFormVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormVisible(true);
  };

  const handleDelete = async (record) => {
    try {
      const response = await deleteQLeaveMessage({ id: record.id });
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
        ? await updateQLeaveMessage(values)
        : await saveQLeaveMessage(values);

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
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 200,
    },
    {
      title: '留言内容',
      dataIndex: 'content',
      key: 'content',
      width: 300,
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'state',
      key: 'state',
      width: 100,
      render: (state) => {
        const stateMap = {
          '1': { text: '已处理', color: 'success' },
          '0': { text: '待处理', color: 'warning' },
        };
        const s = stateMap[state] || { text: '未知', color: 'default' };
        return <Tag color={s.color}>{s.text}</Tag>;
      }
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
      title: '姓名',
      dataIndex: 'name',
      key: 'SEARCH_LIKE_name',
      type: 'text',
    },
    {
      title: '状态',
      dataIndex: 'state',
      key: 'SEARCH_EQ_state',
      type: 'select',
      options: [
        { label: '待处理', value: '0' },
        { label: '已处理', value: '1' },
      ],
    },
  ];

  return (
    <div style={{ textAlign: 'left' }}>
      <CmBasePage
        columns={columns}
        apiEndpoint="/qLeaveMessage/getList"
        apiMethod="get"
        searchFieldList={searchFieldList}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        rowKey="id"
      />

      <DataForm
        visible={formVisible}
        title={editingRecord ? '编辑留言' : '新增留言'}
        initialValues={editingRecord || {}}
        extraValues={{ id: editingRecord?.id }}
        onCancel={() => setFormVisible(false)}
        onSubmit={handleSubmit}
        loading={loading}
      >
        <Form.Item
          name="name"
          label="姓名"
          rules={[{ required: true, message: '请输入姓名' }]}
        >
          <Input placeholder="请输入姓名" />
        </Form.Item>

        <Form.Item
          name="phone"
          label="联系电话"
          rules={[{ required: true, message: '请输入联系电话' }]}
        >
          <Input placeholder="请输入联系电话" />
        </Form.Item>

        <Form.Item
          name="email"
          label="邮箱"
        >
          <Input placeholder="请输入邮箱" />
        </Form.Item>

        <Form.Item
          name="content"
          label="留言内容"
          rules={[{ required: true, message: '请输入留言内容' }]}
        >
          <TextArea rows={4} placeholder="请输入留言内容" />
        </Form.Item>

        <Form.Item
          name="state"
          label="状态"
          rules={[{ required: true, message: '请选择状态' }]}
        >
          <Radio.Group>
            <Radio value={0}>待处理</Radio>
            <Radio value={1}>已处理</Radio>
          </Radio.Group>
        </Form.Item>
      </DataForm>
    </div>
  );
};

export default LeaveMessagePage;
