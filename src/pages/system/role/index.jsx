import React, { useState, useEffect, useRef } from 'react';
import { message, Tree, Form, Input, InputNumber, Switch, Tag, Dropdown, Modal, Space, Select, Checkbox } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import CmBasePage from '@components/CmBasePage';
import DataForm from '@components/DataForm';
import {
  saveSysRole,
  updateSysRole,
  deleteSysRole,
  getSysOrganTree,
  changeSysRoleStatus,
  saveSysRoleDataScope
} from '@api';
import { treeselect, roleMenuTreeselect } from '@api/modules/menu';

const RolePage = () => {
  // 角色表单状态
  const [formVisible, setFormVisible] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [loading, setLoading] = useState(false);

  // 数据权限表单状态
  const [dataScopeVisible, setDataScopeVisible] = useState(false);
  const [dataScopeLoading, setDataScopeLoading] = useState(false);
  const [editingRoleForDataScope, setEditingRoleForDataScope] = useState(null);

  // 菜单树相关状态
  const [menuTree, setMenuTree] = useState([]);
  const [checkedMenuKeys, setCheckedMenuKeys] = useState([]);
  const [expandedMenuKeys, setExpandedMenuKeys] = useState([]);
  const [menuCheckStrictly, setMenuCheckStrictly] = useState(true);
  const menuTreeRef = useRef(null);

  // 部门树相关状态（数据权限）
  const [deptTree, setDeptTree] = useState([]);
  const [checkedDeptKeys, setCheckedDeptKeys] = useState([]);
  const [expandedDeptKeys, setExpandedDeptKeys] = useState([]);
  const [deptCheckStrictly, setDeptCheckStrictly] = useState(true);

  // 使用ref存储最新的选中节点
  const checkedMenuKeysRef = useRef([]);
  const checkedDeptKeysRef = useRef([]);

  // 同步更新ref
  useEffect(() => {
    checkedMenuKeysRef.current = checkedMenuKeys;
  }, [checkedMenuKeys]);

  useEffect(() => {
    checkedDeptKeysRef.current = checkedDeptKeys;
  }, [checkedDeptKeys]);

  // 数据权限选项
  const dataScopeOptions = [
    { value: '1', label: '全部数据权限' },
    { value: '2', label: '自定数据权限' },
    { value: '3', label: '本部门数据权限' },
    { value: '4', label: '本部门及以下数据权限' },
    { value: '5', label: '仅本人数据权限' }
  ];

  /**
   * 获取菜单树数据
   */
  const fetchMenuTree = async () => {
    try {
      const response = await treeselect();
      if (response.code === 0 || response.code === 200) {
        const treeData = cleanTreeData(response.data || []);
        setMenuTree(treeData);
        return treeData;
      } else {
        message.error(response.msg || '获取菜单树失败');
        return [];
      }
    } catch (error) {
      message.error('获取菜单树失败: ' + error.message);
      return [];
    }
  };

  /**
   * 获取部门树数据
   */
  const fetchDeptTree = async () => {
    try {
      const response = await getSysOrganTree();
      if (response.code === 0 || response.code === 200) {
        const treeData = cleanTreeData(response.data || []);
        setDeptTree(treeData);
        return treeData;
      } else {
        message.error(response.msg || '获取部门树失败');
        return [];
      }
    } catch (error) {
      message.error('获取部门树失败: ' + error.message);
      return [];
    }
  };

  /**
   * 清理树形数据中的空children字段
   */
  const cleanTreeData = (data) => {
    if (!Array.isArray(data)) return [];
    return data.map(item => {
      const newItem = { ...item };
      if (item.children && Array.isArray(item.children) && item.children.length > 0) {
        newItem.children = cleanTreeData(item.children);
      } else {
        delete newItem.children;
      }
      return newItem;
    });
  };

  /**
   * 获取所有父节点ID
   */
  const getAllParentIdsFromTree = (treeData) => {
    const parentIds = new Set();
    const traverse = (nodes) => {
      nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
          parentIds.add(node.id);
          traverse(node.children);
        }
      });
    };
    traverse(treeData);
    return parentIds;
  };

  /**
   * 获取角色的菜单权限
   */
  const fetchRoleMenus = async (roleId) => {
    try {
      const response = await roleMenuTreeselect(roleId);
      if (response.code === 0 || response.code === 200) {
        // 使用后端返回的menus作为树数据，checkedKeys作为选中状态
        const treeData = response.menus || response.data?.menus || [];
        const checkedKeys = response.checkedKeys || response.data?.checkedKeys || [];

        setMenuTree(cleanTreeData(treeData));
        setCheckedMenuKeys(checkedKeys);
      } else {
        message.error(response.msg || '获取角色权限失败');
        setMenuTree([]);
        setCheckedMenuKeys([]);
      }
    } catch (error) {
      message.error('获取角色权限失败: ' + error.message);
      setMenuTree([]);
      setCheckedMenuKeys([]);
    }
  };

  /**
   * 当角色表单打开时获取数据
   */
  useEffect(() => {
    if (formVisible) {
      if (editingRole) {
        const roleId = editingRole.roleId || editingRole.id;
        if (roleId) {
          fetchRoleMenus(roleId);
        }
      } else {
        // 新增时，获取完整的菜单树
        fetchMenuTree();
        setCheckedMenuKeys([]);
      }
    }
  }, [formVisible, editingRole]);

  /**
   * 当数据权限表单打开时获取数据
   */
  useEffect(() => {
    if (dataScopeVisible && editingRoleForDataScope) {
      fetchDeptTree().then(() => {
        // 如果需要加载角色已有的数据权限，可以在这里添加
        if (editingRoleForDataScope.deptIds) {
          setCheckedDeptKeys(editingRoleForDataScope.deptIds);
        } else {
          setCheckedDeptKeys([]);
        }
      });
    }
  }, [dataScopeVisible, editingRoleForDataScope]);

  /**
   * 刷新表格
   */
  const refreshTable = () => {
    document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
      new CustomEvent('reload')
    );
  };

  /**
   * 新增角色
   */
  const handleAdd = () => {
    setEditingRole(null);
    setFormVisible(true);
  };

  /**
   * 编辑角色
   */
  const handleEdit = (record) => {
    setEditingRole(record);
    setFormVisible(true);
  };

  /**
   * 删除角色
   */
  const handleDelete = async (record) => {
    try {
      const roleId = record.roleId || record.id;
      const response = await deleteSysRole(roleId);
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
   * 提交角色表单
   */
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // 根据是否开启父子联动决定提交的菜单ID
      let menuIdsToSubmit;
      if (menuCheckStrictly) {
        // 父子不联动：只提交选中的节点
        menuIdsToSubmit = checkedMenuKeysRef.current;
      } else {
        // 父子联动：需要提交所有选中的叶子节点和半选中父节点
        const parentIds = getParentIdsForCheckedKeys(checkedMenuKeysRef.current, menuTree);
        menuIdsToSubmit = [...new Set([...checkedMenuKeysRef.current, ...parentIds])];
      }

      const submitValues = {
        ...values,
        menuCheckStrictly: menuCheckStrictly,
        menuIds: menuIdsToSubmit.length > 0 ? menuIdsToSubmit : undefined
      };

      let response;
      if (editingRole) {
        const roleId = editingRole.roleId || editingRole.id;
        response = await updateSysRole({ ...submitValues, roleId });
        if (response.code === 0 || response.code === 200) {
          message.success('更新成功');
        } else {
          message.error(response.msg || '更新失败');
          setLoading(false);
          return;
        }
      } else {
        response = await saveSysRole(submitValues);
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
      refreshTable();
    } catch (error) {
      message.error('操作失败: ' + error.message);
      setLoading(false);
    }
  };

  /**
   * 获取所有选中节点的父节点ID
   */
  const getAllParentIds = (treeData, childId, parentIds = []) => {
    for (const node of treeData) {
      if (node.id === childId) {
        return parentIds;
      }
      if (node.children && node.children.length > 0) {
        const found = getAllParentIds(node.children, childId, [...parentIds, node.id]);
        if (found.length > 0) {
          return found;
        }
      }
    }
    return [];
  };

  /**
   * 获取所有选中节点的父节点ID（用于提交时）
   */
  const getParentIdsForCheckedKeys = (checkedKeysList, treeData = menuTree) => {
    const parentIds = new Set();
    checkedKeysList.forEach(key => {
      const ids = getAllParentIds(treeData, key);
      ids.forEach(id => parentIds.add(id));
    });
    return Array.from(parentIds);
  };

  /**
   * 处理菜单树节点选择
   */
  const onMenuCheck = (checkedKeysValue) => {
    setCheckedMenuKeys(checkedKeysValue);
  };

  /**
   * 处理菜单树节点展开/收起
   */
  const onMenuExpand = (expandedKeysValue) => {
    setExpandedMenuKeys(expandedKeysValue);
  };

  /**
   * 展开所有菜单节点
   */
  const expandAllMenus = () => {
    const getAllNodeKeys = (data) => {
      const keys = [];
      data.forEach(node => {
        keys.push(node.id);
        if (node.children) {
          keys.push(...getAllNodeKeys(node.children));
        }
      });
      return keys;
    };
    setExpandedMenuKeys(getAllNodeKeys(menuTree));
  };

  /**
   * 折叠所有菜单节点
   */
  const collapseAllMenus = () => {
    setExpandedMenuKeys([]);
  };

  /**
   * 全选菜单
   */
  const checkAllMenus = () => {
    const getAllNodeKeys = (data) => {
      const keys = [];
      data.forEach(node => {
        if (!node.children || node.children.length === 0) {
          keys.push(node.id);
        } else {
          keys.push(...getAllNodeKeys(node.children));
        }
      });
      return keys;
    };
    setCheckedMenuKeys(getAllNodeKeys(menuTree));
  };

  /**
   * 取消全选菜单
   */
  const uncheckAllMenus = () => {
    setCheckedMenuKeys([]);
  };

  /**
   * 角色状态切换
   */
  const handleStatusChange = async (record) => {
    const currentStatus = record.status == '0' || record.status === 0 ? '0' : '1';
    const newStatus = currentStatus === '0' ? '1' : '0';
    const statusText = newStatus === '0' ? '启用' : '停用';

    Modal.confirm({
      title: '状态切换',
      content: `确认要"${statusText}""${record.roleName}"角色吗？`,
      onOk: async () => {
        try {
          const roleId = record.roleId || record.id;
          const response = await changeSysRoleStatus(roleId, newStatus);
          if (response.code === 0 || response.code === 200) {
            message.success(`${statusText}成功`);
            refreshTable();
          } else {
            message.error(response.msg || '操作失败');
          }
        } catch (error) {
          message.error('操作失败: ' + error.message);
        }
      }
    });
  };

  /**
   * 数据权限操作
   */
  const handleDataScope = (record) => {
    setEditingRoleForDataScope(record);
    setDataScopeVisible(true);
  };

  /**
   * 提交数据权限
   */
  const handleSubmitDataScope = async (values) => {
    setDataScopeLoading(true);
    try {
      // 根据是否开启父子联动决定提交的部门ID
      let deptIdsToSubmit;
      if (deptCheckStrictly) {
        // 父子不联动：只提交选中的节点
        deptIdsToSubmit = checkedDeptKeysRef.current;
      } else {
        // 父子联动：需要提交所有选中的叶子节点和半选中父节点
        const parentIds = getParentIdsForCheckedKeys(checkedDeptKeysRef.current, deptTree);
        deptIdsToSubmit = [...new Set([...checkedDeptKeysRef.current, ...parentIds])];
      }

      const submitValues = {
        ...values,
        roleId: editingRoleForDataScope.id,
        deptCheckStrictly: deptCheckStrictly,
        deptIds: deptIdsToSubmit
      };

      const response = await saveSysRoleDataScope(submitValues);
      if (response.code === 0 || response.code === 200) {
        message.success('数据权限设置成功');
        setDataScopeVisible(false);
        refreshTable();
      } else {
        message.error(response.msg || '设置失败');
      }
    } catch (error) {
      message.error('设置失败: ' + error.message);
    } finally {
      setDataScopeLoading(false);
    }
  };

  /**
   * 处理部门树节点选择
   */
  const onDeptCheck = (checkedKeysValue) => {
    setCheckedDeptKeys(checkedKeysValue);
  };

  /**
   * 处理部门树节点展开/收起
   */
  const onDeptExpand = (expandedKeysValue) => {
    setExpandedDeptKeys(expandedKeysValue);
  };

  /**
   * 展开所有部门节点
   */
  const expandAllDepts = () => {
    const getAllNodeKeys = (data) => {
      const keys = [];
      data.forEach(node => {
        keys.push(node.id);
        if (node.children) {
          keys.push(...getAllNodeKeys(node.children));
        }
      });
      return keys;
    };
    setExpandedDeptKeys(getAllNodeKeys(deptTree));
  };

  /**
   * 折叠所有部门节点
   */
  const collapseAllDepts = () => {
    setExpandedDeptKeys([]);
  };

  /**
   * 全选部门
   */
  const checkAllDepts = () => {
    const getAllNodeKeys = (data) => {
      const keys = [];
      data.forEach(node => {
        if (!node.children || node.children.length === 0) {
          keys.push(node.id);
        } else {
          keys.push(...getAllNodeKeys(node.children));
        }
      });
      return keys;
    };
    setCheckedDeptKeys(getAllNodeKeys(deptTree));
  };

  /**
   * 取消全选部门
   */
  const uncheckAllDepts = () => {
    setCheckedDeptKeys([]);
  };

  /**
   * 更多操作菜单
   */
  const getMoreActionMenu = (record) => {
    return {
      items: [
        {
          key: 'dataScope',
          label: '数据权限',
          onClick: () => handleDataScope(record)
        }
      ]
    };
  };

  // 表格列配置
  const columns = [
    {
      title: '角色编号',
      dataIndex: 'roleId',
      key: 'roleId',
      width: 120,
      sorter: true,
      render: (text, record) => text || record.id,
    },
    {
      title: '角色名称',
      dataIndex: 'roleName',
      key: 'roleName',
      width: 150,
      sorter: true,
    },
    {
      title: '权限字符',
      dataIndex: 'roleKey',
      key: 'roleKey',
      width: 150,
      sorter: true,
    },
    {
      title: '显示顺序',
      dataIndex: 'roleSort',
      key: 'roleSort',
      width: 100,
      sorter: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status, record) => (
        <Switch
          checked={status == '0' || status === 0}
          checkedChildren="正常"
          unCheckedChildren="停用"
          onChange={() => handleStatusChange(record)}
        />
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      sorter: true,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <a onClick={() => handleEdit(record)}>编辑</a>
          <a onClick={() => handleDelete(record)} style={{ color: '#ff4d4f' }}>删除</a>
          <Dropdown menu={getMoreActionMenu(record)}>
            <a onClick={e => e.preventDefault()}>
              更多 <DownOutlined />
            </a>
          </Dropdown>
        </Space>
      ),
    },
  ];

  // 搜索字段配置
  const searchFieldList = [
    {
      title: '角色名称',
      dataIndex: 'roleName',
      key: 'SEARCH_LIKE_roleName',
      type: 'text',
    },
    {
      title: '权限字符',
      dataIndex: 'roleKey',
      key: 'SEARCH_LIKE_roleKey',
      type: 'text',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'SEARCH_EQ_status',
      type: 'select',
      options: [
        { label: '正常', value: '0' },
        { label: '停用', value: '1' }
      ]
    },
  ];

  return (
    <div style={{ textAlign: 'left' }}>
      <CmBasePage
        columns={columns}
        apiEndpoint="/system/role/list"
        apiMethod="get"
        searchFieldList={searchFieldList}
        onAdd={handleAdd}
        onDelete={handleDelete}
        rowKey="roleId"
        actionButtons={{
          view: false,
          edit: false,
          delete: false
        }}
      />

      {/* 角色编辑表单 */}
      <DataForm
        visible={formVisible}
        title={editingRole ? '编辑角色' : '添加角色'}
        initialValues={editingRole || { roleSort: 0, status: '0' }}
        extraValues={{ roleId: editingRole ? (editingRole.roleId || editingRole.id) : undefined }}
        onCancel={() => setFormVisible(false)}
        onSubmit={handleSubmit}
        onClosed={() => {
          setEditingRole(null);
          setCheckedMenuKeys([]);
          setExpandedMenuKeys([]);
        }}
        loading={loading}
        formType="drawer"
        drawerSize="large"
      >
        <Form.Item
          name="roleName"
          label="角色名称"
          rules={[{ required: true, message: '请输入角色名称' }]}
        >
          <Input placeholder="请输入角色名称" />
        </Form.Item>

        <Form.Item
          name="roleKey"
          label="权限字符"
          rules={[{ required: true, message: '请输入权限字符' }]}
          tooltip="控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasRole('admin')`)"
        >
          <Input placeholder="请输入权限字符" />
        </Form.Item>

        <Form.Item
          name="roleSort"
          label="显示顺序"
          rules={[{ required: true, message: '请输入显示顺序' }]}
        >
          <InputNumber placeholder="请输入显示顺序" style={{ width: '100%' }} min={0} />
        </Form.Item>

        <Form.Item
          name="status"
          label="状态"
          valuePropName="checked"
          getValueProps={(value) => ({ checked: value == '0' || value === 0 })}
          getValueFromEvent={(checked) => (checked ? '0' : '1')}
        >
          <Switch checkedChildren="正常" unCheckedChildren="停用" />
        </Form.Item>

        <Form.Item label="菜单权限">
          <div>
            <Space style={{ marginBottom: 8 }}>
              <a onClick={expandAllMenus}>展开/折叠</a>
              <a onClick={checkAllMenus}>全选</a>
              <a onClick={uncheckAllMenus}>全不选</a>
            </Space>
            <Checkbox
              checked={menuCheckStrictly}
              onChange={(e) => setMenuCheckStrictly(e.target.checked)}
              style={{ marginBottom: 8 }}
            >
              父子联动
            </Checkbox>
            <div style={{ border: '1px solid #d9d9d9', borderRadius: 4, padding: 10, maxHeight: 400, overflow: 'auto' }}>
              {menuTree.length > 0 ? (
                <Tree
                  checkable
                  expandedKeys={expandedMenuKeys}
                  onExpand={onMenuExpand}
                  checkedKeys={checkedMenuKeys}
                  onCheck={onMenuCheck}
                  checkStrictly={!menuCheckStrictly}
                  fieldNames={{ title: 'label', key: 'id', children: 'children' }}
                  treeData={menuTree}
                />
              ) : (
                <div>暂无菜单数据</div>
              )}
            </div>
          </div>
        </Form.Item>

        <Form.Item
          name="remark"
          label="备注"
        >
          <Input.TextArea placeholder="请输入备注" rows={4} />
        </Form.Item>
      </DataForm>

      {/* 数据权限表单 */}
      <DataForm
        visible={dataScopeVisible}
        title="分配数据权限"
        initialValues={editingRoleForDataScope || { dataScope: '1' }}
        extraValues={{ roleId: editingRoleForDataScope?.roleId || editingRoleForDataScope?.id }}
        onCancel={() => setDataScopeVisible(false)}
        onSubmit={handleSubmitDataScope}
        onClosed={() => {
          setEditingRoleForDataScope(null);
          setCheckedDeptKeys([]);
          setExpandedDeptKeys([]);
        }}
        loading={dataScopeLoading}
        formType="drawer"
      >
        <Form.Item
          name="roleName"
          label="角色名称"
        >
          <Input disabled />
        </Form.Item>

        <Form.Item
          name="roleKey"
          label="权限字符"
        >
          <Input disabled />
        </Form.Item>

        <Form.Item
          name="dataScope"
          label="权限范围"
          rules={[{ required: true, message: '请选择权限范围' }]}
        >
          <Select placeholder="请选择权限范围">
            {dataScopeOptions.map(option => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="数据权限" style={{ display: editingRoleForDataScope?.dataScope === '2' ? 'block' : 'none' }}>
          <div>
            <Space style={{ marginBottom: 8 }}>
              <a onClick={expandAllDepts}>展开/折叠</a>
              <a onClick={checkAllDepts}>全选</a>
              <a onClick={uncheckAllDepts}>全不选</a>
            </Space>
            <Checkbox
              checked={deptCheckStrictly}
              onChange={(e) => setDeptCheckStrictly(e.target.checked)}
              style={{ marginBottom: 8 }}
            >
              父子联动
            </Checkbox>
            <div style={{ border: '1px solid #d9d9d9', borderRadius: 4, padding: 10, maxHeight: 400, overflow: 'auto' }}>
              {deptTree.length > 0 ? (
                <Tree
                  checkable
                  expandedKeys={expandedDeptKeys}
                  onExpand={onDeptExpand}
                  checkedKeys={checkedDeptKeys}
                  onCheck={onDeptCheck}
                  checkStrictly={!deptCheckStrictly}
                  fieldNames={{ title: 'label', key: 'id', children: 'children' }}
                  treeData={deptTree}
                />
              ) : (
                <div>暂无部门数据</div>
              )}
            </div>
          </div>
        </Form.Item>
      </DataForm>
    </div>
  );
};

export default RolePage;
