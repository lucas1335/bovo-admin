import React, { useState, useEffect } from 'react';
import { message, Tag, Form, Input, Radio, Tabs, Select } from 'antd';
import CmBasePage from '@components/CmBasePage';
import DataForm from '@components/DataForm';
import CmEditor from '@components/CmEditor';
import { listNotice, addNotice, updateNotice, delNotice, getTabList } from '@api/modules/notice';

const { TabPane } = Tabs;
const { Option } = Select;

/**
 * 通知公告管理页面
 * 功能：通知公告的增删改查，支持多种公告类型（通过标签页切换）
 */
const NoticePage = () => {
  const [form] = Form.useForm();

  // 1. 状态管理
  const [formVisible, setFormVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);

  // 标签页相关状态
  const [activeTabKey, setActiveTabKey] = useState('');
  const [tabList, setTabList] = useState([]); // 所有标签列表
  const [currentSelectList, setCurrentSelectList] = useState([]); // 当前标签的下拉选项

  /**
   * 加载标签列表
   */
  const loadTabList = async () => {
    try {
      const response = await getTabList();
      if (response.code === 0 || response.code === 200) {
        const tabs = response.rows || [];
        setTabList(tabs);
        if (tabs.length > 0) {
          setActiveTabKey(tabs[0].key);
          // 设置第一个标签的下拉选项
          if (tabs[0].obj) {
            try {
              const objData = JSON.parse(tabs[0].obj);
              setCurrentSelectList(objData);
            } catch (e) {
              console.error('Failed to parse obj:', e);
              setCurrentSelectList([]);
            }
          }
        }
      }
    } catch (error) {
      console.error('获取标签列表失败:', error);
    }
  };

  useEffect(() => {
    loadTabList();
  }, []);

  /**
   * 标签页切换处理
   */
  const handleTabChange = (key) => {
    setActiveTabKey(key);
    // 查找当前标签的下拉选项
    const currentTab = tabList.find(tab => tab.key === key);
    if (currentTab && currentTab.obj) {
      try {
        const objData = JSON.parse(currentTab.obj);
        setCurrentSelectList(objData);
      } catch (e) {
        console.error('Failed to parse obj:', e);
        setCurrentSelectList([]);
      }
    } else {
      setCurrentSelectList([]);
    }
  };

  // 2. 列配置
  const columns = [
    {
      title: '公告ID',
      dataIndex: 'noticeId',
      key: 'noticeId',
      width: 100,
      sorter: true,
    },
    {
      title: '公告标题',
      dataIndex: 'noticeTitle',
      key: 'noticeTitle',
      width: 250,
      sorter: true,
    },
    {
      title: '公告类型',
      dataIndex: 'noticeType',
      key: 'noticeType',
      width: 120,
      render: (noticeType) => {
        const typeMap = {
          '1': { color: 'blue', text: '通知' },
          '2': { color: 'orange', text: '公告' },
        };
        const typeInfo = typeMap[noticeType] || { color: 'default', text: '未知' };
        return <Tag color={typeInfo.color}>{typeInfo.text}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusMap = {
          '0': { color: 'green', text: '正常' },
          '1': { color: 'red', text: '关闭' },
        };
        const statusInfo = statusMap[status] || { color: 'default', text: '未知' };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
    },
    {
      title: '创建者',
      dataIndex: 'createBy',
      key: 'createBy',
      width: 120,
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
      title: '公告标题',
      dataIndex: 'noticeTitle',
      key: 'SEARCH_LIKE_noticeTitle',
      type: 'text',
    },
  ];

  // 4. 事件处理
  /**
   * 新增公告
   */
  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({ status: '0', noticeType: '1' });
    setFormVisible(true);
  };

  /**
   * 编辑公告
   */
  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setFormVisible(true);
  };

  /**
   * 删除公告
   */
  const handleDelete = async (record) => {
    try {
      const response = await delNotice(record.noticeId);
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
   * 提交表单
   */
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // 添加当前标签的key
      const submitData = {
        ...values,
        key: activeTabKey
      };

      const response = editingRecord
        ? await updateNotice(submitData)
        : await addNotice(submitData);

      if (response.code === 0 || response.code === 200) {
        message.success(editingRecord ? '更新成功' : '创建成功');
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

  /**
   * 数据加载
   */
  const loadData = async (params) => {
    try {
      const requestParams = {
        pageNum: params.current || 1,
        pageSize: params.pageSize || 10,
        key: activeTabKey, // 添加key参数
        ...params
      };

      const response = await listNotice(requestParams);

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

  // 5. 渲染
  return (
    <div>
      <Tabs
        activeKey={activeTabKey}
        onChange={handleTabChange}
        type="card"
        style={{ marginBottom: 16 }}
      >
        {tabList.map(tab => (
          <TabPane tab={tab.value} key={tab.key}>
            <CmBasePage
              key={tab.key}
              columns={columns}
              onLoadData={loadData}
              searchFieldList={searchFieldList}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDelete}
              rowKey="noticeId"
              actionButtons={{
                edit: true,
                delete: true,
              }}
            />
          </TabPane>
        ))}
      </Tabs>

      <DataForm
        visible={formVisible}
        title={editingRecord ? '编辑公告' : '新增公告'}
        initialValues={editingRecord || { status: '0', noticeType: '1' }}
        extraValues={{ noticeId: editingRecord?.noticeId }}
        onCancel={() => setFormVisible(false)}
        onSubmit={handleSubmit}
        onClosed={() => setEditingRecord(null)}
        loading={loading}
        formType="drawer"
        width="60%"
      >
        <Form.Item
          name="noticeTitle"
          label="公告标题"
          rules={[{ required: true, message: '请输入公告标题' }]}
        >
          <Input placeholder="请输入公告标题" />
        </Form.Item>

        <Form.Item
          name="noticeType"
          label="公告类型"
          rules={[{ required: true, message: '请选择公告类型' }]}
        >
          <Radio.Group>
            <Radio value="1">通知</Radio>
            <Radio value="2">公告</Radio>
          </Radio.Group>
        </Form.Item>

        {/* 如果有下拉选项，显示下拉选择 */}
        {currentSelectList && currentSelectList.length > 0 && (
          <Form.Item
            name="noticeType"
            label="公告类型"
            rules={[{ required: true, message: '请选择公告类型' }]}
          >
            <Select placeholder="请选择公告类型">
              {currentSelectList.map(item => (
                <Option key={item.value} value={item.value}>
                  {item.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}

        <Form.Item
          name="status"
          label="状态"
          rules={[{ required: true, message: '请选择状态' }]}
        >
          <Radio.Group>
            <Radio value="0">正常</Radio>
            <Radio value="1">关闭</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="content"
          label="公告内容"
          rules={[{ required: true, message: '请输入公告内容' }]}
        >
          <CmEditor
            value={editingRecord?.content || ''}
            onChange={(value) => form.setFieldsValue({ content: value })}
            height={300}
          />
        </Form.Item>
      </DataForm>
    </div>
  );
};

export default NoticePage;
