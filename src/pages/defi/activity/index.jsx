import React, { useState } from 'react';
import { message, Modal, Form, Input, Select, DatePicker, Popconfirm, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import CmBasePage from '@components/CmBasePage';
import dayjs from 'dayjs';
import {
  getDefiActivityList,
  saveDefiActivity,
  updateDefiActivity,
  deleteDefiActivity,
} from '@api';

const { Option } = Select;
const { TextArea } = Input;

// 活动币种类型映射
const activityTypeMap = {
  1: { label: 'BTC', color: 'orange' },
  2: { label: 'ETH', color: 'blue' },
  3: { label: 'USDT', color: 'green' },
};

// 活动状态映射
const activityStatusMap = {
  0: { label: '进行中', color: 'green' },
  1: { label: '已结束', color: 'red' },
  2: { label: '未开始', color: 'blue' },
};

/**
 * 空投活动列表页面
 * 功能：活动列表展示、搜索、新增、删除
 */
const DefiActivityPage = () => {
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
    form.setFieldsValue({
      type: '1',
      endTime: dayjs().add(7, 'day'),
    });
    setModalVisible(true);
  };

  /**
   * 删除活动
   */
  const handleDelete = async (record) => {
    try {
      const id = record.id;
      if (!id) {
        message.warning('记录ID不存在');
        return;
      }
      const response = await deleteDefiActivity(id);
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
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setModalLoading(true);

      // 格式化日期
      const submitData = {
        ...values,
        endTime: values.endTime ? dayjs(values.endTime).format('YYYY-MM-DD') : null,
      };

      let response;
      if (currentRecord) {
        response = await updateDefiActivity(submitData);
      } else {
        response = await saveDefiActivity(submitData);
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
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 120,
    },
    {
      title: '金额任务',
      dataIndex: 'totleAmount',
      key: 'totleAmount',
      width: 130,
      render: (amount) => amount ? Number(amount).toFixed(8) : '0.00000000',
    },
    {
      title: '奖励金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 130,
      render: (amount) => amount ? Number(amount).toFixed(8) : '0.00000000',
    },
    {
      title: '活动币种',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type) => {
        const status = activityTypeMap[type] || { label: '未知', color: 'default' };
        return <Tag color={status.color}>{status.label}</Tag>;
      },
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 120,
      render: (time) => time ? dayjs(time).format('YYYY-MM-DD') : '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusInfo = activityStatusMap[status] || { label: '未知', color: 'default' };
        return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>;
      },
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
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Popconfirm
          title="删除确认"
          description="确定要删除这条活动记录吗？"
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
      ),
    },
  ];

  // 搜索字段配置
  const searchFieldList = [
    {
      title: '金额任务',
      dataIndex: 'totleAmount',
      key: 'SEARCH_EQ_totleAmount',
      type: 'text',
    },
    {
      title: '奖励金额',
      dataIndex: 'amount',
      key: 'SEARCH_EQ_amount',
      type: 'text',
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'SEARCH_LTE_endTime',
      type: 'date',
    },
  ];

  return (
    <>
      <CmBasePage
        columns={columns}
        apiEndpoint="/contract/defiActivity/list"
        apiMethod="get"
        searchFieldList={searchFieldList}
        actionButtons={{ view: false, edit: false, delete: false }}
        rowKey="id"
        toolbarExtraButtons={[
          {
            label: '新增',
            icon: <PlusOutlined />,
            onClick: handleAdd,
            type: 'primary',
          },
        ]}
      />

      {/* 新增/编辑弹窗 */}
      <Modal
        title={currentRecord ? '修改空投活动' : '添加空投活动'}
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
            name="userId"
            label="用户ID"
            rules={[{ required: true, message: '请输入用户ID' }]}
          >
            <Input placeholder="请输入用户ID" />
          </Form.Item>
          <Form.Item
            name="type"
            label="活动币种"
            rules={[{ required: true, message: '请选择活动币种' }]}
          >
            <Select placeholder="请选择活动币种">
              {Object.keys(activityTypeMap).map(key => (
                <Option key={key} value={key}>
                  {activityTypeMap[key].label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="totleAmount"
            label="金额任务"
            rules={[
              { required: true, message: '请输入金额任务' },
              { pattern: /^\d+(\.\d+)?$/, message: '请输入有效的数字' },
            ]}
          >
            <Input type="number" placeholder="请输入需要金额" />
          </Form.Item>
          <Form.Item
            name="amount"
            label="奖励金额"
            rules={[
              { required: true, message: '请输入奖励金额' },
              { pattern: /^\d+(\.\d+)?$/, message: '请输入有效的数字' },
            ]}
          >
            <Input type="number" placeholder="请输入奖励金额" />
          </Form.Item>
          <Form.Item
            name="endTime"
            label="结束时间"
            rules={[{ required: true, message: '请选择结束时间' }]}
          >
            <DatePicker style={{ width: '100%' }} placeholder="请选择结束时间" />
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

export default DefiActivityPage;
