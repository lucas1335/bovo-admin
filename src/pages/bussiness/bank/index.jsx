import React, { useState } from 'react';
import { message, Tag, Form, Input } from 'antd';
import CmBasePage from '@components/CmBasePage';
import DataForm from '@components/DataForm';
import { getBankCardList, updateBankCard, deleteBankCard } from '@api';

/**
 * 银行卡管理页面
 */
const BankCardPage = () => {
  const [formVisible, setFormVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);

  /**
   * 处理编辑按钮点击
   */
  const handleEdit = (record) => {
    setEditingRecord(record);
    setIsViewMode(false);
    setFormVisible(true);
  };

  /**
   * 处理查看按钮点击
   */
  const handleView = (record) => {
    setEditingRecord(record);
    setIsViewMode(true);
    setFormVisible(true);
  };

  /**
   * 处理删除操作
   */
  const handleDelete = async (record) => {
    try {
      const response = await deleteBankCard({ id: record.id });
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
   * 处理表单提交
   */
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const submitData = {
        ...values,
        id: editingRecord?.id
      };

      const response = await updateBankCard(submitData);

      if (response.code === 0 || response.code === 200) {
        message.success('更新成功');
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

  /**
   * 银行卡号脱敏处理
   * 只显示前4位和后4位，中间用****代替
   */
  const maskCardNumber = (cardNumber) => {
    if (!cardNumber) return '-';
    if (cardNumber.length <= 8) return cardNumber;
    const start = cardNumber.substring(0, 4);
    const end = cardNumber.substring(cardNumber.length - 4);
    const middle = '*'.repeat(cardNumber.length - 8);
    return `${start}${middle}${end}`;
  };

  /**
   * 表格列配置
   */
  const columns = [
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 100,
    },
    {
      title: '姓名',
      dataIndex: 'userName',
      key: 'userName',
      width: 120,
    },
    {
      title: '银行卡号',
      dataIndex: 'cardNumber',
      key: 'cardNumber',
      width: 200,
      render: (text) => maskCardNumber(text),
    },
    {
      title: '开户银行名称',
      dataIndex: 'bankName',
      key: 'bankName',
      width: 150,
    },
    {
      title: '开户省市',
      dataIndex: 'bankAddress',
      key: 'bankAddress',
      width: 150,
    },
    {
      title: '开户网点',
      dataIndex: 'bankBranch',
      key: 'bankBranch',
      width: 150,
    },
    {
      title: '银行编码',
      dataIndex: 'bankCode',
      key: 'bankCode',
      width: 120,
    },
    {
      title: '用户地址',
      dataIndex: 'userAddress',
      key: 'userAddress',
      width: 150,
    },
  ];

  /**
   * 搜索字段配置
   */
  const searchFieldList = [
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'SEARCH_EQ_userId',
      type: 'text',
    },
    {
      title: '姓名',
      dataIndex: 'userName',
      key: 'SEARCH_LIKE_userName',
      type: 'text',
    },
    {
      title: '银行卡号',
      dataIndex: 'cardNumber',
      key: 'SEARCH_LIKE_cardNumber',
      type: 'text',
    },
    {
      title: '开户银行',
      dataIndex: 'bankName',
      key: 'SEARCH_LIKE_bankName',
      type: 'text',
    },
  ];

  return (
    <div>
      {/* 列表页面 */}
      <CmBasePage
        columns={columns}
        apiEndpoint="/system/userBank/list"
        apiMethod="get"
        searchFieldList={searchFieldList}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        actionButtons={{ view: true, edit: true, delete: true }}
        rowKey="id"
      />

      {/* 编辑/查看表单 */}
      <DataForm
        visible={formVisible}
        title={isViewMode ? '查看银行卡信息' : '编辑银行卡信息'}
        initialValues={editingRecord || {}}
        extraValues={{ id: editingRecord?.id }}
        onCancel={() => setFormVisible(false)}
        onSubmit={handleSubmit}
        onClosed={() => {
          setEditingRecord(null);
          setIsViewMode(false);
        }}
        loading={loading}
        formType="drawer"
        width="600px"
        disabled={isViewMode}
      >
        <Form.Item
          name="userId"
          label="用户ID"
          rules={[{ required: true, message: '请输入用户ID' }]}
        >
          <Input placeholder="请输入用户ID" disabled={isViewMode} />
        </Form.Item>

        <Form.Item
          name="userName"
          label="姓名"
          rules={[{ required: true, message: '请输入姓名' }]}
        >
          <Input placeholder="请输入姓名" disabled={isViewMode} />
        </Form.Item>

        <Form.Item
          name="cardNumber"
          label="银行卡号"
          rules={[{ required: true, message: '请输入银行卡号' }]}
        >
          <Input placeholder="请输入银行卡号" disabled={isViewMode} />
        </Form.Item>

        <Form.Item
          name="bankName"
          label="开户银行名称"
          rules={[{ required: true, message: '请输入开户银行名称' }]}
        >
          <Input placeholder="请输入开户银行名称" disabled={isViewMode} />
        </Form.Item>

        <Form.Item
          name="bankAddress"
          label="开户省市"
          rules={[{ required: true, message: '请输入开户省市' }]}
        >
          <Input placeholder="请输入开户省市（如：广东省深圳市）" disabled={isViewMode} />
        </Form.Item>

        <Form.Item
          name="bankBranch"
          label="开户网点"
          rules={[{ required: true, message: '请输入开户网点' }]}
        >
          <Input placeholder="请输入开户网点" disabled={isViewMode} />
        </Form.Item>

        <Form.Item
          name="bankCode"
          label="银行编码"
          rules={[{ required: true, message: '请输入银行编码' }]}
        >
          <Input placeholder="请输入银行编码" disabled={isViewMode} />
        </Form.Item>

        <Form.Item
          name="userAddress"
          label="用户地址"
        >
          <Input placeholder="请输入用户地址" disabled={isViewMode} />
        </Form.Item>
      </DataForm>
    </div>
  );
};

export default BankCardPage;
