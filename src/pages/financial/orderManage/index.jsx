import React, { useState } from 'react';
import { message, Tag, Form, Input, InputNumber, DatePicker, Popconfirm } from 'antd';
import dayjs from 'dayjs';
import CmBasePage from '@components/CmBasePage';
import DataForm from '@components/DataForm';
import { getFinancialOrderList, getFinancialOrderDetail, saveFinancialOrder, updateFinancialOrder, deleteFinancialOrder, reCallFinancialOrder } from '@api/modules/financial';

/**
 * 理财订单管理页面
 * 功能：理财订单列表展示、搜索、删除、赎回
 */
const OrderManagePage = () => {
  const [formVisible, setFormVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);

  /**
   * 编辑订单
   */
  const handleEdit = async (record) => {
    try {
      const response = await getFinancialOrderDetail(record.id);
      if (response.code === 0 || response.code === 200) {
        // 处理日期格式
        const orderData = {
          ...response.data,
          createTime: response.data.createTime ? dayjs(response.data.createTime) : null,
          endTime: response.data.endTime ? dayjs(response.data.endTime) : null,
        };
        setEditingRecord(orderData);
        setFormVisible(true);
      } else {
        message.error(response.msg || '获取订单详情失败');
      }
    } catch (error) {
      message.error('获取订单详情失败: ' + error.message);
    }
  };

  /**
   * 删除订单
   */
  const handleDelete = async (record) => {
    try {
      const response = await deleteFinancialOrder(record.id);
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
   * 赎回订单
   */
  const handleReCall = async (record) => {
    try {
      const response = await reCallFinancialOrder(record.id);
      if (response.code === 0 || response.code === 200) {
        message.success('设置成功');
        refreshTable();
      } else {
        message.error(response.msg || '操作失败');
      }
    } catch (error) {
      message.error('操作失败: ' + error.message);
    }
  };

  /**
   * 提交表单
   */
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // 处理日期格式
      const formData = {
        ...values,
        createTime: values.createTime ? values.createTime.format('YYYY-MM-DD') : null,
        endTime: values.endTime ? values.endTime.format('YYYY-MM-DD') : null,
      };

      const response = editingRecord
        ? await updateFinancialOrder(formData)
        : await saveFinancialOrder(formData);

      if (response.code === 0 || response.code === 200) {
        message.success(editingRecord ? '修改成功' : '新增成功');
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
   * 刷新表格数据
   */
  const refreshTable = () => {
    document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
      new CustomEvent('reload')
    );
  };

  /**
   * 订单状态映射
   */
  const statusMap = {
    0: { color: 'processing', text: '收益中' },
    1: { color: 'success', text: '已结算' },
    2: { color: 'default', text: '已赎回' },
  };

  /**
   * 类型映射
   */
  const typeMap = {
    0: '质押挖矿',
    1: '非质押挖矿',
  };

  /**
   * 复制订单号
   */
  const copyOrderNo = (orderNo) => {
    navigator.clipboard.writeText(orderNo).then(() => {
      message.success('复制成功');
    }).catch(() => {
      message.error('复制失败');
    });
  };

  /**
   * 列配置定义
   */
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: true,
    },
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 100,
    },
    {
      title: '订单编号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 150,
      render: (orderNo) => (
        <a onClick={() => copyOrderNo(orderNo)} style={{ cursor: 'pointer' }}>
          {orderNo}
        </a>
      ),
    },
    {
      title: '投资金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (amount) => `¥${parseFloat(amount || 0).toFixed(2)}`,
    },
    {
      title: '投资期限',
      dataIndex: 'days',
      key: 'days',
      width: 100,
      render: (days) => `${days}天`,
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusInfo = statusMap[status] || { color: 'default', text: '未知' };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
    },
    {
      title: '产品ID',
      dataIndex: 'planId',
      key: 'planId',
      width: 100,
    },
    {
      title: '产品名称',
      dataIndex: 'planTitle',
      key: 'planTitle',
      width: 150,
      ellipsis: true,
    },
    {
      title: '结算时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
      render: (time) => time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: '到期时间',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 160,
      render: (time) => time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: '累计收益',
      dataIndex: 'accumulaEarn',
      key: 'accumulaEarn',
      width: 120,
      render: (earn) => `¥${parseFloat(earn || 0).toFixed(2)}`,
    },
    {
      title: '最小利率(%)',
      dataIndex: 'minOdds',
      key: 'minOdds',
      width: 120,
      render: (odds) => `${odds || 0}%`,
    },
    {
      title: '最大利率(%)',
      dataIndex: 'maxOdds',
      key: 'maxOdds',
      width: 120,
      render: (odds) => `${odds || 0}%`,
    },
    {
      title: '违约利率(%)',
      dataIndex: 'defaultOdds',
      key: 'defaultOdds',
      width: 120,
      render: (odds) => `${odds || 0}%`,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => typeMap[type] || '-',
    },
  ];

  /**
   * 搜索字段配置
   */
  const searchFieldList = [
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'SEARCH_EQ_userId',
      type: 'text',
    },
    {
      title: '产品ID',
      dataIndex: 'planId',
      key: 'SEARCH_EQ_planId',
      type: 'text',
    },
    {
      title: '产品名称',
      dataIndex: 'planTitle',
      key: 'SEARCH_LIKE_planTitle',
      type: 'text',
    },
    {
      title: '订单编号',
      dataIndex: 'orderNo',
      key: 'SEARCH_LIKE_orderNo',
      type: 'text',
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      key: 'SEARCH_EQ_status',
      type: 'select',
      options: [
        { label: '收益中', value: '0' },
        { label: '已结算', value: '1' },
        { label: '已赎回', value: '2' },
      ],
    },
  ];

  /**
   * 自定义操作列
   */
  const renderActions = (text, record) => {
    const actions = [];

    // 赎回按钮（仅在订单状态为收益中时显示，且根据环境变量判断）
    if (record.status === 0) {
      actions.push(
        <Popconfirm
          key="recall"
          title="是否同意用户赎回？"
          onConfirm={() => handleReCall(record)}
          okText="同意"
          cancelText="不同意"
        >
          <a style={{ marginRight: 8 }}>赎回</a>
        </Popconfirm>
      );
    }

    // 删除按钮
    actions.push(
      <a key="delete" onClick={() => handleDelete(record)} style={{ color: '#ff4d4f' }}>
        删除
      </a>
    );

    return actions;
  };

  return (
    <div>
      {/* 理财订单列表 */}
      <CmBasePage
        columns={columns}
        apiEndpoint="/contract/mineOrder/list"
        apiMethod="get"
        searchFieldList={searchFieldList}
        onEdit={handleEdit}
        onDelete={handleDelete}
        actionButtons={{
          view: false,
          edit: true,
          delete: true,
        }}
        rowKey="id"
        renderActions={renderActions}
      />

      {/* 订单表单 */}
      <DataForm
        visible={formVisible}
        title={editingRecord ? '修改理财订单' : '添加理财订单'}
        initialValues={editingRecord || {}}
        extraValues={{ id: editingRecord?.id }}
        onCancel={() => setFormVisible(false)}
        onSubmit={handleSubmit}
        onClosed={() => setEditingRecord(null)}
        loading={loading}
        formType="modal"
        width="600px"
      >
        <Form.Item
          name="amount"
          label="投资金额"
          rules={[{ required: true, message: '投资金额不能为空' }]}
        >
          <InputNumber placeholder="请输入投资金额" min={0} step={0.01} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="days"
          label="投资期限"
          rules={[{ required: true, message: '投资期限不能为空' }]}
        >
          <InputNumber placeholder="请输入投资期限" min={1} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="planId"
          label="产品ID"
          rules={[{ required: true, message: '产品ID不能为空' }]}
        >
          <Input placeholder="请输入产品ID" />
        </Form.Item>

        <Form.Item
          name="planTitle"
          label="产品名称"
          rules={[{ required: true, message: '产品名称不能为空' }]}
        >
          <Input placeholder="请输入产品名称" />
        </Form.Item>

        <Form.Item
          name="orderNo"
          label="订单编号"
          rules={[{ required: true, message: '订单编号不能为空' }]}
        >
          <Input placeholder="请输入订单编号" />
        </Form.Item>

        <Form.Item
          name="endTime"
          label="到期时间"
        >
          <DatePicker
            placeholder="请选择到期时间"
            style={{ width: '100%' }}
            format="YYYY-MM-DD"
          />
        </Form.Item>

        <Form.Item
          name="createTime"
          label="结算时间"
        >
          <DatePicker
            placeholder="请选择结算时间"
            style={{ width: '100%' }}
            format="YYYY-MM-DD"
          />
        </Form.Item>

        <Form.Item
          name="accumulaEarn"
          label="累计收益"
        >
          <InputNumber placeholder="请输入累计收益" min={0} step={0.01} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="minOdds"
          label="最小利率(%)"
        >
          <InputNumber placeholder="请输入最小利率" min={0} step={0.01} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="maxOdds"
          label="最大利率(%)"
        >
          <InputNumber placeholder="请输入最大利率" min={0} step={0.01} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="defaultOdds"
          label="违约利率(%)"
        >
          <InputNumber placeholder="请输入违约利率" min={0} step={0.01} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="adminUserId"
          label="后台用户ID"
        >
          <Input placeholder="请输入后台用户ID" />
        </Form.Item>

        <Form.Item
          name="userId"
          label="用户ID"
        >
          <Input placeholder="请输入用户ID" />
        </Form.Item>

        <Form.Item
          name="orderAmount"
          label="订单金额"
        >
          <InputNumber placeholder="请输入订单金额" min={0} step={0.01} style={{ width: '100%' }} />
        </Form.Item>
      </DataForm>
    </div>
  );
};

export default OrderManagePage;
