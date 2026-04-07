import React, { useState, useMemo } from 'react';
import { message, Tag, Form, Input, Select, Button, Modal, InputNumber, Space, Popconfirm } from 'antd';
import CmBasePage from '@components/CmBasePage';
import { EyeOutlined } from '@ant-design/icons';
import { getAssetList, deleteAsset, freezeAsset, adjustAsset } from '@api';

const { Option } = Select;
const { TextArea } = Input;

/**
 * 用户资产管理页面
 * 功能：资产列表展示、搜索、冻结/解冻、资产调整
 */
const AssetPage = () => {
  const [formVisible, setFormVisible] = useState(false);
  const [freezeModalVisible, setFreezeModalVisible] = useState(false);
  const [adjustModalVisible, setAdjustModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [freezeForm] = Form.useForm();
  const [adjustForm] = Form.useForm();

  /**
   * 刷新表格
   */
  const refreshTable = () => {
    document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
      new CustomEvent('reload')
    );
  };

  /**
   * 查看详情
   */
  const handleView = (record) => {
    setCurrentRecord(record);
    setFormVisible(true);
  };

  /**
   * 删除资产
   */
  const handleDelete = async (record) => {
    try {
      const response = await deleteAsset(record.userId);
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
   * 打开冻结/解冻弹窗
   */
  const handleFreeze = (record) => {
    setCurrentRecord(record);
    freezeForm.resetFields();
    freezeForm.setFieldsValue({
      userId: record.userId,
      symbol: record.symbol,
      operation: 'freeze',
    });
    setFreezeModalVisible(true);
  };

  /**
   * 提交冻结/解冻操作
   */
  const handleFreezeSubmit = async () => {
    try {
      const values = await freezeForm.validateFields();
      setLoading(true);
      const response = await freezeAsset(values);
      if (response.code === 0 || response.code === 200) {
        message.success('操作成功');
        setFreezeModalVisible(false);
        refreshTable();
      } else {
        message.error(response.msg || '操作失败');
      }
    } catch (error) {
      if (error.errorFields) {
        // 表单验证失败
        return;
      }
      message.error('操作失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 打开资产调整弹窗
   */
  const handleAdjust = (record) => {
    setCurrentRecord(record);
    adjustForm.resetFields();
    adjustForm.setFieldsValue({
      userId: record.userId,
      symbol: record.symbol,
      operation: 'add',
    });
    setAdjustModalVisible(true);
  };

  /**
   * 提交资产调整操作
   */
  const handleAdjustSubmit = async () => {
    try {
      const values = await adjustForm.validateFields();
      setLoading(true);
      const response = await adjustAsset(values);
      if (response.code === 0 || response.code === 200) {
        message.success('调整成功');
        setAdjustModalVisible(false);
        refreshTable();
      } else {
        message.error(response.msg || '调整失败');
      }
    } catch (error) {
      if (error.errorFields) {
        // 表单验证失败
        return;
      }
      message.error('调整失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 资产类型映射
  const typeMap = {
    0: { color: 'blue', text: '现货' },
    1: { color: 'green', text: '合约' },
    2: { color: 'orange', text: '理财' },
  };

  // 自定义操作列
  const actionColumn = useMemo(() => ({
    title: '操作',
    key: 'action',
    width: 280,
    fixed: 'right',
    render: (_, record) => (
      <Space size="small">
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleView(record)}
        >
          查看
        </Button>
        <Button
          type="link"
          size="small"
          onClick={() => handleFreeze(record)}
        >
          冻结/解冻
        </Button>
        <Button
          type="link"
          size="small"
          onClick={() => handleAdjust(record)}
        >
          资产调整
        </Button>
        <Popconfirm
          title="删除确认"
          description="确定要删除这条资产记录吗？"
          onConfirm={() => handleDelete(record)}
          okText="确定"
          cancelText="取消"
        >
          <Button
            type="link"
            size="small"
            danger
          >
            删除
          </Button>
        </Popconfirm>
      </Space>
    ),
  }), []);

  const columns = [
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 100,
      sorter: true,
    },
    {
      title: '地址',
      dataIndex: 'adress',
      key: 'adress',
      width: 200,
      ellipsis: true,
    },
    {
      title: '币种',
      dataIndex: 'symbol',
      key: 'symbol',
      width: 100,
      sorter: true,
    },
    {
      title: '资产类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type) => {
        const status = typeMap[type] || { color: 'default', text: '未知' };
        return <Tag color={status.color}>{status.text}</Tag>;
      },
    },
    {
      title: '资产总额',
      dataIndex: 'amout',
      key: 'amout',
      width: 130,
      render: (amount) => amount ? Number(amount).toFixed(8) : '0.00000000',
    },
    {
      title: '占用资产',
      dataIndex: 'occupiedAmount',
      key: 'occupiedAmount',
      width: 130,
      render: (amount) => amount ? Number(amount).toFixed(8) : '0.00000000',
    },
    {
      title: '可用资产',
      dataIndex: 'availableAmount',
      key: 'availableAmount',
      width: 130,
      render: (amount) => amount ? Number(amount).toFixed(8) : '0.00000000',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 150,
      ellipsis: true,
    },
    actionColumn,
  ];

  // 搜索字段配置
  const searchFieldList = [
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'SEARCH_EQ_userId',
      type: 'text',
    },
    {
      title: '资产类型',
      dataIndex: 'type',
      key: 'SEARCH_EQ_type',
      type: 'select',
      options: [
        { label: '现货', value: 0 },
        { label: '合约', value: 1 },
        { label: '理财', value: 2 },
      ],
    },
    {
      title: '币种',
      dataIndex: 'symbol',
      key: 'SEARCH_LIKE_symbol',
      type: 'text',
    },
    {
      title: '地址',
      dataIndex: 'adress',
      key: 'SEARCH_LIKE_adress',
      type: 'text',
    },
    {
      title: '资产总额(最小)',
      dataIndex: 'amoutMin',
      key: 'SEARCH_GTE_amout',
      type: 'digit',
    },
    {
      title: '资产总额(最大)',
      dataIndex: 'amoutMax',
      key: 'SEARCH_LTE_amout',
      type: 'digit',
    },
    {
      title: '占用资产(最小)',
      dataIndex: 'occupiedAmountMin',
      key: 'SEARCH_GTE_occupiedAmount',
      type: 'digit',
    },
    {
      title: '占用资产(最大)',
      dataIndex: 'occupiedAmountMax',
      key: 'SEARCH_LTE_occupiedAmount',
      type: 'digit',
    },
    {
      title: '可用资产(最小)',
      dataIndex: 'availableAmountMin',
      key: 'SEARCH_GTE_availableAmount',
      type: 'digit',
    },
    {
      title: '可用资产(最大)',
      dataIndex: 'availableAmountMax',
      key: 'SEARCH_LTE_availableAmount',
      type: 'digit',
    },
    {
      title: '创建时间(开始)',
      dataIndex: 'startTime',
      key: 'SEARCH_GTE_createTime',
      type: 'date',
    },
    {
      title: '创建时间(结束)',
      dataIndex: 'endTime',
      key: 'SEARCH_LTE_createTime',
      type: 'date',
    },
  ];

  return (
    <div>
      <CmBasePage
        columns={columns}
        apiEndpoint="/asset/appAsset/list"
        apiMethod="get"
        searchFieldList={searchFieldList}
        actionButtons={{ view: false, edit: false, delete: false }}
        rowKey="userId"
      />

      {/* 查看详情弹窗 */}
      <Modal
        title="资产详情"
        open={formVisible}
        onCancel={() => setFormVisible(false)}
        footer={[
          <Button key="close" onClick={() => setFormVisible(false)}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        {currentRecord && (
          <Form labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
            <Form.Item label="用户ID">
              <span>{currentRecord.userId}</span>
            </Form.Item>
            <Form.Item label="地址">
              <span>{currentRecord.adress}</span>
            </Form.Item>
            <Form.Item label="币种">
              <span>{currentRecord.symbol}</span>
            </Form.Item>
            <Form.Item label="资产类型">
              <Tag color={typeMap[currentRecord.type]?.color || 'default'}>
                {typeMap[currentRecord.type]?.text || '未知'}
              </Tag>
            </Form.Item>
            <Form.Item label="资产总额">
              <span>{currentRecord.amout ? Number(currentRecord.amout).toFixed(8) : '0.00000000'}</span>
            </Form.Item>
            <Form.Item label="占用资产">
              <span>{currentRecord.occupiedAmount ? Number(currentRecord.occupiedAmount).toFixed(8) : '0.00000000'}</span>
            </Form.Item>
            <Form.Item label="可用资产">
              <span>{currentRecord.availableAmount ? Number(currentRecord.availableAmount).toFixed(8) : '0.00000000'}</span>
            </Form.Item>
            <Form.Item label="创建时间">
              <span>{currentRecord.createTime}</span>
            </Form.Item>
            <Form.Item label="备注">
              <span>{currentRecord.remark || '-'}</span>
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* 冻结/解冻弹窗 */}
      <Modal
        title="冻结/解冻资产"
        open={freezeModalVisible}
        onOk={handleFreezeSubmit}
        onCancel={() => setFreezeModalVisible(false)}
        confirmLoading={loading}
        width={500}
      >
        <Form form={freezeForm} labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
          <Form.Item
            name="userId"
            label="用户ID"
            rules={[{ required: true, message: '请输入用户ID' }]}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="symbol"
            label="币种"
            rules={[{ required: true, message: '请输入币种' }]}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="operation"
            label="操作类型"
            rules={[{ required: true, message: '请选择操作类型' }]}
          >
            <Select>
              <Option value="freeze">冻结</Option>
              <Option value="unfreeze">解冻</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="amount"
            label="金额"
            rules={[
              { required: true, message: '请输入金额' },
              { type: 'number', min: 0, message: '金额不能为负数' },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="请输入金额"
              precision={8}
              min={0}
            />
          </Form.Item>
          <Form.Item
            name="remark"
            label="备注"
            rules={[{ required: true, message: '请输入备注' }]}
          >
            <TextArea rows={3} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 资产调整弹窗 */}
      <Modal
        title="资产调整"
        open={adjustModalVisible}
        onOk={handleAdjustSubmit}
        onCancel={() => setAdjustModalVisible(false)}
        confirmLoading={loading}
        width={500}
      >
        <Form form={adjustForm} labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
          <Form.Item
            name="userId"
            label="用户ID"
            rules={[{ required: true, message: '请输入用户ID' }]}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="symbol"
            label="币种"
            rules={[{ required: true, message: '请输入币种' }]}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="operation"
            label="操作类型"
            rules={[{ required: true, message: '请选择操作类型' }]}
          >
            <Select>
              <Option value="add">增加</Option>
              <Option value="reduce">减少</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="amount"
            label="金额"
            rules={[
              { required: true, message: '请输入金额' },
              { type: 'number', min: 0, message: '金额不能为负数' },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="请输入金额"
              precision={8}
              min={0}
            />
          </Form.Item>
          <Form.Item
            name="remark"
            label="备注"
            rules={[{ required: true, message: '请输入备注' }]}
          >
            <TextArea rows={3} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AssetPage;
