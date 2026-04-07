import React, { useState, useEffect, useMemo } from 'react';
import { message, Tag, Button, Popconfirm, Form, Input, Select, Switch, InputNumber, TreeSelect, Modal, Table, Radio } from 'antd';
import CmBasePage from '@components/CmBasePage';
import DataForm from '@components/DataForm';
import CmImage from '@components/CmImage';
import CmUpload from '@components/CmUpload';
import ChooseArticle from './components/ChooseArticle';
import { getPNavMenuList, savePNavMenu, updatePNavMenu, deletePNavMenu, getPArticleCategoryList, getQProductCategoryList } from '@api';
import { EditOutlined, DeleteOutlined, PlusOutlined, ExpandOutlined, CompressOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

// 文章选择输入组件
const ArticleInput = ({ value, onChange }) => {
  const [articleSelectorVisible, setArticleSelectorVisible] = useState(false);

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Input
          placeholder="点击选择文章"
          readOnly
          value={value || ''}
          onClick={() => setArticleSelectorVisible(true)}
          style={{ cursor: 'pointer', flex: 1 }}
        />
        <Button onClick={() => setArticleSelectorVisible(true)}>
          选择
        </Button>
      </div>
      <ChooseArticle
        visible={articleSelectorVisible}
        onCancel={() => setArticleSelectorVisible(false)}
        onConfirm={(article) => {
          onChange(article.id);
          setArticleSelectorVisible(false);
        }}
        selectedArticleId={value}
      />
    </>
  );
};

/**
 * 导航菜单管理页面（树形结构）
 */
