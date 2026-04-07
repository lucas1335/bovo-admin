import React, { useState } from 'react';
import { message, Tag, Form, Input, Radio, InputNumber, Select, Row, Col } from 'antd';
import CmBasePage from '@components/CmBasePage';
import DataForm from '@components/DataForm';
import { SchemaBuilder } from '@components/SchemaBuilder';
import { savePModuleRule, updatePModuleRule, deletePModuleRule } from '@api';

const { TextArea } = Input;

/**
 * 模块规则配置管理页面
 */
const RulePage = () => {
  const [formVisible, setFormVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState(false);

  const handleAdd = () => {
    setEditingRecord(null);
    setViewMode(false);
    setFormVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setViewMode(false);
    setFormVisible(true);
  };

  const handleView = (record) => {
    setEditingRecord(record);
    setViewMode(true);
    setFormVisible(true);
  };

  const handleDelete = async (record) => {
    try {
      const response = await deletePModuleRule({ id: record.id });
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
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = editingRecord
        ? await updatePModuleRule(values)
        : await savePModuleRule(values);

      if (response.code === 0 || response.code === 200) {
        message.success(editingRecord ? '更新成功' : '创建成功');
        setFormVisible(false);
        document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
          new CustomEvent('reload')
        );
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
      title: '规则名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '规则编码',
      dataIndex: 'code',
      key: 'code',
      width: 150,
    },
    {
      title: '配置类型',
      dataIndex: 'configType',
      key: 'configType',
      width: 150,
      render: (configType) => {
        const typeMap = {
          'SINGLE_PAGE': { text: '单页', color: 'blue' },
          'LIST': { text: '列表', color: 'green' },
          'OBJECT': { text: '对象', color: 'orange' },
          'RICH_TEXT': { text: '富文本', color: 'purple' },
        };
        const t = typeMap[configType] || { text: configType || '未知', color: 'default' };
        return <Tag color={t.color}>{t.text}</Tag>;
      }
    },
    {
      title: '分组',
      dataIndex: 'groupName',
      key: 'groupName',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'state',
      key: 'state',
      width: 100,
      render: (state) => {
        const stateMap = {
          1: { text: '启用', color: 'success' },
          0: { text: '禁用', color: 'error' },
        };
        const s = stateMap[state] || { text: '未知', color: 'default' };
        return <Tag color={s.color}>{s.text}</Tag>;
      }
    },
    {
      title: '排序号码',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 100,
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
      title: '规则名称',
      dataIndex: 'name',
      key: 'SEARCH_LIKE_name',
      type: 'text',
    },
    {
      title: '配置类型',
      dataIndex: 'configType',
      key: 'SEARCH_EQ_configType',
      type: 'select',
      options: [
        { label: '单页', value: 'SINGLE_PAGE' },
        { label: '列表', value: 'LIST' },
        { label: '对象', value: 'OBJECT' },
        { label: '富文本', value: 'RICH_TEXT' }
      ]
    },
    {
      title: '状态',
      dataIndex: 'state',
      key: 'SEARCH_EQ_state',
      type: 'select',
      options: [
        { label: '启用', value: '1' },
        { label: '禁用', value: '0' }
      ]
    },
  ];

  const configTypeOptions = [
    { label: '单页', value: 'SINGLE_PAGE' },
    { label: '列表', value: 'LIST' },
    { label: '对象', value: 'OBJECT' },
    { label: '富文本', value: 'RICH_TEXT' }
  ];

  return (
    <div style={{ textAlign: 'left' }}>
      <CmBasePage
        columns={columns}
        apiEndpoint="/pModuleRule/getList"
        apiMethod="get"
        searchFieldList={searchFieldList}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        rowKey="id"
      />

      <DataForm
        visible={formVisible}
        title={viewMode ? '查看规则配置' : (editingRecord ? '编辑规则配置' : '新增规则配置')}
        initialValues={editingRecord || {}}
        extraValues={{ id: editingRecord?.id }}
        onCancel={() => setFormVisible(false)}
        onSubmit={handleSubmit}
        loading={loading}
        formType="drawer"
        width="80%"
        disabled={viewMode}
      >
        {/* 第一行：规则名称、规则编码、配置类型 */}
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="name"
              label="规则名称"
              rules={[{ required: true, message: '请输入规则名称' }]}
            >
              <Input placeholder="请输入规则名称" disabled={viewMode} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="code"
              label="规则编码"
              rules={[{ required: true, message: '请输入规则编码' }]}
            >
              <Input placeholder="请输入规则编码" disabled={viewMode} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="configType"
              label="配置类型"
              rules={[{ required: true, message: '请选择配置类型' }]}
            >
              <Select
                placeholder="请选择配置类型"
                options={configTypeOptions}
                disabled={viewMode}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* 配置规则区域 */}
        <Form.Item
          name="schemaJson"
          label="配置规则"
          getValueFromEvent={(value) => JSON.stringify(value)}
          getValueProps={(value) => {
            if (!value) return { value: [] };
            if (Array.isArray(value)) return { value };
            if (typeof value === 'string') {
              try {
                const parsed = JSON.parse(value);
                return { value: Array.isArray(parsed) ? parsed : [] };
              } catch {
                return { value: [] };
              }
            }
            return { value: [] };
          }}
        >
          <SchemaBuilder disabled={viewMode} />
        </Form.Item>

        {/* 最后一行：分组、状态、排序号码 */}
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="groupName"
              label="分组"
            >
              <Input placeholder="请输入分组" disabled={viewMode} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="state"
              label="状态"
              rules={[{ required: true, message: '请选择状态' }]}
            >
              <Radio.Group disabled={viewMode}>
                <Radio value={1}>启用</Radio>
                <Radio value={0}>禁用</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="orderNo"
              label="排序号码"
              rules={[{ required: true, message: '请输入排序号码' }]}
            >
              <InputNumber placeholder="请输入排序号码" style={{ width: '100%' }} disabled={viewMode} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="remark"
          label="备注"
        >
          <TextArea rows={3} placeholder="请输入备注" disabled={viewMode} />
        </Form.Item>
      </DataForm>
    </div>
  );
};

export default RulePage;
