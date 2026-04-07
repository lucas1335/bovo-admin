import React, { useState, useEffect } from 'react';
import { message, Form, Input, Select, Slider, Switch, Modal, Tag, Image } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import CmBasePage from '@components/CmBasePage';
import CmUpload from '@components/CmUpload';
import {
  getSpontaneousCoinList,
  getSpontaneousCoinDetail,
  addSpontaneousCoin,
  updateSpontaneousCoin,
  deleteSpontaneousCoin,
  getKlineSymbolList,
} from '@api/modules/spontaneousCoin';

const { confirm } = Modal;
const { Option } = Select;

/**
 * 自发币种管理页面
 * 功能：币种列表展示、新增、修改、删除、显示价格折算切换
 */
const SpontaneousCoinPage = () => {
  // 状态管理
  const [formVisible, setFormVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [coinList, setCoinList] = useState([]); // 币种交易所列表
  const [currentMarket, setCurrentMarket] = useState({}); // 当前选择的交易所
  const [amountAvailable, setAmountAvailable] = useState(''); // 可用金额
  const [sliderValue, setSliderValue] = useState(0); // 滑块值

  const [form] = Form.useForm();

  /**
   * 获取币种交易所列表
   */
  const fetchCoinList = async () => {
    try {
      const response = await getKlineSymbolList({ pageNum: 1, pageSize: 999 });

      if (response.code === 0 || response.code === 200) {
        const list = (response.rows || []).map(elem => ({
          ...elem,
          label: `${elem.coin}-${elem.market}`
        }));
        setCoinList(list);
      }
    } catch (error) {
      console.error('获取币种列表失败:', error);
    }
  };

  useEffect(() => {
    fetchCoinList();
  }, []);

  /**
   * 加载列表数据
   */
  const loadData = async (params) => {
    const requestParams = {
      pageNum: params.current || 1,
      pageSize: params.pageSize || 10,
      searchParam: params.searchParam || '{}',
      orderByColumn: 'createTime',
      // isAsc: false
    };

    const response = await getSpontaneousCoinList(requestParams);

    if (response.code === 0 || response.code === 200) {
      return {
        data: response.rows || response.data?.rows || response.data?.list || response.data?.records || [],
        success: true,
        total: response.total || response.data?.total || 0
      };
    } else {
      message.error(response.msg || '获取数据失败');
      return {
        data: [],
        success: false,
        total: 0
      };
    }
  };

  /**
   * 打开新增对话框
   */
  const handleAdd = () => {
    setEditingRecord(null);
    setSliderValue(0);
    setAmountAvailable('');
    setCurrentMarket({});
    form.resetFields();
    setFormVisible(true);
  };

  /**
   * 打开编辑对话框
   */
  const handleEdit = async (record) => {
    setEditingRecord(record);

    const response = await getSpontaneousCoinDetail(record.id);

    if (response.code === 0 || response.code === 200) {
      const data = response.data;
      form.setFieldsValue(data);
      setAmountAvailable(data.price);
      setSliderValue(Math.round(data.proportion || 0));
      setFormVisible(true);
    } else {
      message.error(response.msg || '获取详情失败');
    }
  };

  /**
   * 参考币种变更
   */
  const handleCoinChange = (value) => {
    const selected = coinList.find(item => item.coin === value);
    if (selected) {
      setCurrentMarket(selected);
      setAmountAvailable(selected.price);
      form.setFieldsValue({
        referMarket: selected.market,
        price: selected.price
      });
    }
  };

  /**
   * 滑块值变更 - 计算价格
   */
  const handleSliderChange = (value) => {
    setSliderValue(value);

    if (!amountAvailable || Number(value) === 0) {
      form.setFieldsValue({ proportion: 100 });
      return;
    }

    let newPrice;
    let newProportion;

    if (Number(value) > 0) {
      // 正值：增加百分比
      const percentPrice = (Number(amountAvailable) / 100).toFixed(6);
      newPrice = (Number(percentPrice) * value).toFixed(6);
      newProportion = (Number(newPrice) / Number(amountAvailable)) * 100;
    } else if (value < 0) {
      // 负值：减少百分比
      const x = (500 + value) / 500;
      newPrice = (Number(amountAvailable) * x).toFixed(6);
      if (value === -500) {
        newProportion = 0;
      } else {
        newProportion = (Number(newPrice) / Number(amountAvailable)) * 100;
      }
    } else {
      newPrice = amountAvailable;
      newProportion = 100;
    }

    form.setFieldsValue({
      price: newPrice,
      proportion: newProportion.toFixed(6)
    });
  };

  /**
   * 提交表单
   */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const submitData = {
        ...values,
        id: editingRecord?.id
      };

      const response = editingRecord?.id
        ? await updateSpontaneousCoin(submitData)
        : await addSpontaneousCoin(submitData);

      if (response.code === 0 || response.code === 200) {
        message.success(editingRecord?.id ? '修改成功' : '新增成功');
        setFormVisible(false);
        form.resetFields();
        document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
          new CustomEvent('reload')
        );
      } else {
        message.error(response.msg || '操作失败');
      }
    } catch (error) {
      if (error.errorFields) {
        message.warning('请填写必填项');
      } else {
        message.error('操作失败: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * 删除币种
   */
  const handleDelete = (record) => {
    confirm({
      title: '确认删除?',
      icon: <ExclamationCircleOutlined />,
      content: `是否确认删除发币编号为"${record.id}"的数据项？`,
      onOk: async () => {
        try {
          setLoading(true);
          const response = await deleteSpontaneousCoin(record.id);

          if (response.code === 0 || response.code === 200) {
            message.success('删除成功');
            document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
              new CustomEvent('reload')
            );
          } else {
            message.error(response.msg || '删除失败');
          }
        } catch (error) {
          message.error('删除失败: ' + error.message);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  /**
   * 显示/隐藏价格折算
   */
  const handleIsCountChange = (record, checked) => {
    confirm({
      title: '确认操作?',
      icon: <ExclamationCircleOutlined />,
      content: `是否${checked ? '显示' : '隐藏'}价格折算？`,
      onOk: async () => {
        try {
          const updateData = { ...record, isCount: checked ? '1' : '0' };
          const response = await updateSpontaneousCoin(updateData);

          if (response.code === 0 || response.code === 200) {
            message.success('修改成功');
            document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
              new CustomEvent('reload')
            );
          } else {
            message.error(response.msg || '操作失败');
          }
        } catch (error) {
          message.error('操作失败: ' + error.message);
        }
      },
      onCancel: () => {
        // 取消时恢复原状态
        document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
          new CustomEvent('reload')
        );
      }
    });
  };

  // 滑块刻度标记
  const sliderMarks = {
    '-500': '-500%',
    '-375': '-375%',
    '-250': '-250%',
    '-125': '-125%',
    0: '0',
    125: '125%',
    250: '250%',
    375: '375%',
    500: '500%'
  };

  // 列配置
  const columns = [
    {
      title: '主键ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '图标',
      dataIndex: 'logo',
      key: 'logo',
      width: 80,
      render: (logo) => logo ? (
        <Image src={logo} width={30} height={30} style={{ borderRadius: '50%' }} />
      ) : '-',
    },
    {
      title: '币种',
      dataIndex: 'coin',
      key: 'coin',
      width: 120,
    },
    {
      title: '参考币种',
      dataIndex: 'referCoin',
      key: 'referCoin',
      width: 120,
    },
    {
      title: '参考币种交易所',
      dataIndex: 'referMarket',
      key: 'referMarket',
      width: 150,
    },
    {
      title: '初始价格',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (price) => price ? Number(price).toFixed(6) : '-',
    },
    {
      title: '价格百分比',
      dataIndex: 'proportion',
      key: 'proportion',
      width: 120,
      render: (proportion) => proportion ? Number(proportion).toFixed(2) + '%' : '-',
    },
    {
      title: '显示价格折算',
      dataIndex: 'isCount',
      key: 'isCount',
      width: 130,
      render: (isCount, record) => (
        <Switch
          checked={isCount === '1'}
          onChange={(checked) => handleIsCountChange(record, checked)}
        />
      ),
    },
  ];

  // 搜索配置
  const searchFieldList = [
    {
      title: '币种',
      dataIndex: 'coin',
      key: 'SEARCH_LIKE_coin',
      type: 'text',
    },
    {
      title: '参考币种',
      dataIndex: 'referCoin',
      key: 'SEARCH_LIKE_referCoin',
      type: 'text',
    },
  ];

  return (
    <>
      <CmBasePage
        columns={columns}
        onLoadData={loadData}
        searchFieldList={searchFieldList}
        rowKey="id"
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        actionButtons={{
          view: false,
          edit: true,
          delete: true,
        }}
      />

      {/* 新增/编辑对话框 */}
      <Modal
        title={editingRecord?.id ? '修改发币' : '添加发币'}
        open={formVisible}
        onCancel={() => {
          setFormVisible(false);
          form.resetFields();
        }}
        onOk={handleSubmit}
        confirmLoading={loading}
        width={800}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          preserve={false}
        >
          <Form.Item
            name="coin"
            label="币种"
            rules={[{ required: true, message: '币种不能为空' }]}
          >
            <Input placeholder="请输入币种" />
          </Form.Item>

          <Form.Item
            name="referCoin"
            label="参考币种"
            rules={[{ required: true, message: '请选择参考币种' }]}
          >
            <Select
              placeholder="请选择币种"
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              onChange={handleCoinChange}
            >
              {coinList.map(item => (
                <Option key={item.label} value={item.coin}>
                  {item.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="referMarket"
            label="参考币种交易所"
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            name="logo"
            label="图标"
            rules={[{ required: true, message: '请上传图标' }]}
          >
            <CmUpload limit={1} />
          </Form.Item>

          <Form.Item
            name="price"
            label="初始价格"
            rules={[{ required: true, message: '价格不能为空' }]}
          >
            <Input disabled />
          </Form.Item>

          {currentMarket.market && (
            <Form.Item label="价格调整">
              <div style={{ padding: '0 10px' }}>
                <Slider
                  min={-500}
                  max={500}
                  step={50}
                  value={sliderValue}
                  onChange={handleSliderChange}
                  marks={sliderMarks}
                  tooltip={{ formatter: (value) => `${value}%` }}
                />
              </div>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </>
  );
};

export default SpontaneousCoinPage;
