import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import { getSettingConfig, saveSettingConfigWithBio } from '@api';

/**
 * 贷款配置页面
 */
const LoanRatePage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getLoan();
  }, []);

  /**
   * 获取贷款逾期配置
   */
  const getLoan = async () => {
    try {
      const res = await getSettingConfig('LOAD_SETTING');
      if (res.code === 200) {
        form.setFieldsValue({
          overdueRate: res.data?.overdueRate || '',
        });
      }
    } catch (e) {
      console.error('请求失败', e);
    }
  };

  /**
   * 提交表单
   */
  const submitForm = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const res = await saveSettingConfigWithBio(
        'LOAD_SETTING',
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

  // ==================== 渲染 ====================

  return (
    <div style={{ padding: '24px' }}>
      <Form
        form={form}
        layout="vertical"
        style={{ maxWidth: 400 }}
      >
        <Form.Item
          label="贷款逾期利率"
          name="overdueRate"
          rules={[
            { required: true, message: '请输入贷款逾期利率' },
            {
              pattern: /^[1-9]\d*(\.\d{1,6})?$|^0(\.\d{1,6})?$/,
              message: '请输入最多保留6位小数的大于0的数字',
            },
          ]}
        >
          <Input placeholder="请输入贷款逾期利率" style={{ width: 400 }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={submitForm} loading={loading}>
            保存
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default LoanRatePage;
