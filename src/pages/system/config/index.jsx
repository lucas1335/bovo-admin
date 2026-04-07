import React, { useState } from 'react';
import { message, Form, Input } from 'antd';
import CmBasePage from '@components/CmBasePage';
import DataForm from '@components/DataForm';
import { listConfig, addConfig, updateConfig, delConfig } from '@api/modules/config';

/**
 * 系统参数配置页面
 */
const SysConfigPage = () => {
  const [formVisible, setFormVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);

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
      const response = await delConfig(record.configId);
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
      let response;
      if (editingRecord) {
        response = await updateConfig(values);
        if (response.code === 0 || response.code === 200) {
          message.success('更新成功');
        } else {
          message.error(response.msg || '更新失败');
          setLoading(false);
          return;
        }
      } else {
        response = await addConfig(values);
        if (response.code === 0 || response.code === 200) {
          message.success('创建成功');
        } else {
          message.error(response.msg || '创建失败');
          setLoading(false);
          return;
        }
      }
      setFormVisible(false);
      setLoading(false);
      document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
        new CustomEvent('reload')
      );
    } catch (error) {
      message.error('操作失败: ' + error.message);
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '参数名称',
      dataIndex: 'configName',
      key: 'configName',
      width: 200,
      sorter: true,
    },
    {
      title: '参数键名',
      dataIndex: 'configKey',
      key: 'configKey',
      width: 200,
      sorter: true,
    },
    {
      title: '参数键值',
      dataIndex: 'configValue',
      key: 'configValue',
      width: 300,
      ellipsis: true,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 200,
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
      sorter: true,
    },
    {
      title: '创建人',
      dataIndex: 'createBy',
      key: 'createBy',
      width: 120,
    },
  ];

  /**
   * 刷新表格
   */
  const refreshTable = () => {
    document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
      new CustomEvent('reload')
    );
  };

  /**
   * 数据加载
   */
  const loadData = async (params) => {
    try {
      const requestParams = {
        pageNum: params.current || 1,
        pageSize: params.pageSize || 10,
        ...params
      };

      const response = await listConfig(requestParams);

      if (response.code === 0 || response.code === 200) {
        return {
          data: response.rows || [],
          success: true,
          total: response.total || 0
        };
      } else {
        message.error(response.msg || '获取数据失败');
        return {
          data: [],
          success: false,
          total: 0
        };
      }
    } catch (error) {
      message.error('获取数据失败: ' + error.message);
      return {
        data: [],
        success: false,
        total: 0
      };
    }
  };

  const searchFieldList = [
    {
      title: '配置名称',
      dataIndex: 'configName',
      key: 'SEARCH_LIKE_configName',
      type: 'text',
    },
    {
      title: '配置编码',
      dataIndex: 'configKey',
      key: 'SEARCH_LIKE_configKey',
      type: 'text',
    },
  ];

  return (
    <div style={{ textAlign: 'left' }}>
      <CmBasePage
        columns={columns}
        onLoadData={loadData}
        searchFieldList={searchFieldList}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        rowKey="configId"
      />

      <DataForm
        visible={formVisible}
        title={editingRecord ? '编辑参数配置' : '新增参数配置'}
        initialValues={editingRecord || {}}
        extraValues={{ configId: editingRecord ? editingRecord.configId : undefined }}
        onCancel={() => setFormVisible(false)}
        onSubmit={handleSubmit}
        onClosed={() => setEditingRecord(null)}
        loading={loading}
        formType="drawer"
      >
        <Form.Item
          name="configName"
          label="参数名称"
          rules={[{ required: true, message: '请输入参数名称' }]}
        >
          <Input placeholder="请输入参数名称" />
        </Form.Item>

        <Form.Item
          name="configKey"
          label="参数键名"
          rules={[{ required: true, message: '请输入参数键名' }]}
        >
          <Input placeholder="请输入参数键名" />
        </Form.Item>

        <Form.Item
          name="configValue"
          label="参数键值"
          rules={[{ required: true, message: '请输入参数键值' }]}
        >
          <Input.TextArea placeholder="请输入参数键值" rows={4} />
        </Form.Item>

        <Form.Item
          name="remark"
          label="备注"
        >
          <Input.TextArea placeholder="请输入备注" rows={3} />
        </Form.Item>
      </DataForm>
    </div>
  );
};

export default SysConfigPage;
