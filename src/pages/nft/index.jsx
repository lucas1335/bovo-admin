import React, { useState } from 'react';
import { Tabs, message, Modal, Form, Input, Select, InputNumber, DatePicker, Button, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, UploadOutlined } from '@ant-design/icons';
import CmBasePage from '@components/CmBasePage';
import DataForm from '@components/DataForm';
import CmUpload from '@components/CmUpload';
import CmImage from '@components/CmImage';
import {
  getNftSeriesList,
  saveNftSeries,
  updateNftSeries,
  deleteNftSeries,
  getNftProductList,
  getNftProductDetail,
  saveNftProduct,
  updateNftProduct,
  deleteNftProduct,
  getNftSeriesOptions,
  updateNftProductStatus,
  getNftOrderList,
  deleteNftOrder,
} from '@api';

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

/**
 * NFT管理页面
 * 包含：NFT合集管理、NFT藏品管理、NFT订单管理
 */
const NftManagement = () => {
  const [activeTab, setActiveTab] = useState('series');

  return (
    <div>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'series',
            label: 'NFT合集',
            children: <NftSeries />,
          },
          {
            key: 'product',
            label: 'NFT藏品',
            children: <NftProduct />,
          },
          {
            key: 'order',
            label: 'NFT订单',
            children: <NftOrder />,
          },
        ]}
      />
    </div>
  );
};

