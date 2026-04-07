import React, { useState, useEffect } from 'react';
import { Card, Tabs, Form, InputNumber, Switch, Button, message, Descriptions, Statistic, Row, Col, Tag, Space } from 'antd';
import { SaveOutlined, ReloadOutlined, FundOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getCommissionConfig, saveCommissionConfig, getCommissionStatistics } from '@api';

/**
 * 佣金管理主页面
 * 功能：
 * 1. 充值返佣配置
 * 2. 理财返佣配置
 * 3. 佣金统计概览
 * 4. 快捷入口到详细记录
 */
const CommissionPage = () => {
  const [activeTab, setActiveTab] = useState('recharge');
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState(null);
  const [rechargeForm] = Form.useForm();
  const [financialForm] = Form.useForm();
  const navigate = useNavigate();

  /**
   * 加载统计数据
   */
  const loadStatistics = async () => {
    try {
      const response = await getCommissionStatistics({});
      if (response.code === 0 || response.code === 200) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('加载统计数据失败:', error);
    }
  };

  /**
   * 切换标签页时加载对应配置
   */
  const handleTabChange = (key) => {
    setActiveTab(key);
    if (key === 'recharge') {
      loadRechargeConfig();
    } else if (key === 'financial') {
      loadFinancialConfig();
    } else if (key === 'statistics') {
      loadStatistics();
    }
  };

  /**
   * 加载充值返佣配置
   */
  const loadRechargeConfig = async () => {
    try {
      const response = await getCommissionConfig('RECHARGE_REBATE_SETTING');
      if (response.code === 0 || response.code === 200) {
        const data = response.data || {};
        rechargeForm.setFieldsValue({
          ratio: data.ratio || 0,
          rebateMaxAmount: data.rebateMaxAmount || 0,
          isOpen: data.isOpen || false,
        });
      }
    } catch (error) {
      console.error('加载充值返佣配置失败:', error);
    }
  };

  /**
   * 加载理财返佣配置
   */
  const loadFinancialConfig = async () => {
    try {
      const response = await getCommissionConfig('FINANCIAL_REBATE_SETTING');
      if (response.code === 0 || response.code === 200) {
        const data = response.data || {};
        financialForm.setFieldsValue({
          oneRatio: data.oneRatio || 0,
          twoRatio: data.twoRatio || 0,
          threeRatio: data.threeRatio || 0,
          isOpen: data.isOpen || false,
        });
      }
    } catch (error) {
      console.error('加载理财返佣配置失败:', error);
    }
  };

  /**
   * 保存充值返佣配置
   */
  const handleSaveRecharge = async () => {
    try {
      const values = await rechargeForm.validateFields();
      setLoading(true);

      const response = await saveCommissionConfig(
        'RECHARGE_REBATE_SETTING',
        JSON.stringify(values)
      );

      if (response.code === 0 || response.code === 200) {
        message.success('充值返佣配置保存成功');
        loadRechargeConfig();
      } else {
        message.error(response.msg || '保存失败');
      }
    } catch (error) {
      if (error.errorFields) {
        message.error('请填写完整信息');
      } else {
        message.error('保存失败: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * 保存理财返佣配置
   */
  const handleSaveFinancial = async () => {
    try {
      const values = await financialForm.validateFields();
      setLoading(true);

      const response = await saveCommissionConfig(
        'FINANCIAL_REBATE_SETTING',
        JSON.stringify(values)
      );

      if (response.code === 0 || response.code === 200) {
        message.success('理财返佣配置保存成功');
        loadFinancialConfig();
      } else {
        message.error(response.msg || '保存失败');
      }
    } catch (error) {
      if (error.errorFields) {
        message.error('请填写完整信息');
      } else {
        message.error('保存失败: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * 刷新配置
   */
  const handleRefresh = () => {
    if (activeTab === 'recharge') {
      loadRechargeConfig();
      message.success('配置已刷新');
    } else if (activeTab === 'financial') {
      loadFinancialConfig();
      message.success('配置已刷新');
    } else if (activeTab === 'statistics') {
      loadStatistics();
      message.success('统计数据已刷新');
    }
  };

  /**
   * 跳转到记录查询页面
   */
  const goToRecords = () => {
    navigate('/cm-moxb/commission/records');
  };

  // 初始化加载
  useEffect(() => {
    loadRechargeConfig();
  }, []);

  return (
    <div className="commission-container">
      <Card
        title="佣金管理"
        className="commission-card"
        extra={
          <Button
            type="primary"
            icon={<FundOutlined />}
            onClick={goToRecords}
          >
            查看详细记录
          </Button>
        }
      >
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={[
            {
              key: 'recharge',
              label: '充值返佣配置',
              children: (
                <div className="config-panel">
                  <Form
                    form={rechargeForm}
                    layout="vertical"
                    className="commission-form"
                  >
                    <Form.Item
                      name="ratio"
                      label="充值返点比例（%）"
                      rules={[
                        { required: true, message: '请输入充值返点比例' },
                        { type: 'number', min: 0, max: 100, message: '比例范围 0-100' }
                      ]}
                    >
                      <InputNumber
                        placeholder="请输入充值返点比例"
                        min={0}
                        max={100}
                        precision={2}
                        style={{ width: '100%' }}
                        addonAfter="%"
                      />
                    </Form.Item>

                    <Form.Item
                      name="rebateMaxAmount"
                      label="充值返点最大值"
                      rules={[
                        { required: true, message: '请输入最大值' },
                        { type: 'number', min: 0, message: '不能小于0' }
                      ]}
                    >
                      <InputNumber
                        placeholder="请输入最大值"
                        min={0}
                        precision={2}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>

                    <Form.Item
                      name="isOpen"
                      label="启用状态"
                      valuePropName="checked"
                    >
                      <Switch
                        checkedChildren="开"
                        unCheckedChildren="关"
                      />
                    </Form.Item>
                  </Form>

                  <div className="form-actions">
                    <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      loading={loading}
                      onClick={handleSaveRecharge}
                    >
                      保存配置
                    </Button>
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={handleRefresh}
                    >
                      刷新
                    </Button>
                  </div>

                  <Descriptions
                    title="配置说明"
                    bordered
                    column={1}
                    className="config-descriptions"
                  >
                    <Descriptions.Item label="返点比例">
                      用户充值时获得的返点比例，范围为0-100%
                    </Descriptions.Item>
                    <Descriptions.Item label="最大值">
                      单次充值可获得的返点金额上限
                    </Descriptions.Item>
                    <Descriptions.Item label="启用状态">
                      开关关闭时，用户充值将不享受返佣优惠
                    </Descriptions.Item>
                  </Descriptions>
                </div>
              ),
            },
            {
              key: 'financial',
              label: '理财返佣配置',
              children: (
                <div className="config-panel">
                  <Form
                    form={financialForm}
                    layout="vertical"
                    className="commission-form"
                  >
                    <Form.Item
                      name="oneRatio"
                      label="一级返点比例（%）"
                      rules={[
                        { required: true, message: '请输入一级返点比例' },
                        { type: 'number', min: 0, max: 100, message: '比例范围 0-100' }
                      ]}
                    >
                      <InputNumber
                        placeholder="请输入一级返点比例"
                        min={0}
                        max={100}
                        precision={2}
                        style={{ width: '100%' }}
                        addonAfter="%"
                      />
                    </Form.Item>

                    <Form.Item
                      name="twoRatio"
                      label="二级返点比例（%）"
                      rules={[
                        { required: true, message: '请输入二级返点比例' },
                        { type: 'number', min: 0, max: 100, message: '比例范围 0-100' }
                      ]}
                    >
                      <InputNumber
                        placeholder="请输入二级返点比例"
                        min={0}
                        max={100}
                        precision={2}
                        style={{ width: '100%' }}
                        addonAfter="%"
                      />
                    </Form.Item>

                    <Form.Item
                      name="threeRatio"
                      label="三级返点比例（%）"
                      rules={[
                        { required: true, message: '请输入三级返点比例' },
                        { type: 'number', min: 0, max: 100, message: '比例范围 0-100' }
                      ]}
                    >
                      <InputNumber
                        placeholder="请输入三级返点比例"
                        min={0}
                        max={100}
                        precision={2}
                        style={{ width: '100%' }}
                        addonAfter="%"
                      />
                    </Form.Item>

                    <Form.Item
                      name="isOpen"
                      label="启用状态"
                      valuePropName="checked"
                    >
                      <Switch
                        checkedChildren="开"
                        unCheckedChildren="关"
                      />
                    </Form.Item>
                  </Form>

                  <div className="form-actions">
                    <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      loading={loading}
                      onClick={handleSaveFinancial}
                    >
                      保存配置
                    </Button>
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={handleRefresh}
                    >
                      刷新
                    </Button>
                  </div>

                  <Descriptions
                    title="配置说明"
                    bordered
                    column={1}
                    className="config-descriptions"
                  >
                    <Descriptions.Item label="一级返点">
                      直接推荐用户购买理财产品时的返点比例
                    </Descriptions.Item>
                    <Descriptions.Item label="二级返点">
                      下级用户推荐其他人购买理财产品时的返点比例
                    </Descriptions.Item>
                    <Descriptions.Item label="三级返点">
                      三级用户推荐其他人购买理财产品时的返点比例
                    </Descriptions.Item>
                    <Descriptions.Item label="启用状态">
                      开关关闭时，理财返佣功能将暂停
                    </Descriptions.Item>
                  </Descriptions>
                </div>
              ),
            },
            {
              key: 'statistics',
              label: '佣金统计',
              children: (
                <div className="statistics-panel">
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={6}>
                      <Statistic
                        title="今日佣金总额"
                        prefix="¥"
                        value={statistics?.todayTotal || 0}
                        precision={2}
                        valueStyle={{ color: '#3f8600' }}
                      />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Statistic
                        title="本月佣金总额"
                        prefix="¥"
                        value={statistics?.monthTotal || 0}
                        precision={2}
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Statistic
                        title="待结算佣金"
                        prefix="¥"
                        value={statistics?.pendingTotal || 0}
                        precision={2}
                        valueStyle={{ color: '#faad14' }}
                      />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Statistic
                        title="累计佣金总额"
                        prefix="¥"
                        value={statistics?.totalTotal || 0}
                        precision={2}
                        valueStyle={{ color: '#cf1322' }}
                      />
                    </Col>
                  </Row>

                  <Card title="佣金来源统计" style={{ marginTop: 16 }}>
                    <div className="commission-source">
                      <div className="source-item">
                        <span className="source-label">充值返佣：</span>
                        <Tag color="blue">¥ {(statistics?.rechargeTotal || 0).toFixed(2)}</Tag>
                      </div>
                      <div className="source-item">
                        <span className="source-label">理财返佣：</span>
                        <Tag color="green">¥ {(statistics?.financialTotal || 0).toFixed(2)}</Tag>
                      </div>
                      <div className="source-item">
                        <span className="source-label">交易返佣：</span>
                        <Tag color="orange">¥ {(statistics?.tradeTotal || 0).toFixed(2)}</Tag>
                      </div>
                      <div className="source-item">
                        <span className="source-label">其他返佣：</span>
                        <Tag color="purple">¥ {(statistics?.otherTotal || 0).toFixed(2)}</Tag>
                      </div>
                    </div>
                  </Card>

                  <Card title="快捷操作" style={{ marginTop: 16 }}>
                    <Space>
                      <Button type="primary" onClick={goToRecords}>
                        查看佣金记录
                      </Button>
                      <Button onClick={goToRecords}>
                        查看结算记录
                      </Button>
                    </Space>
                  </Card>
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default CommissionPage;
