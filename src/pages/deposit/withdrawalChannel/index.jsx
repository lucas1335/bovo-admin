import React, { useState, useEffect } from 'react';
import { message, Button, Form, Input, InputNumber, Select, Switch, Modal, Tag } from 'antd';
import CmBasePage from '@components/CmBasePage';
import { PlusOutlined } from '@ant-design/icons';
import {
  getConfigSetting,
  saveConfigSetting
} from '@api/modules/withdraw';

/**
 * 提现通道管理页面
 * 功能：提现通道配置的增删改查
 */
const WithdrawalChannelPage = () => {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [modalTitle, setModalTitle] = useState('');
  const [operationType, setOperationType] = useState(0); // 1: 新增, 2: 修改

  // 提现类型选项
  const typeOptions = [
    { label: '数字货币', value: '0' },
    { label: '银行卡', value: '1' }
  ];

  // 加载所有数据（不设置状态）
  const fetchAllData = async () => {
    try {
      const response = await getConfigSetting('WITHDRAWAL_CHANNEL_SETTING');
      if (response.code === 0 || response.code === 200) {
        return response.data || [];
      }
      return [];
    } catch (error) {
      message.error('获取提现通道配置失败: ' + error.message);
      return [];
    }
  };


  // 打开新增对话框
  const handleAdd = () => {
    setOperationType(1);
    setModalTitle('新增提现通道配置');
    setCurrentRecord(null);
    form.resetFields();
    form.setFieldsValue({ status: '1', type: '0' });
    setModalVisible(true);
  };

  // 打开修改对话框
  const handleEdit = (record, index) => {
    setOperationType(2);
    setModalTitle('修改提现通道配置');
    setCurrentRecord({ ...record, index });
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // 验证审批额度
      if (values.audit && values.walletAuditVal && Number(values.walletAuditVal) <= Number(values.audit)) {
        message.error('触发审批额度必须小于触发钱包审批额度');
        return;
      }

      // 验证数字格式并转换为数字类型
      const numberFields = ['audit', 'walletAuditVal', 'withdrawalMix', 'withdrawalMax', 'fee', 'ratio'];
      numberFields.forEach(field => {
        if (values[field] !== undefined && values[field] !== null && values[field] !== '') {
          values[field] = Number(values[field]);
        }
      });

      // 验证正整数
      if (values.dayWithdrawalNum && (!Number.isInteger(Number(values.dayWithdrawalNum)) || Number(values.dayWithdrawalNum) <= 0)) {
        message.error('每日提现次数必须为正整数');
        return;
      }

      if (values.freeNum && (!Number.isInteger(Number(values.freeNum)) || Number(values.freeNum) < 0)) {
        message.error('免费提现次数必须为非负整数');
        return;
      }

      setLoading(true);

      if (operationType === 2) {
        // 修改
        const allData = await fetchAllData();
        const updatedData = allData.map((item, idx) =>
          (idx === currentRecord.index) ? values : item
        );

        const response = await saveConfigSetting('WITHDRAWAL_CHANNEL_SETTING', updatedData);

        if (response.code === 0 || response.code === 200) {
          message.success('修改成功');
          setModalVisible(false);
          refreshTable();
        } else {
          message.error(response.msg || '修改失败');
        }
      } else {
        // 新增
        // 检查是否重复
        const allData = await fetchAllData();
        const isDuplicate = allData.some(item => item.rechargeName === values.rechargeName);
        if (isDuplicate) {
          message.error('已存在重复币种');
          setLoading(false);
          return;
        }

        const updatedData = [...allData, values];

        const response = await saveConfigSetting('WITHDRAWAL_CHANNEL_SETTING', updatedData);

        if (response.code === 0 || response.code === 200) {
          message.success('新增成功');
          setModalVisible(false);
          refreshTable();
        } else {
          message.error(response.msg || '新增失败');
        }
      }
    } catch (error) {
      if (error.errorFields) {
        message.warning('请检查表单填写');
      } else {
        message.error('操作失败: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // 数字输入框格式化
  const formatNumber = (value) => {
    if (!value) return value;
    // 只允许数字和小数点，最多3位小数
    const str = value.toString();
    const match = str.match(/^\D*(\d*(?:\.\d{0,3})?).*$/);
    return match ? match[1] : '';
  };

  // 列配置
  const columns = [
    {
      title: '展示名称',
      dataIndex: 'rechargeName',
      key: 'rechargeName',
      width: 120
    },
    {
      title: '提现币种',
      dataIndex: 'rechargeType',
      key: 'rechargeType',
      width: 120
    },
    {
      title: '触发审批额度',
      dataIndex: 'audit',
      key: 'audit',
      width: 120,
      render: (text) => text ? Number(text).toFixed(3) : '-'
    },
    {
      title: '触发钱包审批额度',
      dataIndex: 'walletAuditVal',
      key: 'walletAuditVal',
      width: 150,
      render: (text) => text !== undefined ? Number(text).toFixed(3) : '-'
    },
    {
      title: '提现状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === '1' ? 'blue' : 'default'}>
          {status === '1' ? '开启' : '关闭'}
        </Tag>
      )
    },
    {
      title: '提现类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type) => (
        <span>{type === '0' ? '数字货币' : type === '1' ? '银行卡' : '-'}</span>
      )
    },
    {
      title: '提现范围',
      dataIndex: 'withdrawalMix',
      key: 'withdrawalMix',
      width: 120,
      render: (_, record) => (
        <span>{record.withdrawalMix} ~ {record.withdrawalMax}</span>
      )
    },
    {
      title: '固定手续费',
      dataIndex: 'fee',
      key: 'fee',
      width: 100,
      render: (text) => text ? Number(text).toFixed(3) : '-'
    },
    {
      title: '手续费率(%)',
      dataIndex: 'ratio',
      key: 'ratio',
      width: 100,
      render: (text) => text ? Number(text).toFixed(3) : '-'
    },
    {
      title: '次数限制(日)',
      dataIndex: 'dayWithdrawalNum',
      key: 'dayWithdrawalNum',
      width: 120
    },
    {
      title: '免费提现次数',
      dataIndex: 'freeNum',
      key: 'freeNum',
      width: 120
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record, index) => (
        <Button
          type="link"
          size="small"
          onClick={() => handleEdit(record, index)}
        >
          修改
        </Button>
      )
    }
  ];

  // 刷新表格
  const refreshTable = () => {
    document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
      new CustomEvent('reload')
    );
  };

  return (
    <div>
      <CmBasePage
        columns={columns}
        onLoadData={async () => {
          setLoading(true);
          try {
            const response = await getConfigSetting('WITHDRAWAL_CHANNEL_SETTING');
            if (response.code === 0 || response.code === 200) {
              const data = response.data || [];
              return {
                data: data,
                success: true,
                total: data.length
              };
            }
            return {
              data: [],
              success: false,
              total: 0
            };
          } catch (error) {
            message.error('获取提现通道配置失败: ' + error.message);
            return {
              data: [],
              success: false,
              total: 0
            };
          } finally {
            setLoading(false);
          }
        }}
        loading={loading}
        actionButtons={{
          add: true,
          edit: false,
          delete: false
        }}
        onAdd={handleAdd}
        rowKey={(record, index) => index}
        searchVisible={false}
      />

      {/* 新增/修改对话框 */}
      <Modal
        title={modalTitle}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        confirmLoading={loading}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          preserve={false}
        >
          <Form.Item
            name="rechargeType"
            label="提现币种"
            rules={[{ required: true, message: '提现币种不能为空' }]}
          >
            <Input
              placeholder="请输入提现币种"
              disabled={operationType === 2}
            />
          </Form.Item>

          <Form.Item
            name="rechargeName"
            label="展示名称"
            rules={[{ required: true, message: '展示名称不能为空' }]}
          >
            <Input
              placeholder="请输入展示名称"
              disabled={operationType === 2}
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="提现状态"
            valuePropName="checked"
          >
            <Switch
              checkedChildren="开启"
              unCheckedChildren="关闭"
              checkedValue="1"
              unCheckedValue="0"
            />
          </Form.Item>

          <Form.Item
            name="type"
            label="选择提现类型"
            rules={[{ required: true, message: '提现类型不能为空' }]}
          >
            {operationType === 2 ? (
              <Input
                value={typeOptions.find(t => t.value === form.getFieldValue('type'))?.label}
                disabled
              />
            ) : (
              <Select
                placeholder="请选择提现类型"
                options={typeOptions}
              />
            )}
          </Form.Item>

          <Form.Item
            name="audit"
            label="触发审批额度"
            rules={[
              { required: true, message: '触发审批额度不能为空' },
              {
                validator: (_, value) => {
                  if (value && form.getFieldValue('walletAuditVal') && Number(value) >= Number(form.getFieldValue('walletAuditVal'))) {
                    return Promise.reject('触发审批额度必须小于触发钱包审批额度');
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Input
              placeholder="请输入触发审批额度(0.001)"
              onChange={(e) => {
                const value = formatNumber(e.target.value);
                form.setFieldsValue({ audit: value });
                if (value) form.validateFields(['walletAuditVal']);
              }}
            />
          </Form.Item>

          <Form.Item
            name="walletAuditVal"
            label="触发钱包审批额度"
            rules={[
              { required: true, message: '触发钱包审批额度不能为空' },
              {
                validator: (_, value) => {
                  if (value && form.getFieldValue('audit') && Number(value) <= Number(form.getFieldValue('audit'))) {
                    return Promise.reject('触发钱包审批额度必须大于触发审批额度');
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Input
              placeholder="请输入触发钱包审批额度(0.001)"
              onChange={(e) => {
                const value = formatNumber(e.target.value);
                form.setFieldsValue({ walletAuditVal: value });
                if (value) form.validateFields(['audit']);
              }}
            />
          </Form.Item>

          <Form.Item
            name="withdrawalMix"
            label="最小限制"
            rules={[{ required: true, message: '最小限制不能为空' }]}
          >
            <Input
              placeholder="请输入最小限制金额(0.001)"
              onChange={(e) => {
                const value = formatNumber(e.target.value);
                form.setFieldsValue({ withdrawalMix: value });
              }}
            />
          </Form.Item>

          <Form.Item
            name="withdrawalMax"
            label="最大限制"
            rules={[{ required: true, message: '最大限制不能为空' }]}
          >
            <Input
              placeholder="请输入最大限制金额(0.001)"
              onChange={(e) => {
                const value = formatNumber(e.target.value);
                form.setFieldsValue({ withdrawalMax: value });
              }}
            />
          </Form.Item>

          <Form.Item
            name="fee"
            label="固定手续费"
            rules={[{ required: true, message: '固定手续费不能为空' }]}
          >
            <Input
              placeholder="请输入固定手续费(0.001)"
              onChange={(e) => {
                const value = formatNumber(e.target.value);
                form.setFieldsValue({ fee: value });
              }}
            />
          </Form.Item>

          <Form.Item
            name="ratio"
            label="手续费率"
            rules={[{ required: true, message: '手续费率不能为空' }]}
          >
            <Input
              placeholder="请输入手续费率(0.001)"
              onChange={(e) => {
                const value = formatNumber(e.target.value);
                form.setFieldsValue({ ratio: value });
              }}
            />
          </Form.Item>

          <Form.Item
            name="dayWithdrawalNum"
            label="次数限制(日)"
            rules={[{ required: true, message: '每日提现次数不能为空' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="请输入每日可提现次数"
              min={1}
              precision={0}
            />
          </Form.Item>

          <Form.Item
            name="freeNum"
            label="免费提现次数"
            rules={[{ required: true, message: '免费提现次数不能为空' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="请输入免费提现次数"
              min={0}
              precision={0}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default WithdrawalChannelPage;
