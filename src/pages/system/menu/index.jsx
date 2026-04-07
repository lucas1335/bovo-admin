import React, { useState, useRef, useEffect } from 'react';
import { message, Tag, Button, Popconfirm, Form, Input, Select, Radio, InputNumber, TreeSelect } from 'antd';
import CmBasePage from '@components/CmBasePage';
import DataForm from '@components/DataForm';
import { IconSelectInput } from '@components/IconSelector';
import { listMenu, saveSysMenu, updateSysMenu, deleteSysMenu } from '@api';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import Tooltip from 'antd/es/tooltip';

const { Option } = Select;
const { TextArea } = Input;

/**
 * 菜单管理页面
 * 功能：菜单树形展示、新增、编辑、删除、排序、图标选择
 */
const MenuPage = () => {
  // ==================== 状态管理 ====================
  const [formVisible, setFormVisible] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [parentMenu, setParentMenu] = useState(null);
  const [loading, setLoading] = useState(false);
  const [menuTreeOptions, setMenuTreeOptions] = useState([]); // 父级菜单选择树
  const menuListRef = useRef([]); // 存储完整菜单列表用于构建选择树

  // ==================== 事件处理函数 ====================

  /**
   * 新增根菜单
   */
  const handleAdd = () => {
    setEditingMenu(null);
    setParentMenu(null);
    setFormVisible(true);
  };

  /**
   * 新增子菜单
   */
  const handleAddChild = (record) => {
    setEditingMenu(null);
    setParentMenu(record);
    setFormVisible(true);
  };

  /**
   * 编辑菜单
   */
  const handleEdit = (record) => {
    setEditingMenu(record);
    setParentMenu(null);
    setFormVisible(true);
  };

  /**
   * 删除菜单
   */
  const handleDelete = async (record) => {
    try {
      const response = await deleteSysMenu(record.menuId);
      if (response.code === 0 || response.code === 200) {
        message.success('菜单删除成功');
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
      // 构建提交数据
      const submitValues = {
        ...values,
        parentId: parentMenu
          ? parentMenu.id
          : (editingMenu?.parentId ?? values.parentId ?? '0')
      };

      let response;
      if (editingMenu) {
        response = await updateSysMenu(submitValues);
      } else {
        response = await saveSysMenu(submitValues);
      }

      if (response.code === 0 || response.code === 200) {
        message.success(editingMenu ? '菜单更新成功' : '菜单创建成功');
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
   * 刷新表格
   */
  const refreshTable = () => {
    document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
      new CustomEvent('reload')
    );
  };

  // ==================== 数据加载 ====================

  /**
   * 将平行数组转换为树形结构
   * 参考 old-vue/src/utils/ruoyi.js 的 handleTree 函数
   */
  const handleTree = (data, id = 'menuId', parentId = 'parentId', children = 'children') => {
    const config = { id, parentId, childrenList: children };

    const childrenListMap = {};
    const nodeIds = {};
    const tree = [];

    // 构建父节点到子节点的映射
    for (const d of data) {
      const pid = d[config.parentId];
      if (childrenListMap[pid] == null) {
        childrenListMap[pid] = [];
      }
      nodeIds[d[config.id]] = d;
      childrenListMap[pid].push(d);
    }

    // 找出所有根节点（父节点不在数据中的节点）
    for (const d of data) {
      const pid = d[config.parentId];
      if (nodeIds[pid] == null) {
        tree.push(d);
      }
    }

    // 递归处理子节点
    function adaptToChildrenList(o) {
      if (childrenListMap[o[config.id]] !== null) {
        o[config.childrenList] = childrenListMap[o[config.id]];
      }
      if (o[config.childrenList]) {
        for (const c of o[config.childrenList]) {
          adaptToChildrenList(c);
        }
      }
    }

    for (const t of tree) {
      adaptToChildrenList(t);
    }

    return tree;
  };

  /**
   * 自定义数据加载函数
   */
  const loadData = async (params, sorter, filter) => {
    try {
      const response = await listMenu(params);
      if (response.code === 0 || response.code === 200) {
        const menuData = response.data || [];

        // 将平行数组转换为树形结构
        const treeData = handleTree(menuData, 'menuId', 'parentId', 'children');

        // 收集扁平列表用于构建父级菜单选择树
        const flattenMenus = [];

        const collectMenus = (data) => {
          if (!Array.isArray(data)) return;
          for (const item of data) {
            flattenMenus.push(item);
            if (item.children) {
              collectMenus(item.children);
            }
          }
        };

        collectMenus(treeData);
        menuListRef.current = flattenMenus;

        return {
          data: treeData,
          success: true,
          total: treeData.length
        };
      } else {
        message.error(response.msg || '获取菜单数据失败');
        return { data: [], success: false, total: 0 };
      }
    } catch (error) {
      message.error('获取菜单数据失败: ' + error.message);
      return { data: [], success: false, total: 0 };
    }
  };

  /**
   * 构建父级菜单选择树
   */
  const buildMenuTreeOptions = () => {
    const buildTree = (menus, parentId = 0) => {
      return menus
        .filter(menu => menu.parentId === parentId)
        .map(menu => ({
          title: menu.menuName,
          value: menu.menuId,
          key: menu.menuId,
          children: buildTree(menus, menu.menuId)
        }));
    };

    // 添加根节点
    const treeOptions = [
      {
        title: '主类目',
        value: 0,
        key: 0,
        children: buildTree(menuListRef.current)
      }
    ];

    return treeOptions;
  };

  // 当表单打开时，构建菜单树选项
  useEffect(() => {
    if (formVisible) {
      setMenuTreeOptions(buildMenuTreeOptions());
    }
  }, [formVisible]);

  // ==================== 渲染辅助函数 ====================

  /**
   * 获取表单初始值
   */
  const getInitialValues = () => {
    if (editingMenu) {
      return {
        ...editingMenu,
        menuType: editingMenu.menuType ?? 'M',
        orderNum: editingMenu.orderNum ?? 0,
        visible: editingMenu.visible ?? '0',
        isFrame: editingMenu.isFrame ?? '1',
        isCache: editingMenu.isCache ?? '0',
        status: editingMenu.status ?? '0'
      };
    }
    if (parentMenu) {
      return {
        parentId: parentMenu.menuId,
        menuType: 'C', // 默认为菜单
        orderNum: 0,
        isFrame: '1',
        isCache: '0',
        visible: '0',
        status: '0'
      };
    }
    return {
      menuType: 'M', // 默认为目录
      orderNum: 0,
      isFrame: '1',
      isCache: '0',
      visible: '0',
      status: '0'
    };
  };

  /**
   * 获取表单标题
   */
  const getFormTitle = () => {
    if (editingMenu) return '修改菜单';
    if (parentMenu) return `添加菜单 (${parentMenu.title})`;
    return '添加菜单';
  };

  // ==================== 列配置 ====================

  const columns = [
    {
      title: '菜单名称',
      dataIndex: 'menuName',
      key: 'menuName',
      width: 200,
    },
    {
      title: '图标',
      dataIndex: 'icon',
      key: 'icon',
      width: 100,
      render: (icon) => {
        if (!icon) return '-';
        // 这里可以使用 Icon 组件渲染
        return <span>{icon}</span>;
      }
    },
    {
      title: '排序',
      dataIndex: 'orderNum',
      key: 'orderNum',
      width: 80,
    },
    {
      title: '权限标识',
      dataIndex: 'perms',
      key: 'perms',
      ellipsis: true,
    },
    {
      title: '组件路径',
      dataIndex: 'component',
      key: 'component',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status == 0 ? 'green' : 'red'}>
          {status == 0 ? '正常' : '停用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 280,
      render: (_, record) => (
        <>
          {/* 目录和菜单类型可以添加子菜单 */}
          {(record.menuType === 'M' || record.menuType === 'C') && (
            <Button
              type="link"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => handleAddChild(record)}
            >
              新增
            </Button>
          )}
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            修改
          </Button>
          <Popconfirm
            title="删除确认"
            description={`是否确认删除名称为"${record.menuName}"的数据项？`}
            onConfirm={() => handleDelete(record)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  // ==================== 工具栏按钮 ====================

  const toolBarExtraButtons = [];

  // ==================== 渲染 ====================

  return (
    <div style={{ textAlign: 'left' }}>
      <CmBasePage
        columns={columns}
        onLoadData={loadData}
        searchVisible={false}
        onAdd={handleAdd}
        toolBarExtraButtons={toolBarExtraButtons}
        rowKey="menuId"
        pagination={false}
        expandable={{
          childrenColumnName: 'children',
          defaultExpandAllRows: true,
        }}
      />

      <DataForm
        visible={formVisible}
        title={getFormTitle()}
        initialValues={getInitialValues()}
        extraValues={{ id: editingMenu ? editingMenu.id : undefined }}
        onCancel={() => setFormVisible(false)}
        onSubmit={handleSubmit}
        onClosed={() => {
          setEditingMenu(null);
          setParentMenu(null);
        }}
        loading={loading}
        formType="drawer"
        width={680}
      >
        {/* 上级菜单 */}
        <Form.Item
          name="parentId"
          label="上级菜单"
        >
          <TreeSelect
            treeData={menuTreeOptions}
            placeholder="选择上级菜单"
            showSearch
            treeDefaultExpandAll
            allowClear
          />
        </Form.Item>

        {/* 菜单类型 */}
        <Form.Item
          name="menuType"
          label="菜单类型"
          rules={[{ required: true, message: '请选择菜单类型' }]}
        >
          <Radio.Group>
            <Radio value="M">目录</Radio>
            <Radio value="C">菜单</Radio>
            <Radio value="F">按钮</Radio>
          </Radio.Group>
        </Form.Item>

        {/* 菜单图标 - 非按钮类型显示 */}
        <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.menuType !== currentValues.menuType}>
          {({ getFieldValue }) =>
            getFieldValue('menuType') !== 'F' ? (
              <Form.Item
                name="icon"
                label="菜单图标"
              >
                <IconSelectInput placeholder="点击选择图标" />
              </Form.Item>
            ) : null
          }
        </Form.Item>

        {/* 菜单名称 */}
        <Form.Item
          name="menuName"
          label="菜单名称"
          rules={[{ required: true, message: '请输入菜单名称' }]}
        >
          <Input placeholder="请输入菜单名称" />
        </Form.Item>

        {/* 显示排序 */}
        <Form.Item
          name="orderNum"
          label="显示排序"
          rules={[{ required: true, message: '请输入显示排序' }]}
        >
          <InputNumber min={0} placeholder="请输入显示排序" style={{ width: '100%' }} />
        </Form.Item>

        {/* 是否外链 - 非按钮类型显示 */}
        <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.menuType !== currentValues.menuType}>
          {({ getFieldValue }) =>
            getFieldValue('menuType') !== 'F' ? (
              <Form.Item
                name="isFrame"
                label={
                  <span>
                    是否外链
                    <Tooltip title="选择是外链则路由地址需要以`http(s)://`开头">
                      <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                    </Tooltip>
                  </span>
                }
              >
                <Radio.Group>
                  <Radio value="0">是</Radio>
                  <Radio value="1">否</Radio>
                </Radio.Group>
              </Form.Item>
            ) : null
          }
        </Form.Item>

        {/* 路由地址 - 非按钮类型显示 */}
        <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.menuType !== currentValues.menuType}>
          {({ getFieldValue }) =>
            getFieldValue('menuType') !== 'F' ? (
              <Form.Item
                name="path"
                label={
                  <span>
                    路由地址
                    <Tooltip title="访问的路由地址，如：`user`，如外网地址需内链访问则以`http(s)://`开头">
                      <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                    </Tooltip>
                  </span>
                }
                rules={[{ required: true, message: '请输入路由地址' }]}
              >
                <Input placeholder="请输入路由地址" />
              </Form.Item>
            ) : null
          }
        </Form.Item>

        {/* 组件路径 - 仅菜单类型显示 */}
        <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.menuType !== currentValues.menuType}>
          {({ getFieldValue }) =>
            getFieldValue('menuType') === 'C' ? (
              <Form.Item
                name="component"
                label={
                  <span>
                    组件路径
                    <Tooltip title="访问的组件路径，如：`system/user/index`，默认在`views`目录下">
                      <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                    </Tooltip>
                  </span>
                }
              >
                <Input placeholder="请输入组件路径" />
              </Form.Item>
            ) : null
          }
        </Form.Item>

        {/* 权限字符 - 非目录类型显示 */}
        <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.menuType !== currentValues.menuType}>
          {({ getFieldValue }) =>
            getFieldValue('menuType') !== 'M' ? (
              <Form.Item
                name="perms"
                label={
                  <span>
                    权限字符
                    <Tooltip title="控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasPermi('system:user:list')`)">
                      <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                    </Tooltip>
                  </span>
                }
              >
                <Input placeholder="请输入权限标识" maxLength="100" />
              </Form.Item>
            ) : null
          }
        </Form.Item>

        {/* 路由参数 - 仅菜单类型显示 */}
        <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.menuType !== currentValues.menuType}>
          {({ getFieldValue }) =>
            getFieldValue('menuType') === 'C' ? (
              <Form.Item
                name="query"
                label={
                  <span>
                    路由参数
                    <Tooltip title='访问路由的默认传递参数，如：`{"id": 1, "name": "ry"}`'>
                      <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                    </Tooltip>
                  </span>
                }
              >
                <Input placeholder="请输入路由参数" maxLength="255" />
              </Form.Item>
            ) : null
          }
        </Form.Item>

        {/* 是否缓存 - 仅菜单类型显示 */}
        <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.menuType !== currentValues.menuType}>
          {({ getFieldValue }) =>
            getFieldValue('menuType') === 'C' ? (
              <Form.Item
                name="isCache"
                label={
                  <span>
                    是否缓存
                    <Tooltip title="选择是则会被`keep-alive`缓存，需要匹配组件的`name`和地址保持一致">
                      <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                    </Tooltip>
                  </span>
                }
              >
                <Radio.Group>
                  <Radio value="0">缓存</Radio>
                  <Radio value="1">不缓存</Radio>
                </Radio.Group>
              </Form.Item>
            ) : null
          }
        </Form.Item>

        {/* 显示状态 - 非按钮类型显示 */}
        <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.menuType !== currentValues.menuType}>
          {({ getFieldValue }) =>
            getFieldValue('menuType') !== 'F' ? (
              <Form.Item
                name="visible"
                label={
                  <span>
                    显示状态
                    <Tooltip title="选择隐藏则路由将不会出现在侧边栏，但仍然可以访问">
                      <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                    </Tooltip>
                  </span>
                }
              >
                <Radio.Group>
                  <Radio value="0">显示</Radio>
                  <Radio value="1">隐藏</Radio>
                </Radio.Group>
              </Form.Item>
            ) : null
          }
        </Form.Item>

        {/* 菜单状态 - 非按钮类型显示 */}
        <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.menuType !== currentValues.menuType}>
          {({ getFieldValue }) =>
            getFieldValue('menuType') !== 'F' ? (
              <Form.Item
                name="status"
                label={
                  <span>
                    菜单状态
                    <Tooltip title="选择停用则路由将不会出现在侧边栏，也不能被访问">
                      <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                    </Tooltip>
                  </span>
                }
              >
                <Radio.Group>
                  <Radio value="0">正常</Radio>
                  <Radio value="1">停用</Radio>
                </Radio.Group>
              </Form.Item>
            ) : null
          }
        </Form.Item>
      </DataForm>
    </div>
  );
};

export default MenuPage;