const NavMenuPage = () => {
  const [form] = Form.useForm();
  const [formVisible, setFormVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [parentRecord, setParentRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [allKeys, setAllKeys] = useState([]);
  const [viewMode, setViewMode] = useState(false);
  const [classifyList, setClassifyList] = useState([]);
  const [productClassifyList, setProductClassifyList] = useState([]);
  const [navMenuList, setNavMenuList] = useState([]);

  // 获取文章分类列表
  useEffect(() => {
    const fetchClassifyList = async () => {
      try {
        const response = await getPArticleCategoryList({
          pageNum: 1,
          pageSize: 1000,
          searchParam: JSON.stringify({ SEARCH_EQ_article_flag: 1 })
        });
        if (response.code === 0 || response.code === 200) {
          const list = response.data?.records || response.data?.list || response.data || [];
          setClassifyList(list);
        }
      } catch (error) {
        message.error('文章分类获取失败');
      }
    };
    fetchClassifyList();
  }, []);

  // 获取产品分类列表
  useEffect(() => {
    const fetchProductClassifyList = async () => {
      try {
        const response = await getQProductCategoryList({
          pageNum: 1,
          pageSize: 1000,
        });
        if (response.code === 0 || response.code === 200) {
          setProductClassifyList(response.data || []);
        }
      } catch (error) {
        message.error('产品分类获取失败');
      }
    };
    fetchProductClassifyList();
  }, []);

  // 获取导航菜单列表，用于 navTarget 字段
  useEffect(() => {
    const fetchNavMenuList = async () => {
      try {
        const response = await getPNavMenuList({});
        if (response.code === 0 || response.code === 200) {
          const list = response.data || [];
          setNavMenuList(list);
        } else {
          message.error(response.msg || '导航菜单获取失败');
        }
      } catch (error) {
        message.error('导航菜单获取失败: ' + error.message);
      }
    };
    fetchNavMenuList();
  }, []);

  // 树形选择器数据转换
  const normalizeTreeData = (data) => {
    return data.map(item => ({
      title: item.name,
      value: String(item.id),
      key: String(item.id),
      children: item.children ? normalizeTreeData(item.children) : [],
    }));
  };

  // 转换导航菜单数据，只保留有子节点的父节点
  const normalizeNavTreeData = (data) => {
    return data
      .filter(item => item.children && item.children.length > 0)
      .map(item => ({
        title: item.label,
        value: String(item.id),
        key: String(item.id),
        children: item.children ? normalizeNavTreeData(item.children) : [],
      }));
  };

  const handleAdd = () => {
    setEditingRecord(null);
    setParentRecord(null);
    setViewMode(false);
    setFormVisible(true);
  };

  const handleAddChild = (record) => {
    setEditingRecord(null);
    setParentRecord(record);
    setViewMode(false);
    setFormVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setParentRecord(null);
    setViewMode(false);
    setFormVisible(true);
  };

  const handleView = (record) => {
    setEditingRecord(record);
    setParentRecord(null);
    setViewMode(true);
    setFormVisible(true);
  };

  const handleDelete = async (record) => {
    try {
      const response = await deletePNavMenu({ id: record.id });
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
      const submitValues = {
        ...values,
        pid: parentRecord ? parentRecord.id : (editingRecord?.pid ?? values.pid ?? ''),
      };

      const response = editingRecord
        ? await updatePNavMenu(submitValues)
        : await savePNavMenu(submitValues);

      if (response.code === 0 || response.code === 200) {
        message.success(editingRecord ? '更新成功' : '创建成功');
        setFormVisible(false);
        document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
          new CustomEvent('reload')
        );
      } else {
        message.error(response.msg || '操作失败');
        setLoading(false);
        return;
      }
    } catch (error) {
      message.error('操作失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 链接类型选项
  const linkTypeOptions = [
    { label: '栏目', value: 'nav' },
    { label: '文章列表', value: 'category' },
    { label: '单页文章', value: 'article' },
    { label: '图文列表', value: 'imageText' },
    { label: '自定义链接', value: 'customUrl' },
  ];

  // 状态渲染
  const renderState = (state) => {
    return (
      <Tag color={state == 1 ? 'green' : 'red'}>
        {state == 1 ? '正常' : '隐藏'}
      </Tag>
    );
  };

  // 链接类型渲染
  const renderLinkType = (linkType) => {
    const typeMap = {
      'category': { text: '文章列表', color: 'blue' },
      'article': { text: '单页文章', color: 'purple' },
      'nav': { text: '栏目', color: 'cyan' },
      'imageText': { text: '图文列表', color: 'green' },
      'customUrl': { text: '自定义链接', color: 'orange' },
    };
    const type = typeMap[linkType] || { text: linkType || '未知', color: 'default' };
    return <Tag color={type.color}>{type.text}</Tag>;
  };

  const columns = [
    {
      title: '显示文本',
      dataIndex: 'label',
      key: 'label',
      width: 200,
      align: 'left',
    },
    {
      title: '栏目编码',
      dataIndex: 'navCode',
      key: 'navCode',
      width: 150,
    },
    {
      title: '链接类型',
      dataIndex: 'linkType',
      key: 'linkType',
      width: 120,
      render: renderLinkType,
    },
    {
      title: '链接目标',
      dataIndex: 'linkTarget',
      key: 'linkTarget',
      width: 200,
      ellipsis: true,
    },
    {
      title: '排序',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 80,
    },
    {
      title: '显示状态',
      dataIndex: 'state',
      key: 'state',
      width: 80,
      render: renderState,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 200,
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 300,
      render: (_, record) => (
        <>
          <Button
            type="link"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => handleAddChild(record)}
          >
            添加下级
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => handleView(record)}
          >
            查看
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{ color: '#faad14' }}
          >
            编辑
          </Button>
          <Popconfirm
            title="删除确认"
            description="确定要删除这条数据吗？"
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

  // 自定义数据加载函数，用于处理树形结构数据
  const loadData = async (params) => {
    try {
      const response = await getPNavMenuList(params);
      if (response.code === 0 || response.code === 200) {
        // 处理树形数据，确保每个节点都有唯一key
        const allKeysList = [];
        const processData = (data) => {
          if (!Array.isArray(data)) return [];
          return data.map(item => {
            allKeysList.push(item.id);
            return {
              ...item,
              children: item.children ? processData(item.children) : undefined
            };
          });
        };

        const processedData = processData(response.data || []);
        setAllKeys(allKeysList);

        return {
          data: processedData,
          success: true,
          total: processedData.length
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

  // 切换展开/收起所有
  const handleToggleExpand = () => {
    const isExpanded = expandedRowKeys.length === allKeys.length;
    setExpandedRowKeys(isExpanded ? [] : allKeys);
  };

  // 工具栏额外按钮
  const toolBarExtraButtons = [
    <Button
      key="toggleExpand"
      icon={expandedRowKeys.length === allKeys.length ? <CompressOutlined /> : <ExpandOutlined />}
      onClick={handleToggleExpand}
      disabled={allKeys.length === 0}
    >
      {expandedRowKeys.length === allKeys.length ? '收起全部' : '展开全部'}
    </Button>
  ];

  const initialValues = useMemo(() => {
    if (editingRecord) {
      return editingRecord;
    }
    if (parentRecord) {
      return { pid: parentRecord.id };
    }
    return { state: 1, orderNo: 0 };
  }, [editingRecord, parentRecord]);

  const formTitle = useMemo(() => {
    if (viewMode) {
      return '查看导航菜单';
    }
    if (editingRecord) {
      return '编辑导航菜单';
    }
    if (parentRecord) {
      return `添加子菜单 (${parentRecord.label})`;
    }
    return '添加导航菜单';
  }, [viewMode, editingRecord, parentRecord]);

  return (
    <div style={{ textAlign: 'left' }}>
      <CmBasePage
        columns={columns}
        onLoadData={loadData}
        searchVisible={false}
        onAdd={handleAdd}
        toolBarExtraButtons={toolBarExtraButtons}
        rowKey="id"
        pagination={false}
        expandable={{
          expandedRowKeys: expandedRowKeys,
          onExpandedRowsChange: setExpandedRowKeys,
          childrenColumnName: 'children',
        }}
      />

      <DataForm
        key={editingRecord?.id || (parentRecord ? `new-${parentRecord.id}` : 'new-root')}
        visible={formVisible}
        title={formTitle}
        initialValues={initialValues}
        extraValues={{ id: editingRecord ? editingRecord.id : undefined }}
        onCancel={() => {
          setFormVisible(false);
        }}
        onSubmit={handleSubmit}
        onClosed={() => {
          setEditingRecord(null);
          setParentRecord(null);
        }}
        loading={loading}
        disabled={viewMode}
        form={form}
        width={800}
        maxBodyHeight={600}
        bodyStyle={{ paddingTop: 12 }}
      >
        <Form.Item
          name="label"
          label="显示文本"
          rules={[{ required: true, message: '请输入显示文本' }]}
        >
          <Input placeholder="请输入显示文本" />
        </Form.Item>

        <Form.Item
          name="navCode"
          label="栏目编码"
          rules={[{ required: true, message: '请输入栏目编码' }]}
        >
          <Input placeholder="请输入栏目编码" />
        </Form.Item>

        <Form.Item
          name="image"
          label="背景图"
        >
          <CmUpload />
        </Form.Item>

        <Form.Item
          name="linkType"
          label="链接类型"
          rules={[{ required: true, message: '请选择链接类型' }]}
        >
          <Select placeholder="请选择链接类型">
            {linkTypeOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) => prevValues.linkType !== currentValues.linkType || prevValues.linkTarget !== currentValues.linkTarget || prevValues.navCode !== currentValues.navCode}
        >
          {({ getFieldValue }) => {
            const currentLinkType = getFieldValue('linkType');
            const currentNavCode = getFieldValue('navCode');
            const isProductCategory = currentNavCode?.includes('Product') && currentLinkType === 'customUrl';
            const treeData = normalizeTreeData(classifyList);

            // nav 类型不需要 linkTarget
            if (currentLinkType === 'nav') {
              return null;
            }

            return (
              <Form.Item
                name="linkTarget"
                label={
                  currentLinkType === 'customUrl' ? (isProductCategory ? '产品分类' : '链接地址') :
                  currentLinkType === 'category' ? '文章分类' :
                  currentLinkType === 'article' ? '选择文章' :
                  currentLinkType === 'imageText' ? '图文分类' :
                  '链接目标'
                }
                tooltip={
                  currentLinkType === 'customUrl' ? (isProductCategory ? '请选择产品分类' : '请输入链接地址') :
                  currentLinkType === 'category' ? '请选择文章分类，可选中父节点' :
                  currentLinkType === 'article' ? '点击选择文章' :
                  currentLinkType === 'imageText' ? '请选择图文分类，可选中父节点' :
                  '关联ID，如文章ID'
                }
                rules={currentLinkType === 'category' || currentLinkType === 'imageText' || (currentLinkType === 'customUrl' && isProductCategory) ? [{ required: true, message: '请选择分类' }] : undefined}
                getValueProps={(value) => ({
                  value: currentLinkType === 'article' ? (value ? `文章id: ${value}` : '') : value,
                })}
              >
                {isProductCategory ? (
                  <Select
                    placeholder="请选择产品分类"
                    allowClear
                    showSearch
                    optionFilterProp="children"
                  >
                    {productClassifyList.map(item => (
                      <Option key={item.id} value={String(item.id)}>
                        {item.title}
                      </Option>
                    ))}
                  </Select>
                ) : currentLinkType === 'category' || currentLinkType === 'imageText' ? (
                  <TreeSelect
                    placeholder={currentLinkType === 'category' ? '请选择文章分类' : '请选择图文分类'}
                    treeData={treeData}
                    allowClear
                    showSearch
                    treeDefaultExpandAll
                    treeCheckable={false}
                  />
                ) : currentLinkType === 'article' ? (
                  <ArticleInput />
                ) : (
                  <Input
                    placeholder={
                      currentLinkType === 'customUrl' ? '请输入链接地址' : '请输入链接目标'
                    }
                  />
                )}
              </Form.Item>
            );
          }}
        </Form.Item>

        <Form.Item
          name="orderNo"
          label="排序号码"
          rules={[{ required: true, message: '请输入排序号码' }]}
        >
          <InputNumber placeholder="请输入排序号码" style={{ width: '100%' }} min={0} />
        </Form.Item>

        <Form.Item
          name="state"
          label="显示状态"
          valuePropName="checked"
          getValueProps={(value) => ({ checked: value === 1 })}
          getValueFromEvent={(checked) => (checked ? 1 : 0)}
        >
          <Switch checkedChildren="正常" unCheckedChildren="隐藏" />
        </Form.Item>

        <Form.Item
          name="remark"
          label="备注"
        >
          <TextArea rows={3} placeholder="请输入备注" />
        </Form.Item>

        <Form.Item
          name="navFlag"
          label="跟随导航"
          initialValue={0}
        >
          <Radio.Group>
            <Radio value={0}>否</Radio>
            <Radio value={1}>是</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="navTarget"
          label="导航目标"
        >
          <TreeSelect
            placeholder="请选择导航目标（仅父节点）"
            treeData={normalizeNavTreeData(navMenuList)}
            allowClear
            showSearch
            treeDefaultExpandAll
            treeCheckable={false}
            filterTreeNode={(input, treeNode) =>
              treeNode.title.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          />
        </Form.Item>

      </DataForm>
    </div>
  );
};

export default NavMenuPage;
