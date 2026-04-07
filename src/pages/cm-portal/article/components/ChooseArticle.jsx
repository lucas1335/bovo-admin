import React, { useState, useEffect } from 'react';
import { Drawer, Table, Input, TreeSelect, Button, Space, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { getPArticleInfoList, getPArticleCategoryList } from '@api';

/**
 * 选择文章组件
 * @param {boolean} visible - 是否显示
 * @param {Function} onCancel - 取消回调
 * @param {Function} onConfirm - 确认回调，返回选中的文章对象 { id, title, ... }
 * @param {string} selectedArticleId - 已选中的文章ID（用于回显）
 */
const ChooseArticle = ({ visible, onCancel, onConfirm, selectedArticleId }) => {
  const [tableLoading, setTableLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [total, setTotal] = useState(0);
  const [selectedRowKey, setSelectedRowKey] = useState(null);

  const [categoryId, setCategoryId] = useState(null);
  const [classifyList, setClassifyList] = useState([]);
  const [classifyMap, setClassifyMap] = useState(new Map());
  const [title, setTitle] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  // 获取文章分类列表
  useEffect(() => {
    const fetchClassifyList = async () => {
      try {
        const response = await getPArticleCategoryList({
          pageNum: 1,
          pageSize: 1000,
        });
        if (response.code === 0 || response.code === 200) {
          const list = response.data?.records || response.data?.list || response.data || [];
          setClassifyList(list);

          // 构建分类Map用于显示分类名称
          const map = new Map();
          const buildMap = (items) => {
            items.forEach(item => {
              map.set(item.id, item);
              if (item.children && item.children.length > 0) {
                buildMap(item.children);
              }
            });
          };
          buildMap(list);
          setClassifyMap(map);
        }
      } catch (error) {
        message.error('文章分类获取失败');
      }
    };
    fetchClassifyList();
  }, []);

  // 转换树形数据
  const normalizeTreeData = (data) => {
    return data.map(item => ({
      title: item.name,
      value: String(item.id),
      key: String(item.id),
      children: item.children ? normalizeTreeData(item.children) : [],
    }));
  };

  // 获取文章列表
  const fetchArticleList = async (page = 1, pageSize = 10, catId = null, titleParam = null) => {
    try {
      setTableLoading(true);
      const searchParam = {};
      const targetCategoryId = catId !== null ? catId : categoryId;
      const targetTitle = titleParam !== null ? titleParam : title;

      if (targetCategoryId) {
        searchParam.SEARCH_EQ_categoryId = targetCategoryId;
      }
      if (targetTitle) {
        searchParam.SEARCH_LIKE_title = targetTitle;
      }

      const response = await getPArticleInfoList({
        pageNum: page,
        pageSize: pageSize,
        searchParam: JSON.stringify(searchParam),
      });

      if (response.code === 0 || response.code === 200) {
        const list = response.data?.records || response.data?.list || response.data || [];
        setDataSource(list);
        setTotal(response.data?.total || 0);
      } else {
        message.error(response.msg || '获取文章列表失败');
      }
    } catch (error) {
      message.error('获取文章列表失败');
    } finally {
      setTableLoading(false);
    }
  };

  // 打开时设置选中状态
  useEffect(() => {
    if (visible) {
      // 确保 selectedRowKey 是字符串类型，与 rowKey 保持一致
      setSelectedRowKey(selectedArticleId ? String(selectedArticleId) : null);
      fetchArticleList(1, pagination.pageSize);
    }
  }, [visible, selectedArticleId]);

  // 获取分类名称
  const getCategoryName = (categoryId) => {
    const category = classifyMap.get(categoryId);
    return category ? category.name : '-';
  };

  // 搜索
  const handleSearch = () => {
    setPagination({ current: 1, pageSize: pagination.pageSize });
    fetchArticleList(1, pagination.pageSize, categoryId, title);
  };

  // 重置
  const handleReset = () => {
    setCategoryId(null);
    setTitle('');
    setPagination({ current: 1, pageSize: 10 });
    fetchArticleList(1, 10, null, null);
  };

  // 确认选择
  const handleConfirm = () => {
    if (!selectedRowKey) {
      message.warning('请选择一篇文章');
      return;
    }
    const article = dataSource.find(item => String(item.id) === String(selectedRowKey));
    if (article) {
      onConfirm(article);
      setSelectedRowKey(null); // 清空选中状态
    }
    onCancel();
  };

  const columns = [
    {
      title: '文章ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '分类',
      dataIndex: 'categoryId',
      key: 'categoryId',
      width: 150,
      render: (categoryId) => getCategoryName(categoryId),
    },
    {
      title: '状态',
      dataIndex: 'state',
      key: 'state',
      width: 100,
      render: (state) => (
        <span style={{ color: state == 1 ? 'green' : 'red' }}>
          {state == 1 ? '展示' : '隐藏'}
        </span>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          onClick={() => {
            setSelectedRowKey(String(record.id));
            onConfirm(record);
          }}
        >
          选择
        </Button>
      ),
    },
  ];

  const treeData = normalizeTreeData(classifyList);

  return (
    <Drawer
      title="选择文章"
      open={visible}
      onClose={onCancel}
      width={900}
      destroyOnClose
      footer={
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" onClick={handleConfirm}>
            确定
          </Button>
        </Space>
      }
    >
      <Space style={{ marginBottom: 16 }} size={12}>
        <Input
          placeholder="搜索文章标题"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onPressEnter={handleSearch}
          style={{ width: 300 }}
          allowClear
        />
        <TreeSelect
          placeholder="选择分类"
          value={categoryId}
          onChange={(value) => {
            setCategoryId(value);
            setPagination({ current: 1, pageSize: pagination.pageSize });
            fetchArticleList(1, pagination.pageSize, value, title);
          }}
          treeData={treeData}
          allowClear
          showSearch
          treeNodeFilterProp="title"
          treeDefaultExpandAll
          style={{ width: 300 }}
        />
        <Button icon={<SearchOutlined />} onClick={handleSearch}>
          搜索
        </Button>
        <Button onClick={handleReset}>
          重置
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey="id"
        loading={tableLoading}
        rowSelection={{
          type: 'radio',
          selectedRowKey,
          onChange: (selectedRowKeys) => {
            setSelectedRowKey(selectedRowKeys);
          },
        }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          onChange: (page, pageSize) => {
            setPagination({ current: page, pageSize });
            fetchArticleList(page, pageSize);
          },
        }}
        scroll={{ y: 520 }}
      />
    </Drawer>
  );
};

export default ChooseArticle;
