import React, { useState } from 'react';
import { Tag, Form, Input, Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import CmBasePage from '@components/CmBasePage';
import DataForm from '@components/DataForm';
import {
  listOrder,
  addOrder,
} from '@api/modules/collect';

/**
 * 归集订单页面
 */
const CollectionOrderPage = () => {
  // ==================== 状态管理 ====================
  const [formVisible, setFormVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  /**
   * 新增订单
   */
  const handleAdd = () => {
    setFormVisible(true);
  };

  /**
   * 提交表单
   */
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await addOrder(values);
      if (response.code === 0 || response.code === 200) {
        message.success('新增成功');
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

  // ==================== 列配置 ====================

  const columns = [
    {
      title: '主键ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: 'hash',
      dataIndex: 'hash',
      key: 'hash',
      width: 200,
      ellipsis: true,
    },
    {
      title: '归集地址',
      dataIndex: 'address',
      key: 'address',
      width: 300,
      ellipsis: true,
    },
    {
      title: '归集金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const statusMap = {
          1: { color: 'processing', text: '进行中' },
          2: { color: 'success', text: '归集成功' },
          3: { color: 'error', text: '归集失败' },
        };
        const item = statusMap[status] || { color: 'default', text: '未知' };
        return <Tag color={item.color}>{item.text}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 200,
      ellipsis: true,
    },
  ];

  // ==================== 搜索配置 ====================

  const searchFieldList = [
    {
      title: 'hash',
      dataIndex: 'hash',
      key: 'SEARCH_LIKE_hash',
      type: 'text',
    },
    {
      title: '归集地址',
      dataIndex: 'address',
      key: 'SEARCH_LIKE_address',
      type: 'text',
    },
    {
      title: '归集金额',
      dataIndex: 'amount',
      key: 'SEARCH_LIKE_amount',
      type: 'text',
    },
  ];

  // ==================== 渲染 ====================

  return (
    <div>
      <CmBasePage
        columns={columns}
        apiEndpoint="/asset/collectionOrder/list"
        apiMethod="get"
        searchFieldList={searchFieldList}
        onAdd={handleAdd}
        rowKey="id"
        actionButtons={{
          edit: false,
          delete: false,
          view: false,
        }}
      />

      <DataForm
        visible={formVisible}
        title="新增归集订单"
        initialValues={{}}
        onCancel={() => setFormVisible(false)}
        onSubmit={handleSubmit}
        onClosed={() => setFormVisible(false)}
        loading={loading}
        formType="modal"
        width={500}
      >
        <Form.Item
          name="hash"
          label="订单号"
          rules={[{ required: true, message: '请输入订单号' }]}
        >
          <Input placeholder="请输入订单号" />
        </Form.Item>
        <Form.Item
          name="address"
          label="归集地址"
          rules={[{ required: true, message: '请输入归集地址' }]}
        >
          <Input placeholder="请输入归集地址" />
        </Form.Item>
        <Form.Item
          name="amount"
          label="归集金额"
          rules={[{ required: true, message: '请输入归集金额' }]}
        >
          <Input placeholder="请输入归集金额" />
        </Form.Item>
        <Form.Item
          name="remark"
          label="备注"
        >
          <Input.TextArea placeholder="请输入备注" rows={3} />
        </Form.Item>
      </DataForm>
    </div>
  );
};

export default CollectionOrderPage;
