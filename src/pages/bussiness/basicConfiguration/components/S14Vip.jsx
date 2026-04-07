import React, { useEffect, useState } from 'react';
import { Form, Button, message, InputNumber, Radio, Space } from 'antd';
import { getSettingConfig, saveSettingConfigWithBio } from '@api';

/**
 * S14Vip - VIP等级设置组件
 */
const S14Vip = ({ formRef }) => {
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
      const res = await getSettingConfig('VIP_LEVEL_SETTING');
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
      const res = await saveSettingConfigWithBio('VIP_LEVEL_SETTING', JSON.stringify(values));
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
        <Form.Item label="vip0">
          <Space>
            <span>开始：</span>
            <Form.Item name="vip0Start" noStyle>
              <InputNumber style={{ width: 150 }} />
            </Form.Item>
            <span>结束：</span>
            <Form.Item name="vip0End" noStyle>
              <InputNumber style={{ width: 150 }} />
            </Form.Item>
          </Space>
        </Form.Item>
        <Form.Item label="vip1">
          <Space>
            <span>开始：</span>
            <Form.Item name="vip1Start" noStyle>
              <InputNumber style={{ width: 150 }} />
            </Form.Item>
            <span>结束：</span>
            <Form.Item name="vip1End" noStyle>
              <InputNumber style={{ width: 150 }} />
            </Form.Item>
          </Space>
        </Form.Item>
        <Form.Item label="vip2">
          <Space>
            <span>开始：</span>
            <Form.Item name="vip2Start" noStyle>
              <InputNumber style={{ width: 150 }} />
            </Form.Item>
            <span>结束：</span>
            <Form.Item name="vip2End" noStyle>
              <InputNumber style={{ width: 150 }} />
            </Form.Item>
          </Space>
        </Form.Item>
        <Form.Item label="vip3">
          <Space>
            <span>开始：</span>
            <Form.Item name="vip3Start" noStyle>
              <InputNumber style={{ width: 150 }} />
            </Form.Item>
            <span>结束：</span>
            <Form.Item name="vip3End" noStyle>
              <InputNumber style={{ width: 150 }} />
            </Form.Item>
          </Space>
        </Form.Item>
        <Form.Item label="vip4">
          <Space>
            <span>开始：</span>
            <Form.Item name="vip4Start" noStyle>
              <InputNumber style={{ width: 150 }} />
            </Form.Item>
            <span>结束：</span>
            <Form.Item name="vip4End" noStyle>
              <InputNumber style={{ width: 150 }} />
            </Form.Item>
          </Space>
        </Form.Item>
        <Form.Item label="vip5">
          <Space>
            <span>开始：</span>
            <Form.Item name="vip5Start" noStyle>
              <InputNumber style={{ width: 150 }} />
            </Form.Item>
            <span>结束：</span>
            <Form.Item name="vip5End" noStyle>
              <InputNumber style={{ width: 150 }} />
            </Form.Item>
          </Space>
        </Form.Item>
        <Form.Item label="vip6">
          <Space>
            <span>开始：</span>
            <Form.Item name="vip6Start" noStyle>
              <InputNumber style={{ width: 150 }} />
            </Form.Item>
            <span>结束：</span>
            <Form.Item name="vip6End" noStyle>
              <InputNumber style={{ width: 150 }} />
            </Form.Item>
          </Space>
        </Form.Item>
        <Form.Item label="vip7">
          <Space>
            <span>开始：</span>
            <Form.Item name="vip7Start" noStyle>
              <InputNumber style={{ width: 150 }} />
            </Form.Item>
            <span>结束：</span>
            <Form.Item name="vip7End" noStyle>
              <InputNumber style={{ width: 150 }} />
            </Form.Item>
          </Space>
        </Form.Item>
        <Form.Item label="vip8">
          <Space>
            <span>开始：</span>
            <Form.Item name="vip8Start" noStyle>
              <InputNumber style={{ width: 150 }} />
            </Form.Item>
          </Space>
        </Form.Item>
        <Form.Item label="开关" name="isOpen">
          <Radio.Group>
            <Radio value={true}>开</Radio>
            <Radio value={false}>关</Radio>
          </Radio.Group>
        </Form.Item>
      </Form>
      <div style={{ marginTop: 16 }}>
        <Button type="primary" onClick={submitForm} loading={loading}>保存</Button>
      </div>
    </div>
  );
};

export default S14Vip;
