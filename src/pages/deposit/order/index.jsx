import React, { useState, useEffect } from 'react';
import { message, Form, Input, Button, Card, Spin } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getRechargeOrderDetail } from '@api/modules/recharge';

/**
 * 充值订单详情页面
 * 功能：展示充值订单的详细信息
 */
const DepositOrderPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);

  // 从URL参数获取订单ID
  const orderId = searchParams.get('id');

  // 加载订单详情
  useEffect(() => {
    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId]);

  const fetchOrderDetail = async () => {
    setLoading(true);
    try {
      const response = await getRechargeOrderDetail({ id: orderId });
      if (response.code === 0 || response.code === 200) {
        setOrderData(response.data);
        form.setFieldsValue(response.data);
      } else {
        message.error(response.msg || '获取订单详情失败');
      }
    } catch (error) {
      message.error('获取订单详情失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate('/deposit/recharge');
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  return (
    <div style={{ margin: '100px auto', width: '800px' }}>
      <Card
        title="充值订单详情"
        extra={
          <Button type="primary" onClick={handleGoBack}>
            返回
          </Button>
        }
      >
        <Form
          form={form}
          layout="vertical"
          disabled
        >
          <Form.Item
            name="address"
            label="充值地址"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="serialId"
            label="订单号"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="amount"
            label="充值金额"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="realAmount"
            label="实际充值金额"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="remark"
            label="备注"
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          {/* 隐藏字段 */}
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="userId" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="username" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="coin" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="type" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="status" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="createTime" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="operateTime" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="fileName" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="rechargeRemark" hidden>
            <Input />
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default DepositOrderPage;
