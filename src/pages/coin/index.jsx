import React, { useState } from 'react';
import { message, Form, Input, InputNumber } from 'antd';
import CmBasePage from '@components/CmBasePage';
import DataForm from '@components/DataForm';
import CmUpload from '@components/CmUpload';
import { listKlineSymbol, addKlineSymbol, updateKlineSymbol, delKlineSymbol } from '@api/modules/klineSymbol';

/**
 * 币种管理页面
 */
const CoinManagementPage = () => {
  // 1. 状态管理（按固定顺序）
  const [formVisible, setFormVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);

  // 2. 列配置
  const columns = [
    {
      title: '币种图标',
      dataIndex: 'logo',
      key: 'logo',
      width: 100,
      render: (logo) => {
        if (!logo) return <span>-</span>;
        return (
          <img
            src={logo}
            alt="币种图标"
            style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }}
            onError={(e) => {
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAzMCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIGZpbGw9IiNmNWY1ZjUiIHJ4PSI0Ii8+PHRleHQgeD0iMTUiIHk9IjIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjEwIiBmaWxsPSIjOWI5YjliIj7wn5OtPC90ZXh0Pjwvc3ZnPg==';
            }}
          />
        );
      },
    },
    {
      title: '代币名称',
      dataIndex: 'symbol',
      key: 'symbol',
      width: 120,
    },
    {
      title: '代币全名',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 180,
    },
    {
      title: '精度',
      dataIndex: 'precision',
      key: 'precision',
      width: 80,
      render: (precision) => precision || '-',
    },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
      width: 80,
      sorter: true,
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
      width: 180,
    },
  ];

  // 3. 搜索配置
  const searchFieldList = [
    {
      title: '代币名称',
      dataIndex: 'symbol',
      key: 'SEARCH_LIKE_symbol',
      type: 'text',
    },
  ];

  // 4. 事件处理
  const handleAdd = () => {
    setEditingRecord(null);
    setIsViewMode(false);
    setFormVisible(true);
  };

  const handleView = (record) => {
    setEditingRecord(record);
    setIsViewMode(true);
    setFormVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setIsViewMode(false);
    setFormVisible(true);
  };

  const handleDelete = async (record) => {
    try {
      const response = await delKlineSymbol(record.id);
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
      // 编辑时确保包含 id
      const submitData = editingRecord
        ? { ...values, id: editingRecord.id }
        : values;

      const response = editingRecord
        ? await updateKlineSymbol(submitData)
        : await addKlineSymbol(submitData);

      if (response.code === 0 || response.code === 200) {
        message.success(editingRecord ? '更新成功' : '新增成功');
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

  const refreshTable = () => {
    document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
      new CustomEvent('reload')
    );
  };

  // 5. 渲染
  return (
    <div>
      <CmBasePage
        columns={columns}
        apiEndpoint="/match-engine/klineSymbol/list"
        apiMethod="get"
        searchFieldList={searchFieldList}
        onAdd={handleAdd}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        actionButtons={{ view: true, edit: true, delete: true }}
        rowKey="id"
      />

      <DataForm
        visible={formVisible}
        title={isViewMode ? '查看币种' : (editingRecord ? '编辑币种' : '新增币种')}
        initialValues={editingRecord || {}}
        extraValues={{ id: editingRecord?.id }}
        onCancel={() => setFormVisible(false)}
        onSubmit={handleSubmit}
        onClosed={() => {
          setEditingRecord(null);
          setIsViewMode(false);
        }}
        loading={loading}
        formType="modal"
        width={600}
        disabled={isViewMode}
      >
        <Form.Item
          name="symbol"
          label="代币名称"
          rules={[{ required: true, message: '请输入代币名称' }]}
        >
          <Input placeholder="请输入代币名称，如 BTC" />
        </Form.Item>

        <Form.Item
          name="fullName"
          label="代币全名"
          rules={[{ required: true, message: '请输入代币全名' }]}
        >
          <Input placeholder="请输入代币全名，如 Bitcoin" />
        </Form.Item>

        <Form.Item
          name="logo"
          label="代币图标"
        >
          <CmUpload />
        </Form.Item>

        <Form.Item
          name="precision"
          label="精度"
          initialValue={8}
        >
          <InputNumber
            placeholder="请输入精度"
            min={0}
            max={18}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          name="sort"
          label="排序"
          initialValue={0}
        >
          <InputNumber
            placeholder="请输入排序"
            min={0}
            style={{ width: '100%' }}
          />
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

export default CoinManagementPage;
