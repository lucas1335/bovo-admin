import React, { useState, useEffect } from 'react';
import { message, Form, Input, Select, Switch, Modal, Button, Space, Popconfirm, Tag, Image } from 'antd';
import CmBasePage from '@components/CmBasePage';
import DataForm from '@components/DataForm';
import CmUpload from '@components/CmUpload';
import {
  getQuicklyTradePairList,
  getQuicklyTradePairDetail,
  saveQuicklyTradePair,
  updateQuicklyTradePair,
  deleteQuicklyTradePair,
  getCoinList,
  getCycleList,
  saveCopy
} from '@api/modules/quickly';

const { Option } = Select;
const { TextArea } = Input;

/**
 * 秒合约交易对管理页面
 * 功能：交易对列表展示、搜索、新增、编辑、删除、周期复制
 */
const TradePairPage = () => {
  // 1. 状态管理
  const [formVisible, setFormVisible] = useState(false);
  const [copyVisible, setCopyVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [coinList, setCoinList] = useState([]);
  const [cycleList, setCycleList] = useState([]);
  const [copyList, setCopyList] = useState([]);
  const [showChange, setShowChange] = useState(0);
  const [currentMarket, setCurrentMarket] = useState(null);
  const [copyForm, setCopyForm] = useState({ copyId: undefined, copyIds: [] });
  const [nameCoin, setNameCoin] = useState('');

  // 2. 获取币种列表
  const fetchCoinList = async () => {
    try {
      const response = await getCoinList({ pageNum: 1, pageSize: 1000 });
      if (response.code === 0 || response.code === 200) {
        const list = (response.rows || response.data?.records || response.data || []).map(item => ({
          ...item,
          label: `${item.symbol}-${item.market}`
        }));
        setCoinList(list);
      }
    } catch (error) {
      console.error('获取币种列表失败:', error);
    }
  };

  // 3. 获取周期列表（用于周期复制）
  const fetchCycleList = async () => {
    try {
      const response = await getCycleList();
      if (response.code === 0 || response.code === 200) {
        const list = (response.data || []).map(elem => ({
          id: elem.id,
          symbol: elem.symbol,
          coin: elem.coin,
          showSymbol: elem.showSymbol
        }));
        setCycleList(list);
      }
    } catch (error) {
      console.error('获取周期列表失败:', error);
    }
  };

  // 4. 获取复制列表
  const fetchCopyList = async () => {
    try {
      const response = await getCoinList({ pageNum: 1, pageSize: 1000 });
      if (response.code === 0 || response.code === 200) {
        setCopyList(response.rows || response.data?.records || response.data || []);
      }
    } catch (error) {
      console.error('获取复制列表失败:', error);
    }
  };

  // 5. 初始化数据
  useEffect(() => {
    fetchCoinList();
    fetchCycleList();
    fetchCopyList();
  }, []);

  // 6. 事件处理
  const handleAdd = () => {
    setEditingRecord(null);
    setShowChange(0);
    setNameCoin('');
    setFormVisible(true);
  };

  const handleEdit = async (record) => {
    try {
      const response = await getQuicklyTradePairDetail({ id: record.id });
      if (response.code === 0 || response.code === 200) {
        const data = response.data;
        setShowChange(1);
        setNameCoin(`${data.coin?.toUpperCase() || ''}-${data.market || ''}`);
        setEditingRecord({
          ...data,
          coinLabel: `${data.symbol || ''}-${data.market || ''}`
        });
        setFormVisible(true);
      }
    } catch (error) {
      message.error('获取详情失败');
    }
  };

  const handleDelete = async (record) => {
    try {
      const response = await deleteQuicklyTradePair({ id: record.id });
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

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      let submitData = { ...values };

      // 新增时需要设置币种和市场
      if (!editingRecord && currentMarket) {
        submitData.coin = currentMarket.symbol;
        submitData.market = currentMarket.market;
      }

      const response = editingRecord
        ? await updateQuicklyTradePair(submitData)
        : await saveQuicklyTradePair(submitData);

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

  const handleCopy = () => {
    setCopyForm({ copyId: undefined, copyIds: [] });
    setCopyVisible(true);
  };

  const handleCopySubmit = async () => {
    if (!copyForm.copyId || !copyForm.copyIds || copyForm.copyIds.length === 0) {
      message.warning('请选择要复制的币种和周期');
      return;
    }

    try {
      const response = await saveCopy(copyForm);
      if (response.code === 0 || response.code === 200) {
        message.success('复制成功');
        setCopyVisible(false);
        refreshTable();
      } else {
        message.error(response.msg || '复制失败');
      }
    } catch (error) {
      message.error('复制失败: ' + error.message);
    }
  };

  const handleCoinChange = (value) => {
    const coin = coinList.find(item => item.id === value);
    if (coin) {
      setCurrentMarket(coin);
    }
  };

  const refreshTable = () => {
    document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
      new CustomEvent('reload')
    );
  };

  // 7. 币种类型映射
  const coinTypeMap = {
    1: { color: 'blue', text: '现货' },
    2: { color: 'green', text: '合约' },
    3: { color: 'orange', text: '其他' },
  };

  // 8. 列配置
  const columns = [
    {
      title: '图标',
      dataIndex: 'logo',
      key: 'logo',
      width: 80,
      render: (logo) => {
        if (!logo) return <span>-</span>;
        return <Image src={logo} width={30} height={30} style={{ borderRadius: '50%' }} />;
      }
    },
    {
      title: '显示名称',
      dataIndex: 'showSymbol',
      key: 'showSymbol',
      width: 120,
    },
    {
      title: '交易对',
      dataIndex: 'symbol',
      key: 'symbol',
      width: 120,
    },
    {
      title: '币种',
      dataIndex: 'coin',
      key: 'coin',
      width: 100,
    },
    {
      title: '结算币种',
      dataIndex: 'baseCoin',
      key: 'baseCoin',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => {
        return status === 1
          ? <Tag color="warning">开</Tag>
          : <Tag color="default">关</Tag>;
      }
    },
    {
      title: '首屏显示',
      dataIndex: 'showFlag',
      key: 'showFlag',
      width: 100,
      render: (flag) => {
        return flag === 1
          ? <Tag color="success">是</Tag>
          : <Tag color="default">否</Tag>;
      }
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type) => {
        const item = coinTypeMap[type] || { color: 'default', text: '未知' };
        return <Tag color={item.color}>{item.text}</Tag>;
      }
    },
    {
      title: '手续费率',
      dataIndex: 'feeRate',
      key: 'feeRate',
      width: 100,
    },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
      width: 80,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 150,
      ellipsis: true,
    },
  ];

  // 9. 搜索配置
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

  // 10. 渲染
  return (
    <div>
      <CmBasePage
        columns={columns}
        apiEndpoint="/contract/secondCoinConfig/list"
        apiMethod="get"
        searchFieldList={searchFieldList}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        actionButtons={{ edit: true, delete: true }}
        rowKey="id"
        toolBarExtraButtons={[
          <Button key="copy" type="primary" onClick={handleCopy}>
            周期复制
          </Button>
        ]}
      />

      {/* 新增/编辑表单 */}
      <DataForm
        visible={formVisible}
        title={editingRecord ? '修改秒合约交易对' : '添加秒合约交易对'}
        initialValues={editingRecord || {
          status: 1,
          showFlag: 1,
          customPrice: '0'
        }}
        extraValues={{ id: editingRecord?.id }}
        onCancel={() => setFormVisible(false)}
        onSubmit={handleSubmit}
        onClosed={() => {
          setEditingRecord(null);
          setShowChange(0);
          setCurrentMarket(null);
          setNameCoin('');
        }}
        loading={loading}
        formType="modal"
        width={600}
      >
        {showChange === 0 ? (
          <Form.Item
            name="currentId"
            label="币种"
            rules={[{ required: true, message: '请选择币种' }]}
          >
            <Select
              placeholder="请选择币种"
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              onChange={handleCoinChange}
            >
              {coinList.map(coin => (
                <Option key={coin.id} value={coin.id}>{coin.label}</Option>
              ))}
            </Select>
          </Form.Item>
        ) : (
          <Form.Item label="币种">
            <Input value={nameCoin} disabled />
          </Form.Item>
        )}

        <Form.Item
          name="logo"
          label="图标"
        >
          <CmUpload />
        </Form.Item>

        {showChange !== 1 && (
          <Form.Item
            name="periodId"
            label="周期复制"
          >
            <Select
              placeholder="请选择要复制周期的币种"
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              allowClear
            >
              {cycleList.map(coin => (
                <Option key={coin.id} value={coin.id}>{coin.showSymbol}</Option>
              ))}
            </Select>
          </Form.Item>
        )}

        <Form.Item
          name="showSymbol"
          label="显示名称"
          rules={[{ required: true, message: '请输入显示名称' }]}
        >
          <Input placeholder="请输入显示名称" />
        </Form.Item>

        <Form.Item
          name="status"
          label="状态"
          valuePropName="checked"
        >
          <Switch checkedChildren="开" unCheckedChildren="关" />
        </Form.Item>

        <Form.Item
          name="showFlag"
          label="首屏展示"
          valuePropName="checked"
        >
          <Switch checkedChildren="是" unCheckedChildren="否" />
        </Form.Item>

        <Form.Item
          name="type"
          label="类型"
          rules={[{ required: true, message: '请选择类型' }]}
        >
          <Select placeholder="请选择类型">
            <Option value={1}>现货</Option>
            <Option value={2}>合约</Option>
            <Option value={3}>其他</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="feeRate"
          label="手续费率"
        >
          <Input type="number" placeholder="请输入手续费率" />
        </Form.Item>

        <Form.Item
          name="sort"
          label="排序"
        >
          <Input type="number" placeholder="请输入排序" />
        </Form.Item>

        <Form.Item
          name="customPrice"
          label="启用自定义价格"
        >
          <Select>
            <Option value="0">不启用</Option>
            <Option value="1">启用</Option>
          </Select>
        </Form.Item>

        <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.customPrice !== currentValues.customPrice}>
          {({ getFieldValue }) => {
            if (getFieldValue('customPrice') === '1') {
              return (
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
              );
            }
            return null;
          }}
        </Form.Item>

        <Form.Item
          name="remark"
          label="备注"
        >
          <TextArea placeholder="请输入备注" rows={3} />
        </Form.Item>
      </DataForm>

      {/* 周期复制对话框 */}
      <Modal
        title="币种周期"
        open={copyVisible}
        onOk={handleCopySubmit}
        onCancel={() => setCopyVisible(false)}
        width={500}
      >
        <Form layout="vertical">
          <Form.Item label="币种">
            <Select
              placeholder="请选择币种"
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              value={copyForm.copyId}
              onChange={(value) => setCopyForm({ ...copyForm, copyId: value })}
            >
              {copyList.map(coin => (
                <Option key={coin.id} value={coin.id}>{coin.showSymbol}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="周期复制">
            <Select
              mode="multiple"
              placeholder="请选择要复制的周期"
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              value={copyForm.copyIds}
              onChange={(value) => setCopyForm({ ...copyForm, copyIds: value })}
            >
              {cycleList
                .filter(item => item.id !== copyForm.copyId)
                .map(coin => (
                  <Option key={coin.id} value={coin.id}>{coin.showSymbol}</Option>
                ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TradePairPage;
