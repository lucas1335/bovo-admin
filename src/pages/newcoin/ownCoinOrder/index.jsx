/**
 * 新币认购订单管理页面
 *
 * 功能：管理用户申购新币的订单
 *
 * @author System
 * @date 2026-04-02
 */

import React, { useState } from 'react';
import { message, Form, Input, Select, Tag } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import CmBasePage from '@components/CmBasePage';
import DataForm from '@components/DataForm';
import {
  getOwnCoinOrderList,
  getOwnCoinOrderDetail,
  saveOwnCoinOrder,
  updateOwnCoinOrder,
  deleteOwnCoinOrder
} from '@api/modules/newcoin';

const { Option } = Select;

// 中签状态选项
const SIGN_FLAG_OPTIONS = [
  { label: '待中签', value: '0' },
  { label: '已中签', value: '1' },
  { label: '未中签', value: '2' }
];

/** 新币认购订单管理页面 */
const OwnCoinOrderPage = () => {
  const [formVisible, setFormVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);

  // 刷新表格
  const refreshTable = () => {
    document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
      new CustomEvent('reload')
    );
  };

  // 新增按钮
  const handleAdd = () => {
    setEditingRecord(null);
    setFormVisible(true);
  };

  // 编辑按钮
  const handleEdit = async (record) => {
    try {
      const response = await getOwnCoinOrderDetail(record.id);
      if (response.code === 0 || response.code === 200) {
        setEditingRecord(response.data);
        setFormVisible(true);
      } else {
        message.error(response.msg || '获取详情失败');
      }
    } catch (error) {
      message.error('获取详情失败: ' + error.message);
    }
  };

  // 删除按钮
  const handleDelete = async (record) => {
    try {
      const response = await deleteOwnCoinOrder(record.id);
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

  // 提交表单
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      let response;
      if (editingRecord && editingRecord.id) {
        response = await updateOwnCoinOrder({ ...values, id: editingRecord.id });
      } else {
        response = await saveOwnCoinOrder(values);
      }

      if (response.code === 0 || response.code === 200) {
        message.success(editingRecord ? '修改成功' : '新增成功');
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

  // 复制到剪贴板
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      message.success('复制成功');
    });
  };

  // 中签状态映射
  const signFlagMap = {
    '0': { color: 'default', text: '待中签' },
    '1': { color: 'success', text: '已中签' },
    '2': { color: 'error', text: '未中签' },
  };

  // 表格列配置
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      align: 'center',
    },
    {
      title: '订单号',
      dataIndex: 'orderId',
      key: 'orderId',
      width: 200,
      align: 'center',
      render: (orderId) => (
        <span
          style={{ cursor: 'pointer' }}
          onClick={() => copyToClipboard(orderId)}
        >
          {orderId} <CopyOutlined />
        </span>
      ),
    },
    {
      title: '申购币种ID',
      dataIndex: 'ownId',
      key: 'ownId',
      width: 120,
      align: 'center',
    },
    {
      title: '申购币种',
      dataIndex: 'ownCoin',
      key: 'ownCoin',
      width: 120,
      align: 'center',
    },
    {
      title: '申购额',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      align: 'center',
    },
    {
      title: '申购数量',
      dataIndex: 'number',
      key: 'number',
      width: 120,
      align: 'center',
    },
    {
      title: '申购价',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      align: 'center',
    },
    {
      title: '中签状态',
      dataIndex: 'signFlag',
      key: 'signFlag',
      width: 100,
      align: 'center',
      render: (signFlag) => {
        const status = signFlagMap[signFlag];
        return status ? <Tag color={status.color}>{status.text}</Tag> : '-';
      },
    },
  ];

  // 搜索字段配置
  const searchFieldList = [
    {
      title: '订单ID',
      dataIndex: 'orderId',
      key: 'SEARCH_EQ_orderId',
      type: 'text',
    },
    {
      title: '申购币种ID',
      dataIndex: 'ownId',
      key: 'SEARCH_EQ_ownId',
      type: 'text',
    },
    {
      title: '申购币种',
      dataIndex: 'ownCoin',
      key: 'SEARCH_LIKE_ownCoin',
      type: 'text',
    },
    {
      title: '申购额',
      dataIndex: 'amount',
      key: 'SEARCH_EQ_amount',
      type: 'text',
    },
    {
      title: '申购数量',
      dataIndex: 'number',
      key: 'SEARCH_EQ_number',
      type: 'text',
    },
    {
      title: '申购价',
      dataIndex: 'price',
      key: 'SEARCH_EQ_price',
      type: 'text',
    },
  ];

  return (
    <div>
      <CmBasePage
        columns={columns}
        apiEndpoint="/contract/ownCoinOrder/list"
        apiMethod="get"
        searchFieldList={searchFieldList}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        rowKey="id"
        actionButtons={{
          view: false,
          edit: true,
          delete: true,
        }}
      />

      <DataForm
        visible={formVisible}
        title={editingRecord ? '修改申购订单' : '添加申购订单'}
        initialValues={editingRecord || {}}
        onCancel={() => setFormVisible(false)}
        onSubmit={handleSubmit}
        onClosed={() => setEditingRecord(null)}
        loading={loading}
        formType="modal"
        width="600px"
      >
        <Form.Item
          name="orderId"
          label="订单ID"
          rules={[{ required: true, message: '订单ID不能为空' }]}
        >
          <Input placeholder="请输入订单ID" />
        </Form.Item>

        <Form.Item
          name="ownId"
          label="申购币种ID"
          rules={[{ required: true, message: '申购币种ID不能为空' }]}
        >
          <Input placeholder="请输入申购币种ID" />
        </Form.Item>

        <Form.Item
          name="ownCoin"
          label="申购币种"
          rules={[{ required: true, message: '申购币种不能为空' }]}
        >
          <Input placeholder="请输入申购币种" />
        </Form.Item>

        <Form.Item
          name="amount"
          label="申购额"
          rules={[{ required: true, message: '申购额不能为空' }]}
        >
          <Input placeholder="请输入申购额" />
        </Form.Item>

        <Form.Item
          name="number"
          label="申购数量"
          rules={[{ required: true, message: '申购数量不能为空' }]}
        >
          <Input placeholder="请输入申购数量" />
        </Form.Item>

        <Form.Item
          name="price"
          label="申购价"
          rules={[{ required: true, message: '申购价不能为空' }]}
        >
          <Input placeholder="请输入申购价" />
        </Form.Item>

        <Form.Item
          name="adminUserIds"
          label="上级用户IDS"
        >
          <Input placeholder="请输入上级用户IDS" />
        </Form.Item>

        <Form.Item
          name="adminParentIds"
          label="上级后台用户IDS"
        >
          <Input placeholder="请输入上级后台用户IDS" />
        </Form.Item>

        <Form.Item
          name="signFlag"
          label="中签状态"
        >
          <Select placeholder="请选择中签状态">
            {SIGN_FLAG_OPTIONS.map(option => (
              <Option key={option.value} value={option.value}>{option.label}</Option>
            ))}
          </Select>
        </Form.Item>
      </DataForm>
    </div>
  );
};

export default OwnCoinOrderPage;
