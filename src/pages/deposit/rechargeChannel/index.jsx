import React, { useState, useEffect } from 'react';
import { message, Button, Form, Input, InputNumber, Select, Modal, Tag } from 'antd';
import CmBasePage from '@components/CmBasePage';
import { PlusOutlined } from '@ant-design/icons';
import {
  getRechargeConfigSetting,
  saveRechargeConfigSetting
} from '@api/modules/recharge';

/**
 * 充值通道管理页面
 * 功能：充值通道配置的增删改查、审批
 */
const RechargeChannelPage = () => {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [modalTitle, setModalTitle] = useState('');
  const [operationType, setOperationType] = useState(0); // 1: 新增, 2: 修改
  const [userInfo, setUserInfo] = useState(null);

  // 币种选项配置
  const coinOptions = [
    {
      id: '1',
      label: 'usdt',
      value: 'usdt',
      options: [
        { id: '1-1', label: 'TRC20', value: 'TRC20' },
        { id: '1-2', label: 'ERC20', value: 'ERC20' }
      ]
    },
    {
      id: '2',
      label: 'eth',
      value: 'eth',
      options: [
        { id: '2-1', label: 'ETH', value: 'ETH' }
      ]
    },
    {
      id: '3',
      label: 'btc',
      value: 'btc',
      options: [
        { id: '3-1', label: 'BTC', value: 'BTC' }
      ]
    }
  ];

  // 加载用户信息
  useEffect(() => {
    const userStr = localStorage.getItem('userInfo');
    if (userStr) {
      try {
        setUserInfo(JSON.parse(userStr));
      } catch (e) {
        console.error('Failed to parse userInfo:', e);
      }
    }
  }, []);


  // 加载所有数据（包括其他代理创建的）
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const response = await getRechargeConfigSetting('ASSET_COIN');
      if (response.code === 0 || response.code === 200) {
        return response.data || [];
      }
      return [];
    } catch (error) {
      message.error('获取充值通道配置失败: ' + error.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // 打开新增对话框
  const handleAdd = () => {
    setOperationType(1);
    setModalTitle('新增充值通道');
    setCurrentRecord(null);
    form.resetFields();
    // 设置默认值
    form.setFieldsValue({
      userId: userInfo?.userId,
      createBy: userInfo?.userName
    });
    setModalVisible(true);
  };

  // 打开修改对话框
  const handleEdit = (record) => {
    setOperationType(2);
    setModalTitle('修改充值通道');
    setCurrentRecord(record);
    form.setFieldsValue({
      ...record,
      change: true
    });
    setModalVisible(true);
  };

  // 删除记录
  const handleDelete = (record) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除币种 "${record.coinName}" 吗？`,
      onOk: async () => {
        setLoading(true);
        try {
          const allData = await fetchAllData();
          const filteredData = allData.filter(
            item => !(item.coinName === record.coinName && item.coin === record.coin && item.userId === record.userId)
          );

          const response = await saveRechargeConfigSetting('ASSET_COIN', filteredData);

          if (response.code === 0 || response.code === 200) {
            message.success('删除成功');
            refreshTable();
          } else {
            message.error(response.msg || '删除失败');
          }
        } catch (error) {
          message.error('删除失败: ' + error.message);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // 审批通过
  const handleApprove = async (record) => {
    setLoading(true);
    try {
      const allData = await fetchAllData();
      const updatedData = allData.map(item => {
        if (item.coinName === record.coinName && item.coin === record.coin && item.userId === record.userId) {
          return { ...item, status: '1' };
        }
        return item;
      });

      const response = await saveRechargeConfigSetting({
        configKey: 'ASSET_COIN',
        configValue: JSON.stringify(updatedData)
      });

      if (response.code === 0 || response.code === 200) {
        message.success('审批成功');
        refreshTable();
      } else {
        message.error(response.msg || '审批失败');
        // 恢复原状态
        record.status = '';
      }
    } catch (error) {
      message.error('审批失败: ' + error.message);
      record.status = '';
    } finally {
      setLoading(false);
    }
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // 验证充值最大额和最小额
      if (values.rechargeMax && values.rechargeMin && Number(values.rechargeMax) <= Number(values.rechargeMin)) {
        message.error('充值最大额必须大于充值最低额');
        return;
      }

      // 验证数字格式
      const numberFields = ['rechargeMax', 'rechargeMin'];
      for (const field of numberFields) {
        if (values[field]) {
          const num = Number(values[field]);
          if (isNaN(num) || num <= 0) {
            message.error('请输入有效的数字');
            return;
          }
          // 检查小数位数
          if (values[field].toString().split('.')[1]?.length > 6) {
            message.error('最多保留6位小数');
            return;
          }
        }
      }

      // 验证充值次数
      if (values.rechargeNum) {
        const num = Number(values.rechargeNum);
        if (isNaN(num) || num <= 0 || !Number.isInteger(num)) {
          message.error('充值次数必须为正整数');
          return;
        }
      }

      setLoading(true);

      if (operationType === 2) {
        // 修改
        const allData = await fetchAllData();
        const updatedData = allData.map(item => {
          if (item.coinName === currentRecord.coinName && item.coin === currentRecord.coin && item.userId === currentRecord.userId) {
            return { ...item, ...values };
          }
          return item;
        });

        const response = await saveRechargeConfigSetting('ASSET_COIN', updatedData);

        if (response.code === 0 || response.code === 200) {
          message.success('修改成功');
          setModalVisible(false);
          refreshTable();
        } else {
          message.error(response.msg || '修改失败');
        }
      } else {
        // 新增
        const allData = await fetchAllData();

        // 检查是否重复
        const isDuplicate = allData.some(
          item => item.coinName === values.coinName && item.coin === values.coin && item.userId === values.userId
        );

        if (isDuplicate) {
          message.error('充值类型不能重复');
          setLoading(false);
          return;
        }

        allData.push(values);

        const response = await saveRechargeConfigSetting('ASSET_COIN', allData);

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

  // 币种改变时联动更新币种类型
  const handleCoinChange = (value) => {
    const found = coinOptions.find(item => item.value === value);
    if (found && found.options.length > 0) {
      form.setFieldsValue({ coinName: found.options[0].value });
    }
  };

  // 获取币种类型选项
  const getCoinNameOptions = () => {
    const coinValue = form.getFieldValue('coin');
    const found = coinOptions.find(item => item.value === coinValue);
    return found ? found.options : [];
  };

  // 刷新表格
  const refreshTable = () => {
    document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
      new CustomEvent('reload')
    );
  };

  // 列配置
  const columns = [
    {
      title: '币种名称',
      dataIndex: 'coin',
      key: 'coin',
      width: 120
    },
    {
      title: '币种类型',
      dataIndex: 'coinName',
      key: 'coinName',
      width: 120
    },
    {
      title: '充值最低额',
      dataIndex: 'rechargeMin',
      key: 'rechargeMin',
      width: 120,
      render: (text) => text ? Number(text).toFixed(2) : '-'
    },
    {
      title: '充值最大额',
      dataIndex: 'rechargeMax',
      key: 'rechargeMax',
      width: 120,
      render: (text) => text ? Number(text).toFixed(2) : '-'
    },
    {
      title: '创建人',
      dataIndex: 'createBy',
      key: 'createBy',
      width: 120
    },
    {
      title: '充值地址',
      dataIndex: 'coinAddress',
      key: 'coinAddress',
      width: 200,
      ellipsis: true
    },
    {
      title: '充值次数',
      dataIndex: 'rechargeNum',
      key: 'rechargeNum',
      width: 100
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === '1' ? 'green' : 'orange'}>
          {status === '1' ? '已审批' : '未审批'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 250,
      fixed: 'right',
      render: (_, record) => (
        <>
          <Button
            type="link"
            size="small"
            onClick={() => handleEdit(record)}
          >
            修改
          </Button>
          <Button
            type="link"
            size="small"
            danger
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
          {record.status !== '1' && (
            <Button
              type="link"
              size="small"
              onClick={() => handleApprove(record)}
            >
              审批
            </Button>
          )}
        </>
      )
    }
  ];


  return (
    <div>
      <CmBasePage
        columns={columns}
        onLoadData={async () => {
          setLoading(true);
          try {
            const response = await getRechargeConfigSetting('ASSET_COIN');
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
            message.error('获取充值通道配置失败: ' + error.message);
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
        rowKey={(record) => `${record.coin}-${record.coinName}-${record.userId}`}
        searchVisible={false}
      />

      {/* 新增/修改对话框 */}
      <Modal
        title={modalTitle}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
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
            name="coin"
            label="币种名称"
            rules={[{ required: true, message: '请选择币种名称' }]}
          >
            <Select
              placeholder="请选择币种名称"
              disabled={operationType === 2}
              onChange={handleCoinChange}
              options={coinOptions.map(item => ({
                label: item.label,
                value: item.value
              }))}
            />
          </Form.Item>

          <Form.Item
            name="coinName"
            label="币种类型"
            rules={[{ required: true, message: '请选择币种类型' }]}
          >
            <Select
              placeholder="请选择币种类型"
              disabled={operationType === 2}
              options={getCoinNameOptions().map(item => ({
                label: item.label,
                value: item.value
              }))}
            />
          </Form.Item>

          <Form.Item
            name="rechargeMax"
            label="充值最大额"
            rules={[
              { required: true, message: '请输入充值最大额' },
              {
                validator: (_, value) => {
                  if (value && Number(value) <= 0) {
                    return Promise.reject('充值最大额必须大于0');
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="请输入充值最大额"
              min={0}
              precision={6}
            />
          </Form.Item>

          <Form.Item
            name="rechargeMin"
            label="充值最低额"
            rules={[
              { required: true, message: '请输入充值最低额' },
              {
                validator: (_, value) => {
                  if (value && Number(value) <= 0) {
                    return Promise.reject('充值最低额必须大于0');
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="请输入充值最低额"
              min={0}
              precision={6}
            />
          </Form.Item>

          <Form.Item
            name="coinAddress"
            label="充值地址"
            rules={[{ required: true, message: '请输入充值地址' }]}
          >
            <Input placeholder="请输入充值地址" />
          </Form.Item>

          <Form.Item
            name="rechargeNum"
            label="充值次数"
            rules={[
              { required: true, message: '请输入充值次数' },
              {
                validator: (_, value) => {
                  if (value && (!Number.isInteger(Number(value)) || Number(value) <= 0)) {
                    return Promise.reject('充值次数必须为正整数');
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="请输入充值次数"
              min={1}
              precision={0}
            />
          </Form.Item>

          <Form.Item name="userId" hidden>
            <Input />
          </Form.Item>

          <Form.Item name="createBy" hidden>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RechargeChannelPage;
