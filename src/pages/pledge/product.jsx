import React, { useState } from 'react';
import { message, Tag, Form, Input, InputNumber, Switch, Image } from 'antd';
import CmBasePage from '@components/CmBasePage';
import DataForm from '@components/DataForm';
import CmUpload from '@components/CmUpload';
import { getPledgeProductList, savePledgeProduct, updatePledgeProduct, deletePledgeProduct } from '@api/modules/pledge';

/**
 * 抵押产品管理页面
 * 功能：抵押产品列表展示、搜索、新增、编辑、删除
 */
const PledgeProductPage = () => {
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
  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormVisible(true);
  };

  /**
   * 删除产品
   */
  const handleDelete = async (record) => {
    try {
      const response = await deletePledgeProduct({ id: record.id });
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
      // 处理开关值：Switch组件返回boolean，需要转换为0/1
      const formData = {
        ...values,
        status: values.status === true ? 0 : 1, // 0: 展示, 1: 不展示
      };

      const response = editingRecord
        ? await updatePledgeProduct(formData)
        : await savePledgeProduct(formData);

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

  /**
   * 刷新表格数据
   */
  const refreshTable = () => {
    document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
      new CustomEvent('reload')
    );
  };

  // 显示状态映射
  const statusMap = {
    0: { color: 'green', text: '展示' },
    1: { color: 'default', text: '不展示' },
  };

  /**
   * 列配置定义
   */
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: true,
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      ellipsis: true,
    },
    {
      title: '图标',
      dataIndex: 'icon',
      key: 'icon',
      width: 100,
      render: (icon) => (
        icon ? <Image src={icon} width={50} height={50} style={{ objectFit: 'cover' }} /> : '-'
      ),
    },
    {
      title: '天数',
      dataIndex: 'days',
      key: 'days',
      width: 100,
      render: (days) => `${days}天`,
      sorter: true,
    },
    {
      title: '违约利率(%)',
      dataIndex: 'defaultOdds',
      key: 'defaultOdds',
      width: 120,
      render: (odds) => `${(parseFloat(odds || 0)).toFixed(2)}%`,
    },
    {
      title: '日利率范围(%)',
      key: 'oddsRange',
      width: 150,
      render: (_, record) => (
        <div>
          <div>最小: {(parseFloat(record.minOdds || 0)).toFixed(2)}%</div>
          <div>最大: {(parseFloat(record.maxOdds || 0)).toFixed(2)}%</div>
        </div>
      ),
    },
    {
      title: '金额范围',
      key: 'amountRange',
      width: 150,
      render: (_, record) => (
        <div>
          <div>最小: ¥{(parseFloat(record.limitMin || 0)).toFixed(2)}</div>
          <div>最大: ¥{(parseFloat(record.limitMax || 0)).toFixed(2)}</div>
        </div>
      ),
    },
    {
      title: '限购次数',
      dataIndex: 'timeLimit',
      key: 'timeLimit',
      width: 100,
      render: (limit) => limit === 0 ? '不限购' : `${limit}次`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusInfo = statusMap[status] || { color: 'default', text: '未知' };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
    },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
      width: 80,
      sorter: true,
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
      title: '状态',
      dataIndex: 'status',
      key: 'SEARCH_EQ_status',
      type: 'select',
      options: [
        { label: '展示', value: 0 },
        { label: '不展示', value: 1 },
      ],
    },
  ];

  return (
    <div>
      {/* 抵押产品列表 */}
      <CmBasePage
        columns={columns}
        apiEndpoint="/contract/mingProduct/list"
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
        title={editingRecord ? '编辑抵押产品' : '新增抵押产品'}
        initialValues={{
          ...editingRecord,
          status: editingRecord?.status === 0, // 转换为boolean供Switch使用
        }}
        extraValues={{ id: editingRecord?.id }}
        onCancel={() => setFormVisible(false)}
        onSubmit={handleSubmit}
        onClosed={() => setEditingRecord(null)}
        loading={loading}
        formType="drawer"
        width="600px"
      >
        <Form.Item
          name="title"
          label="标题"
          rules={[{ required: true, message: '请输入标题' }]}
        >
          <Input placeholder="请输入产品标题" />
        </Form.Item>

        <Form.Item
          name="icon"
          label="产品图标"
          rules={[{ required: true, message: '请上传产品图标' }]}
        >
          <CmUpload />
        </Form.Item>

        <Form.Item
          name="days"
          label="投资天数"
          rules={[{ required: true, message: '请输入投资天数' }]}
        >
          <InputNumber placeholder="请输入天数" min={1} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="defaultOdds"
          label="违约利率(%)"
          rules={[{ required: true, message: '请输入违约利率' }]}
        >
          <InputNumber placeholder="请输入违约利率" min={0} step={0.01} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="minOdds"
          label="最小日利率(%)"
          rules={[{ required: true, message: '请输入最小日利率' }]}
        >
          <InputNumber placeholder="请输入最小日利率" min={0} step={0.01} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="maxOdds"
          label="最大日利率(%)"
          rules={[{ required: true, message: '请输入最大日利率' }]}
        >
          <InputNumber placeholder="请输入最大日利率" min={0} step={0.01} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="timeLimit"
          label="限购次数"
          rules={[{ required: true, message: '请输入限购次数' }]}
          extra="0表示不限购"
        >
          <InputNumber placeholder="请输入限购次数" min={0} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="limitMin"
          label="最小金额"
          rules={[{ required: true, message: '请输入最小金额' }]}
        >
          <InputNumber placeholder="请输入最小金额" min={0} step={0.01} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="limitMax"
          label="最大金额"
          rules={[{ required: true, message: '请输入最大金额' }]}
        >
          <InputNumber placeholder="请输入最大金额" min={0} step={0.01} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="status"
          label="前端展示"
          valuePropName="checked"
          getValueProps={(value) => ({ checked: value === true })}
          getValueFromEvent={(checked) => (checked ? true : false)}
        >
          <Switch checkedChildren="是" unCheckedChildren="否" />
        </Form.Item>

        <Form.Item
          name="sort"
          label="排序"
        >
          <InputNumber placeholder="请输入排序值" min={0} style={{ width: '100%' }} />
        </Form.Item>
      </DataForm>
    </div>
  );
};

export default PledgeProductPage;
