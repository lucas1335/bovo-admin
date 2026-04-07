import React, { useEffect } from 'react';
import { Form, Button, message, Switch } from 'antd';
import { getSettingConfig, saveSettingConfigWithBio } from '@api';

/**
 * S3Code - 验证码设置组件
 */
const S3Code = ({ formRef }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (formRef) {
      formRef.current = form;
    }
    getMarket();
  }, []);

  const getMarket = async () => {
    try {
      const res = await getSettingConfig('MARKET_URL');
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
          url: data.url === true || data.url === 'true',
          adminCode: data.adminCode === true || data.adminCode === 'true',
          h5Code: data.h5Code === true || data.h5Code === 'true',
        };
        form.setFieldsValue(formData);
      }
    } catch (e) {
      console.error('请求失败', e);
    }
  };

  const submitMarketForm = async () => {
    try {
      const values = await form.validateFields();
      const res = await saveSettingConfigWithBio('MARKET_URL', values);
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
        <Form.Item
          label="谷歌验证码"
          name="url"
          rules={[{ required: true, message: '请选择开关' }]}
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
        <Form.Item
          label="admin图形验证码"
          name="adminCode"
          rules={[{ required: true, message: '请选择开关' }]}
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
        <Form.Item
          label="H5图形验证码"
          name="h5Code"
          rules={[{ required: true, message: '请选择开关' }]}
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={submitMarketForm}>
            保存
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default S3Code;
