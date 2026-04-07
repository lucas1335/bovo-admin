import React, { useState } from 'react';
import { message, Tag, Button, Popconfirm, Form, Input, InputNumber, Radio } from 'antd';
import CmBasePage from '@components/CmBasePage';
import DataForm from '@components/DataForm';
import { getSysPostList, saveSysPost, updateSysPost, deleteSysPost } from '@api';

/**
 * 岗位管理页面
 */
const PostPage = () => {
  // 1. 状态管理（按固定顺序）
  const [formVisible, setFormVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);

  // 2. 列配置
  const columns = [
    {
      title: '岗位编号',
      dataIndex: 'postId',
      key: 'postId',
      width: 100,
      sorter: true,
    },
    {
      title: '岗位编码',
      dataIndex: 'postCode',
      key: 'postCode',
      width: 150,
      sorter: true,
    },
    {
      title: '岗位名称',
      dataIndex: 'postName',
      key: 'postName',
      width: 200,
      sorter: true,
    },
    {
      title: '岗位排序',
      dataIndex: 'postSort',
      key: 'postSort',
      width: 100,
      sorter: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusMap = {
          '0': { color: 'green', text: '正常' },
          '1': { color: 'orange', text: '停用' },
        };
        const statusInfo = statusMap[status] || { color: 'default', text: '未知' };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
    },
  ];

  // 3. 搜索配置
  const searchFieldList = [
    {
      title: '岗位编码',
      dataIndex: 'postCode',
      key: 'SEARCH_LIKE_postCode',
      type: 'text',
    },
    {
      title: '岗位名称',
      dataIndex: 'postName',
      key: 'SEARCH_LIKE_postName',
      type: 'text',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'SEARCH_EQ_status',
      type: 'select',
      options: [
        { label: '正常', value: '0' },
        { label: '停用', value: '1' }
      ]
    },
  ];

  // 4. 事件处理
  /**
   * 新增岗位
   */
  const handleAdd = () => {
    setEditingRecord(null);
    setFormVisible(true);
  };

  /**
   * 编辑岗位
   */
  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormVisible(true);
  };

  /**
   * 删除岗位
   */
  const handleDelete = async (record) => {
    try {
      const response = await deleteSysPost({ postId: record.postId });
      if (response.code === 0 || response.code === 200) {
        message.success('删除成功');
        refreshTable();
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
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = editingRecord
        ? await updateSysPost(values)
        : await saveSysPost(values);

      if (response.code === 0 || response.code === 200) {
        message.success(editingRecord ? '更新成功' : '创建成功');
        setFormVisible(false);
        refreshTable();
      } else {
        message.error(response.msg || '操作失败');
      }
    } catch (error) {
      message.error('操作失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 刷新表格
   */
  const refreshTable = () => {
    document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
      new CustomEvent('reload')
    );
  };

  // 5. 渲染
  return (
    <div>
      <CmBasePage
        columns={columns}
        apiEndpoint="/system/post/list"
        apiMethod="get"
        searchFieldList={searchFieldList}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        rowKey="postId"
        actionButtons={{
          edit: true,
          delete: true,
        }}
      />

      <DataForm
        visible={formVisible}
        title={editingRecord ? '编辑岗位' : '新增岗位'}
        initialValues={editingRecord || { postSort: 0, status: '0' }}
        extraValues={{ postId: editingRecord?.postId }}
        onCancel={() => setFormVisible(false)}
        onSubmit={handleSubmit}
        onClosed={() => setEditingRecord(null)}
        loading={loading}
        formType="modal"
        width={600}
      >
        <Form.Item
          name="postName"
          label="岗位名称"
          rules={[{ required: true, message: '请输入岗位名称' }]}
        >
          <Input placeholder="请输入岗位名称" />
        </Form.Item>

        <Form.Item
          name="postCode"
          label="岗位编码"
          rules={[{ required: true, message: '请输入岗位编码' }]}
        >
          <Input placeholder="请输入岗位编码" />
        </Form.Item>

        <Form.Item
          name="postSort"
          label="岗位排序"
          rules={[{ required: true, message: '请输入岗位排序' }]}
        >
          <InputNumber placeholder="请输入岗位排序" min={0} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="status"
          label="岗位状态"
          rules={[{ required: true, message: '请选择岗位状态' }]}
        >
          <Radio.Group>
            <Radio value="0">正常</Radio>
            <Radio value="1">停用</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="remark"
          label="备注"
        >
          <Input.TextArea placeholder="请输入备注" rows={4} />
        </Form.Item>
      </DataForm>
    </div>
  );
};

export default PostPage;
