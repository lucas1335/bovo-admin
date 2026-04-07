import React, { useState } from 'react';
import { message, Tag, Form, Input, InputNumber, Select, Switch, Image } from 'antd';
import CmBasePage from '@components/CmBasePage';
import DataForm from '@components/DataForm';
import CmUpload from '@components/CmUpload';
import { getFinancialProductList, getFinancialProductDetail, saveFinancialProduct, updateFinancialProduct, deleteFinancialProduct } from '@api/modules/financial';

/**
 * 理财产品管理页面
 * 功能：理财产品列表展示、搜索、新增、编辑、删除
 */
const ProductManagePage = () => {
  const [formVisible, setFormVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);

  /**
   * 新增产品
   */
  const handleAdd = () => {
    setEditingRecord(null);
    setFormVisible(true);
  };

  /**
   * 编辑产品
   */
  const handleEdit = async (record) => {
    try {
      const response = await getFinancialProductDetail(record.id);
      if (response.code === 0 || response.code === 200) {
        setEditingRecord(response.data);
        setFormVisible(true);
      } else {
        message.error(response.msg || '获取产品详情失败');
      }
    } catch (error) {
      message.error('获取产品详情失败: ' + error.message);
    }
  };

  /**
   * 删除产品
   */
  const handleDelete = async (record) => {
    try {
      const response = await deleteFinancialProduct(record.id);
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
      const response = editingRecord
        ? await updateFinancialProduct(values)
        : await saveFinancialProduct(values);

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

  /**
   * 刷新表格数据
   */
  const refreshTable = () => {
    document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
      new CustomEvent('reload')
    );
  };

  /**
   * 状态映射
   */
  const statusMap = {
    1: { color: 'success', text: '启用' },
    0: { color: 'default', text: '禁用' },
  };

  /**
   * 分类映射
   */
  const classifyMap = {
    '1': 'VIP',
    '0': '普通',
  };

  /**
   * 列配置定义
   */
  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: 150,
      ellipsis: true,
    },
    {
      title: '图标',
      dataIndex: 'icon',
      key: 'icon',
      width: 80,
      render: (icon) => (
        icon ? <Image src={icon} width={50} height={50} style={{ objectFit: 'cover' }} /> : '-'
      ),
    },
    {
      title: 'VIP等级',
      dataIndex: 'level',
      key: 'level',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => {
        const statusInfo = statusMap[status] || { color: 'default', text: '未知' };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
    },
    {
      title: '天数',
      dataIndex: 'days',
      key: 'days',
      width: 80,
    },
    {
      title: '违约利率(%)',
      dataIndex: 'defaultOdds',
      key: 'defaultOdds',
      width: 100,
      render: (odds) => `${odds || 0}%`,
    },
    {
      title: '日利率范围(%)',
      key: 'oddsRange',
      width: 130,
      render: (_, record) => (
        <span>{record.minOdds} / {record.maxOdds}</span>
      ),
    },
    {
      title: '限购次数',
      dataIndex: 'timeLimit',
      key: 'timeLimit',
      width: 80,
      render: (limit) => limit ? limit : '不限',
    },
    {
      title: '金额范围',
      key: 'amountRange',
      width: 130,
      render: (_, record) => (
        <span>{record.limitMin} / {record.limitMax}</span>
      ),
    },
    {
      title: '热销',
      dataIndex: 'isHot',
      key: 'isHot',
      width: 60,
      render: (isHot) => (isHot ? '是' : '否'),
    },
    {
      title: '购买次数',
      dataIndex: 'buyPurchase',
      key: 'buyPurchase',
      width: 100,
    },
    {
      title: '日平均利率(%)',
      dataIndex: 'avgRate',
      key: 'avgRate',
      width: 100,
      render: (rate) => `${rate || 0}%`,
    },
    {
      title: '币种',
      dataIndex: 'coin',
      key: 'coin',
      width: 60,
    },
    {
      title: '分类',
      dataIndex: 'classify',
      key: 'classify',
      width: 80,
      render: (classify) => classifyMap[classify] || '-',
    },
    {
      title: '项目进度(%)',
      dataIndex: 'process',
      key: 'process',
      width: 100,
    },
    {
      title: '平台基础投资金额',
      dataIndex: 'basicInvestAmount',
      key: 'basicInvestAmount',
      width: 120,
    },
    {
      title: '平台总投资额',
      dataIndex: 'totalInvestAmount',
      key: 'totalInvestAmount',
      width: 100,
    },
    {
      title: '剩余/已购金额',
      key: 'amountStatus',
      width: 130,
      render: (_, record) => (
        <span>{record.remainAmount} / {record.purchasedAmount}</span>
      ),
    },
  ];

  /**
   * 搜索字段配置
   */
  const searchFieldList = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'SEARCH_LIKE_title',
      type: 'text',
    },
    {
      title: '币种',
      dataIndex: 'coin',
      key: 'SEARCH_LIKE_coin',
      type: 'text',
    },
    {
      title: '分类',
      dataIndex: 'classify',
      key: 'SEARCH_LIKE_classify',
      type: 'text',
    },
    {
      title: 'VIP等级',
      dataIndex: 'level',
      key: 'SEARCH_LIKE_level',
      type: 'text',
    },
  ];

  /**
   * 表单初始值
   */
  const getInitialValues = () => {
    if (editingRecord) {
      return {
        ...editingRecord,
        isHot: editingRecord.isHot === 1,
        status: editingRecord.status === 1,
      };
    }
    return {
      coin: 'USDT',
      isHot: false,
      status: true,
    };
  };

  return (
    <div>
      {/* 理财产品列表 */}
      <CmBasePage
        columns={columns}
        apiEndpoint="/contract/mineFinancial/list"
        apiMethod="get"
        searchFieldList={searchFieldList}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        actionButtons={{
          view: false,
          edit: true,
          delete: true,
        }}
        rowKey="id"
      />

      {/* 产品表单 */}
      <DataForm
        visible={formVisible}
        title={editingRecord ? '修改理财产品' : '添加理财产品'}
        initialValues={getInitialValues()}
        extraValues={{ id: editingRecord?.id }}
        onCancel={() => setFormVisible(false)}
        onSubmit={handleSubmit}
        onClosed={() => setEditingRecord(null)}
        loading={loading}
        formType="modal"
        width="800px"
      >
        <Form.Item
          name="icon"
          label="图片"
          rules={[{ required: true, message: '请上传产品图片' }]}
        >
          <CmUpload limit={1} />
        </Form.Item>

        <Form.Item
          name="title"
          label="标题"
          rules={[{ required: true, message: '标题不能为空' }]}
        >
          <Input placeholder="请输入标题" />
        </Form.Item>

        <Form.Item
          name="days"
          label="天数"
          rules={[{ required: true, message: '天数(如 7,10,30)不能为空' }]}
        >
          <InputNumber placeholder="请输入天数" min={1} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="defaultOdds"
          label="违约利率(%)"
        >
          <InputNumber placeholder="请输入违约利率" min={0} step={0.01} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="minOdds"
          label="最小日利率(%)"
        >
          <InputNumber placeholder="请输入最小日利率" min={0} step={0.01} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="maxOdds"
          label="最大日利率(%)"
        >
          <InputNumber placeholder="请输入最大日利率" min={0} step={0.01} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="timeLimit"
          label="限购次数"
          rules={[{ required: true, message: '每人限购次数，0表示不限不能为空' }]}
          extra="0表示不限"
        >
          <InputNumber placeholder="请输入限购次数" min={0} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="limitMin"
          label="最小金额"
          rules={[{ required: true, message: '最小金额不能为空' }]}
        >
          <InputNumber placeholder="请输入最小金额" min={0} step={0.01} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="limitMax"
          label="最大金额"
          rules={[{ required: true, message: '最大金额不能为空' }]}
        >
          <InputNumber placeholder="请输入最大金额" min={0} step={0.01} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="isHot"
          label="是否热销"
          valuePropName="checked"
          getValueFromEvent={(checked) => (checked ? 1 : 0)}
        >
          <Switch checkedChildren="是" unCheckedChildren="否" />
        </Form.Item>

        <Form.Item
          name="status"
          label="是否启用"
          valuePropName="checked"
          getValueFromEvent={(checked) => (checked ? 1 : 0)}
        >
          <Switch checkedChildren="是" unCheckedChildren="否" />
        </Form.Item>

        <Form.Item
          name="sort"
          label="排序"
        >
          <InputNumber placeholder="请输入排序值" min={0} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="buyPurchase"
          label="购买次数"
        >
          <InputNumber placeholder="请输入购买次数" min={0} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="avgRate"
          label="日平均利率(%)"
        >
          <InputNumber placeholder="请输入日平均利率" min={0} step={0.01} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="coin"
          label="币种"
        >
          <Input disabled />
        </Form.Item>

        <Form.Item
          name="classify"
          label="分类"
          rules={[{ required: true, message: '请选择分类' }]}
        >
          <Select placeholder="请选择分类">
            <Select.Option value="1">VIP</Select.Option>
            <Select.Option value="0">普通</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="basicInvestAmount"
          label="平台基础投资金额"
        >
          <InputNumber placeholder="请输入平台基础投资金额" min={0} step={0.01} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="totalInvestAmount"
          label="平台总投资额"
        >
          <InputNumber placeholder="请输入平台总投资额" min={0} step={0.01} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="level"
          label="VIP等级"
        >
          <Input placeholder="请输入VIP等级" />
        </Form.Item>

        <Form.Item
          name="process"
          label="项目进度(%)"
        >
          <InputNumber placeholder="请输入项目进度" min={0} max={100} step={0.01} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="remainAmount"
          label="剩余金额"
        >
          <InputNumber placeholder="请输入剩余金额" min={0} step={0.01} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="remark"
          label="标签"
        >
          <Input.TextArea placeholder="请输入标签" rows={3} />
        </Form.Item>

        <Form.Item
          name="purchasedAmount"
          label="已购金额"
        >
          <InputNumber placeholder="请输入已购金额" min={0} step={0.01} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="problem"
          label="常见问题"
        >
          <Input.TextArea placeholder="请输入常见问题" rows={4} />
        </Form.Item>

        <Form.Item
          name="prodectIntroduction"
          label="产品介绍"
        >
          <Input.TextArea placeholder="请输入产品介绍" rows={4} />
        </Form.Item>
      </DataForm>
    </div>
  );
};

export default ProductManagePage;
