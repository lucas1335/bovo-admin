import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Switch, message, Image, Space, Popconfirm } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { getSettingConfig, saveSettingConfigWithBio } from '@api';
import CmUpload from '@components/CmUpload';

/**
 * S1Sidebar - 侧边栏配置组件
 */
const S1Sidebar = () => {
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
      const res = await getSettingConfig('APP_SIDEBAR_SETTING');
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
    setTitle('添加侧边栏');
    setOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    form.setFieldsValue(item);
    setTitle('修改侧边栏');
    setOpen(true);
  };

  const handleDelete = async (item) => {
    try {
      const deleteItem = { ...item, name: '' };
      const res = await saveSettingConfigWithBio('APP_SIDEBAR_SETTING', JSON.stringify(deleteItem));
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
          item.key === editingItem.key ? values : item
        );
        const res = await saveSettingConfigWithBio('APP_SIDEBAR_SETTING', JSON.stringify(values));
        if (res.code === 200) {
          message.success('修改成功');
          setOpen(false);
          getList();
        } else {
          message.error(res.msg || '修改失败');
        }
      } else {
        // 新增 - 检查键名是否重复
        const exists = dataList.some(item => item.key === values.key);
        if (exists) {
          message.error('已存在重复键名');
          return;
        }
        const res = await saveSettingConfigWithBio('APP_SIDEBAR_SETTING', JSON.stringify(values));
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
    { title: '名称', dataIndex: 'name', align: 'center' },
    { title: '键名', dataIndex: 'key', align: 'center' },
    {
      title: '图标',
      dataIndex: 'logoUrl',
      align: 'center',
      render: (url) => url ? <Image src={url} width={30} height={30} style={{ objectFit: 'contain' }} /> : '-'
    },
    { title: '跳转地址', dataIndex: 'jumpUrl', align: 'center' },
    {
      title: '跳转类型',
      dataIndex: 'jumpType',
      align: 'center',
      render: (type) => type === 'link' ? '超链接' : '路由跳转'
    },
    { title: '排序', dataIndex: 'sort', align: 'center' },
    {
      title: '状态',
      dataIndex: 'isOpen',
      align: 'center',
      render: (isOpen) => (
        <span style={{ color: isOpen === '1' || isOpen === true ? 'green' : 'gray' }}>
          {isOpen === '1' || isOpen === true ? '开启' : '关闭'}
        </span>
      )
    },
    {
      title: '操作',
      align: 'center',
      fixed: 'right',
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
        rowKey="key"
        columns={columns}
        dataSource={dataList}
        loading={loading}
        scroll={{ x: 'max-content', y: 'calc(100vh - 360px)' }}
        bordered
      />
      <Modal
        title={title}
        open={open}
        onOk={handleSubmit}
        onCancel={() => setOpen(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="名称" name="name" rules={[{ required: true, message: '名称不能为空' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="键名" name="key" rules={[{ required: true, message: '键名不能为空' }]}>
            <Input disabled={!!editingItem} />
          </Form.Item>
          <Form.Item label="图标" name="logoUrl" rules={[{ required: true, message: '图标不能为空' }]}>
            <CmUpload limit={1} />
          </Form.Item>
          <Form.Item label="跳转地址" name="jumpUrl" rules={[{ required: true, message: '跳转地址不能为空' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="跳转类型" name="jumpType" rules={[{ required: true, message: '跳转类型不能为空' }]}>
            <select style={{ width: '100%', height: 32, border: '1px solid #d9d9d9', borderRadius: 4 }}>
              <option value="path">路由跳转</option>
              <option value="link">超链接</option>
            </select>
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

export default S1Sidebar;
