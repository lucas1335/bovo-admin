import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Switch, message, Space, Popconfirm } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { getSettingConfig, saveSettingConfigWithBio } from '@api';

/**
 * S12Coin - 首页币种设置组件
 */
const S12Coin = () => {
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
      const res = await getSettingConfig('HOME_COIN_SETTING');
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
    setTitle('新增币种');
    setOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    form.setFieldsValue({ ...item, sort: Number(item.sort) });
    setTitle('修改币种');
    setOpen(true);
  };

  const handleDelete = async (item) => {
    try {
      const newData = dataList.filter(i => i.coin !== item.coin);
      const res = await saveSettingConfigWithBio('HOME_COIN_SETTING', newData);
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
      values.isOpen = values.isOpen || 'false';

      if (editingItem) {
        // 修改
        const newData = dataList.map(item =>
          item.coin === editingItem.coin ? values : item
        );
        const res = await saveSettingConfigWithBio('HOME_COIN_SETTING', newData);
        if (res.code === 200) {
          message.success('修改成功');
          setOpen(false);
          getList();
        } else {
          message.error(res.msg || '修改失败');
        }
      } else {
        // 新增 - 检查币种是否重复
        const exists = dataList.some(item => item.coin === values.coin);
        if (exists) {
          message.error('已存在重复币种');
          return;
        }
        const newData = [...dataList, values];
        const res = await saveSettingConfigWithBio('HOME_COIN_SETTING', newData);
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
    { title: '币种', dataIndex: 'coin', align: 'center' },
    { title: '排序', dataIndex: 'sort', align: 'center' },
    {
      title: '状态',
      dataIndex: 'isOpen',
      align: 'center',
      render: (isOpen) => (
        <span style={{ color: isOpen === 'true' ? 'green' : 'gray' }}>
          {isOpen === 'true' ? '开启' : '关闭'}
        </span>
      )
    },
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
        rowKey="coin"
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
          <Form.Item label="币种" name="coin" rules={[{ required: true, message: '币种不能为空' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="排序" name="sort" rules={[{ required: true, message: '排序不能为空' }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item label="状态" name="isOpen" valuePropName="checked">
            <Switch checkedChildren="开启" unCheckedChildren="关闭" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default S12Coin;
