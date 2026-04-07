/**
 * 币币交易币种配置页面
 *
 * 功能：管理币币交易币种配置
 *
 * @author System
 * @date 2026-04-02
 */

import React, { useState } from 'react';
import { message, Form, Input, Select, Switch, Button, Tag, Modal, Table, Image } from 'antd';
import CmBasePage from '@components/CmBasePage';
import DataForm from '@components/DataForm';
import CmUpload from '@components/CmUpload';
import {
  listConfiguration,
  getCurrency,
  delCurrency,
  addCurrency,
  updateCurrency,
  addOneCurrency,
  getCoinList
} from '@api/modules/currency';

const { Option } = Select;

/** 币币交易币种配置页面 */
const CurrencyConfigrution = () => {
  const [form] = Form.useForm();
  const [batchForm] = Form.useForm();

  const [formVisible, setFormVisible] = useState(false);
  const [batchModalVisible, setBatchModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [coinList, setCoinList] = useState([]);
  const [currentMarket, setCurrentMarket] = useState(null);
  const [selectedCoinIds, setSelectedCoinIds] = useState([]);
  const [customPriceEnabled, setCustomPriceEnabled] = useState('0');

  // 刷新表格
  const refreshTable = () => {
    document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
      new CustomEvent('reload')
    );
  };

  // 获取可添加币种列表
  const fetchCoinList = async () => {
    try {
      const response = await getCoinList();
      if (response.code === 200) {
        const list = (response.rows || []).map((item) => ({
          ...item,
          label: `${item.symbol}-${item.market}`,
        }));
        setCoinList(list);
      }
    } catch (error) {
      message.error('获取币种列表失败: ' + error.message);
    }
  };

  // 新增按钮
  const handleAdd = () => {
    setEditingRecord(null);
    setCustomPriceEnabled('0');
    fetchCoinList();
    setCurrentMarket(null);
    setFormVisible(true);
  };

  // 编辑按钮
  const handleEdit = async (record) => {
    try {
      fetchCoinList();
      const response = await getCurrency(record.id);
      if (response.code === 0 || response.code === 200) {
        const data = response.data;
        setEditingRecord(data);
        setCustomPriceEnabled(data.customPrice || '0');
        form.setFieldsValue({
          ...data,
          currentId: data.id,
        });
        setFormVisible(true);
      } else {
        message.error(response.msg || '获取详情失败');
      }
    } catch (error) {
      message.error('获取详情失败: ' + error.message);
    }
  };

  // 删除按钮
  const handleDelete = async (record) => {
    try {
      const response = await delCurrency(record.id);
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

  // 提交表单
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const submitData = {
        ...values,
        customPrice: customPriceEnabled,
      };

      let response;
      if (editingRecord && editingRecord.id) {
        response = await updateCurrency({ ...submitData, id: editingRecord.id });
      } else {
        const marketData = currentMarket;
        submitData.market = marketData?.market;
        submitData.coin = marketData?.symbol;
        response = await addCurrency(submitData);
      }

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

  // 币种选择变化
  const handleCoinChange = (value) => {
    const market = coinList.find((item) => item.id === value);
    setCurrentMarket(market);
  };

  // 打开一键新增弹窗
  const handleBatchAdd = () => {
    setBatchModalVisible(true);
    setSelectedCoinIds([]);
    fetchCoinList();
  };

  // 批量选择变化
  const handleBatchSelectionChange = (selectedRowKeys) => {
    setSelectedCoinIds(selectedRowKeys);
  };

  // 提交一键新增
  const handleBatchSubmit = async () => {
    if (selectedCoinIds.length === 0) {
      message.warning('请选择要添加的币种');
      return;
    }

    setLoading(true);
    try {
      const symbols = selectedCoinIds
        .map(id => coinList.find(c => c.id === id)?.symbol?.toLowerCase())
        .filter(Boolean)
        .join(',');

      const response = await addOneCurrency({ symbols });
      if (response.code === 0 || response.code === 200) {
        message.success('批量新增成功');
        setBatchModalVisible(false);
        refreshTable();
      } else {
        message.error(response.msg || '批量新增失败');
      }
    } catch (error) {
      message.error('批量新增失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 表格列配置
  const columns = [
    {
      title: '图标',
      dataIndex: 'logo',
      key: 'logo',
      width: 80,
      align: 'center',
      render: (logo) => logo ? <Image src={logo} width={30} height={30} /> : '-',
    },
    {
      title: '交易对',
      dataIndex: 'symbol',
      key: 'symbol',
      width: 120,
      align: 'center',
    },
    {
      title: '前端展示交易对',
      dataIndex: 'showSymbol',
      key: 'showSymbol',
      width: 150,
      align: 'center',
    },
    {
      title: '交易 / 结算币种',
      key: 'pair',
      width: 150,
      align: 'center',
      render: (_, record) => (
        <div>{record.coin} / {record.baseCoin}</div>
      ),
    },
    {
      title: '手续费(%)',
      dataIndex: 'feeRate',
      key: 'feeRate',
      width: 100,
      align: 'center',
    },
    {
      title: '最小 / 最大下单量',
      key: 'orderMinMax',
      width: 150,
      align: 'center',
      render: (_, record) => (
        <div>{record.orderMin} / {record.orderMax}</div>
      ),
    },
    {
      title: '最低卖出量',
      dataIndex: 'minSell',
      key: 'minSell',
      width: 120,
      align: 'center',
    },
    {
      title: '启用禁用',
      dataIndex: 'enable',
      key: 'enable',
      width: 100,
      align: 'center',
      render: (enable) => (
        <Tag color={enable == 1 ? 'blue' : 'default'}>
          {enable == 1 ? '启用' : '禁用'}
        </Tag>
      ),
    },
  ];

  // 搜索字段配置
  const searchFieldList = [
    {
      title: '交易对',
      dataIndex: 'symbol',
      key: 'SEARCH_LIKE_symbol',
      type: 'text',
    },
    {
      title: '交易币种',
      dataIndex: 'coin',
      key: 'SEARCH_LIKE_coin',
      type: 'text',
    },
  ];

  // 一键新增表格列
  const coinColumns = [
    {
      title: '图标',
      dataIndex: 'logo',
      key: 'logo',
      width: 80,
      align: 'center',
      render: (logo) => logo ? <Image src={logo} width={30} height={30} /> : '-',
    },
    {
      title: '币种名称',
      dataIndex: 'symbol',
      key: 'symbol',
      align: 'center',
    },
  ];

  return (
    <div>
      <CmBasePage
        columns={columns}
        apiEndpoint="/contract/currencySymbol/list"
        apiMethod="get"
        searchFieldList={searchFieldList}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        rowKey="id"
        actionButtons={{
          view: false,
          edit: true,
          delete: true,
        }}
        toolBarExtraButtons={[
          <Button
            key="batchAdd"
            type="primary"
            onClick={handleBatchAdd}
          >
            一键新增
          </Button>,
        ]}
      />

      <DataForm
        visible={formVisible}
        title={editingRecord ? '修改币币交易币种配置' : '添加币币交易币种配置'}
        form={form}
        initialValues={
          editingRecord
            ? { ...editingRecord, currentId: editingRecord.id }
            : { enable: '1', customPrice: '0' }
        }
        onCancel={() => setFormVisible(false)}
        onSubmit={handleSubmit}
        onClosed={() => {
          setEditingRecord(null);
          form.resetFields();
          setCurrentMarket(null);
        }}
        loading={loading}
        formType="modal"
        width="700px"
      >
        <Form.Item
          name="showSymbol"
          label="展示交易对"
          rules={[{ required: true, message: '展示交易对不能为空' }]}
        >
          <Input placeholder="请输入展示交易对" />
        </Form.Item>

        {!editingRecord && (
          <Form.Item
            name="currentId"
            label="币种"
            rules={[{ required: true, message: '请选择币种' }]}
          >
            <Select
              placeholder="请选择币种"
              showSearch
              allowClear
              onChange={handleCoinChange}
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {coinList.map((coin) => (
                <Option key={coin.id} value={coin.id}>
                  {coin.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}

        <Form.Item
          name="logo"
          label="图标"
        >
          <CmUpload />
        </Form.Item>

        <Form.Item
          name="feeRate"
          label="手续费率"
          rules={[{ required: true, message: '手续费率不能为空' }]}
        >
          <Input placeholder="请输入手续费率" />
        </Form.Item>

        <Form.Item
          name="orderMin"
          label="最小下单量"
          rules={[{ required: true, message: '最小下单量不能为空' }]}
        >
          <Input type="number" placeholder="请输入最小下单量" />
        </Form.Item>

        <Form.Item
          name="orderMax"
          label="最大下单量"
          rules={[{ required: true, message: '最大下单量不能为空' }]}
        >
          <Input type="number" placeholder="请输入最大下单量" />
        </Form.Item>

        <Form.Item
          name="minSell"
          label="最低卖出量"
          rules={[{ required: true, message: '最低卖出量不能为空' }]}
        >
          <Input placeholder="请输入最低卖出量" />
        </Form.Item>

        <Form.Item
          name="customPrice"
          label="启用自定义价格"
          initialValue="0"
        >
          <Select
            onChange={(value) => setCustomPriceEnabled(value)}
          >
            <Option value="0">不启用</Option>
            <Option value="1">启用</Option>
          </Select>
        </Form.Item>

        {customPriceEnabled === '1' && (
          <>
            <Form.Item
              name="initCustomPrice"
              label="初始自定义价格"
            >
              <Input placeholder="请输入初始自定义价格" />
            </Form.Item>

            <Form.Item
              name="maxCustomPrice"
              label="自定义价格最高价"
            >
              <Input placeholder="请输入自定义价格最高价" />
            </Form.Item>

            <Form.Item
              name="minCustomPrice"
              label="自定义价格最低价"
            >
              <Input placeholder="请输入自定义价格最低价" />
            </Form.Item>

            <Form.Item
              name="customMaxRate"
              label="单次最大涨幅率"
            >
              <Input placeholder="请输入单次最大涨幅率" />
            </Form.Item>
          </>
        )}

        <Form.Item
          name="enable"
          label="启用"
          valuePropName="checked"
          initialValue={true}
        >
          <Switch checkedChildren="启用" unCheckedChildren="禁用" />
        </Form.Item>
      </DataForm>

      {/* 一键新增弹窗 */}
      <Modal
        title="一键新增"
        open={batchModalVisible}
        onOk={handleBatchSubmit}
        onCancel={() => setBatchModalVisible(false)}
        confirmLoading={loading}
        width={800}
        okText="确定"
        cancelText="取消"
      >
        <Table
          rowKey="id"
          columns={coinColumns}
          dataSource={coinList}
          loading={loading}
          rowSelection={{
            selectedRowKeys: selectedCoinIds,
            onChange: handleBatchSelectionChange,
          }}
          pagination={false}
          size="small"
          scroll={{ y: 400 }}
        />
      </Modal>
    </div>
  );
};

export default CurrencyConfigrution;
