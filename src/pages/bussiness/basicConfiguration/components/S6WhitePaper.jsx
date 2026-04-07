import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Switch, message, Select, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { getSettingConfig, saveSettingConfigWithBio } from '@api';

const { Option } = Select;

const languageOptions = [
  { label: '中文', value: 'zh' },
  { label: 'English', value: 'en' },
  { label: '日本語', value: 'ja' },
  { label: '한국어', value: 'ko' },
];

/**
 * S6WhitePaper - 白皮书配置组件
 */
const S6WhitePaper = () => {
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
      const res = await getSettingConfig('WHITE_PAPER_SETTING');
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
    setTitle('添加白皮书');
    setOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    form.setFieldsValue(item);
    setTitle('修改白皮书');
    setOpen(true);
  };

  const handleDelete = async (item) => {
    try {
      const newData = dataList.filter(i => i.name !== item.name);
      const res = await saveSettingConfigWithBio('WHITE_PAPER_SETTING', newData);
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
          item.name === editingItem.name ? values : item
        );
        const res = await saveSettingConfigWithBio('WHITE_PAPER_SETTING', newData);
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
        const res = await saveSettingConfigWithBio('WHITE_PAPER_SETTING', newData);
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
    { title: '文件地址', dataIndex: 'imgUrl', align: 'center', ellipsis: true },
    {
      title: '语言',
      dataIndex: 'languageId',
      align: 'center',
      render: (lang) => {
        const opt = languageOptions.find(o => o.value === lang);
        return opt ? opt.label : lang;
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      align: 'center',
      render: (status) => (
        <span style={{ color: status === '0' ? 'green' : 'gray' }}>
          {status === '0' ? '开启' : '关闭'}
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
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增</Button>
      </div>
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
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="名称" name="name" rules={[{ required: true, message: '名称不能为空' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="文件地址" name="imgUrl" rules={[{ required: true, message: '文件地址不能为空' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="语言" name="languageId" rules={[{ required: true, message: '请选择语言' }]}>
            <Select>
              {languageOptions.map(opt => (
                <Option key={opt.value} value={opt.value}>{opt.label}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="状态" name="status" valuePropName="checked">
            <Switch checkedChildren="开" unCheckedChildren="关" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default S6WhitePaper;
