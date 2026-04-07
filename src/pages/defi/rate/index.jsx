import React, { useState } from 'react';
import { message, Modal, Form, Input, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import CmBasePage from '@components/CmBasePage';
import {
  getDefiRateList,
  getDefiRateDetail,
  saveDefiRate,
  updateDefiRate,
  deleteDefiRate,
} from '@api';

const { TextArea } = Input;

/**
 * 挖矿利率配置列表页面
 * 功能：利率配置列表展示、搜索、新增、修改、删除
 */
const DefiRatePage = () => {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  /**
   * 刷新表格
   */
  const refreshTable = () => {
    document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
      new CustomEvent('reload')
    );
  };

  /**
   * 打开新增弹窗
   */
  const handleAdd = () => {
    setCurrentRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  /**
   * 打开编辑弹窗
   */
  const handleEdit = async (record) => {
    try {
      setCurrentRecord(record);
      form.resetFields();

      // 获取详情数据
      const response = await getDefiRateDetail(record.id);
      if (response.code === 0 || response.code === 200) {
        const data = response.data;
        form.setFieldsValue({
          minAmount: data.minAmount,
          maxAmount: data.maxAmount,
          rate: data.rate,
          remark: data.remark,
        });
        setModalVisible(true);
      } else {
        message.error(response.msg || '获取详情失败');
      }
    } catch (error) {
      message.error('获取详情失败: ' + error.message);
    }
  };

  /**
   * 删除配置
   */
  const handleDelete = async (record) => {
    try {
      const id = record.id || (selectedRowKeys.length > 0 ? selectedRowKeys[0] : null);
      if (!id) {
        message.warning('请选择要删除的记录');
        return;
      }
      const response = await deleteDefiRate(id);
      if (response.code === 0 || response.code === 200) {
        message.success('删除成功');
        setSelectedRowKeys([]);
        refreshTable();
      } else {
        message.error(response.msg || '删除失败');
      }
    } catch (error) {
      message.error('删除失败: ' + error.message);
    }
  };

  /**
   * 批量删除
   */
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的记录');
      return;
    }
    try {
      // 批量删除，逐个调用删除接口
      for (let i = 0; i < selectedRowKeys.length; i++) {
        await deleteDefiRate(selectedRowKeys[i]);
      }
      message.success('删除成功');
      setSelectedRowKeys([]);
      refreshTable();
    } catch (error) {
      message.error('删除失败: ' + error.message);
    }
  };

  /**
   * 提交表单
   */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setModalLoading(false);

      const submitData = {
        ...values,
        ...(currentRecord ? { id: currentRecord.id } : {}),
      };

      let response;
      if (currentRecord) {
        response = await updateDefiRate(submitData);
      } else {
        response = await saveDefiRate(submitData);
      }

      if (response.code === 0 || response.code === 200) {
        message.success(currentRecord ? '修改成功' : '新增成功');
        setModalVisible(false);
        refreshTable();
      } else {
        message.error(response.msg || '操作失败');
      }
    } catch (error) {
      if (error.errorFields) {
        // 表单验证失败
        return;
      }
      message.error('操作失败: ' + error.message);
    } finally {
      setModalLoading(false);
    }
  };

  // 表格列配置
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '最小金额',
      dataIndex: 'minAmount',
      key: 'minAmount',
      width: 130,
      render: (amount) => amount ? Number(amount).toFixed(8) : '0.00000000',
    },
    {
      title: '最大金额',
      dataIndex: 'maxAmount',
      key: 'maxAmount',
      width: 130,
      render: (amount) => amount ? Number(amount).toFixed(8) : '0.00000000',
    },
    {
      title: '利率',
      dataIndex: 'rate',
      key: 'rate',
      width: 100,
      render: (rate) => rate ? `${Number(rate).toFixed(2)}%` : '0.00%',
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 150,
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => handleEdit(record)}
            style={{
              border: 'none',
              background: 'none',
              color: '#1890ff',
              cursor: 'pointer',
              padding: '4px 8px',
            }}
          >
            <EditOutlined /> 修改
          </button>
          <Popconfirm
            title="删除确认"
            description="确定要删除这条配置记录吗？"
            onConfirm={() => handleDelete(record)}
            okText="确定"
            cancelText="取消"
          >
            <button
              type="button"
              style={{
                border: 'none',
                background: 'none',
                color: '#ff4d4f',
                cursor: 'pointer',
                padding: '4px 8px',
              }}
            >
              <DeleteOutlined /> 删除
            </button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  // 搜索字段配置
  const searchFieldList = [
    {
      title: '最小金额',
      dataIndex: 'minAmount',
      key: 'SEARCH_EQ_minAmount',
      type: 'text',
    },
    {
      title: '最大金额',
      dataIndex: 'maxAmount',
      key: 'SEARCH_EQ_maxAmount',
      type: 'text',
    },
    {
      title: '利率',
      dataIndex: 'rate',
      key: 'SEARCH_EQ_rate',
      type: 'text',
    },
  ];

  return (
    <>
      <CmBasePage
        columns={columns}
        apiEndpoint="/contract/defiRate/list"
        apiMethod="get"
        searchFieldList={searchFieldList}
        actionButtons={{ view: false, edit: false, delete: false }}
        rowKey="id"
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
        }}
        toolbarExtraButtons={[
          {
            label: '新增',
            icon: <PlusOutlined />,
            onClick: handleAdd,
            type: 'primary',
          },
          {
            label: '批量删除',
            icon: <DeleteOutlined />,
            onClick: handleBatchDelete,
            disabled: selectedRowKeys.length === 0,
            danger: true,
          },
        ]}
      />

      {/* 新增/编辑弹窗 */}
      <Modal
        title={currentRecord ? '修改defi挖矿利率配置' : '添加defi挖矿利率配置'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        confirmLoading={modalLoading}
        width={500}
        okText="确定"
        cancelText="取消"
      >
        <Form
          form={form}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          style={{ marginTop: 20 }}
        >
          <Form.Item
            name="minAmount"
            label="最小金额"
            rules={[
              { required: true, message: '请输入最小金额' },
              { pattern: /^\d+(\.\d+)?$/, message: '请输入有效的数字' },
            ]}
          >
            <Input placeholder="请输入最小金额" />
          </Form.Item>
          <Form.Item
            name="maxAmount"
            label="最大金额"
            rules={[
              { required: true, message: '请输入最大金额' },
              { pattern: /^\d+(\.\d+)?$/, message: '请输入有效的数字' },
            ]}
          >
            <Input placeholder="请输入最大金额" />
          </Form.Item>
          <Form.Item
            name="rate"
            label="利率"
            rules={[
              { required: true, message: '请输入利率' },
              { pattern: /^\d+(\.\d+)?$/, message: '请输入有效的数字' },
            ]}
          >
            <Input placeholder="请输入利率" />
          </Form.Item>
          <Form.Item
            name="remark"
            label="备注"
          >
            <TextArea rows={3} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default DefiRatePage;
