import React, { useState } from 'react';
import { Card, Button, Space, Typography, Radio, Divider, message } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import DataForm from '@components/DataForm';

const { Title, Text } = Typography;

const FormDemo = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [formType, setFormType] = useState('modal');
  const [drawerPlacement, setDrawerPlacement] = useState('right');
  const [drawerSize, setDrawerSize] = useState('default');
  const [loading, setLoading] = useState(false);

  // 表单字段配置
  const formFields = [
    {
      type: 'input',
      name: 'name',
      label: '姓名',
      rules: [{ required: true, message: '请输入姓名' }]
    },
    {
      type: 'input',
      name: 'email',
      label: '邮箱',
      rules: [
        { required: true, message: '请输入邮箱' },
        { type: 'email', message: '请输入有效的邮箱地址' }
      ]
    },
    {
      type: 'select',
      name: 'role',
      label: '角色',
      rules: [{ required: true, message: '请选择角色' }],
      options: [
        { label: '管理员', value: 'admin' },
        { label: '编辑', value: 'editor' },
        { label: '用户', value: 'user' }
      ]
    },
    {
      type: 'textarea',
      name: 'description',
      label: '描述',
      rules: [{ max: 200, message: '描述不能超过200个字符' }]
    },
    {
      type: 'switch',
      name: 'active',
      label: '是否激活'
    }
  ];

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('提交成功！');
      console.log('表单数据:', values);
      
      // 关闭表单
      if (formType === 'modal') {
        setModalVisible(false);
      } else {
        setDrawerVisible(false);
      }
    } catch (error) {
      message.error('提交失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (formType === 'modal') {
      setModalVisible(false);
    } else {
      setDrawerVisible(false);
    }
  };

  const openForm = (type) => {
    setFormType(type);
    if (type === 'modal') {
      setModalVisible(true);
    } else {
      setDrawerVisible(true);
    }
  };

  return (
    <div style={{ textAlign: 'left' }}>
      <Title level={2}>表单组件演示</Title>
      
      <Card title="弹出层形式" style={{ marginBottom: 24 }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Text strong>默认弹出层：</Text>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => openForm('modal')}
              style={{ marginLeft: 16 }}
            >
              打开弹出层表单
            </Button>
          </div>
          
          <div>
            <Text strong>抽屉形式：</Text>
            <Space>
              <Radio.Group 
                value={drawerPlacement} 
                onChange={(e) => setDrawerPlacement(e.target.value)}
              >
                <Radio.Button value="left">左侧</Radio.Button>
                <Radio.Button value="right">右侧</Radio.Button>
                <Radio.Button value="top">顶部</Radio.Button>
                <Radio.Button value="bottom">底部</Radio.Button>
              </Radio.Group>
              
              <Radio.Group 
                value={drawerSize} 
                onChange={(e) => setDrawerSize(e.target.value)}
              >
                <Radio.Button value="default">默认大小</Radio.Button>
                <Radio.Button value="large">大尺寸</Radio.Button>
              </Radio.Group>
              
              <Button 
                type="primary" 
                icon={<EditOutlined />}
                onClick={() => openForm('drawer')}
              >
                打开抽屉表单
              </Button>
            </Space>
          </div>
        </Space>
      </Card>

      <Card title="使用说明">
        <Space direction="vertical" size="middle">
          <div>
            <Text strong>弹出层形式 (formType="modal")：</Text>
            <ul>
              <li>适合简单的表单操作</li>
              <li>占用空间较小</li>
              <li>适合快速编辑</li>
            </ul>
          </div>
          
          <div>
            <Text strong>抽屉形式 (formType="drawer")：</Text>
            <ul>
              <li>适合复杂的表单操作</li>
              <li>提供更大的操作空间</li>
              <li>支持多种位置和尺寸</li>
              <li>适合详细编辑</li>
            </ul>
          </div>
          
          <div>
            <Text strong>配置参数：</Text>
            <ul>
              <li><code>formType</code>: 'modal' | 'drawer' - 表单类型</li>
              <li><code>drawerPlacement</code>: 'left' | 'right' | 'top' | 'bottom' - 抽屉位置</li>
              <li><code>drawerSize</code>: 'default' | 'large' - 抽屉尺寸</li>
              <li><code>width</code>: 弹出层宽度（仅弹出层有效）</li>
            </ul>
          </div>
        </Space>
      </Card>

      {/* 弹出层表单 */}
      <DataForm
        visible={modalVisible}
        title="弹出层表单"
        fields={formFields}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        loading={loading}
        formType="modal"
        width={600}
      />

      {/* 抽屉表单 */}
      <DataForm
        visible={drawerVisible}
        title="抽屉表单"
        fields={formFields}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        loading={loading}
        formType="drawer"
        drawerPlacement={drawerPlacement}
        drawerSize={drawerSize}
      />
    </div>
  );
};

export default FormDemo; 