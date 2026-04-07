import React, { useState, useEffect, useRef } from 'react';
import { message, Tag, Form, Input, Radio, Switch, TreeSelect, InputNumber } from 'antd';
import CmBasePage from '@components/CmBasePage';
import DataForm from '@components/DataForm';
import CmUpload from '@components/CmUpload';
import CmEditor from '@components/CmEditor';
import CmImage from '@components/CmImage';
import CategoryTree from './components/CategoryTree';
import { savePVideoInfo, updatePVideoInfo, deletePVideoInfo, getPVideoCategoryList } from '@api';
import './video.css';

const { TextArea } = Input;

/**
 * 视频信息管理页面
 */
const VideoListPage = () => {
  const [formVisible, setFormVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categoryList, setCategoryList] = useState([]);
  const [categoryMap, setCategoryMap] = useState(new Map());
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  // 左侧分类树展开/收起状态（默认收起）
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  // 切换分类树展开/收起
  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // 使用 ref 来存储最新的 categoryId，确保 loadData 能获取到最新值
  const categoryIdRef = useRef(null);

  // 当 selectedCategoryId 变化时，同步更新 ref
  useEffect(() => {
    categoryIdRef.current = selectedCategoryId;
  }, [selectedCategoryId]);

  // 获取视频分类列表
  useEffect(() => {
    const fetchCategoryList = async () => {
      try {
        const response = await getPVideoCategoryList({
          pageNum: 1,
          pageSize: 1000,
        });
        if (response.code === 0 || response.code === 200) {
          const list = response.data?.records || response.data?.list || response.data || [];
          setCategoryList(list);

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
          setCategoryMap(map);
        }
      } catch (error) {
        message.error('视频分类获取失败');
      }
    };
    fetchCategoryList();
  }, []);

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
      const response = await deletePVideoInfo({ id: record.id });
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
        ? await updatePVideoInfo(values)
        : await savePVideoInfo(values);

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

  // 查找分类名称
  const findCategoryName = (categoryId) => {
    const category = categoryMap.get(categoryId);
    if (category) return category.name;

    // 在子分类中查找
    for (const [, item] of categoryMap) {
      if (item.children) {
        const child = item.children.find(child => child.id === categoryId);
        if (child) return child.name;
      }
    }
    return '-';
  };

  // 树形选择器数据转换
  const normalizeTreeData = (data) => {
    return data.map(item => ({
      title: item.name,
      value: item.id,
      key: item.id,
      children: item.children ? normalizeTreeData(item.children) : [],
    }));
  };

  const columns = [
    {
      title: '视频标题',
      dataIndex: 'title',
      key: 'title',
      width: 300,
    },
    {
      title: '分类信息',
      dataIndex: 'categoryId',
      key: 'categoryId',
      width: 150,
      render: (categoryId) => findCategoryName(categoryId),
    },
    {
      title: '封面图',
      dataIndex: 'coverImage',
      key: 'coverImage',
      width: 120,
      render: (text) => <CmImage src={text} width={100} height={60} />,
    },
    {
      title: '视频时长',
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
      render: (duration) => {
        if (!duration) return '-';
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
      }
    },
    {
      title: '状态',
      dataIndex: 'state',
      key: 'state',
      width: 100,
      render: (state) => {
        const stateMap = {
          '1': { text: '上架', color: 'success' },
          '0': { text: '下架', color: 'error' },
        };
        const s = stateMap[state] || { text: '未知', color: 'default' };
        return <Tag color={s.color}>{s.text}</Tag>;
      }
    },
    {
      title: '推荐标识',
      dataIndex: 'recommendFlag',
      key: 'recommendFlag',
      width: 100,
      render: (flag) => (
        <Tag color={flag == 1 ? 'blue' : 'default'}>
          {flag == 1 ? '推荐' : '普通'}
        </Tag>
      ),
    },
    {
      title: '阅读量',
      dataIndex: 'readNum',
      key: 'readNum',
      width: 100,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
    },
  ];

  const treeData = normalizeTreeData(categoryList);

  const searchFieldList = [
    {
      title: '视频标题',
      dataIndex: 'title',
      key: 'SEARCH_LIKE_title',
      type: 'text',
    },
    {
      title: '状态',
      dataIndex: 'state',
      key: 'SEARCH_EQ_state',
      type: 'select',
      options: [
        { label: '上架', value: '1' },
        { label: '下架', value: '0' }
      ]
    },
    {
      title: '推荐标识',
      dataIndex: 'recommendFlag',
      key: 'SEARCH_EQ_recommendFlag',
      type: 'select',
      options: [
        { label: '推荐', value: '1' },
        { label: '普通', value: '0' }
      ]
    },
  ];

  // 处理分类选择
  const handleCategorySelect = (categoryId) => {
    setSelectedCategoryId(categoryId);
    // 触发表格重新加载
    setTimeout(() => {
      const tableContainer = document.querySelector('.ant-pro-table')?.parentNode;
      if (tableContainer) {
        tableContainer.dispatchEvent(new CustomEvent('reload'));
      }
    }, 0);
  };

  // 自定义数据加载函数，支持按分类筛选
  const loadData = async (params) => {
    try {
      const requestParams = {
        ...params,
      };
      // 使用 ref 获取最新的 categoryId
      const currentCategoryId = categoryIdRef.current;
      if (currentCategoryId) {
        const searchParam = requestParams.searchParam
          ? JSON.parse(requestParams.searchParam)
          : {};
        searchParam.SEARCH_EQ_categoryId = currentCategoryId;
        requestParams.searchParam = JSON.stringify(searchParam);
      }

      const response = await fetch(`/api/pVideoInfo/getList?${new URLSearchParams(requestParams)}`).then(res => res.json());

      if (response.code === 0 || response.code === 200) {
        return {
          data: response.data?.records || response.data?.list || response.data || [],
          success: true,
          total: response.data?.total || 0
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

  return (
    <div className="video-list-page">
      <div className="video-list-container" style={{ padding: 0 }}>
        {/* 左侧分类树 */}
        {!sidebarCollapsed && (
          <div className="video-list-sidebar">
            <CategoryTree
              value={selectedCategoryId}
              onSelect={handleCategorySelect}
            />
          </div>
        )}

        {/* 展开/收起按钮 */}
        <div
          className="sidebar-toggle-btn"
          onClick={handleToggleSidebar}
          style={{
            left: sidebarCollapsed ? 0 : 280,
            transition: 'left 0.3s ease'
          }}
        >
          {sidebarCollapsed ? '»' : '«'}
        </div>

        {/* 右侧视频列表 */}
        <div
          className="video-list-content"
          style={{
            marginLeft: 20,
            transition: 'margin-left 0.3s ease'
          }}
        >
          <CmBasePage
            className="video-list-table"
            columns={columns}
            onLoadData={loadData}
            searchFieldList={searchFieldList}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onView={handleView}
            onDelete={handleDelete}
            rowKey="id"
          />
        </div>
      </div>

      <DataForm
        visible={formVisible}
        title={viewMode ? '查看视频' : (editingRecord ? '编辑视频' : '新增视频')}
        initialValues={editingRecord || {}}
        extraValues={{ id: editingRecord?.id }}
        onCancel={() => setFormVisible(false)}
        onSubmit={handleSubmit}
        onClosed={() => setEditingRecord(null)}
        loading={loading}
        formType="drawer"
        width="80%"
        disabled={viewMode}
      >
        <Form.Item
          name="categoryId"
          label="视频分类"
          rules={[{ required: true, message: '请选择视频分类' }]}
        >
          <TreeSelect
            placeholder="请选择视频分类"
            treeData={treeData}
            allowClear
            showSearch
            treeDefaultExpandAll
          />
        </Form.Item>

        <Form.Item
          name="title"
          label="视频标题"
          rules={[{ required: true, message: '请输入视频标题' }]}
        >
          <Input placeholder="请输入视频标题" />
        </Form.Item>

        <Form.Item
          name="coverImage"
          label="封面图"
          rules={[{ required: true, message: '请上传封面图' }]}
        >
          <CmUpload />
        </Form.Item>

        <Form.Item
          name="summary"
          label="视频摘要"
        >
          <TextArea rows={4} placeholder="请输入视频摘要" />
        </Form.Item>

        <Form.Item
          name="content"
          label="视频内容"
        >
          <CmEditor height={500} />
        </Form.Item>

        <Form.Item
          name="videoUrl"
          label="视频URL"
          rules={[{ required: true, message: '请输入视频URL' }]}
        >
          <Input placeholder="请输入视频URL" />
        </Form.Item>

        <Form.Item
          name="duration"
          label="视频时长（秒）"
          rules={[{ required: true, message: '请输入视频时长' }]}
        >
          <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入视频时长（秒）" />
        </Form.Item>

        <Form.Item
          name="state"
          label="状态"
          rules={[{ required: true, message: '请选择状态' }]}
        >
          <Radio.Group>
            <Radio value={1}>上架</Radio>
            <Radio value={0}>下架</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="recommendFlag"
          label="推荐标识"
          valuePropName="checked"
          getValueProps={(value) => ({ checked: value === 1 })}
          getValueFromEvent={(checked) => (checked ? 1 : 0)}
        >
          <Switch checkedChildren="推荐" unCheckedChildren="普通" />
        </Form.Item>

        <Form.Item
          name="linkFlag"
          label="是否外链"
          valuePropName="checked"
          getValueProps={(value) => ({ checked: value === 1 })}
          getValueFromEvent={(checked) => (checked ? 1 : 0)}
        >
          <Switch checkedChildren="是" unCheckedChildren="否" />
        </Form.Item>

        <Form.Item
          name="linkUrl"
          label="外链地址"
        >
          <Input placeholder="请输入外链地址" />
        </Form.Item>

        <Form.Item
          name="remark"
          label="备注"
        >
          <TextArea rows={3} placeholder="请输入备注" />
        </Form.Item>
      </DataForm>
    </div>
  );
};

export default VideoListPage;
