/**
 * 规则说明页面
 *
 * 功能：管理前台功能规则说明，带图标、点赞数等功能类型配置
 * 支持：首页/defi挖矿/助理贷等功能类型
 *
 * @author System
 * @date 2026-04-02
 */

import React, { useState } from 'react';
import { message, Form, Input, Select, Button, Tag, Image, Drawer, Descriptions } from 'antd';
import CmBasePage from '@components/CmBasePage';
import DataForm from '@components/DataForm';
import CmEditor from '@components/CmEditor';
import CmUpload from '@components/CmUpload';
import {
  listSetter,
  getSetter,
  addSetter,
  updateSetter,
  delSetter
} from '@api/modules/setter';

const { Option } = Select;

// 语言选项
const LANGUAGE_OPTIONS = [
  { label: '中文', value: 'zh' },
  { label: 'English', value: 'en' },
  { label: '繁體中文', value: 'tw' },
  { label: '日本語', value: 'ja' },
  { label: '한국어', value: 'ko' }
];

// 功能类型选项
const MODEL_TYPE_OPTIONS = [
  { label: '首页', value: 'home' },
  { label: 'defi挖矿', value: 'defi' },
  { label: '助理贷', value: 'assistant' }
];

/** 规则说明页面 */
const RuleExplanationPage = () => {
  const [formVisible, setFormVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [viewRecord, setViewRecord] = useState(null);
  const [loading, setLoading] = useState(false);

  // 刷新表格
  const refreshTable = () => {
    document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
      new CustomEvent('reload')
    );
  };

  // 新增按钮
  const handleAdd = () => {
    setEditingRecord(null);
    setFormVisible(true);
  };

  // 编辑按钮
  const handleEdit = async (record) => {
    try {
      const response = await getSetter(record.id);
      if (response.code === 0 || response.code === 200) {
        setEditingRecord(response.data);
        setFormVisible(true);
      } else {
        message.error(response.msg || '获取详情失败');
      }
    } catch (error) {
      message.error('获取详情失败: ' + error.message);
    }
  };

  // 查看详情
  const handleView = (record) => {
    setViewRecord(record);
    setDrawerVisible(true);
  };

  // 删除按钮
  const handleDelete = async (record) => {
    try {
      const response = await delSetter(record.id);
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

  // 提交表单
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const submitData = {
        title: values.title,
        content: values.content,
        language: values.language,
        modelType: values.modelType,
        logo: values.logo,
        sort: values.sort || 0,
        likes: values.likes || 0,
      };

      let response;
      if (editingRecord && editingRecord.id) {
        response = await updateSetter({ ...submitData, id: editingRecord.id });
      } else {
        response = await addSetter(submitData);
      }

      if (response.code === 0 || response.code === 200) {
        message.success(editingRecord ? '修改成功' : '新增成功');
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

  // 功能类型映射
  const modelTypeMap = {
    'home': { color: 'blue', text: '首页' },
    'defi': { color: 'green', text: 'defi挖矿' },
    'assistant': { color: 'orange', text: '助理贷' },
  };

  // 表格列配置
  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: 150,
      align: 'center',
    },
    {
      title: '图标',
      dataIndex: 'logo',
      key: 'logo',
      width: 80,
      align: 'center',
      render: (logo) => logo ? <Image src={logo} width={40} height={40} /> : '-',
    },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
      width: 80,
      align: 'center',
    },
    {
      title: '语言',
      dataIndex: 'language',
      key: 'language',
      width: 100,
      align: 'center',
      render: (language) => {
        const lang = LANGUAGE_OPTIONS.find(l => l.value === language);
        return lang ? <Tag color="blue">{lang.label}</Tag> : language;
      },
    },
    {
      title: '点赞数',
      dataIndex: 'likes',
      key: 'likes',
      width: 100,
      align: 'center',
      render: (likes) => <Tag color="red">{likes || 0}</Tag>,
    },
    {
      title: '功能类型',
      dataIndex: 'modelType',
      key: 'modelType',
      width: 120,
      align: 'center',
      render: (modelType) => {
        const type = modelTypeMap[modelType] || { color: 'default', text: '未知' };
        return <Tag color={type.color}>{type.text}</Tag>;
      },
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      align: 'center',
      render: (content) => (
        <div
          style={{
            maxWidth: 300,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {typeof content === 'string' ? content : '-'}
        </div>
      ),
    },
  ];

  // 搜索字段配置
  const searchFieldList = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'SEARCH_LIKE_title',
      type: 'text',
    },
    {
      title: '语言',
      dataIndex: 'language',
      key: 'SEARCH_EQ_language',
      type: 'select',
      options: LANGUAGE_OPTIONS,
    },
  ];

  return (
    <div>
      <CmBasePage
        columns={columns}
        apiEndpoint="/system/home/setter/list"
        apiMethod="get"
        searchFieldList={searchFieldList}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        rowKey="id"
        actionButtons={{
          view: true,
          edit: true,
          delete: true,
        }}
      />

      <DataForm
        visible={formVisible}
        title={editingRecord ? '修改规则说明' : '添加规则说明'}
        initialValues={editingRecord || {}}
        onCancel={() => setFormVisible(false)}
        onSubmit={handleSubmit}
        onClosed={() => setEditingRecord(null)}
        loading={loading}
        formType="modal"
        width="800px"
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
            {LANGUAGE_OPTIONS.map(lang => (
              <Option key={lang.value} value={lang.value}>{lang.label}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="modelType"
          label="功能类型"
          rules={[{ required: true, message: '请选择功能类型' }]}
        >
          <Select placeholder="请选择功能类型">
            {MODEL_TYPE_OPTIONS.map(type => (
              <Option key={type.value} value={type.value}>{type.label}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="logo"
          label="图标"
        >
          <CmUpload />
        </Form.Item>

        <Form.Item
          name="content"
          label="内容"
        >
          <CmEditor height={300} />
        </Form.Item>

        <Form.Item
          name="sort"
          label="排序"
          initialValue={0}
        >
          <Input type="number" placeholder="请输入排序" />
        </Form.Item>

        <Form.Item
          name="likes"
          label="点赞数"
          initialValue={0}
        >
          <Input type="number" placeholder="请输入点赞数" />
        </Form.Item>
      </DataForm>

      {/* 详情抽屉 */}
      <Drawer
        title="规则说明详情"
        placement="right"
        width={800}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {viewRecord && (
          <div style={{ padding: '16px' }}>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="标题">
                {viewRecord.title || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="语言">
                {(() => {
                  const lang = LANGUAGE_OPTIONS.find(l => l.value === viewRecord.language);
                  return lang ? lang.label : viewRecord.language || '-';
                })()}
              </Descriptions.Item>
              <Descriptions.Item label="功能类型">
                {(() => {
                  const type = modelTypeMap[viewRecord.modelType];
                  return type ? type.text : viewRecord.modelType || '-';
                })()}
              </Descriptions.Item>
              <Descriptions.Item label="图标">
                {viewRecord.logo ? <Image src={viewRecord.logo} width={60} height={60} /> : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="排序">
                {viewRecord.sort ?? '-'}
              </Descriptions.Item>
              <Descriptions.Item label="点赞数">
                <Tag color="red">{viewRecord.likes || 0}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="内容">
                <div
                  style={{
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px',
                    padding: '12px',
                    background: '#fafafa',
                    minHeight: '200px',
                  }}
                  dangerouslySetInnerHTML={{ __html: typeof viewRecord.content === 'string' ? viewRecord.content : '' }}
                />
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default RuleExplanationPage;
