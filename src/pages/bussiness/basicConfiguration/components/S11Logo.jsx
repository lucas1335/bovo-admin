import React, { useEffect, useState } from 'react';
import { Form, Button, message } from 'antd';
import { getSettingConfig, saveSettingConfigWithBio } from '@api';
import CmUpload from '@components/CmUpload';

/**
 * S11Logo - 平台logo设置组件
 */
const S11Logo = ({ formRef }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (formRef) {
      formRef.current = form;
    }
    getList();
  }, []);

  const getList = async () => {
    try {
      const res = await getSettingConfig('LOGO_SETTING');
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
        form.setFieldsValue(data);
      }
    } catch (e) {
      console.error('请求失败', e);
    }
  };

  const submitForm = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const res = await saveSettingConfigWithBio('LOGO_SETTING', JSON.stringify(values));
      if (res.code === 200) {
        message.success('保存成功');
        getList();
      } else {
        message.error(res.msg || '保存失败');
      }
    } catch (error) {
      console.error('保存失败', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Form form={form} layout="vertical">
        <Form.Item label="logo" name="logo" rules={[{ required: true, message: '不能为空' }]}>
          <CmUpload limit={1} />
        </Form.Item>
        <Form.Item label="57*57" name="logoA" rules={[{ required: true, message: '不能为空' }]}>
          <CmUpload limit={1} />
        </Form.Item>
        <Form.Item label="72*72" name="logoB" rules={[{ required: true, message: '不能为空' }]}>
          <CmUpload limit={1} />
        </Form.Item>
        <Form.Item label="120*120" name="logoC" rules={[{ required: true, message: '不能为空' }]}>
          <CmUpload limit={1} />
        </Form.Item>
        <Form.Item label="144*144" name="logoD" rules={[{ required: true, message: '不能为空' }]}>
          <CmUpload limit={1} />
        </Form.Item>
      </Form>
      <div style={{ marginTop: 16 }}>
        <Button type="primary" onClick={submitForm} loading={loading}>保存</Button>
      </div>
    </div>
  );
};

export default S11Logo;
