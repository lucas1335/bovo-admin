import React, { useEffect, useState } from 'react';
import { Form, Button, message, Switch, Select } from 'antd';
import { getSettingConfig, saveSettingConfigWithBio, getTimezone } from '@api';

const { Option } = Select;

/**
 * S4Timezone - 时区设置组件
 */
const S4Timezone = ({ formRef }) => {
  const [form] = Form.useForm();
  const [timeLists, setTimeLists] = useState([]);

  useEffect(() => {
    if (formRef) {
      formRef.current = form;
    }
    getPlatform();
    getTimeList();
  }, []);

  const getPlatform = async () => {
    try {
      const res = await getSettingConfig('PLATFORM_SETTING');
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
          timezone: data.timezone || '',
          status: data.status === true || data.status === 'true',
        };
        form.setFieldsValue(formData);
      }
    } catch (e) {
      console.error('请求失败', e);
    }
  };

  const getTimeList = async () => {
    try {
      const res = await getTimezone();
      if (res.code === 200) {
        setTimeLists(res.data || []);
      }
    } catch (e) {
      console.error('请求失败', e);
    }
  };

  const submitPlatformForm = async () => {
    try {
      const values = await form.validateFields();
      const res = await saveSettingConfigWithBio('PLATFORM_SETTING', values);
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
          label="时区"
          name="timezone"
          rules={[{ required: true, message: '请选择时区' }]}
        >
          <Select placeholder="请选择时区">
            {timeLists.map(item => (
              <Option key={item.zoneId} value={item.zoneId}>
                {item.offSet}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="是否24小时制" name="status" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={submitPlatformForm}>
            保存
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default S4Timezone;
