/**
 * 规则说明页面
 *
 * 功能：
 * 1. 规则说明列表管理
 * 2. 支持多种功能类型（首页、defi挖矿、助理贷）
 * 3. 支持多语言
 *
 * @author System
 * @date 2026-04-02
 */

import React, { useState } from 'react';
import { message, Form, Input, Select, InputNumber, Button, Tag, Image } from 'antd';
import CmBasePage from '@components/CmBasePage';
import DataForm from '@components/DataForm';
import CmEditor from '@components/CmEditor';
import CmUpload from '@components/CmUpload';
import {
  listSetter as getSetterList,
  getSetter as getSetterDetail,
  addSetter as saveSetter,
  updateSetter,
  delSetter as deleteSetter
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
  { label: '首页', value: 0 },
  { label: 'defi挖矿', value: 1 },
  { label: '助理贷', value: 2 }
];

/** 规则说明页面 */
const SetterPage = () => {
  const [formVisible, setFormVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
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
      const response = await getSetterDetail(record.id);
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

  // 删除按钮
  const handleDelete = async (record) => {
    try {
      const response = await deleteSetter(record.id);
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
        ...values,
      };

      let response;
      if (editingRecord && editingRecord.id) {
        response = await updateSetter(submitData);
      } else {
        response = await saveSetter(submitData);
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

  // 表格列配置
  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: 120,
      align: 'center',
    },
    {
      title: '图片',
      dataIndex: 'imgUrl',
      key: 'imgUrl',
      width: 100,
      align: 'center',
      render: (imgUrl) => (
        imgUrl ? (
          <Image
            src={imgUrl}
            alt="图片"
            width={60}
            height="auto"
            style={{ objectFit: 'cover' }}
          />
        ) : null
      ),
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
      dataIndex: 'languageName',
      key: 'languageName',
      width: 100,
      align: 'center',
      render: (language) => {
        const lang = LANGUAGE_OPTIONS.find(l => l.value === language);
        return lang ? <Tag color="blue">{lang.label}</Tag> : language;
      },
    },
    {
      title: '点赞数',
      dataIndex: 'likesNum',
      key: 'likesNum',
      width: 100,
      align: 'center',
    },
    {
      title: '类型',
      dataIndex: 'homeType',
      key: 'homeType',
      width: 100,
      align: 'center',
    },
    {
      title: '功能',
      dataIndex: 'modelType',
      key: 'modelType',
      width: 100,
      align: 'center',
      render: (modelType) => {
        const typeMap = {
          0: { color: 'warning', text: '首页' },
          1: { color: 'success', text: 'defi挖矿' },
          2: { color: 'processing', text: '助理贷' },
        };
        const type = typeMap[modelType] || { color: 'default', text: '未知' };
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
            width: 'calc(100% - 580px)',
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            display: '-webkit-box',
          }}
        >
          {content}
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
      dataIndex: 'languageName',
      key: 'SEARCH_EQ_languageName',
      type: 'select',
      options: LANGUAGE_OPTIONS,
    },
  ];

  return (
    <div style={{ textAlign: 'left' }}>
      <CmBasePage
        columns={columns}
        apiEndpoint="/system/home/setter/list"
        apiMethod="get"
        searchFieldList={searchFieldList}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        rowKey="id"
        actionButtons={{
          view: false,
          edit: true,
          delete: true,
        }}
      />

      <DataForm
        visible={formVisible}
        title={editingRecord ? '修改规则说明' : '添加规则说明'}
        initialValues={editingRecord || {}}
        extraValues={{ id: editingRecord?.id }}
        onCancel={() => setFormVisible(false)}
        onSubmit={handleSubmit}
        onClosed={() => setEditingRecord(null)}
        loading={loading}
        formType="modal"
        width="700px"
      >
        <Form.Item
          name="title"
          label="标题"
          rules={[{ required: true, message: '标题不能为空' }]}
        >
          <Input placeholder="请输入标题" />
        </Form.Item>

        <Form.Item
          name="modelType"
          label="功能"
          rules={[{ required: true, message: '请选择功能' }]}
        >
          <Select placeholder="请选择功能">
            {MODEL_TYPE_OPTIONS.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="content"
          label="内容"
          rules={[{ required: true, message: '内容不能为空' }]}
        >
          <CmEditor height={300} />
        </Form.Item>

        <Form.Item
          name="imgUrl"
          label="图片"
          rules={[{ required: true, message: '请上传图片' }]}
        >
          <CmUpload
            listType="picture-card"
            maxCount={1}
            accept="image/*"
          />
        </Form.Item>

        <Form.Item
          name="sort"
          label="排序"
          rules={[{ required: true, message: '排序不能为空' }]}
        >
          <InputNumber placeholder="请输入排序" min={0} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="languageName"
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
          name="likesNum"
          label="点赞数"
          rules={[{ required: true, message: '点赞数不能为空' }]}
        >
          <InputNumber placeholder="请输入点赞数" min={0} style={{ width: '100%' }} />
        </Form.Item>
      </DataForm>
    </div>
  );
};

export default SetterPage;
