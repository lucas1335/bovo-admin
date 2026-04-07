import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Form,
  Input,
  Button,
  Switch,
  Select,
  InputNumber,
  message,
  Space,
  Typography,
  Divider,
  Alert
} from 'antd';
import {
  SettingOutlined,
  SaveOutlined,
  ReloadOutlined,
  DatabaseOutlined,
  SecurityScanOutlined,
  NotificationOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const SystemManagement = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSave = async (values) => {
    setLoading(true);
    try {
      // 模拟保存操作
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('系统设置保存成功！');
    } catch (error) {
      message.error('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    form.resetFields();
    message.info('设置已重置');
  };

  return (
    <div style={{ textAlign: 'left' }}>
      {/* <Title level={2} style={{ marginBottom: 24 }}>系统管理</Title>
      
      <Alert
        message="系统设置"
        description="请谨慎修改系统设置，某些设置可能会影响系统运行。"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      /> */}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        initialValues={{
          siteName: '后台管理系统',
          siteDescription: '基于React和Ant Design的后台管理系统',
          maintenanceMode: false,
          userRegistration: true,
          emailNotification: true,
          sessionTimeout: 30,
          maxLoginAttempts: 5,
          passwordMinLength: 8,
          logLevel: 'info',
          backupFrequency: 'daily',
          smtpServer: 'smtp.example.com',
          smtpPort: 587,
          smtpUsername: 'admin@example.com',
          systemNotice: '系统维护通知：系统将于每周日凌晨2:00-4:00进行维护，期间可能影响正常使用。'
        }}
      >
        <Row gutter={[24, 24]}>
          {/* 基本设置 */}
          <Col xs={24} lg={12}>
            <Card title="基本设置" icon={<SettingOutlined />}>
              <Form.Item
                name="siteName"
                label="网站名称"
                rules={[{ required: true, message: '请输入网站名称' }]}
              >
                <Input placeholder="请输入网站名称" />
              </Form.Item>

              <Form.Item
                name="siteDescription"
                label="网站描述"
              >
                <TextArea rows={3} placeholder="请输入网站描述" />
              </Form.Item>

              <Form.Item
                name="maintenanceMode"
                label="维护模式"
                valuePropName="checked"
                getValueProps={(value) => ({ checked: value === 1 })}
                getValueFromEvent={(checked) => (checked ? 1 : 0)}
              >
                <Switch />
              </Form.Item>

              <Form.Item
                name="userRegistration"
                label="允许用户注册"
                valuePropName="checked"
                getValueProps={(value) => ({ checked: value === 1 })}
                getValueFromEvent={(checked) => (checked ? 1 : 0)}
              >
                <Switch />
              </Form.Item>
            </Card>
          </Col>

          {/* 安全设置 */}
          <Col xs={24} lg={12}>
            <Card title="安全设置" icon={<SecurityScanOutlined />}>
              <Form.Item
                name="sessionTimeout"
                label="会话超时时间（分钟）"
                rules={[{ required: true, message: '请输入会话超时时间' }]}
              >
                <InputNumber min={5} max={1440} style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                name="maxLoginAttempts"
                label="最大登录尝试次数"
                rules={[{ required: true, message: '请输入最大登录尝试次数' }]}
              >
                <InputNumber min={1} max={10} style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                name="passwordMinLength"
                label="密码最小长度"
                rules={[{ required: true, message: '请输入密码最小长度' }]}
              >
                <InputNumber min={6} max={20} style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                name="logLevel"
                label="日志级别"
                rules={[{ required: true, message: '请选择日志级别' }]}
              >
                <Select>
                  <Option value="debug">Debug</Option>
                  <Option value="info">Info</Option>
                  <Option value="warn">Warning</Option>
                  <Option value="error">Error</Option>
                </Select>
              </Form.Item>
            </Card>
          </Col>

          {/* 邮件设置 */}
          <Col xs={24} lg={12}>
            <Card title="邮件设置" icon={<NotificationOutlined />}>
              <Form.Item
                name="emailNotification"
                label="启用邮件通知"
                valuePropName="checked"
                getValueProps={(value) => ({ checked: value === 1 })}
                getValueFromEvent={(checked) => (checked ? 1 : 0)}
              >
                <Switch />
              </Form.Item>

              <Form.Item
                name="smtpServer"
                label="SMTP服务器"
                rules={[{ required: true, message: '请输入SMTP服务器地址' }]}
              >
                <Input placeholder="smtp.example.com" />
              </Form.Item>

              <Form.Item
                name="smtpPort"
                label="SMTP端口"
                rules={[{ required: true, message: '请输入SMTP端口' }]}
              >
                <InputNumber min={1} max={65535} style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                name="smtpUsername"
                label="SMTP用户名"
                rules={[{ required: true, message: '请输入SMTP用户名' }]}
              >
                <Input placeholder="admin@example.com" />
              </Form.Item>

              <Form.Item
                name="smtpPassword"
                label="SMTP密码"
                rules={[{ required: true, message: '请输入SMTP密码' }]}
              >
                <Input.Password placeholder="请输入SMTP密码" />
              </Form.Item>
            </Card>
          </Col>

          {/* 数据设置 */}
          <Col xs={24} lg={12}>
            <Card title="数据设置" icon={<DatabaseOutlined />}>
              <Form.Item
                name="backupFrequency"
                label="备份频率"
                rules={[{ required: true, message: '请选择备份频率' }]}
              >
                <Select>
                  <Option value="hourly">每小时</Option>
                  <Option value="daily">每天</Option>
                  <Option value="weekly">每周</Option>
                  <Option value="monthly">每月</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="dataRetention"
                label="数据保留天数"
                rules={[{ required: true, message: '请输入数据保留天数' }]}
              >
                <InputNumber min={1} max={3650} style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                name="maxFileSize"
                label="最大文件上传大小（MB）"
                rules={[{ required: true, message: '请输入最大文件上传大小' }]}
              >
                <InputNumber min={1} max={100} style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                name="allowedFileTypes"
                label="允许的文件类型"
                rules={[{ required: true, message: '请输入允许的文件类型' }]}
              >
                <Select mode="tags" placeholder="请输入文件类型，如：jpg,png,pdf">
                  <Option value="jpg">JPG</Option>
                  <Option value="png">PNG</Option>
                  <Option value="pdf">PDF</Option>
                  <Option value="doc">DOC</Option>
                  <Option value="xls">XLS</Option>
                </Select>
              </Form.Item>
            </Card>
          </Col>

          {/* 系统通知 */}
          <Col xs={24}>
            <Card title="系统通知">
              <Form.Item
                name="systemNotice"
                label="系统公告"
              >
                <TextArea rows={4} placeholder="请输入系统公告内容" />
              </Form.Item>
            </Card>
          </Col>
        </Row>

        <Divider />

        <div style={{ textAlign: 'center' }}>
          <Space size="large">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SaveOutlined />}
              size="large"
            >
              保存设置
            </Button>
            <Button
              onClick={handleReset}
              icon={<ReloadOutlined />}
              size="large"
            >
              重置设置
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );
};

export default SystemManagement; 