import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, message, Tabs } from 'antd';
import { getSettingConfig, saveSettingConfigWithBio } from '@api';

const { Option } = Select;

/**
 * 玩法配置页面
 */
const GameplayConfigurationPage = () => {
  const [activeTab, setActiveTab] = useState('first');
  const [gameplayForm1] = Form.useForm();
  const [gameplayForm] = Form.useForm();
  const [gameplayDefiForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getGameplay1();
  }, []);

  /**
   * 切换标签
   */
  const handleTabChange = (key) => {
    setActiveTab(key);
    if (key === 'first') {
      getGameplay1();
    } else if (key === 'second') {
      getGameplay();
    } else if (key === 'thired') {
      getGameplayDefi();
    }
  };

  /**
   * 获取质押挖矿配置
   */
  const getGameplay1 = async () => {
    try {
      const res = await getSettingConfig('MING_SETTLEMENT_SETTING');
      if (res.code === 200) {
        gameplayForm1.setFieldsValue(res.data || {});
      }
    } catch (e) {
      console.error('请求失败', e);
    }
  };

  /**
   * 保存质押挖矿配置
   */
  const submitGameplayForm1 = async () => {
    try {
      const values = await gameplayForm1.validateFields();
      setLoading(true);
      const res = await saveSettingConfigWithBio(
        'MING_SETTLEMENT_SETTING',
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
   * 获取理财配置
   */
  const getGameplay = async () => {
    try {
      const res = await getSettingConfig('FINANCIAL_SETTLEMENT_SETTING');
      if (res.code === 200) {
        gameplayForm.setFieldsValue(res.data || {});
      }
    } catch (e) {
      console.error('请求失败', e);
    }
  };

  /**
   * 保存理财配置
   */
  const submitGameplayForm = async () => {
    try {
      const values = await gameplayForm.validateFields();
      if (values.settlementType != '1') {
        delete values.settlementDay;
      }
      setLoading(true);
      const res = await saveSettingConfigWithBio(
        'FINANCIAL_SETTLEMENT_SETTING',
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
   * 获取defi挖矿配置
   */
  const getGameplayDefi = async () => {
    try {
      const res = await getSettingConfig('DEFI_INCOME_SETTING');
      if (res.code === 200) {
        gameplayDefiForm.setFieldsValue(res.data || {});
      }
    } catch (e) {
      console.error('请求失败', e);
    }
  };

  /**
   * 保存defi挖矿配置
   */
  const submitGameplayDefiForm = async () => {
    try {
      const values = await gameplayDefiForm.validateFields();
      setLoading(true);
      const res = await saveSettingConfigWithBio(
        'DEFI_INCOME_SETTING',
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
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        items={[
          {
            key: 'first',
            label: '质押挖矿',
            children: (
              <Form
                form={gameplayForm1}
                layout="vertical"
                style={{ maxWidth: 400 }}
              >
                <Form.Item
                  label="结算类型"
                  name="settlementType"
                  rules={[{ required: true, message: '请选择结算类型' }]}
                >
                  <Select placeholder="请选择结算类型">
                    <Option value={1}>每日</Option>
                    <Option value={2}>到期结算</Option>
                  </Select>
                </Form.Item>
                <Form.Item>
                  <Button type="primary" onClick={submitGameplayForm1} loading={loading}>
                    保存
                  </Button>
                </Form.Item>
              </Form>
            ),
          },
          {
            key: 'second',
            label: '理财',
            children: (
              <Form
                form={gameplayForm}
                layout="vertical"
                style={{ maxWidth: 400 }}
              >
                <Form.Item
                  label="结算类型"
                  name="settlementType"
                  rules={[{ required: true, message: '请选择结算类型' }]}
                >
                  <Select placeholder="请选择结算类型">
                    <Option value={1}>指定天数</Option>
                    <Option value={2}>每日</Option>
                    <Option value={3}>产品到期结算</Option>
                  </Select>
                </Form.Item>
                <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.settlementType !== currentValues.settlementType}>
                  {({ getFieldValue }) =>
                    getFieldValue('settlementType') == '1' ? (
                      <Form.Item
                        label="结算日期"
                        name="settlementDay"
                        rules={[
                          { required: true, message: '请输入结算日期' },
                          {
                            pattern: /^([1-9]|[1-2][0-8])$/,
                            message: '只能输入1-28的数字',
                          },
                        ]}
                      >
                        <Input placeholder="请输入结算日期" />
                      </Form.Item>
                    ) : null
                  }
                </Form.Item>
                <Form.Item>
                  <Button type="primary" onClick={submitGameplayForm} loading={loading}>
                    保存
                  </Button>
                </Form.Item>
              </Form>
            ),
          },
          {
            key: 'thired',
            label: 'defi挖矿',
            children: (
              <Form
                form={gameplayDefiForm}
                layout="vertical"
                style={{ maxWidth: 400 }}
              >
                <Form.Item
                  label="总产出"
                  name="totalOutput"
                  rules={[{ required: true, message: '请输入总产出' }]}
                >
                  <Input type="number" placeholder="请输入总产出" />
                </Form.Item>
                <Form.Item
                  label="用户收益"
                  name="userBenefits"
                  rules={[{ required: true, message: '请输入用户收益' }]}
                >
                  <Input type="number" placeholder="请输入用户收益" />
                </Form.Item>
                <Form.Item
                  label="参与者"
                  name="participant"
                  rules={[{ required: true, message: '请输入参与者' }]}
                >
                  <Input type="number" placeholder="请输入参与者" />
                </Form.Item>
                <Form.Item
                  label="有效节点"
                  name="validNode"
                  rules={[{ required: true, message: '请输入有效节点' }]}
                >
                  <Input type="number" placeholder="请输入有效节点" />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" onClick={submitGameplayDefiForm} loading={loading}>
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

export default GameplayConfigurationPage;
