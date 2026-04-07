/**
 * 规则配置页面（前台文本配置）
 *
 * 功能：管理前台规则说明，如服务条款、隐私政策等
 * 支持多语言、富文本内容
 *
 * @author System
 * @date 2026-04-02
 */

import React, { useState, useEffect } from 'react';
import { message, Form, Input, Select, Switch, Button, Tag } from 'antd';
import CmBasePage from '@components/CmBasePage';
import DataForm from '@components/DataForm';
import CmEditor from '@components/CmEditor';
import apiService from '@api/base';
import {
  getRulesList,
  getRulesLabelList,
  getRulesDetail,
  saveRules,
  updateRules,
  deleteRules
} from '@api';

const { Option } = Select;

// 规则类型选项
const RULE_TYPES = [
  { label: '服务条款', value: 'TERMS_CLAUSE' },
  { label: 'U本位合约说明', value: 'U_STANDARD_EXPLAIN' },
  { label: '注册隐私政策', value: 'REGISTRY_PRIVACY' },
  { label: '注册使用条款', value: 'REGISTRY_CLAUSE' },
  { label: '贷款规则', value: 'LOANS_RULE' }
];

// 语言选项
const LANGUAGE_OPTIONS = [
  { label: '中文', value: 'zh' },
  { label: 'English', value: 'en' },
  { label: '繁體中文', value: 'tw' },
  { label: '日本語', value: 'ja' },
  { label: '한국어', value: 'ko' }
];

/** 规则配置页面 */
const RuleConfigPage = () => {
  const [formVisible, setFormVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ruleTypeOptions, setRuleTypeOptions] = useState(RULE_TYPES);
  const [currentRuleType, setCurrentRuleType] = useState('TERMS_CLAUSE');

  // 获取规则标签列表
  useEffect(() => {
    const fetchLabelList = async () => {
      try {
        const response = await getRulesLabelList();
        if (response.code === 0 || response.code === 200) {
          const options = response.rows || response.data || [];
          if (options.length > 0) {
            setRuleTypeOptions(options);
            setCurrentRuleType(options[0].key || options[0].value);
          }
        }
      } catch (error) {
        console.error('获取规则标签失败:', error);
      }
    };
    fetchLabelList();
  }, []);

  // 刷新表格
  const refreshTable = () => {
    document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
      new CustomEvent('reload')
    );
  };

  // 自定义数据加载函数
  const handleLoadData = async (params) => {
    try {
      const requestParams = {
        pageNum: params.current || 1,
        pageSize: params.pageSize || 10,
        key: currentRuleType, // 动态拼接 key 参数
      };

      // 处理搜索参数
      const searchParam = {};
      if (params.SEARCH_LIKE_title) {
        searchParam.SEARCH_LIKE_title = params.SEARCH_LIKE_title;
      }
      if (params.SEARCH_EQ_language) {
        searchParam.SEARCH_EQ_language = params.SEARCH_EQ_language;
      }
      if (params.SEARCH_EQ_key) {
        searchParam.SEARCH_EQ_key = params.SEARCH_EQ_key;
      }
      if (params.SEARCH_EQ_isShow !== undefined && params.SEARCH_EQ_isShow !== null) {
        searchParam.SEARCH_EQ_isShow = params.SEARCH_EQ_isShow;
      }

      if (Object.keys(searchParam).length > 0) {
        requestParams.searchParam = JSON.stringify(searchParam);
      }

      const response = await apiService.get('/contract/optionRules/list', { params: requestParams });

      if (response.code === 0 || response.code === 200) {
        return {
          data: response.rows || response.data?.records || response.data?.list || response.data?.content || response.data || [],
          success: true,
          total: response.total || response.data?.total || response.data?.length || 0
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

  // 新增按钮
  const handleAdd = () => {
    setEditingRecord(null);
    setFormVisible(true);
  };

  // 编辑按钮
  const handleEdit = async (record) => {
    try {
      const response = await getRulesDetail(record.id);
      if (response.code === 0 || response.code === 200) {
        setEditingRecord({ ...response.data, key: currentRuleType });
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
      const response = await deleteRules(record.id);
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
        isShow: values.isShow ? 0 : 2,
        language: values.language,
        key: currentRuleType
      };

      let response;
      if (editingRecord && editingRecord.id) {
        response = await updateRules({ ...submitData, id: editingRecord.id });
      } else {
        response = await saveRules(submitData);
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
      width: 150,
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
      title: '是否展示',
      dataIndex: 'isShow',
      key: 'isShow',
      width: 100,
      align: 'center',
      render: (isShow) => {
        return isShow === 0 ?
          <Tag color="warning">是</Tag> :
          <Tag color="default">否</Tag>;
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
            width: 'calc(100% - 280px)',
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
      dataIndex: 'language',
      key: 'SEARCH_EQ_language',
      type: 'select',
      options: LANGUAGE_OPTIONS,
    },
    {
      title: '规则类型',
      dataIndex: 'key',
      key: 'SEARCH_EQ_key',
      type: 'select',
      options: ruleTypeOptions,
    },
    {
      title: '是否展示',
      dataIndex: 'isShow',
      key: 'SEARCH_EQ_isShow',
      type: 'select',
      options: [
        { label: '展示', value: '0' },
        { label: '不展示', value: '2' }
      ],
    },
  ];

  return (
    <div style={{ textAlign: 'left' }}>
      <CmBasePage
        columns={columns}
        onLoadData={handleLoadData}
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
        title={editingRecord ? '修改前台文本配置' : '添加前台文本配置'}
        initialValues={
          editingRecord ? { ...editingRecord, isShow: editingRecord.isShow === 0 } : { isShow: true }
        }
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
          name="key"
          label="规则类型"
          rules={[{ required: true, message: '请选择规则类型' }]}
          initialValue={currentRuleType}
        >
          <Select placeholder="请选择规则类型">
            {ruleTypeOptions.map(type => (
              <Option key={type.key || type.value} value={type.key || type.value}>
                {type.value || type.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="content"
          label="内容"
        >
          <CmEditor height={300} />
        </Form.Item>

        <Form.Item
          name="isShow"
          label="是否展示"
          valuePropName="checked"
          initialValue={true}
        >
          <Switch
            checkedChildren="展示"
            unCheckedChildren="不展示"
          />
        </Form.Item>
      </DataForm>
    </div>
  );
};

export default RuleConfigPage;
