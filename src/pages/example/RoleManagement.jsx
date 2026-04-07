import React, { useState, useEffect } from 'react';
import { message, Tag, Space } from 'antd';
import DataGrid from '../../components/DataGrid';
import DataForm from '../../components/DataForm';

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  // 模拟角色数据
  const mockRoles = [
    {
      id: 1,
      name: '超级管理员',
      code: 'SUPER_ADMIN',
      description: '系统最高权限，可以管理所有功能',
      permissions: ['user:read', 'user:write', 'role:read', 'role:write', 'system:read', 'system:write'],
      status: 'active',
      createdAt: '2024-01-01',
      userCount: 1
    },
    {
      id: 2,
      name: '管理员',
      code: 'ADMIN',
      description: '可以管理用户和基本系统功能',
      permissions: ['user:read', 'user:write', 'system:read'],
      status: 'active',
      createdAt: '2024-01-02',
      userCount: 3
    },
    {
      id: 3,
      name: '普通用户',
      code: 'USER',
      description: '基础用户权限',
      permissions: ['user:read'],
      status: 'active',
      createdAt: '2024-01-03',
      userCount: 15
    },
    {
      id: 4,
      name: '访客',
      code: 'GUEST',
      description: '只读权限',
      permissions: ['user:read'],
      status: 'inactive',
      createdAt: '2024-01-04',
      userCount: 0
    }
  ];

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setRoles(mockRoles);
    } catch (error) {
      message.error('加载角色列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingRole(null);
    setFormVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRole(record);
    setFormVisible(true);
  };

  const handleDelete = async (record) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setRoles(roles.filter(role => role.id !== record.id));
      message.success('角色删除成功');
    } catch (error) {
      message.error('删除失败，请重试');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingRole) {
        const updatedRoles = roles.map(role =>
          role.id === editingRole.id ? { ...role, ...values } : role
        );
        setRoles(updatedRoles);
        message.success('角色信息更新成功');
      } else {
        const newRole = {
          id: Date.now(),
          ...values,
          status: 'active',
          createdAt: new Date().toISOString().split('T')[0],
          userCount: 0
        };
        setRoles([...roles, newRole]);
        message.success('角色添加成功');
      }
      setFormVisible(false);
    } catch (error) {
      message.error('操作失败，请重试');
    }
  };

  const handleSearch = (field, value) => {
    console.log('搜索:', field, value);
    // 这里可以实现搜索逻辑
  };

  const columns = [
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Space direction="vertical" size="small">
          <div style={{ fontWeight: 'bold' }}>{name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.code}</div>
        </Space>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '权限数量',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions) => (
        <Tag color="blue">{permissions?.length || 0} 个权限</Tag>
      ),
    },
    {
      title: '用户数量',
      dataIndex: 'userCount',
      key: 'userCount',
      render: (count) => (
        <Tag color="green">{count} 个用户</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
  ];

  const searchFields = [
    { label: '角色名称', value: 'name' },
    { label: '角色代码', value: 'code' },
    { label: '状态', value: 'status' },
  ];

  const formFields = [
    {
      type: 'input',
      name: 'name',
      label: '角色名称',
      rules: [{ required: true, message: '请输入角色名称' }]
    },
    {
      type: 'input',
      name: 'code',
      label: '角色代码',
      rules: [{ required: true, message: '请输入角色代码' }]
    },
    {
      type: 'textarea',
      name: 'description',
      label: '角色描述',
      rules: [{ required: true, message: '请输入角色描述' }]
    },
    {
      type: 'select',
      name: 'status',
      label: '状态',
      rules: [{ required: true, message: '请选择状态' }],
      options: [
        { label: '启用', value: 'active' },
        { label: '禁用', value: 'inactive' },
      ]
    },
  ];

  return (
    <div style={{ textAlign: 'left' }}>
      <DataGrid
        title="角色管理"
        columns={columns}
        dataSource={roles}
        loading={loading}
        searchFields={searchFields}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRefresh={loadRoles}
        onSearch={handleSearch}
        addButtonText="添加角色"
        titleLevel={4}
        pagination={{
          total: roles.length,
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
      />

      <DataForm
        visible={formVisible}
        title={editingRole ? '编辑角色' : '添加角色'}
        fields={formFields}
        initialValues={editingRole || {}}
        onCancel={() => setFormVisible(false)}
        onSubmit={handleSubmit}
        loading={loading}
        formType="drawer"
      />
    </div>
  );
};

export default RoleManagement; 