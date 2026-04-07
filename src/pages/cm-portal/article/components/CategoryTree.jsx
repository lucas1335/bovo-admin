import React, { useState, useEffect } from 'react';
import { Tree, Input, Empty, Spin, Button } from 'antd';
import { SearchOutlined, ExpandOutlined, CompressOutlined } from '@ant-design/icons';
import { getPArticleCategoryList } from '@api';
import './CategoryTree.css';

const { Search } = Input;

/**
 * 文章分类树组件
 * @param {Function} onSelect - 选中分类回调 (categoryId, record)
 */
const CategoryTree = ({ onSelect, value }) => {
  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState(value ? [value] : []);
  const [searchValue, setSearchValue] = useState('');
  const [allKeys, setAllKeys] = useState([]);

  // 获取分类数据
  useEffect(() => {
    fetchCategoryList();
  }, []);

  // 当 value 变化时更新选中状态
  useEffect(() => {
    if (value) {
      setSelectedKeys([value]);
    } else {
      setSelectedKeys([]);
    }
  }, [value]);

  const fetchCategoryList = async () => {
    setLoading(true);
    try {
      const response = await getPArticleCategoryList({
        pageNum: 1,
        pageSize: 1000,
        searchParam: JSON.stringify({ SEARCH_EQ_article_flag: 1 })
      });
      if (response.code === 0 || response.code === 200) {
        const list = response.data?.records || response.data?.list || response.data || [];

        // 转换为树形数据结构
        const normalizedData = normalizeTreeData(list);
        setTreeData(normalizedData);

        // 收集所有节点的key
        const keys = getAllKeys(normalizedData);
        setAllKeys(keys);

        // 默认不展开节点（收起状态）
        setExpandedKeys([]);
      }
    } catch (error) {
      console.error('文章分类获取失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取所有节点的key
  const getAllKeys = (data) => {
    const keys = [];
    const traverse = (items) => {
      items.forEach(item => {
        if (item.key) {
          keys.push(item.key);
        }
        if (item.children && item.children.length > 0) {
          traverse(item.children);
        }
      });
    };
    traverse(data);
    return keys;
  };

  // 转换树形数据
  const normalizeTreeData = (data) => {
    return data.map(item => {
      const hasChildren = item.children && item.children.length > 0;
      return {
        title: item.name,
        key: String(item.id),
        value: String(item.id),
        children: hasChildren ? normalizeTreeData(item.children) : undefined,
      };
    });
  };

  // 切换展开/收起所有
  const handleToggleExpand = () => {
    const isExpanded = expandedKeys.length === allKeys.length;
    setExpandedKeys(isExpanded ? [] : allKeys);
  };

  // 选中节点
  const handleSelect = (selectedKeys, info) => {
    setSelectedKeys(selectedKeys);

    if (selectedKeys.length > 0) {
      const categoryId = selectedKeys[0];
      // node 是 Tree 组件生成的节点，包含我们自定义的字段
      onSelect?.(categoryId, info.node);
    } else {
      onSelect?.(null, null);
    }
  };

  // 搜索过滤
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchValue(value);
  };

  // 过滤树节点 - 前端模糊搜索
  const filterTreeNode = (node) => {
    if (!searchValue) return true;
    const title = node.title?.toString()?.toLowerCase() || '';
    return title.includes(searchValue.toLowerCase());
  };

  return (
    <div className="category-tree">
      <div className="category-tree-header">
        <Search
          placeholder="搜索分类"
          allowClear={false}
          onChange={handleSearch}
          prefix={<SearchOutlined />}
        />
        <Button
          type="text"
          icon={expandedKeys.length === allKeys.length ? <CompressOutlined /> : <ExpandOutlined />}
          onClick={handleToggleExpand}
          className="expand-toggle-btn"
          disabled={allKeys.length === 0}
        >
          {expandedKeys.length === allKeys.length ? '收起' : '展开'}
        </Button>
      </div>

      <div className="category-tree-body">
        {loading ? (
          <div className="category-tree-loading">
            <Spin tip="加载中..." />
          </div>
        ) : treeData.length > 0 ? (
          <Tree
            expandedKeys={expandedKeys}
            selectedKeys={selectedKeys}
            onExpand={setExpandedKeys}
            onSelect={handleSelect}
            treeData={treeData}
            filterTreeNode={filterTreeNode}
            blockNode
          />
        ) : (
          <Empty
            description="暂无分类数据"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </div>
    </div>
  );
};

export default CategoryTree;
