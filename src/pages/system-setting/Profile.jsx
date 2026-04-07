import React, { useState } from 'react';
import { Card, Row, Col, Avatar, Form, Input, Button, message, Space, Typography, Descriptions, Tag } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, EditOutlined, SaveOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '@contexts/AuthContext';

const { Title, Text } = Typography;

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [passwordForm] = Form.useForm();
  const [profileForm] = Form.useForm();

  const handleProfileUpdate = async (values) => {
    try {
      updateProfile(values);
      message.success('个人信息更新成功！');
      setEditing(false);
    } catch (error) {
      message.error('更新失败，请重试');
    }
  };

  const handlePasswordChange = async (values) => {
    try {
      message.success('密码修改成功！');
      passwordForm.resetFields();
    } catch (error) {
      message.error('密码修改失败，请重试');
    }
  };

  return (
    <div style={{ textAlign: 'left' }}>
      {/* <Title level={2} style={{ marginBottom: 24 }}>个人中心</Title> */}
      
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card
            title="个人信息"
            extra={
              <Button
                type={editing ? "primary" : "default"}
                icon={editing ? <SaveOutlined /> : <EditOutlined />}
                onClick={() => setEditing(!editing)}
              >
                {editing ? '保存' : '编辑'}
              </Button>
            }
          >
            <Row gutter={[24, 24]}>
              <Col xs={24} md={8}>
                <div style={{ textAlign: 'center' }}>
                  <Avatar
                    size={120}
                    src={user?.avatar}
                    icon={<UserOutlined />}
                    style={{ border: '2px solid #f0f0f0' }}
                  />
                  <div style={{ marginTop: 16 }}>
                    <Text strong>{user?.name}</Text>
                    <br />
                    <Text type="secondary">{user?.role === 'admin' ? '管理员' : '普通用户'}</Text>
                  </div>
                </div>
              </Col>
              
              <Col xs={24} md={16}>
                {editing ? (
                  <Form
                    form={profileForm}
                    layout="vertical"
                    initialValues={user}
                    onFinish={handleProfileUpdate}
                  >
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="name"
                          label="姓名"
                          rules={[{ required: true, message: '请输入姓名' }]}
                        >
                          <Input prefix={<UserOutlined />} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="username"
                          label="用户名"
                          rules={[{ required: true, message: '请输入用户名' }]}
                        >
                          <Input prefix={<UserOutlined />} disabled />
                        </Form.Item>
                      </Col>
                    </Row>
                    
                    <Form.Item
                      name="email"
                      label="邮箱"
                      rules={[
                        { required: true, message: '请输入邮箱' },
                        { type: 'email', message: '请输入有效的邮箱地址' }
                      ]}
                    >
                      <Input prefix={<MailOutlined />} />
                    </Form.Item>
                    
                    <Form.Item
                      name="phone"
                      label="手机号"
                      rules={[{ required: true, message: '请输入手机号' }]}
                    >
                      <Input prefix={<PhoneOutlined />} />
                    </Form.Item>
                    
                    <Form.Item>
                      <Space>
                        <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                          保存
                        </Button>
                        <Button onClick={() => setEditing(false)}>
                          取消
                        </Button>
                      </Space>
                    </Form.Item>
                  </Form>
                ) : (
                  <Descriptions column={1}>
                    <Descriptions.Item label="姓名">{user?.name}</Descriptions.Item>
                    <Descriptions.Item label="用户名">{user?.username}</Descriptions.Item>
                    <Descriptions.Item label="邮箱">{user?.email}</Descriptions.Item>
                    <Descriptions.Item label="角色">
                      <Tag color={user?.role === 'admin' ? 'red' : 'blue'}>
                        {user?.role === 'admin' ? '管理员' : '普通用户'}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="注册时间">2024-01-01</Descriptions.Item>
                    <Descriptions.Item label="最后登录">2024-01-15 10:30:00</Descriptions.Item>
                  </Descriptions>
                )}
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="修改密码" icon={<LockOutlined />}>
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handlePasswordChange}
            >
              <Form.Item
                name="oldPassword"
                label="当前密码"
                rules={[{ required: true, message: '请输入当前密码' }]}
              >
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>
              
              <Form.Item
                name="newPassword"
                label="新密码"
                rules={[
                  { required: true, message: '请输入新密码' },
                  { min: 6, message: '密码长度至少6位' }
                ]}
              >
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>
              
              <Form.Item
                name="confirmPassword"
                label="确认新密码"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: '请确认新密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('两次输入的密码不一致'));
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" htmlType="submit" block icon={<LockOutlined />}>
                  修改密码
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Profile; 