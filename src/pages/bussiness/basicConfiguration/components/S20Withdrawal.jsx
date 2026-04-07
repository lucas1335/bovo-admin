import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { getSettingConfig, saveSettingConfigWithBio } from '@api';

/**
 * S20Withdrawal - 提现配置组件
 */
const S20Withdrawal = () => {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [form] = Form.useForm();
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    getList();
  }, []);

  const getList = async () => {
    setLoading(true);
    try {
      const res = await getSettingConfig('WITHDRAWAL_CHANNEL_SETTING');
      if (res.code === 200) {
        setDataList(res.data || []);
      }
    } catch (e) {
      console.error('请求失败', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setTitle('新增提现配置');
    setOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    form.setFieldsValue(item);
    setTitle('修改提现配置');
    setOpen(true);
  };

  const handleDelete = async (item) => {
    try {
      const newData = dataList.filter(i => i.rechargeName !== item.rechargeName);
      const res = await saveSettingConfigWithBio('WITHDRAWAL_CHANNEL_SETTING', newData);
      if (res.code === 200) {
        message.success('删除成功');
        getList();
      } else {
        message.error(res.msg || '删除失败');
      }
    } catch (e) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingItem) {
        // 修改
        const newData = dataList.map(item =>
          item.rechargeName === editingItem.rechargeName ? values : item
        );
        const res = await saveSettingConfigWithBio('WITHDRAWAL_CHANNEL_SETTING', newData);
        if (res.code === 200) {
          message.success('修改成功');
          setOpen(false);
          getList();
        } else {
          message.error(res.msg || '修改失败');
        }
      } else {
        // 新增 - 检查币种是否重复
        const exists = dataList.some(item => item.rechargeName === values.rechargeName);
        if (exists) {
          message.error('已存在重复币种');
          return;
        }
        const newData = [...dataList, values];
        const res = await saveSettingConfigWithBio('WITHDRAWAL_CHANNEL_SETTING', newData);
        if (res.code === 200) {
          message.success('新增成功');
          setOpen(false);
          getList();
        } else {
          message.error(res.msg || '新增失败');
        }
      }
    } catch (e) {
      console.error('保存失败', e);
    }
  };

  const columns = [
    { title: '序号', dataIndex: 'index', align: 'center', render: (_, __, index) => index + 1 },
    { title: '币种', dataIndex: 'rechargeName', align: 'center' },
    { title: '固定手续费', dataIndex: 'fee', align: 'center' },
    { title: '手续费比例', dataIndex: 'ratio', align: 'center' },
    { title: '最小数量', dataIndex: 'withdrawalMix', align: 'center' },
    { title: '最大数量', dataIndex: 'withdrawalMax', align: 'center' },
    {
      title: '操作',
      align: 'center',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button type="primary" size="small" onClick={() => handleEdit(record)}>修改</Button>
          <Popconfirm
            title="确认删除?"
            onConfirm={() => handleDelete(record)}
            okText="确定"
            cancelText="取消"
          >
            <Button danger size="small">删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增</Button>
      </div>
      <Table
        columns={columns}
        dataSource={dataList}
        loading={loading}
        scroll={{ y: 'calc(100vh - 360px)' }}
        bordered
        pagination={false}
      />
      <Modal
        title={title}
        open={open}
        onOk={handleSubmit}
        onCancel={() => setOpen(false)}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="币种" name="rechargeName" rules={[{ required: true, message: '币种不能为空' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="固定手续费" name="fee" rules={[{ required: true, message: '固定手续费不能为空' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="手续费比例" name="ratio" rules={[{ required: true, message: '手续费比例不能为空' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="最小数量" name="withdrawalMix" rules={[{ required: true, message: '最小数量不能为空' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="最大数量" name="withdrawalMax" rules={[{ required: true, message: '最大数量不能为空' }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default S20Withdrawal;
