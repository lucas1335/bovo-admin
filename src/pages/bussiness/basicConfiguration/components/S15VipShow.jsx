import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, message, Select, Popconfirm, Input } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { getSettingConfig, saveSettingConfigWithBio } from '@api';

const { Option } = Select;
const { TextArea } = Input;

const languageOptions = [
  { label: '中文', value: 'zh' },
  { label: 'English', value: 'en' },
  { label: '日本語', value: 'ja' },
  { label: '한국어', value: 'ko' },
];

/**
 * S15VipShow - VIP说明组件
 */
const S15VipShow = () => {
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
      const res = await getSettingConfig('VIP_DIRECTIONS_SETTING');
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
    setTitle('新增VIP说明');
    setOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    form.setFieldsValue(item);
    setTitle('修改VIP说明');
    setOpen(true);
  };

  const handleDelete = async (item) => {
    try {
      const newData = dataList.filter(i => i.lang !== item.lang);
      const res = await saveSettingConfigWithBio('VIP_DIRECTIONS_SETTING', newData);
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
          item.lang === editingItem.lang ? values : item
        );
        const res = await saveSettingConfigWithBio('VIP_DIRECTIONS_SETTING', newData);
        if (res.code === 200) {
          message.success('修改成功');
          setOpen(false);
          getList();
        } else {
          message.error(res.msg || '修改失败');
        }
      } else {
        // 新增 - 检查语言是否重复
        const exists = dataList.some(item => item.lang === values.lang);
        if (exists) {
          message.error('已存在重复语言');
          return;
        }
        const newData = [...dataList, values];
        const res = await saveSettingConfigWithBio('VIP_DIRECTIONS_SETTING', newData);
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
    {
      title: '语言',
      dataIndex: 'lang',
      align: 'center',
      width: 120,
      render: (lang) => {
        const opt = languageOptions.find(o => o.value === lang);
        return opt ? opt.label : lang;
      }
    },
    {
      title: '内容',
      dataIndex: 'info',
      align: 'center',
      render: (info) => (
        <div style={{
          width: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical'
        }}>
          {info}
        </div>
      )
    },
    {
      title: '操作',
      align: 'center',
      width: 120,
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
        rowKey="lang"
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
          <Form.Item label="语言" name="lang" rules={[{ required: true, message: '请选择语言' }]}>
            <Select>
              {languageOptions.map(opt => (
                <Option key={opt.value} value={opt.value}>{opt.label}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="内容" name="info" rules={[{ required: true, message: '内容不能为空' }]}>
            <TextArea rows={6} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default S15VipShow;
