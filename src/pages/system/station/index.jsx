/**
 * 站内信管理页面
 *
 * 功能：
 * 1. 站内信列表管理
 * 2. 支持发送普通消息和全站消息
 * 3. 查看消息读取状态
 *
 * @author System
 * @date 2026-04-02
 */

import React, { useState } from 'react';
import { message, Form, Input, Select, Button, Tag, Popconfirm, Drawer, Descriptions } from 'antd';
import CmBasePage from '@components/CmBasePage';
import DataForm from '@components/DataForm';
import CmEditor from '@components/CmEditor';
import {
  getMailList,
  saveMail,
  deleteMail
} from '@api';

const { Option } = Select;

// 消息类型选项
const MESSAGE_TYPE_OPTIONS = [
  { label: '普通消息', value: '1' },
  { label: '全站消息', value: '2' }
];

/** 站内信管理页面 */
const StationMailPage = () => {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [messageType, setMessageType] = useState('1');

  /**
   * 打开新增弹窗
   */
  const handleAdd = () => {
    form.resetFields();
    setMessageType('1');
    setModalVisible(true);
  };

  /**
   * 查看详情
   */
  const handleView = async (record) => {
    try {
      const response = await getMailList({ id: record.id });
      if (response.code === 200 && response.rows && response.rows.length > 0) {
        setCurrentRecord(response.rows[0]);
        setDrawerVisible(true);
      } else {
        // 如果接口没有返回详情，直接使用当前记录
        setCurrentRecord(record);
        setDrawerVisible(true);
      }
    } catch (error) {
      // 如果获取详情失败，直接使用当前记录
      setCurrentRecord(record);
      setDrawerVisible(true);
    }
  };

  /**
   * 删除
   */
  const handleDelete = async (record) => {
    try {
      const response = await deleteMail(record.id);
      if (response.code === 200) {
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
    setSubmitting(true);
    try {
      const response = await saveMail({
        userIds: values.userId,
        title: values.title,
        content: values.content,
        type: values.type,
      });

      if (response.code === 200) {
        message.success('新增成功');
        setModalVisible(false);
        refreshTable();
      } else {
        message.error(response.msg || '操作失败');
      }
    } catch (error) {
      if (error.errorFields) {
        return;
      }
      message.error('操作失败: ' + error.message);
    } finally {
      setSubmitting(false);
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
   * 消息类型变化
   */
  const handleTypeChange = (value) => {
    setMessageType(value);
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
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: 200,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => {
        const typeMap = {
          '1': { color: 'warning', text: '普通消息' },
          '2': { color: 'processing', text: '全站消息' },
        };
        const t = typeMap[type] || { color: 'default', text: '未知' };
        return <Tag color={t.color}>{t.text}</Tag>;
      },
    },
    {
      title: '读取状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        return status === 0 ?
          <Tag color="error">未读</Tag> :
          <Tag color="default">已读</Tag>;
      },
    },
    {
      title: '操作人',
      dataIndex: 'opertorId',
      key: 'opertorId',
      width: 120,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            type="link"
            size="small"
            onClick={() => handleView(record)}
          >
            查看
          </Button>
          <Popconfirm
            title="删除确认"
            description="确定要删除选中的站内信吗？"
            onConfirm={() => handleDelete(record)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  // 搜索字段配置
  const searchFieldList = [
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'SEARCH_EQ_userId',
      type: 'text',
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'SEARCH_LIKE_title',
      type: 'text',
    },
    {
      title: '操作人',
      dataIndex: 'opertorId',
      key: 'SEARCH_EQ_opertorId',
      type: 'text',
    },
  ];

  return (
    <div>
      <CmBasePage
        columns={columns}
        apiEndpoint="/system/appMail/list"
        apiMethod="get"
        searchFieldList={searchFieldList}
        onAdd={handleAdd}
        onView={handleView}
        rowKey="id"
        actionButtons={{
          view: false,
          edit: false,
          delete: false,
        }}
      />

      <DataForm
        visible={modalVisible}
        title="添加站内信"
        initialValues={{ type: '1' }}
        onCancel={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        onClosed={() => form.resetFields()}
        loading={submitting}
        formType="modal"
        width={600}
      >
        <Form.Item
          label="类型"
          name="type"
          rules={[{ required: true, message: '类型不能为空' }]}
        >
          <Select onChange={handleTypeChange}>
            {MESSAGE_TYPE_OPTIONS.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
        {messageType !== '2' && (
          <Form.Item
            label="用户ID"
            name="userId"
            rules={[{ required: true, message: '用户ID不能为空' }]}
          >
            <Input placeholder="请输入用户ID" />
          </Form.Item>
        )}
        <Form.Item
          label="标题"
          name="title"
          rules={[{ required: true, message: '标题不能为空' }]}
        >
          <Input placeholder="请输入标题" />
        </Form.Item>
        <Form.Item
          label="内容"
          name="content"
        >
          <CmEditor height={300} />
        </Form.Item>
      </DataForm>

      {/* 详情抽屉 */}
      <Drawer
        title="站内信详情"
        placement="right"
        width={800}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {currentRecord && (
          <div style={{ padding: '16px' }}>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="用户ID">
                {currentRecord.userId || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="标题">
                {currentRecord.title || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="类型">
                {currentRecord.type === '1' ? '普通消息' : currentRecord.type === '2' ? '全站消息' : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="读取状态">
                {currentRecord.status === 0 ? '未读' : '已读'}
              </Descriptions.Item>
              <Descriptions.Item label="操作人">
                {currentRecord.opertorId || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {currentRecord.createTime || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="内容" span={1}>
                <div
                  style={{
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px',
                    padding: '12px',
                    background: '#fafafa',
                    minHeight: '200px',
                  }}
                  dangerouslySetInnerHTML={{ __html: currentRecord.content || '' }}
                />
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default StationMailPage;
