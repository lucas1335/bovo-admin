import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Space, Popconfirm } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { getSettingConfig, saveSettingConfigWithBio } from '@api';

const { Option } = Select;

/**
 * S19Other - 其他设置组件
 */
const S19Other = () => {
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
      const res = await getSettingConfig('OTHER_SETTING');
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
    setTitle('新增');
    setOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    form.setFieldsValue(item);
    setTitle('修改');
    setOpen(true);
  };

  const handleDelete = async (item) => {
    try {
      const newData = dataList.filter(i => i.keyStr !== item.keyStr);
      const res = await saveSettingConfigWithBio('OTHER_SETTING', newData);
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
      values.isOpen = values.isOpen ?? false;

      if (editingItem) {
        // 修改
        const newData = dataList.map(item =>
          item.keyStr === editingItem.keyStr ? values : item
        );
        const res = await saveSettingConfigWithBio('OTHER_SETTING', newData);
        if (res.code === 200) {
          message.success('修改成功');
          setOpen(false);
          getList();
        } else {
          message.error(res.msg || '修改失败');
        }
      } else {
        // 新增 - 检查键是否重复
        const exists = dataList.some(item => item.keyStr === values.keyStr);
        if (exists) {
          message.error('已存在重复键');
          return;
        }
        const newData = [...dataList, values];
        const res = await saveSettingConfigWithBio('OTHER_SETTING', newData);
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
    { title: '键', dataIndex: 'keyStr', align: 'center' },
    {
      title: '值',
      dataIndex: 'isOpen',
      align: 'center',
      render: (isOpen) => isOpen ? '是' : '否'
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
          <Form.Item label="键" name="keyStr" rules={[{ required: true, message: '键不能为空' }]}>
            <Input disabled={!!editingItem} />
          </Form.Item>
          <Form.Item label="值" name="isOpen" rules={[{ required: true, message: '值不能为空' }]}>
            <Select>
              <Option value={true}>是</Option>
              <Option value={false}>否</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default S19Other;
