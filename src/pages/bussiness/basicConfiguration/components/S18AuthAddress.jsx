import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message } from 'antd';
import { getSettingConfig, saveSettingConfigWithBio } from '@api';

/**
 * S18AuthAddress - 授权地址设置组件
 */
const S18AuthAddress = () => {
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
      const res = await getSettingConfig('AUTH_ADDRESS_SETTING');
      if (res.code === 200) {
        setDataList(res.data || []);
      }
    } catch (e) {
      console.error('请求失败', e);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    form.setFieldsValue(item);
    setTitle('修改');
    setOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingItem) {
        // 修改
        const newData = dataList.map(item =>
          item.name === editingItem.name ? values : item
        );
        const res = await saveSettingConfigWithBio('AUTH_ADDRESS_SETTING', newData);
        if (res.code === 200) {
          message.success('修改成功');
          setOpen(false);
          getList();
        } else {
          message.error(res.msg || '修改失败');
        }
      }
    } catch (e) {
      console.error('保存失败', e);
    }
  };

  const columns = [
    { title: '网络', dataIndex: 'name', align: 'center' },
    { title: '授权地址', dataIndex: 'authAddress', align: 'center' },
    {
      title: '操作',
      align: 'center',
      width: 150,
      render: (_, record) => (
        <Button type="primary" size="small" onClick={() => handleEdit(record)}>修改</Button>
      )
    }
  ];

  return (
    <div>
      <Table
        rowKey="name"
        columns={columns}
        dataSource={dataList}
        loading={loading}
        scroll={{ y: 'calc(100vh - 360px)' }}
        bordered
      />
      <Modal
        title={title}
        open={open}
        onOk={handleSubmit}
        onCancel={() => setOpen(false)}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="网络" name="name" rules={[{ required: true, message: '网络不能为空' }]}>
            <Input disabled />
          </Form.Item>
          <Form.Item label="授权地址" name="authAddress" rules={[{ required: true, message: '授权地址不能为空' }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default S18AuthAddress;
