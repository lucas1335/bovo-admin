/**
 * 帮助中心管理页面
 *
 * 功能：
 * 1. App下载链接配置 - 管理iOS和Android应用的下载链接
 * 2. 帮助中心管理 - 管理帮助中心的分类（标题、语言、状态）
 *
 * @author Aka
 * @date 2023-08-17
 */

import React, { useState, useRef } from 'react';
import { message, Tag, Button, Divider, Form, Input, Select, Switch } from 'antd';
import CmBasePage from '@components/CmBasePage';
import DataForm from '@components/DataForm';
import {
  getHelpCenterList,
  saveHelpCenter,
  updateHelpCenter,
  deleteHelpCenter,
  getAppLinkList,
  saveAppLink,
  updateAppLink,
  deleteAppLink,
} from '@api';

const { Option } = Select;
const { TextArea } = Input;

const HelpCenterPage = () => {
  // ==================== 帮助中心状态 ====================
  const [helpFormVisible, setHelpFormVisible] = useState(false);
  const [editingHelp, setEditingHelp] = useState(null);
  const [helpLoading, setHelpLoading] = useState(false);

  // ==================== App链接状态 ====================
  const [appLinkFormVisible, setAppLinkFormVisible] = useState(false);
  const [editingAppLink, setEditingAppLink] = useState(null);
  const [appLinkLoading, setAppLinkLoading] = useState(false);

  // 用于刷新表格
  const helpTableRef = useRef(null);
  const appLinkTableRef = useRef(null);

  // ==================== 帮助中心列配置 ====================
  const helpColumns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: 300,
    },
    {
      title: '语言',
      dataIndex: 'language',
      key: 'language',
      width: 120,
      render: (language) => {
        const languageMap = {
          'zh': { color: 'blue', text: '中文' },
          'en': { color: 'green', text: 'English' },
          'zh_TW': { color: 'purple', text: '繁体中文' },
          'ja': { color: 'orange', text: '日本語' },
          'ko': { color: 'cyan', text: '한국어' },
        };
        const lang = languageMap[language] || { color: 'default', text: language || '未知' };
        return <Tag color={lang.color}>{lang.text}</Tag>;
      },
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

  // ==================== App链接列配置 ====================
  const appLinkColumns = [
    {
      title: '平台',
      dataIndex: 'platform',
      key: 'platform',
      width: 120,
      render: (platform) => {
        return platform === 'ios'
          ? <Tag color="success">iOS</Tag>
          : <Tag color="processing">Android</Tag>;
      },
    },
    {
      title: '下载链接',
      dataIndex: 'downloadUrl',
      key: 'downloadUrl',
      ellipsis: true,
      width: 300,
    },
    {
      title: '版本号',
      dataIndex: 'version',
      key: 'version',
      width: 120,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      width: 200,
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

  // ==================== 帮助中心事件处理 ====================

  /**
   * 新增帮助中心
   */
  const handleAddHelp = () => {
    setEditingHelp(null);
    setHelpFormVisible(true);
  };

  /**
   * 编辑帮助中心
   */
  const handleEditHelp = (record) => {
    setEditingHelp(record);
    setHelpFormVisible(true);
  };

  /**
   * 删除帮助中心
   */
  const handleDeleteHelp = async (record) => {
    try {
      const response = await deleteHelpCenter(record.id);
      if (response.code === 0 || response.code === 200) {
        message.success('删除成功');
        refreshHelpTable();
      } else {
        message.error(response.msg || '删除失败');
      }
    } catch (error) {
      message.error('删除失败: ' + error.message);
    }
  };

  /**
   * 查看帮助中心详情
   */
  const handleViewHelp = (record) => {
    // 跳转到帮助中心内容页面
    // 这里使用hash路由或者需要根据实际路由配置调整
    window.location.href = `#/system/help-data/${record.id}/${record.language}`;
  };

  /**
   * 提交帮助中心表单
   */
  const handleSubmitHelp = async (values) => {
    setHelpLoading(true);
    try {
      const response = editingHelp
        ? await updateHelpCenter(values)
        : await saveHelpCenter(values);

      if (response.code === 0 || response.code === 200) {
        message.success(editingHelp ? '修改成功' : '新增成功');
        setHelpFormVisible(false);
        refreshHelpTable();
      } else {
        message.error(response.msg || '操作失败');
      }
    } catch (error) {
      message.error('操作失败: ' + error.message);
    } finally {
      setHelpLoading(false);
    }
  };

  /**
   * 刷新帮助中心表格
   */
  const refreshHelpTable = () => {
    if (helpTableRef.current) {
      helpTableRef.current.reload();
    }
  };

  // ==================== App链接事件处理 ====================

  /**
   * 新增App下载链接
   */
  const handleAddAppLink = () => {
    setEditingAppLink(null);
    setAppLinkFormVisible(true);
  };

  /**
   * 编辑App下载链接
   */
  const handleEditAppLink = (record) => {
    setEditingAppLink(record);
    setAppLinkFormVisible(true);
  };

  /**
   * 删除App下载链接
   */
  const handleDeleteAppLink = async (record) => {
    try {
      const response = await deleteAppLink(record.id);
      if (response.code === 0 || response.code === 200) {
        message.success('删除成功');
        refreshAppLinkTable();
      } else {
        message.error(response.msg || '删除失败');
      }
    } catch (error) {
      message.error('删除失败: ' + error.message);
    }
  };

  /**
   * 提交App下载链接表单
   */
  const handleSubmitAppLink = async (values) => {
    setAppLinkLoading(true);
    try {
      const response = editingAppLink
        ? await updateAppLink(values)
        : await saveAppLink(values);

      if (response.code === 0 || response.code === 200) {
        message.success(editingAppLink ? '修改成功' : '新增成功');
        setAppLinkFormVisible(false);
        refreshAppLinkTable();
      } else {
        message.error(response.msg || '操作失败');
      }
    } catch (error) {
      message.error('操作失败: ' + error.message);
    } finally {
      setAppLinkLoading(false);
    }
  };

  /**
   * 刷新App链接表格
   */
  const refreshAppLinkTable = () => {
    if (appLinkTableRef.current) {
      appLinkTableRef.current.reload();
    }
  };

  // ==================== 渲染 ====================

  return (
    <div style={{ padding: '20px', background: '#fff', minHeight: 'calc(100vh - 64px)' }}>
      {/* App下载链接配置区域 */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          fontSize: '16px',
          fontWeight: 'bold',
          marginBottom: '16px',
          paddingBottom: '8px',
          borderBottom: '1px solid #e8e8e8'
        }}>
          App下载链接配置
        </div>
        <CmBasePage
          actionRef={appLinkTableRef}
          columns={appLinkColumns}
          apiEndpoint="/system/applink/list"
          apiMethod="get"
          onAdd={handleAddAppLink}
          onEdit={handleEditAppLink}
          onDelete={handleDeleteAppLink}
          actionButtons={{
            view: false,
            edit: true,
            delete: true,
          }}
          searchVisible={false}
          rowKey="id"
          pagination={false}
          options={false}
          headerTitle=""
        />
      </div>

      <Divider />

      {/* 帮助中心管理区域 */}
      <div>
        <div style={{
          fontSize: '16px',
          fontWeight: 'bold',
          marginBottom: '16px',
          paddingBottom: '8px',
          borderBottom: '1px solid #e8e8e8'
        }}>
          帮助中心管理
        </div>
        <CmBasePage
          actionRef={helpTableRef}
          columns={helpColumns}
          apiEndpoint="/system/helpCenter/list"
          apiMethod="get"
          onAdd={handleAddHelp}
          onEdit={handleEditHelp}
          onDelete={handleDeleteHelp}
          onView={handleViewHelp}
          actionButtons={{
            view: true,
            edit: true,
            delete: true,
          }}
          searchVisible={false}
          rowKey="id"
          options={false}
          headerTitle=""
        />
      </div>

      {/* App下载链接表单 */}
      <DataForm
        visible={appLinkFormVisible}
        title={editingAppLink ? '修改下载链接' : '新增下载链接'}
        initialValues={editingAppLink || {
          platform: undefined,
          downloadUrl: '',
          version: '',
          description: '',
          enable: '1',
        }}
        extraValues={{ id: editingAppLink?.id }}
        onCancel={() => setAppLinkFormVisible(false)}
        onSubmit={handleSubmitAppLink}
        onClosed={() => setEditingAppLink(null)}
        loading={appLinkLoading}
        formType="modal"
        width={600}
      >
        <Form.Item
          name="platform"
          label="平台"
          rules={[{ required: true, message: '请选择平台' }]}
        >
          <Select placeholder="请选择平台">
            <Option value="ios">iOS</Option>
            <Option value="android">Android</Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="downloadUrl"
          label="下载链接"
          rules={[
            { required: true, message: '下载链接不能为空' },
            { type: 'url', message: '请输入正确的链接格式' }
          ]}
        >
          <Input placeholder="请输入下载链接" />
        </Form.Item>
        <Form.Item
          name="version"
          label="版本号"
          rules={[{ required: true, message: '版本号不能为空' }]}
        >
          <Input placeholder="请输入版本号，如：1.0.0" />
        </Form.Item>
        <Form.Item
          name="description"
          label="描述"
        >
          <TextArea rows={3} placeholder="请输入版本描述" />
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

      {/* 帮助中心表单 */}
      <DataForm
        visible={helpFormVisible}
        title={editingHelp ? '修改标题' : '新增标题'}
        initialValues={editingHelp || {
          title: '',
          language: undefined,
          enable: '1',
        }}
        extraValues={{ id: editingHelp?.id }}
        onCancel={() => setHelpFormVisible(false)}
        onSubmit={handleSubmitHelp}
        onClosed={() => setEditingHelp(null)}
        loading={helpLoading}
        formType="modal"
        width={600}
      >
        <Form.Item
          name="title"
          label="标题"
          rules={[{ required: true, message: '标题不能为空' }]}
        >
          <Input placeholder="请输入标题" />
        </Form.Item>
        <Form.Item
          name="language"
          label="语言"
          rules={[{ required: true, message: '请选择语言' }]}
        >
          <Select placeholder="请选择语言">
            <Option value="zh">中文</Option>
            <Option value="en">English</Option>
            <Option value="zh_TW">繁体中文</Option>
            <Option value="ja">日本語</Option>
            <Option value="ko">한국어</Option>
          </Select>
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

export default HelpCenterPage;
