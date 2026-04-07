import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, message, Popconfirm } from 'antd';
import { getSettingConfig } from '@api';
import CmBasePage from '@components/CmBasePage';
import DataForm from '@components/DataForm';
import {
  listUserRecharge,
  addUserRecharge,
  updateUserRecharge,
  delUserRecharge,
  getUserRecharge,
} from '@api';

const { Option } = Select;

/**
 * 充值地址配置页面
 */
const UserRechargePage = () => {
  const [form] = Form.useForm();
  const [formVisible, setFormVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [coinList, setCoinList] = useState([]);
  const [isUpdate, setIsUpdate] = useState(false);
  const [currentCoin, setCurrentCoin] = useState(null);

  useEffect(() => {
    // 获取充值列表
    getSettingConfig('ASSET_COIN').then((res) => {
      if (res.code === 200) {
        setCoinList(res.data || []);
      }
    });
  }, []);

  /**
   * 新增充值地址
   */
  const handleAdd = () => {
    setIsUpdate(false);
    setFormVisible(true);
  };

  /**
   * 编辑充值地址
   */
  const handleEdit = async (record) => {
    try {
      const response = await getUserRecharge(record.id);
      if (response.code === 200) {
        setEditingRecord(response.data);
        setIsUpdate(true);
        setFormVisible(true);
      }
    } catch (error) {
      message.error('获取详情失败: ' + error.message);
    }
  };

  /**
   * 删除充值地址
   */
  const handleDelete = async (record) => {
    try {
      const response = await delUserRecharge(record.id);
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
   * 提交表单
   */
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      let response;
      if (isUpdate) {
        response = await updateUserRecharge({
          ...values,
          id: editingRecord?.id,
        });
      } else {
        const selectedCoin = coinList.find(c => c.coinName === values.symbol);
        response = await addUserRecharge({
          userId: new URLSearchParams(location.search).get('userId'),
          symbol: values.symbol,
          address: values.address,
          coin: selectedCoin?.coin || '',
        });
      }

      if (response.code === 0 || response.code === 200) {
        message.success(isUpdate ? '修改成功' : '新增成功');
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
   * 币种改变
   */
  const handleCoinChange = (value) => {
    const selected = coinList.find(c => c.coinName === value);
    setCurrentCoin(selected);
  };

  // ==================== 列配置 ====================

  const columns = [
    {
      title: '币种名称',
      dataIndex: 'symbol',
      key: 'symbol',
      width: 150,
    },
    {
      title: '充值地址',
      dataIndex: 'address',
      key: 'address',
      width: 400,
      ellipsis: true,
    },
  ];

  // ==================== 搜索配置 ====================

  const searchFieldList = [
    {
      title: '币种名称',
      dataIndex: 'symbol',
      key: 'SEARCH_EQ_symbol',
      type: 'select',
      options: coinList.map(coin => ({ label: coin.coinName, value: coin.coinName })),
    },
  ];

  // ==================== 渲染 ====================

  return (
    <div>
      <CmBasePage
        columns={columns}
        apiEndpoint="/asset/symbol/address/list"
        apiMethod="get"
        searchFieldList={searchFieldList}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        rowKey="id"
        actionButtons={{
          edit: true,
          delete: true,
          view: false,
        }}
        extraParams={{ userId: new URLSearchParams(location.search).get('userId') }}
      />

      <DataForm
        visible={formVisible}
        title={isUpdate ? '修改用户充值地址' : '添加用户充值地址'}
        initialValues={editingRecord || {}}
        onCancel={() => setFormVisible(false)}
        onSubmit={handleSubmit}
        onClosed={() => {
          setFormVisible(false);
          setEditingRecord(null);
        }}
        loading={loading}
        formType="modal"
        width={500}
      >
        <Form.Item
          label="用户ID"
        >
          <Input value={new URLSearchParams(location.search).get('userId')} disabled />
        </Form.Item>

        {!isUpdate && (
          <Form.Item
            name="symbol"
            label="充值类型"
            rules={[{ required: true, message: '请选择充值类型' }]}
          >
            <Select
              placeholder="请选择充值类型"
              onChange={handleCoinChange}
            >
              {coinList.map(coin => (
                <Option key={coin.id} value={coin.coinName}>
                  {coin.coinName}
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}

        {isUpdate && (
          <Form.Item
            name="symbol"
            label="充值类型"
          >
            <Input disabled />
          </Form.Item>
        )}

        <Form.Item
          name="address"
          label="充值地址"
          rules={[{ required: true, message: '请输入充值地址' }]}
        >
          <Input placeholder="请输入充值地址" />
        </Form.Item>
      </DataForm>
    </div>
  );
};

export default UserRechargePage;
