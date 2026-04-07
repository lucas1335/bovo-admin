import React, { useState, useEffect, useMemo } from 'react';
import { message, Tree, Button, Popconfirm, Modal, Form, Input, InputNumber, Select, Card, Space, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ApartmentOutlined } from '@ant-design/icons';
import { getSysDeptList, saveSysDept, updateSysDept, deleteSysDept, getSysDeptListExcludeChild } from '@api';

const { Option } = Select;

/**
 * 部门管理页面
 * 使用Ant Design Tree组件展示部门树形结构
 */
const DeptPage = () => {
  // 状态管理（按固定顺序）
  const [formVisible, setFormVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [parentDept, setParentDept] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // 部门树数据
  const [deptTreeData, setDeptTreeData] = useState([]);
  const [deptOptions, setDeptOptions] = useState([]);  // 用于表单中的上级部门选择
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [autoExpandParent, setAutoExpandParent] = useState(true);

  // 加载部门树数据
  const fetchDeptTree = async () => {
    try {
      const response = await getSysDeptList();
      if (response.code === 0 || response.code === 200) {
        const treeData = cleanTreeData(response.data || []);
        setDeptTreeData(treeData);

        // 默认展开所有节点
        const allKeys = getAllNodeKeys(treeData);
        setExpandedKeys(allKeys);
      } else {
        message.error(response.msg || '获取部门列表失败');
      }
    } catch (error) {
      message.error('获取部门列表失败: ' + error.message);
    }
  };

  // 清理树形数据中的空 children 字段
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

  // 获取所有节点的key
  const getAllNodeKeys = (data) => {
    const keys = [];
    const traverse = (nodes) => {
      nodes.forEach(node => {
        keys.push(node.deptId);
        if (node.children) {
          traverse(node.children);
        }
      });
    };
    traverse(data);
    return keys;
  };

  // 转换部门数据结构（用于表单中的上级部门选择器）
  const normalizeDeptOptions = (data) => {
    if (!Array.isArray(data)) return [];
    return data.map(item => ({
      title: item.deptName,
      value: item.deptId,
      key: item.deptId,
      children: item.children ? normalizeDeptOptions(item.children) : undefined
    }));
  };

  // 组件加载时获取部门树
  useEffect(() => {
    fetchDeptTree();
  }, []);

  // 当表单打开时，获取部门选项并设置表单初始值
  useEffect(() => {
    if (formVisible) {
      const initialValues = getInitialValues();
      form.setFieldsValue(initialValues);

      if (editingRecord) {
        // 编辑模式：排除当前节点及其子节点
        getSysDeptListExcludeChild(editingRecord.deptId).then(response => {
          if (response.code === 0 || response.code === 200) {
            const treeData = cleanTreeData(response.data || []);
            const options = normalizeDeptOptions(treeData);
            // 如果没有可选项，添加当前节点的父部门作为选项
            if (options.length === 0 && editingRecord.parentId !== 0) {
              options.push({
                title: editingRecord.parentName,
                value: editingRecord.parentId,
                key: editingRecord.parentId
              });
            }
            setDeptOptions(options);
          }
        });
      } else {
        // 新增模式：获取所有部门
        getSysDeptList().then(response => {
          if (response.code === 0 || response.code === 200) {
            const treeData = cleanTreeData(response.data || []);
            setDeptOptions(normalizeDeptOptions(treeData));
          }
        });
      }
    } else {
      form.resetFields();
      setEditingRecord(null);
      setParentDept(null);
    }
  }, [formVisible]);

  // 新增部门
  const handleAdd = () => {
    setEditingRecord(null);
    setParentDept(null);
    setDeptOptions([]);
    setFormVisible(true);
  };

  // 新增子部门
  const handleAddChild = (node) => {
    setEditingRecord(null);
    setParentDept(node);
    setDeptOptions([]);
    setFormVisible(true);
  };

  // 编辑部门
  const handleEdit = (node) => {
    setEditingRecord(node);
    setParentDept(null);
    setFormVisible(true);
  };

  // 删除部门
  const handleDelete = async (node) => {
    try {
      const response = await deleteSysDept(node.deptId);
      if (response.code === 0 || response.code === 200) {
        message.success('删除成功');
        fetchDeptTree();  // 刷新部门树
      } else {
        message.error(response.msg || '删除失败');
      }
    } catch (error) {
      message.error('删除失败: ' + error.message);
    }
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const submitValues = {
        ...values,
        parentId: parentDept
          ? parentDept.deptId
          : (editingRecord?.parentId ?? values.parentId ?? 0)
      };

      let response;
      if (editingRecord) {
        response = await updateSysDept(submitValues);
        if (response.code === 0 || response.code === 200) {
          message.success('更新成功');
        } else {
          message.error(response.msg || '更新失败');
          setLoading(false);
          return;
        }
      } else {
        response = await saveSysDept(submitValues);
        if (response.code === 0 || response.code === 200) {
          message.success('新增成功');
        } else {
          message.error(response.msg || '新增失败');
          setLoading(false);
          return;
        }
      }

      setFormVisible(false);
      setLoading(false);
      fetchDeptTree();  // 刷新部门树
    } catch (error) {
      if (error.errorFields) {
        // 表单验证失败
        console.log('表单验证失败:', error.errorFields);
      } else {
        message.error('操作失败: ' + error.message);
        setLoading(false);
      }
    }
  };

  // 获取表单初始值
  const getInitialValues = () => {
    if (editingRecord) {
      return {
        ...editingRecord,
        status: editingRecord.status || '0'
      };
    }
    if (parentDept) {
      return {
        parentId: parentDept.deptId,
        status: '0'
      };
    }
    return {
      status: '0'
    };
  };

  // 获取表单标题
  const getFormTitle = () => {
    if (editingRecord) {
      return '编辑部门';
    }
    if (parentDept) {
      return `新增下级部门 (${parentDept.deptName})`;
    }
    return '新增部门';
  };

  // 树节点渲染
  const renderTreeNodes = (data) => {
    return data.map(item => {
      if (item.children) {
        return {
          ...item,
          title: renderNodeTitle(item),
          children: renderTreeNodes(item.children)
        };
      }
      return {
        ...item,
        title: renderNodeTitle(item)
      };
    });
  };

  // 渲染节点标题（包含操作按钮）
  const renderNodeTitle = (node) => {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingRight: 20 }}>
        <span style={{ flex: 1 }}>{node.deptName}</span>
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<PlusOutlined />}
            onClick={(e) => { e.stopPropagation(); handleAddChild(node); }}
          >
            新增
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={(e) => { e.stopPropagation(); handleEdit(node); }}
            style={{ color: '#faad14' }}
          >
            编辑
          </Button>
          {node.parentId !== 0 && (
            <Popconfirm
              title="删除确认"
              description={`确定要删除部门"${node.deptName}"吗？`}
              onConfirm={(e) => { e?.stopPropagation(); handleDelete(node); }}
              onCancel={(e) => e?.stopPropagation()}
              okText="确定"
              cancelText="取消"
            >
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={(e) => e.stopPropagation()}
              >
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      </div>
    );
  };

  // 处理树节点展开
  const onExpand = (expandedKeysValue) => {
    setExpandedKeys(expandedKeysValue);
    setAutoExpandParent(false);
  };

  // 处理树节点选择
  const onSelect = (selectedKeysValue, info) => {
    setSelectedKeys(selectedKeysValue);
  };

  // 展开/收起所有节点
  const handleToggleExpand = () => {
    const allKeys = getAllNodeKeys(deptTreeData);
    if (expandedKeys.length === allKeys.length) {
      setExpandedKeys([]);
    } else {
      setExpandedKeys(allKeys);
    }
  };

  // 处理树形数据的选择
  const treeData = useMemo(() => {
    return renderTreeNodes(deptTreeData);
  }, [deptTreeData]);

  return (
    <div style={{ padding: 20 }}>
      <Card
        title={
          <Space>
            <ApartmentOutlined />
            <span>部门管理</span>
          </Space>
        }
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              新增部门
            </Button>
            <Button
              onClick={handleToggleExpand}
            >
              {expandedKeys.length === getAllNodeKeys(deptTreeData).length ? '收起全部' : '展开全部'}
            </Button>
          </Space>
        }
      >
        {deptTreeData.length > 0 ? (
          <Tree
            showLine
            expandedKeys={expandedKeys}
            selectedKeys={selectedKeys}
            onExpand={onExpand}
            onSelect={onSelect}
            treeData={treeData}
            fieldNames={{ title: 'title', key: 'deptId', children: 'children' }}
            autoExpandParent={autoExpandParent}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
            暂无部门数据，请点击"新增部门"按钮创建
          </div>
        )}
      </Card>

      {/* 部门表单 */}
      <Modal
        title={getFormTitle()}
        open={formVisible}
        onCancel={() => setFormVisible(false)}
        onOk={handleSubmit}
        confirmLoading={loading}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="deptId"
            hidden
          >
            <Input />
          </Form.Item>

          {(!editingRecord && !parentDept) || (editingRecord && editingRecord.parentId !== 0) ? (
            <Form.Item
              name="parentId"
              label="上级部门"
              rules={[{ required: true, message: '请选择上级部门' }]}
            >
              <Select
                style={{ width: '100%' }}
                placeholder="请选择上级部门"
                allowClear
                showSearch
                treeDefaultExpandAll
                treeCheckable={false}
                treeNodeFilterProp="title"
                options={deptOptions}
                fieldNames={{ label: 'title', value: 'value', children: 'children' }}
              />
            </Form.Item>
          ) : null}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="deptName"
                label="部门名称"
                rules={[{ required: true, message: '请输入部门名称' }]}
              >
                <Input placeholder="请输入部门名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="orderNum"
                label="显示排序"
                rules={[{ required: true, message: '请输入显示排序' }]}
              >
                <InputNumber placeholder="请输入显示排序" min={0} max={10000} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="leader"
                label="负责人"
              >
                <Input placeholder="请输入负责人" maxLength={20} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="联系电话"
                rules={[
                  {
                    pattern: /^1[3-9]\d{9}$/,
                    message: '请输入正确的手机号码'
                  }
                ]}
              >
                <Input placeholder="请输入联系电话" maxLength={11} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="邮箱"
                rules={[
                  { type: 'email', message: '请输入正确的邮箱地址' }
                ]}
              >
                <Input placeholder="请输入邮箱" maxLength={50} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="部门状态"
                rules={[{ required: true, message: '请选择部门状态' }]}
              >
                <Select placeholder="请选择部门状态">
                  <Option value="0">正常</Option>
                  <Option value="1">停用</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default DeptPage;
