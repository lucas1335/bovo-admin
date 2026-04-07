import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Tabs } from 'antd';
import { getSettingConfig, saveSettingConfigWithBio, Restart } from '@api';

/**
 * 第三方配置页面
 */
const SmsConfigurationPage = () => {
  const [activeTab, setActiveTab] = useState('first');
  const [messageForm] = Form.useForm();
  const [emailForm] = Form.useForm();
  const [ossForm] = Form.useForm();
  const [machineForm] = Form.useForm();
  const [ttlRateForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getMessage();
    getBot();
  }, []);

  /**
   * 切换标签
   */
  const handleTabChange = (key) => {
    setActiveTab(key);
    if (key === 'first') {
      getMessage();
    } else if (key === 'second') {
      getMail();
    } else if (key === 'third') {
      getOss();
    } else if (key === 'four') {
      getBot();
    } else if (key === 'ttlRate') {
      getTtlRate();
    }
  };

  /**
   * 获取短信配置
   */
  const getMessage = async () => {
    try {
      const res = await getSettingConfig('SMS_SETTING');
      if (res.code === 200) {
        const result = res.data || {};
        messageForm.setFieldsValue({
          name: result.name || '',
          mobileAccount: result.mobileAccount || '',
          mobilePassword: result.mobilePassword || '',
          mobileUrl: result.mobileUrl || '',
        });
      }
    } catch (e) {
      console.error('请求失败', e);
    }
  };

  /**
   * 保存短信配置
   */
  const submitMessageForm = async () => {
    try {
      const values = await messageForm.validateFields();
      setLoading(true);
      const res = await saveSettingConfigWithBio(
        'SMS_SETTING',
        JSON.stringify(values)
      );
      if (res.code === 200) {
        message.success('保存成功');
      } else {
        message.error(res.msg || '保存失败');
      }
    } catch (error) {
      console.error('保存失败', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 获取邮箱配置
   */
  const getMail = async () => {
    try {
      const res = await getSettingConfig('EMAIL_SETTING');
      if (res.code === 200) {
        const result = res.data || {};
        emailForm.setFieldsValue({
          mailTemplate: result.mailTemplate || '',
          mailAppName: result.mailAppName || '',
          mailUsername: result.mailUsername || '',
          mailPassword: result.mailPassword || '',
          mailHost: result.mailHost || '',
          mailPort: result.mailPort || '',
        });
      }
    } catch (e) {
      console.error('请求失败', e);
    }
  };

  /**
   * 保存邮箱配置
   */
  const submitEmailForm = async () => {
    try {
      const values = await emailForm.validateFields();
      setLoading(true);
      const res = await saveSettingConfigWithBio(
        'EMAIL_SETTING',
        JSON.stringify(values)
      );
      if (res.code === 200) {
        message.success('保存成功');
      } else {
        message.error(res.msg || '保存失败');
      }
    } catch (error) {
      console.error('保存失败', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 获取OSS配置
   */
  const getOss = async () => {
    try {
      const res = await getSettingConfig('OSS_SETTING');
      if (res.code === 200) {
        const result = res.data || {};
        ossForm.setFieldsValue({
          endPoint: result.endPoint || '',
          accessKeyId: result.accessKeyId || '',
          accessKeySecret: result.accessKeySecret || '',
          bucketName: result.bucketName || '',
          picLocation: result.picLocation || '',
        });
      }
    } catch (e) {
      console.error('请求失败', e);
    }
  };

  /**
   * 保存OSS配置
   */
  const submitOssForm = async () => {
    try {
      const values = await ossForm.validateFields();
      setLoading(true);
      const res = await saveSettingConfigWithBio(
        'OSS_SETTING',
        JSON.stringify(values)
      );
      if (res.code === 200) {
        message.success('保存成功');
      } else {
        message.error(res.msg || '保存失败');
      }
    } catch (error) {
      console.error('保存失败', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 获取TG机器人配置
   */
  const getBot = async () => {
    try {
      const res = await getSettingConfig('TG_BOT_SETTING');
      if (res.code === 200) {
        const result = res.data || {};
        machineForm.setFieldsValue({
          botName: result.botName || '',
          botToken: result.botToken || '',
          chatId: result.chatId || '',
        });
      }
    } catch (e) {
      console.error('请求失败', e);
    }
  };

  /**
   * 保存TG机器人配置
   */
  const submitMachineForm = async () => {
    try {
      const values = await machineForm.validateFields();
      setLoading(true);
      const res = await saveSettingConfigWithBio(
        'TG_BOT_SETTING',
        JSON.stringify(values)
      );
      if (res.code === 200) {
        message.success('保存成功');
      } else {
        message.error(res.msg || '保存失败');
      }
    } catch (error) {
      console.error('保存失败', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 重启机器人
   */
  const handleRestart = async () => {
    try {
      const res = await Restart();
      if (res.code === 200) {
        message.success('重启成功');
      } else {
        message.error(res.msg || '重启失败');
      }
    } catch (error) {
      message.error('重启失败: ' + error.message);
    }
  };

  /**
   * 获取TTL汇率配置
   */
  const getTtlRate = async () => {
    try {
      const res = await getSettingConfig('TTLUSDT_RATE_SETTING');
      if (res.code === 200) {
        const result = res.data || {};
        ttlRateForm.setFieldsValue({
          rate: result.ratio || '',
        });
      }
    } catch (e) {
      console.error('请求失败', e);
    }
  };

  /**
   * 保存TTL汇率配置
   */
  const submitTtlRateForm = async () => {
    try {
      const values = await ttlRateForm.validateFields();
      setLoading(true);
      const data = {
        ratio: values.rate.toString()
      };
      const res = await saveSettingConfigWithBio(
        'TTLUSDT_RATE_SETTING',
        JSON.stringify(data)
      );
      if (res.code === 200) {
        message.success('保存成功');
      } else {
        message.error(res.msg || '保存失败');
      }
    } catch (error) {
      console.error('保存失败', error);
    } finally {
      setLoading(false);
    }
  };

  // ==================== 渲染 ====================

  return (
    <div style={{ padding: '24px' }}>
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        items={[
          {
            key: 'first',
            label: '短信配置',
            children: (
              <Form
                form={messageForm}
                layout="vertical"
                style={{ maxWidth: 400 }}
              >
                <Form.Item
                  label="第三方名称"
                  name="name"
                  rules={[{ required: true, message: '请输入第三方名称' }]}
                >
                  <Input placeholder="请输入第三方名称" style={{ width: 400 }} />
                </Form.Item>
                <Form.Item
                  label="账号"
                  name="mobileAccount"
                  rules={[{ required: true, message: '请输入账号' }]}
                >
                  <Input placeholder="请输入账号" style={{ width: 400 }} />
                </Form.Item>
                <Form.Item
                  label="密码"
                  name="mobilePassword"
                  rules={[{ required: true, message: '请输入密码' }]}
                >
                  <Input.Password placeholder="请输入密码" style={{ width: 400 }} />
                </Form.Item>
                <Form.Item
                  label="请求路径"
                  name="mobileUrl"
                  rules={[{ required: true, message: '请输入请求路径' }]}
                >
                  <Input placeholder="请输入请求路径" style={{ width: 400 }} />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" onClick={submitMessageForm} loading={loading}>
                    保存
                  </Button>
                </Form.Item>
              </Form>
            ),
          },
          {
            key: 'second',
            label: '邮箱配置',
            children: (
              <Form
                form={emailForm}
                layout="vertical"
                style={{ maxWidth: 400 }}
              >
                <Form.Item
                  label="模板"
                  name="mailTemplate"
                  rules={[{ required: true, message: '请输入模板' }]}
                >
                  <Input placeholder="请输入模板" style={{ width: 400 }} />
                </Form.Item>
                <Form.Item
                  label="名称"
                  name="mailAppName"
                  rules={[{ required: true, message: '请输入名称' }]}
                >
                  <Input placeholder="请输入名称" style={{ width: 400 }} />
                </Form.Item>
                <Form.Item
                  label="账号"
                  name="mailUsername"
                  rules={[{ required: true, message: '请输入账号' }]}
                >
                  <Input placeholder="请输入账号" style={{ width: 400 }} />
                </Form.Item>
                <Form.Item
                  label="密码"
                  name="mailPassword"
                  rules={[{ required: true, message: '请输入密码' }]}
                >
                  <Input.Password placeholder="请输入密码" style={{ width: 400 }} />
                </Form.Item>
                <Form.Item
                  label="地址"
                  name="mailHost"
                  rules={[{ required: true, message: '请输入地址' }]}
                >
                  <Input placeholder="请输入地址" style={{ width: 400 }} />
                </Form.Item>
                <Form.Item
                  label="端口"
                  name="mailPort"
                  rules={[{ required: true, message: '请输入端口' }]}
                >
                  <Input placeholder="请输入端口" style={{ width: 400 }} />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" onClick={submitEmailForm} loading={loading}>
                    保存
                  </Button>
                </Form.Item>
              </Form>
            ),
          },
          {
            key: 'third',
            label: 'oss配置',
            children: (
              <Form
                form={ossForm}
                layout="vertical"
                style={{ maxWidth: 400 }}
              >
                <Form.Item
                  label="阿里云oss域名"
                  name="endPoint"
                  rules={[{ required: true, message: '请输入阿里云oss域名' }]}
                >
                  <Input placeholder="请输入阿里云oss域名" style={{ width: 400 }} />
                </Form.Item>
                <Form.Item
                  label="阿里云oss账号ID"
                  name="accessKeyId"
                  rules={[{ required: true, message: '请输入阿里云oss账号ID' }]}
                >
                  <Input placeholder="请输入阿里云oss账号ID" style={{ width: 400 }} />
                </Form.Item>
                <Form.Item
                  label="阿里云oss账号秘钥"
                  name="accessKeySecret"
                  rules={[{ required: true, message: '请输入阿里云oss账号秘钥' }]}
                >
                  <Input.Password placeholder="请输入阿里云oss账号秘钥" style={{ width: 400 }} />
                </Form.Item>
                <Form.Item
                  label="阿里云oss桶名"
                  name="bucketName"
                  rules={[{ required: true, message: '请输入阿里云oss桶名' }]}
                >
                  <Input placeholder="请输入阿里云oss桶名" style={{ width: 400 }} />
                </Form.Item>
                <Form.Item
                  label="阿里云oss存储路径"
                  name="picLocation"
                  rules={[{ required: true, message: '请输入阿里云oss存储路径' }]}
                >
                  <Input placeholder="请输入阿里云oss存储路径" style={{ width: 400 }} />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" onClick={submitOssForm} loading={loading}>
                    保存
                  </Button>
                </Form.Item>
              </Form>
            ),
          },
          {
            key: 'four',
            label: 'TG机器人',
            children: (
              <Form
                form={machineForm}
                layout="vertical"
                style={{ maxWidth: 400 }}
              >
                <Form.Item
                  label="机器人名称"
                  name="botName"
                >
                  <Input placeholder="请输入机器人名称" style={{ width: 400 }} />
                </Form.Item>
                <Form.Item
                  label="机器人token"
                  name="botToken"
                >
                  <Input.Password placeholder="请输入机器人token" style={{ width: 400 }} />
                </Form.Item>
                <Form.Item
                  label="群组ID"
                  name="chatId"
                >
                  <Input placeholder="请输入群组ID" style={{ width: 400 }} />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" onClick={submitMachineForm} loading={loading}>
                    保存
                  </Button>
                  <Button onClick={handleRestart} style={{ marginLeft: 8 }}>
                    重启
                  </Button>
                </Form.Item>
              </Form>
            ),
          },
          {
            key: 'ttlRate',
            label: 'TTL汇率设置',
            children: (
              <Form
                form={ttlRateForm}
                layout="vertical"
                style={{ maxWidth: 400 }}
              >
                <Form.Item
                  label="TTL汇率"
                  name="rate"
                  rules={[
                    { required: true, message: '请输入TTL汇率' },
                    {
                      validator: (_, value) => {
                        if (value === '' || value === null || value === undefined) {
                          return Promise.resolve();
                        }
                        if (typeof value !== 'number' || isNaN(value)) {
                          return Promise.reject(new Error('请输入有效的数字'));
                        }
                        if (value <= 0) {
                          return Promise.reject(new Error('汇率值必须大于0'));
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input type="number" placeholder="请输入大于0的值" style={{ width: 400 }} />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" onClick={submitTtlRateForm} loading={loading}>
                    保存
                  </Button>
                </Form.Item>
              </Form>
            ),
          },
        ]}
      />
    </div>
  );
};

export default SmsConfigurationPage;
