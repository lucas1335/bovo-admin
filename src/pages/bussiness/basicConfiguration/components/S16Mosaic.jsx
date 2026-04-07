import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Switch, message, Space, Popconfirm } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { getSettingConfig, saveSettingConfigWithBio } from '@api';

/**
 * S16Mosaic - 打码配置组件
 */
const S16Mosaic = () => {
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
      const res = await getSettingConfig('ADD_MOSAIC_SETTING');
      if (res.code === 200) {
        let data = res.data;
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch (e) {
            console.error('JSON解析失败:', e);
            data = [];
          }
        }
        setDataList(data || []);
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
    setTitle('添加打码配置');
    setOpen(true);
  };

  const handleEdit = (item, index) => {
    setEditingItem({ ...item, index });
    form.setFieldsValue(item);
    setTitle('修改打码配置');
    setOpen(true);
  };

  const handleDelete = async (index) => {
    try {
      const newData = [...dataList];
      newData.splice(index, 1);
      const res = await saveSettingConfigWithBio('ADD_MOSAIC_SETTING', JSON.stringify(newData));
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

      if (editingItem && editingItem.index !== undefined) {
        // 修改
        const newData = [...dataList];
        newData[editingItem.index] = values;
        const res = await saveSettingConfigWithBio('ADD_MOSAIC_SETTING', JSON.stringify(newData));
        if (res.code === 200) {
          message.success('修改成功');
          setOpen(false);
          getList();
        } else {
          message.error(res.msg || '修改失败');
        }
      } else {
        // 新增
        const newData = [...dataList, values];
        const res = await saveSettingConfigWithBio('ADD_MOSAIC_SETTING', JSON.stringify(newData));
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
    { title: '名称', dataIndex: 'name', align: 'center' },
    { title: '值', dataIndex: 'value', align: 'center' },
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
      render: (_, record, index) => (
        <Space size="small">
          <Button type="primary" size="small" onClick={() => handleEdit(record, index)}>修改</Button>
          <Popconfirm
            title="确认删除?"
            onConfirm={() => handleDelete(index)}
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
          <Form.Item label="名称" name="name" rules={[{ required: true, message: '名称不能为空' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="值" name="value" rules={[{ required: true, message: '值不能为空' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="状态" name="isOpen" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default S16Mosaic;
