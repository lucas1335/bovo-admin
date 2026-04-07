import React, { useEffect } from 'react';
import { Form, Input, Button, message, Switch, InputNumber } from 'antd';
import { getSettingConfig, saveSettingConfigWithBio } from '@api';

/**
 * S2LoginRegister - 登录注册配置组件
 */
const S2LoginRegister = ({ formRef }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (formRef) {
      formRef.current = form;
    }
    getLogin();
  }, []);

  const getLogin = async () => {
    try {
      const res = await getSettingConfig('LOGIN_REGIS_SETTING');
      if (res.code === 200) {
        let data = res.data;
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch (e) {
            console.error('JSON解析失败:', e);
            data = {};
          }
        }
        const formData = {
          emailIsOpen: data.emailIsOpen === true || data.emailIsOpen === 'true',
          phoneIsOpen: data.phoneIsOpen === true || data.phoneIsOpen === 'true',
          ordinaryIsOpen: data.ordinaryIsOpen === true || data.ordinaryIsOpen === 'true',
          inviteCodeIsOpen: data.inviteCodeIsOpen === true || data.inviteCodeIsOpen === 'true',
          credits: data.credits !== undefined ? data.credits : 0,
        };
        form.setFieldsValue(formData);
      }
    } catch (e) {
      console.error('请求失败', e);
    }
  };

  const submitLoginForm = async () => {
    try {
      const values = await form.validateFields();
      const res = await saveSettingConfigWithBio('LOGIN_REGIS_SETTING', values);
      if (res.code === 200) {
        message.success('保存成功');
      } else {
        message.error(res.msg || '保存失败');
      }
    } catch (error) {
      console.error('保存失败', error);
    }
  };

  return (
    <div>
      <Form form={form} layout="vertical" style={{ maxWidth: 500 }}>
        <Form.Item label="邮箱注册" name="emailIsOpen" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item label="手机注册" name="phoneIsOpen" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item label="普通注册" name="ordinaryIsOpen" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item label="强制邀请码注册" name="inviteCodeIsOpen" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item
          label="信誉分"
          name="credits"
          rules={[
            { required: true, message: '请输入信誉分' },
            { type: 'number', min: 0, max: 100, message: '信誉分必须在0-100之间' },
          ]}
        >
          <InputNumber min={0} max={100} style={{ width: 200 }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={submitLoginForm}>
            保存
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default S2LoginRegister;
