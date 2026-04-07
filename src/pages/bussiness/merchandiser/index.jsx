import React, { useState } from 'react';
import { message, Tag, Form, Input, Select, Switch, InputNumber, DatePicker, Row, Col, Divider, Button } from 'antd';
import CmBasePage from '@components/CmBasePage';
import DataForm from '@components/DataForm';
import CmImage from '@components/CmImage';
import {
  getAgentList,
  saveAgent,
  updateAgent,
  deleteAgent,
  getAgentHistoryList,
  calculateProfit,
  saveFollowOrder
} from '@api';

const { Option } = Select;
const { TextArea } = Input;

/**
 * 代理用户管理页面
 * 功能：代理列表展示、新增代理、编辑代理、删除代理、代理审核、历史带单查看
 */
const AgentPage = () => {
  // ==================== 状态管理 ====================
  const [formVisible, setFormVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);

  // 永续跟单弹窗状态
  const [followOrderVisible, setFollowOrderVisible] = useState(false);
  const [followOrderForm] = Form.useForm();
  const [profitData, setProfitData] = useState({
    profit: 0,
    fee: 0,
    followFee: 0,
  });
  const [currentAgent, setCurrentAgent] = useState(null);

  // 历史带单弹窗状态
  const [historyVisible, setHistoryVisible] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // ==================== 事件处理函数 ====================

  /**
   * 新增代理
   */
  const handleAdd = () => {
    setEditingRecord(null);
    setFormVisible(true);
  };

  /**
   * 编辑代理
   */
  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormVisible(true);
  };

  /**
   * 删除代理
   */
  const handleDelete = async (record) => {
    try {
      const response = await deleteAgent({ id: record.id });
      if (response.code === 0 || response.code === 200) {
        message.success('删除成功');
        refreshTable();
      } else {
        message.error(response.msg || '删除失败');
      }
    } catch (error) {
      message.error('删除失败: ' + error.message);
    }
  };

  /**
   * 提交表单（新增或编辑代理）
   */
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // 确保数字类型字段正确转换
      const submitData = {
        ...values,
        compEnable: values.compEnable ? 1 : 2,
        fullCompEnable: values.fullCompEnable ? 1 : 0,
        enable: values.enable ? '1' : '2',
      };

      const response = editingRecord
        ? await updateAgent({ ...submitData, id: editingRecord.id })
        : await saveAgent(submitData);

      if (response.code === 0 || response.code === 200) {
        message.success(editingRecord ? '更新成功' : '新增成功');
        setFormVisible(false);
        refreshTable();
      } else {
        message.error(response.msg || '操作失败');
      }
    } catch (error) {
      message.error('操作失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 刷新表格
   */
  const refreshTable = () => {
    document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
      new CustomEvent('reload')
    );
  };

  /**
   * 新增永续跟单
   */
  const handleAddFollowOrder = (record) => {
    if (record.tranType != 1) {
      message.warning('只有合约类型才能新增永续跟单');
      return;
    }
    setCurrentAgent(record);
    followOrderForm.resetFields();
    followOrderForm.setFieldsValue({
      merchandiserUserId: record.merchandiserUserId,
    });
    setProfitData({ profit: 0, fee: 0, followFee: 0 });
    setFollowOrderVisible(true);
  };

  /**
   * 计算盈利
   */
  const handleCalculateProfit = async () => {
    try {
      const values = await followOrderForm.validateFields();
      const response = await calculateProfit(values);
      if (response.code === 200 && response.data) {
        setProfitData({
          profit: response.data.profit,
          fee: Number(response.data.openFee || 0) + Number(response.data.sellFee || 0),
          followFee: Number(response.data.followFee || 0),
        });
      } else {
        message.error(response.msg || '计算失败');
      }
    } catch (error) {
      message.error('计算失败: ' + error.message);
    }
  };

  /**
   * 保存永续跟单
   */
  const handleSaveFollowOrder = async () => {
    try {
      const values = await followOrderForm.validateFields();
      if (!profitData.fee && !profitData.profit) {
        message.error('请先计算盈利');
        return;
      }
      const response = await saveFollowOrder(values);
      if (response.code === 200) {
        message.success('操作成功');
        setFollowOrderVisible(false);
      } else {
        message.error(response.msg || '操作失败');
      }
    } catch (error) {
      message.error('操作失败: ' + error.message);
    }
  };

  /**
   * 显示历史带单
   */
  const handleShowHistory = async (record) => {
    setHistoryVisible(true);
    setHistoryLoading(true);
    try {
      const response = await getAgentHistoryList({
        pageNum: 1,
        pageSize: 100,
        merchandiserId: record.id,
      });
      if (response.code === 200) {
        setHistoryData(response.rows || []);
      } else {
        message.error(response.msg || '获取历史带单失败');
      }
    } catch (error) {
      message.error('获取历史带单失败: ' + error.message);
    } finally {
      setHistoryLoading(false);
    }
  };

  // ==================== 数据映射配置 ====================

  // 交易类型映射
  const tranTypeMap = {
    0: { color: 'green', text: '秒合约' },
    1: { color: 'orange', text: '合约' },
    2: { color: 'red', text: '现货' },
  };

  // 启用状态映射
  const enableMap = {
    1: { color: 'blue', text: '启用' },
    2: { color: 'default', text: '禁用' },
  };

  // ==================== 列配置 ====================

  const columns = [
    {
      title: '交易类型',
      dataIndex: 'tranType',
      key: 'tranType',
      width: 100,
      render: (tranType) => {
        const status = tranTypeMap[tranType] || { color: 'default', text: '未知' };
        return <Tag color={status.color}>{status.text}</Tag>;
      },
    },
    {
      title: '跟单员ID',
      dataIndex: 'merchandiserUserId',
      key: 'merchandiserUserId',
      width: 120,
    },
    {
      title: '跟单员昵称',
      dataIndex: 'name',
      key: 'name',
      width: 120,
    },
    {
      title: '头像',
      dataIndex: 'logo',
      key: 'logo',
      width: 80,
      render: (text) => <CmImage src={text} width={50} height={50} />,
    },
    {
      title: '星级',
      dataIndex: 'star',
      key: 'star',
      width: 80,
    },
    {
      title: '固定比例跟随',
      dataIndex: 'ratio',
      key: 'ratio',
      width: 120,
      render: (text) => (text != null ? `${text}%` : '-'),
    },
    {
      title: '返佣比例',
      dataIndex: 'commissionRate',
      key: 'commissionRate',
      width: 100,
      render: (text) => (text != null ? `${text}%` : '-'),
    },
    {
      title: '90日收益率',
      dataIndex: 'earningRate',
      key: 'earningRate',
      width: 120,
      render: (text) => (text != null ? `${text}%` : '-'),
    },
    {
      title: '90日收益额',
      dataIndex: 'income',
      key: 'income',
      width: 120,
    },
    {
      title: '初始跟单人数',
      dataIndex: 'initFollowerNum',
      key: 'initFollowerNum',
      width: 120,
    },
    {
      title: '跟单人数',
      dataIndex: 'followerNum',
      key: 'followerNum',
      width: 100,
    },
    {
      title: '带单规模',
      dataIndex: 'scale',
      key: 'scale',
      width: 100,
    },
    {
      title: '带单天数',
      dataIndex: 'day',
      key: 'day',
      width: 100,
    },
    {
      title: '启用状态',
      dataIndex: 'enable',
      key: 'enable',
      width: 100,
      render: (enable) => {
        const status = enableMap[enable] || { color: 'default', text: '未知' };
        return <Tag color={status.color}>{status.text}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
    },
  ];

  // ==================== 搜索配置 ====================

  const searchFieldList = [
    {
      title: '跟单员ID',
      dataIndex: 'merchandiserUserId',
      key: 'SEARCH_LIKE_merchandiserUserId',
      type: 'text',
    },
    {
      title: '交易类型',
      dataIndex: 'tranType',
      key: 'SEARCH_EQ_tranType',
      type: 'select',
      options: [
        { label: '秒合约', value: '0' },
        { label: '合约', value: '1' },
        { label: '现货', value: '2' },
      ],
    },
    {
      title: '启用状态',
      dataIndex: 'enable',
      key: 'SEARCH_EQ_enable',
      type: 'select',
      options: [
        { label: '启用', value: '1' },
        { label: '禁用', value: '2' },
      ],
    },
  ];

  // ==================== 渲染 ====================

  return (
    <div>
      {/* 主列表页面 */}
      <CmBasePage
        columns={columns}
        apiEndpoint="/contract/merchandiser/list"
        apiMethod="get"
        searchFieldList={searchFieldList}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        rowKey="id"
        actionButtons={{
          edit: true,
          delete: true,
        }}
        toolBarExtraButtons={[
          <Button key="follow" type="primary" onClick={handleAddFollowOrder}>
            新增永续跟单
          </Button>,
          <Button key="history" onClick={handleShowHistory}>
            历史带单
          </Button>,
        ]}
      />

      {/* 代理表单弹窗 */}
      <DataForm
        visible={formVisible}
        title={editingRecord ? '编辑代理' : '新增代理'}
        initialValues={{
          compEnable: false,
          fullCompEnable: false,
          enable: true,
          ...editingRecord,
        }}
        extraValues={{ id: editingRecord?.id }}
        onCancel={() => setFormVisible(false)}
        onSubmit={handleSubmit}
        onClosed={() => setEditingRecord(null)}
        loading={loading}
        formType="drawer"
        width="70%"
      >
        {/* 基本信息 */}
        <Divider orientation="left">基本信息</Divider>

        <Form.Item
          name="tranType"
          label="交易类型"
          rules={[{ required: true, message: '请选择交易类型' }]}
        >
          <Select placeholder="请选择交易类型">
            <Option value="0">秒合约</Option>
            <Option value="1">合约</Option>
            <Option value="2">现货</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="merchandiserUserId"
          label="跟单员ID"
          rules={[{ required: true, message: '请输入跟单员ID' }]}
        >
          <Input placeholder="请输入跟单员ID" />
        </Form.Item>

        <Form.Item
          name="name"
          label="跟单员昵称"
          rules={[{ required: true, message: '请输入跟单员昵称' }]}
        >
          <Input placeholder="请输入跟单员昵称" />
        </Form.Item>

        <Form.Item
          name="introduce"
          label="跟单员简介"
          rules={[{ required: true, message: '请输入跟单员简介' }]}
        >
          <TextArea placeholder="请输入跟单员简介" rows={3} />
        </Form.Item>

        <Form.Item
          name="star"
          label="跟单员星级"
          rules={[
            { required: true, message: '请输入跟单员星级' },
            { type: 'number', min: 1, max: 5, message: '星级必须在1-5之间' },
          ]}
        >
          <InputNumber placeholder="请输入跟单员星级" min={1} max={5} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="logo" label="头像">
          <Input placeholder="请输入头像URL" />
        </Form.Item>

        {/* 费率配置 */}
        <Divider orientation="left">费率配置</Divider>

        <Form.Item name="ratio" label="固定比例跟随">
          <InputNumber placeholder="请输入固定比例跟随" min={0} max={100} precision={2} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="thresholdRate" label="门槛比例" rules={[{ type: 'number', min: 0, max: 1, message: '门槛比例必须在0-1之间' }]}>
          <InputNumber placeholder="请输入门槛比例" min={0} max={1} precision={2} step={0.01} style={{ width: '100%' }} />
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="combo1" label="面额1">
              <InputNumber placeholder="面额1" min={0.01} precision={2} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="combo2" label="面额2">
              <InputNumber placeholder="面额2" min={0.01} precision={2} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="combo3" label="面额3">
              <InputNumber placeholder="面额3" min={0.01} precision={2} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="combo4" label="面额4">
              <InputNumber placeholder="面额4" min={0.01} precision={2} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="combo5" label="面额5">
              <InputNumber placeholder="面额5" min={0.01} precision={2} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="combo6" label="面额6">
              <InputNumber placeholder="面额6" min={0.01} precision={2} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="commissionRate" label="返佣比例">
          <InputNumber placeholder="请输入返佣比例" min={0} max={100} precision={2} style={{ width: '100%' }} />
        </Form.Item>

        {/* 收益统计 */}
        <Divider orientation="left">收益统计</Divider>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="earningRate" label="90日收益率">
              <InputNumber placeholder="请输入90日收益率" precision={2} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="income" label="90日收益额">
              <InputNumber placeholder="请输入90日收益额" precision={2} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="initFollowerNum" label="初始跟单人数">
              <InputNumber placeholder="请输入初始跟单人数" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="followerNum" label="跟单人数">
              <InputNumber placeholder="请输入跟单人数" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="scale" label="带单规模">
              <InputNumber placeholder="请输入带单规模" precision={2} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="day" label="带单天数">
              <InputNumber placeholder="请输入带单天数" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="lineImage" label="折线图">
              <Input placeholder="请输入折线图URL" />
            </Form.Item>
          </Col>
        </Row>

        {/* 普通赔付配置 */}
        <Divider orientation="left">普通赔付配置</Divider>

        <Form.Item
          name="compEnable"
          label="是否开启普通赔付"
          valuePropName="checked"
        >
          <Switch checkedChildren="开启" unCheckedChildren="关闭" />
        </Form.Item>

        <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.compEnable !== currentValues.compEnable}>
          {({ getFieldValue }) =>
            getFieldValue('compEnable') ? (
              <Form.Item
                name="compRatio"
                label="普通赔付率"
                rules={[{ type: 'number', min: 0, max: 1, message: '赔付率必须在0-1之间' }]}
              >
                <InputNumber placeholder="请输入普通赔付率" min={0} max={1} precision={2} step={0.01} style={{ width: '100%' }} />
              </Form.Item>
            ) : null
          }
        </Form.Item>

        {/* 百分百赔付配置 */}
        <Divider orientation="left">百分百赔付配置</Divider>

        <Form.Item
          name="fullCompEnable"
          label="是否开启百分百跟单赔付"
          valuePropName="checked"
        >
          <Switch checkedChildren="开启" unCheckedChildren="关闭" />
        </Form.Item>

        <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.fullCompEnable !== currentValues.fullCompEnable}>
          {({ getFieldValue }) =>
            getFieldValue('fullCompEnable') ? (
              <>
                <Form.Item name="fullCompBeginTime" label="开始日期" rules={[{ required: true, message: '请选择开始日期' }]}>
                  <DatePicker showTime style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item name="fullCompMinAmount" label="最少跟单金额" rules={[{ required: true, message: '请输入最少跟单金额' }]}>
                  <InputNumber placeholder="请输入最少跟单金额" min={0} precision={2} style={{ width: '100%' }} />
                </Form.Item>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="fullComp15dMaxNum" label="15天总份额">
                      <InputNumber placeholder="15天总份额" min={0} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="fullComp15dLeftNum" label="15天剩余份额">
                      <InputNumber placeholder="15天剩余份额" min={0} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="fullComp30dMaxNum" label="30天总份额">
                      <InputNumber placeholder="30天总份额" min={0} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="fullComp30dLeftNum" label="30天剩余份额">
                      <InputNumber placeholder="30天剩余份额" min={0} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="fullComp90dMaxNum" label="90天总份额">
                      <InputNumber placeholder="90天总份额" min={0} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="fullComp90dLeftNum" label="90天剩余份额">
                      <InputNumber placeholder="90天剩余份额" min={0} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="fullComp180dMaxNum" label="180天总份额">
                      <InputNumber placeholder="180天总份额" min={0} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="fullComp180dLeftNum" label="180天剩余份额">
                      <InputNumber placeholder="180天剩余份额" min={0} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="fullComp365dMaxNum" label="365天总份额">
                      <InputNumber placeholder="365天总份额" min={0} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="fullComp365dLeftNum" label="365天剩余份额">
                      <InputNumber placeholder="365天剩余份额" min={0} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>
              </>
            ) : null
          }
        </Form.Item>

        {/* 状态配置 */}
        <Divider orientation="left">状态配置</Divider>

        <Form.Item
          name="enable"
          label="启用状态"
          valuePropName="checked"
        >
          <Switch checkedChildren="启用" unCheckedChildren="禁用" />
        </Form.Item>
      </DataForm>

      {/* 永续跟单弹窗 */}
      <DataForm
        visible={followOrderVisible}
        title="新增永续跟单"
        onCancel={() => setFollowOrderVisible(false)}
        onSubmit={handleSaveFollowOrder}
        onClosed={() => {
          followOrderForm.resetFields();
          setProfitData({ profit: 0, fee: 0, followFee: 0 });
        }}
        loading={loading}
        formType="modal"
        width={700}
        footer={
          <>
            <Button onClick={() => setFollowOrderVisible(false)}>取消</Button>
            <Button type="primary" onClick={handleCalculateProfit}>计算盈利</Button>
            <Button type="primary" onClick={handleSaveFollowOrder}>确定</Button>
          </>
        }
      >
        <div style={{ color: 'red', fontSize: '16px', marginBottom: '20px' }}>
          温馨提示：星期天请在中午12点30后带单
        </div>

        <Form form={followOrderForm} layout="vertical">
          <Form.Item name="merchandiserUserId" label="跟单员ID">
            <Input readOnly />
          </Form.Item>

          <Form.Item name="symbol" label="交易对" rules={[{ required: true, message: '请选择交易对' }]}>
            <Select placeholder="请选择交易对">
              <Option value="BTC/USDT">BTC/USDT</Option>
              <Option value="ETH/USDT">ETH/USDT</Option>
              <Option value="BNB/USDT">BNB/USDT</Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="openPrice" label="开仓价" rules={[{ required: true, message: '请输入开仓价' }]}>
                <Input placeholder="请输入开仓价" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="closePrice" label="平仓价" rules={[{ required: true, message: '请输入平仓价' }]}>
                <Input placeholder="请输入平仓价" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="followAmount" label="跟单金额" rules={[{ required: true, message: '请输入跟单金额' }]}>
                <Input placeholder="请输入跟单金额" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="followFeeRate" label="跟单手续费率" rules={[{ required: true, message: '请输入跟单手续费率' }]}>
                <Input placeholder="请输入跟单手续费率" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="leverage" label="杠杆" rules={[{ required: true, message: '请输入杠杆' }]}>
                <Input placeholder="请输入杠杆（如10x）" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="type" label="类型" rules={[{ required: true, message: '请选择类型' }]}>
                <Select placeholder="请选择类型">
                  <Option value="0">做多</Option>
                  <Option value="1">做空</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="openTime" label="开仓时间" rules={[{ required: true, message: '请选择开仓时间' }]}>
                <DatePicker showTime style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="closeTime" label="平仓时间" rules={[{ required: true, message: '请选择平仓时间' }]}>
                <DatePicker showTime style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="fullCompEnable" label="跟单类型" rules={[{ required: true, message: '请选择跟单类型' }]}>
            <Select placeholder="请选择跟单类型">
              <Option value={1}>百分百赔付跟单</Option>
              <Option value={2}>普通跟单</Option>
            </Select>
          </Form.Item>

          <Form.Item label="带单分润">
            <Input value={profitData.followFee} readOnly />
          </Form.Item>

          <Form.Item label="实际利润">
            <Input value={profitData.profit} readOnly />
          </Form.Item>

          <Form.Item label="手续费">
            <Input value={profitData.fee} readOnly />
          </Form.Item>
        </Form>
      </DataForm>

      {/* 历史带单弹窗 */}
      <DataForm
        visible={historyVisible}
        title="历史带单"
        onCancel={() => setHistoryVisible(false)}
        onClosed={() => setHistoryData([])}
        loading={historyLoading}
        formType="modal"
        width="90%"
        footer={<Button onClick={() => setHistoryVisible(false)}>关闭</Button>}
      >
        <CmBasePage
          columns={[
            {
              title: '合约号',
              dataIndex: 'merchandiserUserOrderNo',
              key: 'merchandiserUserOrderNo',
              width: 180,
            },
            {
              title: '类型',
              dataIndex: 'fullCompEnable',
              key: 'fullCompEnable',
              width: 120,
              render: (type) => (
                <Tag color={type === 1 ? 'info' : 'warning'}>
                  {type === 1 ? '普通跟单' : '百分百赔付'}
                </Tag>
              ),
            },
            {
              title: '类型（多/空）',
              dataIndex: 'type',
              key: 'type',
              width: 120,
              render: (type) => (
                <Tag color={type == 0 ? 'success' : 'danger'}>
                  {type == 0 ? '多' : '空'}
                </Tag>
              ),
            },
            {
              title: '交易对',
              dataIndex: 'symbol',
              key: 'symbol',
              width: 120,
            },
            {
              title: '跟单人数',
              dataIndex: 'followCount',
              key: 'followCount',
              width: 100,
            },
            {
              title: '跟单ID',
              dataIndex: 'followIds',
              key: 'followIds',
              width: 180,
              ellipsis: true,
            },
            {
              title: '跟单手续费率',
              dataIndex: 'followFeeRate',
              key: 'followFeeRate',
              width: 120,
              render: (rate) => (rate != null ? `${(rate * 100).toFixed(2)}%` : '-'),
            },
            {
              title: '杠杆',
              dataIndex: 'leverage',
              key: 'leverage',
              width: 80,
              render: (leverage) => (leverage ? `${leverage}x` : '-'),
            },
            {
              title: '开仓时间',
              dataIndex: 'openTime',
              key: 'openTime',
              width: 160,
            },
            {
              title: '平仓时间',
              dataIndex: 'closeTime',
              key: 'closeTime',
              width: 160,
            },
            {
              title: '开仓手续费',
              dataIndex: 'openFee',
              key: 'openFee',
              width: 120,
            },
            {
              title: '平仓手续费',
              dataIndex: 'sellFee',
              key: 'sellFee',
              width: 120,
            },
            {
              title: '盈亏金额',
              dataIndex: 'earn',
              key: 'earn',
              width: 120,
            },
          ]}
          dataSource={historyData}
          loading={historyLoading}
          rowKey="id"
          pagination={{
            defaultPageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
          searchVisible={false}
          actionButtons={{ view: false, edit: false, delete: false }}
        />
      </DataForm>
    </div>
  );
};

export default AgentPage;
