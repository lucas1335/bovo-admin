/**
 * 帮助中心内容管理页面
 *
 * 功能：
 * 1. 管理帮助中心的文章内容（问题、答案）
 * 2. 支持富文本编辑
 * 3. 关联帮助中心分类
 *
 * @author Aka
 * @date 2023-08-17
 */

import React, { useState, useRef } from 'react';
import { message, Tag, Form, Input, Select, Switch, Modal } from 'antd';
import { useParams } from 'react-router-dom';
import CmBasePage from '@components/CmBasePage';
import DataForm from '@components/DataForm';
import CmEditor from '@components/CmEditor';
import {
  getHelpCenterInfoList,
  saveHelpCenterInfo,
  updateHelpCenterInfo,
  deleteHelpCenterInfo,
} from '@api';

const { Option } = Select;

const HelpCenterDataPage = () => {
  // 从路由参数获取帮助中心ID和语言
  const params = useParams();
  const helpCenterId = params?.id;
  const language = params?.language;

  // ==================== 状态管理 ====================
  const [formVisible, setFormVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);

  // 用于刷新表格
  const tableRef = useRef(null);

  // ==================== 列配置 ====================
  const columns = [
    {
      title: '问题',
      dataIndex: 'question',
      key: 'question',
      width: 300,
      ellipsis: true,
    },
    {
      title: '答案',
      dataIndex: 'answer',
      key: 'answer',
      ellipsis: true,
      width: 400,
      render: (text) => {
        if (!text) return '-';
        // 移除HTML标签显示纯文本预览
        const plainText = text.replace(/<[^>]+>/g, '');
        return plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText;
      },
    },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'enable',
      key: 'enable',
      width: 100,
      render: (enable) => {
        return enable === '1' || enable === 1
          ? <Tag color="success">启用</Tag>
          : <Tag color="warning">禁用</Tag>;
      },
    },
  ];

  // ==================== 事件处理 ====================

  /**
   * 新增文章
   */
  const handleAdd = () => {
    setEditingRecord(null);
    setFormVisible(true);
  };

  /**
   * 编辑文章
   */
  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormVisible(true);
  };

  /**
   * 删除文章
   */
  const handleDelete = async (record) => {
    try {
      const response = await deleteHelpCenterInfo(record.id);
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
      // 构造提交数据
      const submitData = {
        ...values,
        helpCenterId: helpCenterId,
      };

      const response = editingRecord
        ? await updateHelpCenterInfo(submitData)
        : await saveHelpCenterInfo(submitData);

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
    if (tableRef.current) {
      tableRef.current.reload();
    }
  };

  /**
   * 返回帮助中心列表
   */
  const handleBack = () => {
    window.location.href = '#/system/help';
  };

  // ==================== 自定义数据加载 ====================
  const loadData = async (params) => {
    try {
      const requestParams = {
        pageNum: params.current || 1,
        pageSize: params.pageSize || 10,
        helpCenterId: helpCenterId,
      };

      const response = await getHelpCenterInfoList(requestParams);

      if (response.code === 0 || response.code === 200) {
        return {
          data: response.data?.records || response.data?.list || response.data || [],
          success: true,
          total: response.data?.total || 0,
        };
      } else {
        message.error(response.msg || '获取数据失败');
        return {
          data: [],
          success: false,
          total: 0,
        };
      }
    } catch (error) {
      message.error('获取数据失败: ' + error.message);
      return {
        data: [],
        success: false,
        total: 0,
      };
    }
  };

  // ==================== 渲染 ====================

  return (
    <div style={{ padding: '20px', background: '#fff', minHeight: 'calc(100vh - 64px)' }}>
      {/* 页面标题 */}
      <div style={{
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <h2 style={{ margin: 0 }}>帮助中心内容管理</h2>
          <p style={{ margin: '8px 0 0 0', color: '#999' }}>
            语言: {language || '-'} | 帮助中心ID: {helpCenterId || '-'}
          </p>
        </div>
        <Button onClick={handleBack}>返回列表</Button>
      </div>

      {/* 数据表格 */}
      <CmBasePage
        actionRef={tableRef}
        columns={columns}
        onLoadData={loadData}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        actionButtons={{
          view: false,
          edit: true,
          delete: true,
        }}
        searchVisible={false}
        rowKey="id"
        options={false}
        headerTitle=""
      />

      {/* 文章表单 */}
      <DataForm
        visible={formVisible}
        title={editingRecord ? '编辑文章' : '新增文章'}
        initialValues={editingRecord || {
          question: '',
          answer: '',
          sort: 0,
          enable: '1',
        }}
        extraValues={{ id: editingRecord?.id }}
        onCancel={() => setFormVisible(false)}
        onSubmit={handleSubmit}
        onClosed={() => setEditingRecord(null)}
        loading={loading}
        formType="drawer"
        width="80%"
      >
        <Form.Item
          name="question"
          label="问题"
          rules={[{ required: true, message: '请输入问题' }]}
        >
          <Input placeholder="请输入问题" />
        </Form.Item>

        <Form.Item
          name="answer"
          label="答案"
          rules={[{ required: true, message: '请输入答案' }]}
        >
          <CmEditor height={400} placeholder="请输入答案内容" />
        </Form.Item>

        <Form.Item
          name="sort"
          label="排序"
          rules={[{ required: true, message: '请输入排序值' }]}
        >
          <Input type="number" placeholder="请输入排序值，数值越小排序越靠前" />
        </Form.Item>

        <Form.Item
          name="enable"
          label="开启状态"
          valuePropName="checked"
          getValueProps={(value) => ({ checked: value === '1' || value === 1 })}
          getValueFromEvent={(checked) => (checked ? '1' : '2')}
        >
          <Switch checkedChildren="启用" unCheckedChildren="禁用" />
        </Form.Item>
      </DataForm>
    </div>
  );
};

export default HelpCenterDataPage;
