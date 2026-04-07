import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Switch, message, Space, Popconfirm } from 'antd';
import { getSettingConfig, saveSettingConfigWithBio } from '@api';

/**
 * S10Trade - 玩法配置组件
 */
const S10Trade = () => {
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
      const res = await getSettingConfig('PLAYING_SETTING');
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
    form.setFieldsValue({ ...item, sort: Number(item.sort) });
    setTitle('修改玩法配置');
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
        const res = await saveSettingConfigWithBio('PLAYING_SETTING', newData);
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
    { title: '名称', dataIndex: 'name', align: 'center' },
    { title: '排序', dataIndex: 'sort', align: 'center' },
    {
      title: '状态',
      dataIndex: 'isOpen',
      align: 'center',
      render: (isOpen) => (
        <span style={{ color: isOpen ? 'green' : 'gray' }}>
          {isOpen ? '开启' : '关闭'}
        </span>
      )
    },
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
          <Form.Item label="名称" name="name" rules={[{ required: true, message: '名称不能为空' }]}>
            <Input disabled />
          </Form.Item>
          <Form.Item label="排序" name="sort" rules={[{ required: true, message: '排序不能为空' }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item label="状态" name="isOpen" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default S10Trade;
