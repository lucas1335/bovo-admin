import React, { useState, useEffect } from 'react';
import { message, Form, Select, DatePicker, Input, Button, Card, Row, Col } from 'antd';
import dayjs from 'dayjs';
import { getSpontaneousCoinNewList, createKlineData } from '@api/modules/spontaneousCoin';

const { RangePicker } = DatePicker;
const { Option } = Select;

/**
 * 创建K线页面
 * 功能：K线数据生成配置
 */
const CreateKlinePage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [symbolList, setSymbolList] = useState([]); // 币种列表

  // 颗粒度选项
  const intervalList = [
    { label: '1分钟', value: '1m' },
    { label: '5分钟', value: '5m' },
    { label: '15分钟', value: '15m' },
    { label: '30分钟', value: '30m' },
    { label: '1小时', value: '1h' },
    { label: '2小时', value: '2h' },
    { label: '1天', value: '1d' }
  ];

  /**
   * 获取币种列表
   */
  const fetchSymbolList = async () => {
    try {
      const response = await getSpontaneousCoinNewList({
        pageNum: 1,
        pageSize: 999
      });

      if (response.code === 0 || response.code === 200) {
        setSymbolList(response.rows || response.data?.rows || response.data?.list || []);
      }
    } catch (error) {
      console.error('获取币种列表失败:', error);
    }
  };

  useEffect(() => {
    fetchSymbolList();
  }, []);

  /**
   * 查询/生成K线数据
   */
  const handleQuery = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const requestParams = {
        symbol: values.symbol,
        interval: values.interval,
        startTime: values.startTime ? values.startTime.format('YYYY-MM-DD HH:mm:ss') : undefined,
        endTime: values.endTime ? values.endTime.format('YYYY-MM-DD HH:mm:ss') : undefined,
        currentPrice: values.currentPrice
      };

      const response = await createKlineData(requestParams);

      if (response.code === 0 || response.code === 200) {
        message.success('K线数据生成成功');
      } else {
        message.error(response.msg || '操作失败');
      }
    } catch (error) {
      if (error.errorFields) {
        message.warning('请填写必填项');
      } else {
        message.error('操作失败: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * 重置表单
   */
  const handleReset = () => {
    form.resetFields();
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card title="K线数据生成" bordered={false}>
        <Form
          form={form}
          layout="vertical"
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="symbol"
                label="币种"
                rules={[{ required: true, message: '请选择币种' }]}
              >
                <Select placeholder="请选择币种" allowClear>
                  {symbolList.map(item => (
                    <Option key={item.id} value={item.coin}>
                      {item.coin}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name="interval"
                label="颗粒度"
                rules={[{ required: true, message: '请选择颗粒度' }]}
              >
                <Select placeholder="请选择颗粒度" allowClear>
                  {intervalList.map(item => (
                    <Option key={item.value} value={item.value}>
                      {item.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name="currentPrice"
                label="截至价格"
              >
                <Input placeholder="请输入截至价格" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startTime"
                label="起始时间"
                rules={[{ required: true, message: '请选择起始时间' }]}
              >
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  placeholder="请选择起始时间"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="endTime"
                label="截至时间"
                rules={[{ required: true, message: '请选择截至时间' }]}
              >
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  placeholder="请选择截至时间"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Button type="primary" onClick={handleQuery} loading={loading}>
              确定
            </Button>
            <Button onClick={handleReset} style={{ marginLeft: 8 }}>
              重置
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateKlinePage;
