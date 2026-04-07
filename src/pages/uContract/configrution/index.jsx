import React, { useState, useEffect } from 'react';
import { message, Tag, Form, Input, Select, Switch, Modal, Image, Button } from 'antd';
import CmBasePage from '@components/CmBasePage';
import DataForm from '@components/DataForm';
import { getUContractList, getUContract, addUContract, updateUContract, deleteUContract } from '@api';
import { getCoinList } from '@api/modules/currency';

const { Option } = Select;

/**
 * U本位合约配置页面
 * 功能：合约币种列表展示、新增、编辑、删除、浮动盈利设置
 */
const UContractConfigPage = () => {
  // 状态管理
  const [detailVisible, setDetailVisible] = useState(false);
  const [profitVisible, setProfitVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [coinList, setCoinList] = useState([]);
  const [currentMarket, setCurrentMarket] = useState(null);
  const [change, setChange] = useState(0); // 0: 新增, 1: 编辑

  /**
   * 查看详情
   */
  const handleView = (record) => {
    setCurrentRecord(record);
    setDetailVisible(true);
  };

  /**
   * 打开新增对话框
   */
  const handleAdd = () => {
    setChange(0);
    setCurrentRecord({
      enable: 0,
      visible: 0,
      exchangeable: 0,
      enableOpenSell: 0,
      enableOpenBuy: 0,
      enableMarketSell: 0,
      enableMarketBuy: 0,
      customPrice: '0',
    });
    fetchCoinList();
    setDetailVisible(true);
  };

  /**
   * 打开编辑对话框
   */
  const handleEdit = async (record) => {
    setChange(1);
    try {
      const response = await getUContract(record.id);
      if (response.code === 0 || response.code === 200) {
        setCurrentRecord(response.data);
        setDetailVisible(true);
      } else {
        message.error(response.msg || '获取详情失败');
      }
    } catch (error) {
      message.error('获取详情失败: ' + error.message);
    }
  };

  /**
   * 打开浮动盈利设置对话框
   */
  const handleUpdateProfit = async (record) => {
    setChange(1);
    try {
      const response = await getUContract(record.id);
      if (response.code === 0 || response.code === 200) {
        setCurrentRecord(response.data);
        setProfitVisible(true);
      } else {
        message.error(response.msg || '获取详情失败');
      }
    } catch (error) {
      message.error('获取详情失败: ' + error.message);
    }
  };

  /**
   * 删除操作
   */
  const handleDelete = async (record) => {
    Modal.confirm({
      title: '确认删除',
      content: `是否确认删除永续合约币种编号为"${record.id}"的数据项？`,
      onOk: async () => {
        try {
          const response = await deleteUContract(record.id);
          if (response.code === 0 || response.code === 200) {
            message.success('删除成功');
            refreshTable();
          } else {
            message.error(response.msg || '删除失败');
          }
        } catch (error) {
          message.error('删除失败: ' + error.message);
        }
      },
    });
  };

  /**
   * 提交表单
   */
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const data = { ...values };

      if (change === 0 && currentMarket) {
        data.market = currentMarket.market;
        data.coin = currentMarket.symbol;
      }

      let response;
      if (data.id) {
        response = await updateUContract(data);
      } else {
        response = await addUContract(data);
      }

      if (response.code === 0 || response.code === 200) {
        message.success(data.id ? '修改成功' : '新增成功');
        setDetailVisible(false);
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
   * 提交浮动盈利设置
   */
  const handleProfitSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await updateUContract({
        id: currentRecord?.id,
        ...values
      });

      if (response.code === 0 || response.code === 200) {
        message.success('修改成功');
        setProfitVisible(false);
        refreshTable();
      } else {
        message.error(response.msg || '修改失败');
      }
    } catch (error) {
      message.error('修改失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 获取币种列表
   */
  const fetchCoinList = async () => {
    try {
      const response = await getCoinList();
      if (response.code === 0 || response.code === 200) {
        const list = response.rows.map(item => ({
          ...item,
          label: `${item.symbol}-${item.market}`
        }));
        setCoinList(list);
      }
    } catch (error) {
      message.error('获取币种列表失败: ' + error.message);
    }
  };

  /**
   * 币种变化
   */
  const handleCoinChange = (value) => {
    const market = coinList.find(item => item.id === value);
    if (market) {
      setCurrentMarket(market);
      setCurrentRecord(prev => ({
        ...prev,
        symbol: `${market.symbol.toLowerCase()}usdt`
      }));
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

  // 状态映射
  const enableMap = {
    0: { color: 'green', text: '启用' },
    1: { color: 'red', text: '禁用' },
  };

  const visibleMap = {
    0: { color: 'green', text: '显示' },
    1: { color: 'default', text: '不显示' },
  };

  const exchangeableMap = {
    0: { color: 'green', text: '可交易' },
    1: { color: 'red', text: '不可交易' },
  };

  /**
   * 列配置定义
   */
  const columns = [
    {
      title: '图标',
      dataIndex: 'logo',
      key: 'logo',
      width: 80,
      render: (logo) => logo ? <Image src={logo} width={30} height={30} style={{ borderRadius: '50%' }} /> : '-',
    },
    {
      title: '交易对',
      dataIndex: 'symbol',
      key: 'symbol',
      width: 120,
    },
    {
      title: '前端展示交易对',
      dataIndex: 'showSymbol',
      key: 'showSymbol',
      width: 150,
    },
    {
      title: '合约面值',
      dataIndex: 'shareNumber',
      key: 'shareNumber',
      width: 120,
      render: (value, record) => {
        const env = import.meta.env.VITE_APP_ENV || '';
        if (env.includes('das')) {
          return `${value}/USDT`;
        }
        return `${value}/${(record.coin || '').toUpperCase()}`;
      },
    },
    {
      title: '杠杆倍数',
      dataIndex: 'leverage',
      key: 'leverage',
      width: 100,
    },
    {
      title: '是否启用',
      dataIndex: 'enable',
      key: 'enable',
      width: 100,
      render: (enable) => {
        const status = enableMap[enable] || { color: 'default', text: '未知' };
        return <Tag color={status.color}>{status.text}</Tag>;
      },
    },
    {
      title: '前端显示',
      dataIndex: 'visible',
      key: 'visible',
      width: 100,
      render: (visible) => {
        const status = visibleMap[visible] || { color: 'default', text: '未知' };
        return <Tag color={status.color}>{status.text}</Tag>;
      },
    },
    {
      title: '是否可交易',
      dataIndex: 'exchangeable',
      key: 'exchangeable',
      width: 100,
      render: (exchangeable) => {
        const status = exchangeableMap[exchangeable] || { color: 'default', text: '未知' };
        return <Tag color={status.color}>{status.text}</Tag>;
      },
    },
    {
      title: '开空',
      dataIndex: 'enableOpenSell',
      key: 'enableOpenSell',
      width: 80,
      render: (val) => <Tag color={val === 0 ? 'green' : 'red'}>{val === 0 ? '启用' : '禁用'}</Tag>,
    },
    {
      title: '开多',
      dataIndex: 'enableOpenBuy',
      key: 'enableOpenBuy',
      width: 80,
      render: (val) => <Tag color={val === 0 ? 'green' : 'red'}>{val === 0 ? '启用' : '禁用'}</Tag>,
    },
    {
      title: '市价开空',
      dataIndex: 'enableMarketSell',
      key: 'enableMarketSell',
      width: 100,
      render: (val) => <Tag color={val === 0 ? 'green' : 'red'}>{val === 0 ? '启用' : '禁用'}</Tag>,
    },
    {
      title: '市价开多',
      dataIndex: 'enableMarketBuy',
      key: 'enableMarketBuy',
      width: 100,
      render: (val) => <Tag color={val === 0 ? 'green' : 'red'}>{val === 0 ? '启用' : '禁用'}</Tag>,
    },
    {
      title: '开仓手续费',
      dataIndex: 'openFee',
      key: 'openFee',
      width: 120,
    },
    {
      title: '平仓手续费',
      dataIndex: 'closeFee',
      key: 'closeFee',
      width: 120,
    },
    {
      title: '资金费率',
      dataIndex: 'usdtRate',
      key: 'usdtRate',
      width: 100,
    },
    {
      title: '资金周期',
      dataIndex: 'intervalHour',
      key: 'intervalHour',
      width: 100,
    },
    {
      title: '币种小数精度',
      dataIndex: 'coinScale',
      key: 'coinScale',
      width: 120,
    },
    {
      title: '基础币小数精度',
      dataIndex: 'baseScale',
      key: 'baseScale',
      width: 140,
    },
    {
      title: '最小数',
      dataIndex: 'minShare',
      key: 'minShare',
      width: 100,
    },
    {
      title: '最大数',
      dataIndex: 'maxShare',
      key: 'maxShare',
      width: 100,
    },
    {
      title: '排序字段',
      dataIndex: 'sort',
      key: 'sort',
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      width: 250,
      fixed: 'right',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {import.meta.env.VITE_APP_ENV?.includes('das') && (
            <Button
              size="small"
              type="warning"
              onClick={() => handleUpdateProfit(record)}
            >
              浮动盈利设置
            </Button>
          )}
          <Button
            size="small"
            type="primary"
            onClick={() => handleEdit(record)}
          >
            修改
          </Button>
          <Button
            size="small"
            danger
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </div>
      ),
    },
  ];

  /**
   * 搜索字段配置
   */
  const searchFieldList = [
    {
      title: '交易对',
      dataIndex: 'symbol',
      key: 'SEARCH_LIKE_symbol',
      type: 'text',
    },
    {
      title: '币种',
      dataIndex: 'coin',
      key: 'SEARCH_LIKE_coin',
      type: 'text',
    },
  ];

  return (
    <div>
      {/* 合约配置列表 */}
      <CmBasePage
        columns={columns}
        apiEndpoint="/contract/ucontract/list"
        apiMethod="get"
        searchFieldList={searchFieldList}
        onView={handleView}
        onAdd={handleAdd}
        actionButtons={{
          view: false,
          edit: false,
          delete: false,
        }}
        rowKey="id"
        toolBarExtraButtons={[
          <Button
            key="add"
            type="primary"
            onClick={handleAdd}
          >
            新增
          </Button>,
        ]}
      />

      {/* 详情/编辑表单 */}
      <DataForm
        visible={detailVisible}
        title={change === 0 ? '添加永续合约币种' : '修改永续合约币种'}
        initialValues={currentRecord}
        onCancel={() => setDetailVisible(false)}
        onSubmit={handleSubmit}
        onClosed={() => setCurrentRecord(null)}
        loading={loading}
        formType="modal"
        width={800}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <Form.Item
            name="showSymbol"
            label="前端展示交易对"
            rules={[{ required: true, message: '请输入前端展示交易对' }]}
            style={{ width: '48%' }}
          >
            <Input placeholder="请输入前端展示交易对" />
          </Form.Item>

          <Form.Item
            name="symbol"
            label="交易对"
            rules={[{ required: true, message: '请输入交易对' }]}
            style={{ width: '48%' }}
          >
            <Input disabled />
          </Form.Item>

          {change === 0 ? (
            <Form.Item
              name="currentId"
              label="交易币种"
              rules={[{ required: true, message: '请选择交易币种' }]}
              style={{ width: '48%' }}
            >
              <Select
                placeholder="请选择交易币种"
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
                onChange={handleCoinChange}
              >
                {coinList.map(coin => (
                  <Option key={coin.id} value={coin.id}>{coin.label}</Option>
                ))}
              </Select>
            </Form.Item>
          ) : (
            <Form.Item
              name="coin"
              label="交易币种"
              style={{ width: '48%' }}
            >
              <Input disabled />
            </Form.Item>
          )}

          <Form.Item
            name="logo"
            label="图标"
            style={{ width: '48%' }}
          >
            <Input placeholder="请输入图标URL" />
          </Form.Item>

          <Form.Item
            name="baseCoin"
            label="结算币种"
            rules={[{ required: true, message: '请输入结算币种' }]}
            style={{ width: '48%' }}
          >
            <Input placeholder="请输入结算币种" />
          </Form.Item>

          <Form.Item
            name="leverage"
            label="杠杆倍数"
            rules={[{ required: true, message: '请输入杠杆倍数' }]}
            style={{ width: '48%' }}
          >
            <Input placeholder="请输入杠杆倍数" />
          </Form.Item>

          <Form.Item
            name="shareNumber"
            label="合约面值"
            rules={[{ required: true, message: '请输入合约面值' }]}
            style={{ width: '48%' }}
          >
            <Input placeholder="请输入合约面值" />
          </Form.Item>

          <Form.Item
            name="openFee"
            label="开仓手续费"
            rules={[{ required: true, message: '请输入开仓手续费' }]}
            style={{ width: '48%' }}
          >
            <Input placeholder="请输入开仓手续费" />
          </Form.Item>

          <Form.Item
            name="closeFee"
            label="平仓手续费"
            rules={[{ required: true, message: '请输入平仓手续费' }]}
            style={{ width: '48%' }}
          >
            <Input placeholder="请输入平仓手续费" />
          </Form.Item>

          <Form.Item
            name="usdtRate"
            label="资金费率"
            rules={[{ required: true, message: '请输入资金费率' }]}
            style={{ width: '48%' }}
          >
            <Input placeholder="请输入资金费率" />
          </Form.Item>

          <Form.Item
            name="intervalHour"
            label="资金费率周期"
            rules={[{ required: true, message: '请输入资金费率周期' }]}
            style={{ width: '48%' }}
          >
            <Input placeholder="请输入资金费率周期" />
          </Form.Item>

          <Form.Item
            name="coinScale"
            label="币种小数精度"
            rules={[{ required: true, message: '请输入币种小数精度' }]}
            style={{ width: '48%' }}
          >
            <Input placeholder="请输入币种小数精度" />
          </Form.Item>

          <Form.Item
            name="baseScale"
            label="基础币小数精度"
            rules={[{ required: true, message: '请输入基础币小数精度' }]}
            style={{ width: '48%' }}
          >
            <Input placeholder="请输入基础币小数精度" />
          </Form.Item>

          <Form.Item
            name="minShare"
            label="最小数"
            rules={[{ required: true, message: '请输入最小数' }]}
            style={{ width: '48%' }}
          >
            <Input placeholder="请输入最小数" />
          </Form.Item>

          <Form.Item
            name="maxShare"
            label="最大数"
            rules={[{ required: true, message: '请输入最大数' }]}
            style={{ width: '48%' }}
          >
            <Input placeholder="请输入最大数" />
          </Form.Item>

          <Form.Item
            name="sort"
            label="排序字段"
            rules={[{ required: true, message: '请输入排序字段' }]}
            style={{ width: '48%' }}
          >
            <Input placeholder="请输入排序字段" />
          </Form.Item>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <Form.Item
            name="enable"
            label="是否启用"
            valuePropName="checked"
            style={{ width: '48%' }}
          >
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>

          <Form.Item
            name="visible"
            label="前端显示"
            valuePropName="checked"
            style={{ width: '48%' }}
          >
            <Switch checkedChildren="显示" unCheckedChildren="不显示" />
          </Form.Item>

          <Form.Item
            name="exchangeable"
            label="是否可交易"
            valuePropName="checked"
            style={{ width: '48%' }}
          >
            <Switch checkedChildren="可交易" unCheckedChildren="不可交易" />
          </Form.Item>

          <Form.Item
            name="enableOpenSell"
            label="开空"
            valuePropName="checked"
            style={{ width: '48%' }}
          >
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>

          <Form.Item
            name="enableOpenBuy"
            label="开多"
            valuePropName="checked"
            style={{ width: '48%' }}
          >
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>

          <Form.Item
            name="enableMarketSell"
            label="市价开空"
            valuePropName="checked"
            style={{ width: '48%' }}
          >
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>

          <Form.Item
            name="enableMarketBuy"
            label="市价开多"
            valuePropName="checked"
            style={{ width: '48%' }}
          >
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
        </div>

        <Form.Item
          name="customPrice"
          label="启用自定义价格"
          rules={[{ required: true, message: '请选择是否启用自定义价格' }]}
        >
          <Select placeholder="请选择是否启用自定义价格">
            <Option value="0">不启用</Option>
            <Option value="1">启用</Option>
          </Select>
        </Form.Item>

        <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.customPrice !== currentValues.customPrice}>
          {({ getFieldValue }) => {
            const customPrice = getFieldValue('customPrice');
            if (customPrice === '1') {
              return (
                <>
                  <Form.Item
                    name="initCustomPrice"
                    label="初始自定义价格"
                    rules={[{ required: true, message: '请输入初始自定义价格' }]}
                  >
                    <Input placeholder="请输入初始自定义价格" />
                  </Form.Item>

                  <Form.Item
                    name="maxCustomPrice"
                    label="自定义价格最高价"
                    rules={[{ required: true, message: '请输入自定义价格最高价' }]}
                  >
                    <Input placeholder="请输入自定义价格最高价" />
                  </Form.Item>

                  <Form.Item
                    name="minCustomPrice"
                    label="自定义价格最低价"
                    rules={[{ required: true, message: '请输入自定义价格最低价' }]}
                  >
                    <Input placeholder="请输入自定义价格最低价" />
                  </Form.Item>

                  <Form.Item
                    name="customMaxRate"
                    label="单次最大涨幅率"
                    rules={[{ required: true, message: '请输入单次最大涨幅率' }]}
                  >
                    <Input placeholder="请输入单次最大涨幅率" />
                  </Form.Item>
                </>
              );
            }
            return null;
          }}
        </Form.Item>
      </DataForm>

      {/* 浮动盈利设置表单 */}
      <DataForm
        visible={profitVisible}
        title="修改浮动盈利"
        initialValues={currentRecord}
        onCancel={() => setProfitVisible(false)}
        onSubmit={handleProfitSubmit}
        onClosed={() => setCurrentRecord(null)}
        loading={loading}
        formType="modal"
        width={600}
      >
        <Form.Item
          name="symbol"
          label="交易对"
        >
          <Input disabled />
        </Form.Item>

        <Form.Item
          name="floatProfit"
          label="浮动盈利点"
          rules={[{ required: true, message: '请输入浮动盈利点' }]}
        >
          <Input placeholder="请输入浮动盈利点" />
        </Form.Item>

        <Form.Item
          name="profitLoss"
          label="浮动盈亏"
          rules={[{ required: true, message: '请输入浮动盈亏' }]}
        >
          <Input placeholder="请输入浮动盈亏" />
        </Form.Item>
      </DataForm>
    </div>
  );
};

export default UContractConfigPage;