// ==================== NFT合集管理 ====================
const NftSeries = () => {
  const [formVisible, setFormVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);

  const refreshTable = () => {
    document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
      new CustomEvent('reload')
    );
  };

  const handleAdd = () => {
    setEditingRecord(null);
    setFormVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormVisible(true);
  };

  const handleDelete = async (record) => {
    try {
      const response = await deleteNftSeries(record.id);
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
      const response = editingRecord
        ? await updateNftSeries(values)
        : await saveNftSeries(values);

      if (response.code === 0 || response.code === 200) {
        message.success(editingRecord ? '更新成功' : '创建成功');
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

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: true,
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      sorter: true,
    },
    {
      title: '所属链',
      dataIndex: 'chainType',
      key: 'chainType',
      width: 120,
    },
    {
      title: '所属链图标',
      dataIndex: 'coinUrl',
      key: 'coinUrl',
      width: 100,
      render: (text) => <CmImage src={text} width={60} height={60} />,
    },
    {
      title: '交易总价格',
      dataIndex: 'tradeAmount',
      key: 'tradeAmount',
      width: 120,
      render: (amount) => amount ? Number(amount).toFixed(2) : '0.00',
    },
    {
      title: '交易次数',
      dataIndex: 'tradeNum',
      key: 'tradeNum',
      width: 100,
    },
    {
      title: '地板价格',
      dataIndex: 'aveAmount',
      key: 'aveAmount',
      width: 120,
      render: (amount) => amount ? Number(amount).toFixed(2) : '0.00',
    },
    {
      title: '封面',
      dataIndex: 'logoUrl',
      key: 'logoUrl',
      width: 100,
      render: (text) => <CmImage src={text} width={60} height={60} />,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
    },
  ];

  const searchFieldList = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'SEARCH_LIKE_name',
      type: 'text',
    },
    {
      title: '所属链',
      dataIndex: 'chainType',
      key: 'SEARCH_LIKE_chainType',
      type: 'text',
    },
    {
      title: '交易总价格(最小)',
      dataIndex: 'tradeAmountMin',
      key: 'SEARCH_GTE_tradeAmount',
      type: 'digit',
    },
    {
      title: '交易总价格(最大)',
      dataIndex: 'tradeAmountMax',
      key: 'SEARCH_LTE_tradeAmount',
      type: 'digit',
    },
    {
      title: '交易次数(最小)',
      dataIndex: 'tradeNumMin',
      key: 'SEARCH_GTE_tradeNum',
      type: 'digit',
    },
    {
      title: '交易次数(最大)',
      dataIndex: 'tradeNumMax',
      key: 'SEARCH_LTE_tradeNum',
      type: 'digit',
    },
  ];

  return (
    <div>
      <CmBasePage
        columns={columns}
        apiEndpoint="/contract/nftSeries/getList"
        apiMethod="get"
        searchFieldList={searchFieldList}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        rowKey="id"
        actionButtons={{ view: false, edit: true, delete: true }}
      />

      <DataForm
        visible={formVisible}
        title={editingRecord ? '编辑NFT合集' : '新增NFT合集'}
        initialValues={editingRecord || {}}
        extraValues={{ id: editingRecord?.id }}
        onCancel={() => setFormVisible(false)}
        onSubmit={handleSubmit}
        onClosed={() => setEditingRecord(null)}
        loading={loading}
        width={600}
        formType="drawer"
      >
        <Form.Item
          name="name"
          label="合集名称"
          rules={[{ required: true, message: '请输入合集名称' }]}
        >
          <Input placeholder="请输入合集名称" />
        </Form.Item>

        <Form.Item
          name="chainType"
          label="所属链"
          rules={[{ required: true, message: '请输入所属链' }]}
        >
          <Input placeholder="请输入所属链，如：ETH、BSC、POLYGON" />
        </Form.Item>

        <Form.Item
          name="coinUrl"
          label="所属链图标"
          rules={[{ required: true, message: '请上传所属链图标' }]}
        >
          <CmUpload />
        </Form.Item>

        <Form.Item
          name="tradeAmount"
          label="交易总价格"
          rules={[{ required: true, message: '请输入交易总价格' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="请输入交易总价格"
            precision={2}
            min={0}
          />
        </Form.Item>

        <Form.Item
          name="tradeNum"
          label="交易次数"
          rules={[{ required: true, message: '请输入交易次数' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="请输入交易次数"
            min={0}
          />
        </Form.Item>

        <Form.Item
          name="aveAmount"
          label="地板价格"
          rules={[{ required: true, message: '请输入地板价格' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="请输入地板价格"
            precision={2}
            min={0}
          />
        </Form.Item>

        <Form.Item
          name="logoUrl"
          label="封面图"
          rules={[{ required: true, message: '请上传封面图' }]}
        >
          <CmUpload />
        </Form.Item>

        <Form.Item
          name="remark"
          label="备注"
        >
          <TextArea rows={4} placeholder="请输入备注" />
        </Form.Item>
      </DataForm>
    </div>
  );
};

// ==================== NFT藏品管理 ====================
const NftProduct = () => {
  const [formVisible, setFormVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [seriesOptions, setSeriesOptions] = useState([]);

  const refreshTable = () => {
    document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
      new CustomEvent('reload')
    );
  };

  const fetchSeriesOptions = async () => {
    try {
      const response = await getNftSeriesOptions();
      if (response.code === 0 || response.code === 200) {
        setSeriesOptions(response.data || []);
      }
    } catch (error) {
      console.error('获取合集列表失败:', error);
    }
  };

  const handleAdd = () => {
    setEditingRecord(null);
    fetchSeriesOptions();
    setFormVisible(true);
  };

  const handleEdit = async (record) => {
    try {
      const response = await getNftProductDetail(record.id);
      if (response.code === 0 || response.code === 200) {
        setEditingRecord(response.data);
        fetchSeriesOptions();
        setFormVisible(true);
      }
    } catch (error) {
      message.error('获取详情失败');
    }
  };

  const handleDelete = async (record) => {
    try {
      const response = await deleteNftProduct(record.id);
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

  const handleStatusChange = async (record) => {
    try {
      const newStatus = record.status === 1 ? 2 : 1;
      const response = await updateNftProductStatus({ id: record.id, status: newStatus });
      if (response.code === 0 || response.code === 200) {
        message.success(newStatus === 2 ? '上架成功' : '下架成功');
        refreshTable();
      } else {
        message.error(response.msg || '操作失败');
      }
    } catch (error) {
      message.error('操作失败: ' + error.message);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = editingRecord
        ? await updateNftProduct(values)
        : await saveNftProduct(values);

      if (response.code === 0 || response.code === 200) {
        message.success(editingRecord ? '更新成功' : '创建成功');
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

  // 商品状态映射
  const statusMap = {
    1: { color: 'default', text: '未上架' },
    2: { color: 'success', text: '已上架' },
  };

  // 销售状态映射
  const saleStatusMap = {
    0: { color: 'warning', text: '待审核' },
    1: { color: 'default', text: '待售' },
    2: { color: 'success', text: '持有' },
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: true,
    },
    {
      title: '图片',
      dataIndex: 'imgUrl',
      key: 'imgUrl',
      width: 100,
      render: (text) => <CmImage src={text} width={80} height={80} />,
    },
    {
      title: '合集ID',
      dataIndex: 'seriesId',
      key: 'seriesId',
      width: 100,
    },
    {
      title: '所属链',
      dataIndex: 'chainType',
      key: 'chainType',
      width: 100,
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
      width: 120,
    },
    {
      title: '持有者地址',
      dataIndex: 'holdAddress',
      key: 'holdAddress',
      width: 180,
      ellipsis: true,
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (price) => price ? Number(price).toFixed(2) : '0.00',
    },
    {
      title: '手续费',
      dataIndex: 'handlingFee',
      key: 'handlingFee',
      width: 100,
      render: (fee) => fee ? Number(fee).toFixed(2) : '0.00',
    },
    {
      title: '版权费',
      dataIndex: 'copyrightFee',
      key: 'copyrightFee',
      width: 100,
      render: (fee) => fee ? Number(fee).toFixed(2) : '0.00',
    },
    {
      title: '商品状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusInfo = statusMap[status] || { color: 'default', text: '未知' };
        return <span style={{ color: statusInfo.color === 'success' ? '#52c41a' : '#999' }}>{statusInfo.text}</span>;
      },
    },
    {
      title: '销售状态',
      dataIndex: 'saleStatus',
      key: 'saleStatus',
      width: 100,
      render: (saleStatus) => {
        const statusInfo = saleStatusMap[saleStatus] || { color: 'default', text: '未知' };
        return <span style={{ color: statusInfo.color === 'success' ? '#52c41a' : statusInfo.color === 'warning' ? '#faad14' : '#999' }}>{statusInfo.text}</span>;
      },
    },
    {
      title: '上架结束日期',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 120,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
    },
  ];

  const searchFieldList = [
    {
      title: '合集ID',
      dataIndex: 'seriesId',
      key: 'SEARCH_EQ_seriesId',
      type: 'digit',
    },
    {
      title: '所属链',
      dataIndex: 'chainType',
      key: 'SEARCH_LIKE_chainType',
      type: 'text',
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'SEARCH_LIKE_author',
      type: 'text',
    },
    {
      title: '持有者地址',
      dataIndex: 'holdAddress',
      key: 'SEARCH_LIKE_holdAddress',
      type: 'text',
    },
    {
      title: '价格(最小)',
      dataIndex: 'priceMin',
      key: 'SEARCH_GTE_price',
      type: 'digit',
    },
    {
      title: '价格(最大)',
      dataIndex: 'priceMax',
      key: 'SEARCH_LTE_price',
      type: 'digit',
    },
    {
      title: '商品状态',
      dataIndex: 'status',
      key: 'SEARCH_EQ_status',
      type: 'select',
      options: [
        { label: '未上架', value: 1 },
        { label: '已上架', value: 2 },
      ],
    },
    {
      title: '销售状态',
      dataIndex: 'saleStatus',
      key: 'SEARCH_EQ_saleStatus',
      type: 'select',
      options: [
        { label: '待审核', value: 0 },
        { label: '待售', value: 1 },
        { label: '持有', value: 2 },
      ],
    },
  ];

  return (
    <div>
      <CmBasePage
        columns={columns}
        apiEndpoint="/contract/nftProduct/getList"
        apiMethod="get"
        searchFieldList={searchFieldList}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        rowKey="id"
        actionButtons={{ view: false, edit: true, delete: true }}
        extraActions={(record) => [
          record.status === 1 ? (
            <Button
              key="listing"
              type="link"
              size="small"
              icon={<UploadOutlined />}
              onClick={() => handleStatusChange(record)}
            >
              上架
            </Button>
          ) : (
            <Button
              key="delisting"
              type="link"
              size="small"
              onClick={() => handleStatusChange(record)}
            >
              下架
            </Button>
          ),
        ]}
      />

      <DataForm
        visible={formVisible}
        title={editingRecord ? '编辑NFT藏品' : '新增NFT藏品'}
        initialValues={editingRecord || {}}
        extraValues={{ id: editingRecord?.id }}
        onCancel={() => setFormVisible(false)}
        onSubmit={handleSubmit}
        onClosed={() => setEditingRecord(null)}
        loading={loading}
        width={600}
        formType="drawer"
      >
        <Form.Item
          name="seriesId"
          label="所属合集"
          rules={[{ required: true, message: '请选择所属合集' }]}
        >
          <Select placeholder="请选择所属合集" showSearch filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }>
            {seriesOptions.map(item => (
              <Option key={item.id} value={item.id}>{item.name}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="imgUrl"
          label="藏品图片"
          rules={[{ required: true, message: '请上传藏品图片' }]}
        >
          <CmUpload />
        </Form.Item>

        <Form.Item
          name="userId"
          label="所属用户ID"
          rules={[{ required: true, message: '请输入所属用户ID' }]}
        >
          <InputNumber style={{ width: '100%' }} placeholder="请输入所属用户ID" min={0} />
        </Form.Item>

        <Form.Item
          name="chainType"
          label="所属链"
          rules={[{ required: true, message: '请输入所属链' }]}
        >
          <Input placeholder="请输入所属链，如：ETH、BSC、POLYGON" />
        </Form.Item>

        <Form.Item
          name="author"
          label="作者"
          rules={[{ required: true, message: '请输入作者' }]}
        >
          <Input placeholder="请输入作者" />
        </Form.Item>

        <Form.Item
          name="holdAddress"
          label="持有者地址"
          rules={[{ required: true, message: '请输入持有者地址' }]}
        >
          <Input placeholder="请输入持有者地址" />
        </Form.Item>

        <Form.Item
          name="price"
          label="价格"
          rules={[{ required: true, message: '请输入价格' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="请输入价格"
            precision={2}
            min={0}
          />
        </Form.Item>

        <Form.Item
          name="handlingFee"
          label="手续费"
          rules={[{ required: true, message: '请输入手续费' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="请输入手续费"
            precision={2}
            min={0}
          />
        </Form.Item>

        <Form.Item
          name="copyrightFee"
          label="版权费"
          rules={[{ required: true, message: '请输入版权费' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="请输入版权费"
            precision={2}
            min={0}
          />
        </Form.Item>

        <Form.Item
          name="des"
          label="描述"
          rules={[{ required: true, message: '请输入描述' }]}
        >
          <TextArea rows={4} placeholder="请输入描述" />
        </Form.Item>

        <Form.Item
          name="endDate"
          label="上架结束日期"
          rules={[{ required: true, message: '请选择上架结束日期' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="remark"
          label="备注"
        >
          <TextArea rows={3} placeholder="请输入备注" />
        </Form.Item>
      </DataForm>
    </div>
  );
};

// ==================== NFT订单管理 ====================
const NftOrder = () => {
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);

  const refreshTable = () => {
    document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
      new CustomEvent('reload')
    );
  };

  const handleView = (record) => {
    setCurrentRecord(record);
    setDetailVisible(true);
  };

  const handleDelete = async (record) => {
    try {
      const response = await deleteNftOrder(record.id);
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

  // 订单状态映射
  const statusMap = {
    0: { color: 'default', text: '报价' },
    1: { color: 'success', text: '成交' },
    2: { color: 'error', text: '失效' },
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: true,
    },
    {
      title: '集合ID',
      dataIndex: 'seriesId',
      key: 'seriesId',
      width: 100,
    },
    {
      title: '藏品ID',
      dataIndex: 'productId',
      key: 'productId',
      width: 100,
    },
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 100,
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (amount) => amount ? Number(amount).toFixed(2) : '0.00',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusInfo = statusMap[status] || { color: 'default', text: '未知' };
        return <span style={{ color: statusInfo.color === 'success' ? '#52c41a' : statusInfo.color === 'error' ? '#ff4d4f' : '#999' }}>{statusInfo.text}</span>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
    },
  ];

  const searchFieldList = [
    {
      title: '集合ID',
      dataIndex: 'seriesId',
      key: 'SEARCH_EQ_seriesId',
      type: 'digit',
    },
    {
      title: '藏品ID',
      dataIndex: 'productId',
      key: 'SEARCH_EQ_productId',
      type: 'digit',
    },
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'SEARCH_EQ_userId',
      type: 'digit',
    },
    {
      title: '金额(最小)',
      dataIndex: 'amountMin',
      key: 'SEARCH_GTE_amount',
      type: 'digit',
    },
    {
      title: '金额(最大)',
      dataIndex: 'amountMax',
      key: 'SEARCH_LTE_amount',
      type: 'digit',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'SEARCH_EQ_status',
      type: 'select',
      options: [
        { label: '报价', value: 0 },
        { label: '成交', value: 1 },
        { label: '失效', value: 2 },
      ],
    },
  ];

  return (
    <div>
      <CmBasePage
        columns={columns}
        apiEndpoint="/contract/nftOrder/getList"
        apiMethod="get"
        searchFieldList={searchFieldList}
        onView={handleView}
        onDelete={handleDelete}
        rowKey="id"
        actionButtons={{ view: true, edit: false, delete: true }}
      />

      <Modal
        title="订单详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        {currentRecord && (
          <Form labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
            <Form.Item label="订单ID">
              <span>{currentRecord.id}</span>
            </Form.Item>
            <Form.Item label="集合ID">
              <span>{currentRecord.seriesId}</span>
            </Form.Item>
            <Form.Item label="藏品ID">
              <span>{currentRecord.productId}</span>
            </Form.Item>
            <Form.Item label="用户ID">
              <span>{currentRecord.userId}</span>
            </Form.Item>
            <Form.Item label="金额">
              <span>{currentRecord.amount ? Number(currentRecord.amount).toFixed(2) : '0.00'}</span>
            </Form.Item>
            <Form.Item label="状态">
              <span style={{ color: statusMap[currentRecord.status]?.color === 'success' ? '#52c41a' : statusMap[currentRecord.status]?.color === 'error' ? '#ff4d4f' : '#999' }}>
                {statusMap[currentRecord.status]?.text || '未知'}
              </span>
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
    </div>
  );
};

export default NftManagement;
