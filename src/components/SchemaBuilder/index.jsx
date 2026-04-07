import React, { useState, useEffect } from 'react';
import { Button, Card, Form, Input, Select, InputNumber, Space, Modal, Tabs, Tag, message, Row, Col, Dropdown } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, CopyOutlined, ArrowUpOutlined, ArrowDownOutlined, MoreOutlined } from '@ant-design/icons';
import './index.css';

const { Option } = Select;
const { TextArea } = Input;

// 生成数据模板（根据 schema 生成包含 key 的空数据结构）
const generateDataTemplate = (fields) => {
  const result = {};

  const processField = (field) => {
    if (field.type === 'object' && field.children) {
      const obj = {};
      field.children.forEach(child => {
        obj[child.key] = processField(child);
      });
      return obj;
    } else if (field.type === 'array' && field.children) {
      // 数组返回包含一个示例项的结构
      const exampleItem = {};
      field.children.forEach(child => {
        exampleItem[child.key] = processField(child);
      });
      return [exampleItem]; // 返回包含示例项的数组
    } else if (field.type === 'array') {
      // 空数组类型返回空数组
      return [];
    } else if (field.type === 'object') {
      // 空对象类型返回空对象
      return {};
    }
    // 其他类型返回空字符串
    return '';
  };

  fields.forEach(field => {
    result[field.key] = processField(field);
  });

  return result;
};

// 字段类型定义（基础表单字段）
const FIELD_TYPES = {
  STRING: { label: '文本', value: 'string', icon: '📝' },
  NUMBER: { label: '数字', value: 'number', icon: '🔢' },
  TEXTAREA: { label: '多行文本', value: 'textarea', icon: '📄' },
  EDITOR: { label: '富文本', value: 'editor', icon: '✏️' },
  SELECT: { label: '下拉选择', value: 'select', icon: '📋' },
  RADIO: { label: '单选', value: 'radio', icon: '🔘' },
  CHECKBOX: { label: '多选', value: 'checkbox', icon: '☑️' },
  DATE: { label: '日期', value: 'date', icon: '📅' },
  DATETIME: { label: '日期时间', value: 'datetime', icon: '🕐' },
  SWITCH: { label: '开关', value: 'switch', icon: '🔀' },
  IMAGE: { label: '单图上传', value: 'image', icon: '🖼️' },
  IMAGES: { label: '多图上传', value: 'images', icon: '🖼️🖼️' },
  FILE: { label: '文件上传', value: 'file', icon: '📎' },
};

// 复合类型定义
const COMPOSITE_TYPES = {
  OBJECT: { label: '嵌套对象', value: 'object', icon: '📦' },
  ARRAY: { label: '数组列表', value: 'array', icon: '📚' },
};

/**
 * SchemaBuilder - 动态表单配置构建器
 * 用于可视化配置表单结构，支持嵌套对象和数组
 */
const SchemaBuilder = ({ value = [], onChange }) => {
  const [fields, setFields] = useState(Array.isArray(value) ? value : []);
  const [editingField, setEditingField] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [jsonError, setJsonError] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (value !== undefined) {
      setFields(Array.isArray(value) ? value : []);
    }
  }, [value]);

  // 处理 JSON 编辑器变化
  const handleJsonChange = (e) => {
    const jsonStr = e.target.value;
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed)) {
        setFields(parsed);
        setJsonError(null);
        if (onChange) {
          onChange(parsed);
        }
      } else {
        setJsonError('JSON 必须是数组格式');
      }
    } catch (err) {
      setJsonError('JSON 格式错误: ' + err.message);
    }
  };

  // 触发onChange
  const triggerChange = (newFields) => {
    setFields(newFields);
    if (onChange) {
      onChange(newFields);
    }
  };

  // 添加字段
  const handleAdd = (parentKey = '', parentType = '') => {
    setEditingField({
      key: '',
      label: '',
      type: 'string',
      required: false,
      placeholder: '',
      defaultValue: '',
      options: [],
      rules: {},
    });
    setEditingIndex({ parentKey, type: 'add' });
    setModalVisible(true);
    form.resetFields();
  };

  // 编辑字段
  const handleEdit = (field, index, parentKey = '') => {
    setEditingField({ ...field });
    setEditingIndex({ index, parentKey, type: 'edit' });
    setModalVisible(true);
    form.setFieldsValue({
      ...field,
      optionsStr: field.options ? JSON.stringify(field.options, null, 2) : '',
      rulesStr: field.rules ? JSON.stringify(field.rules, null, 2) : '',
    });
  };

  // 复制字段
  const handleCopy = (field, index, parentKey = '') => {
    const newField = {
      ...field,
      key: `${field.key}_copy`,
      label: `${field.label} (副本)`,
    };

    if (parentKey) {
      const parentInfo = findField(fields, parentKey);
      if (parentInfo && parentInfo.field && Array.isArray(parentInfo.field.children)) {
        const newChildren = [...parentInfo.field.children];
        newChildren.splice(index + 1, 0, newField);
        updateField(parentKey, { children: newChildren });
      }
    } else {
      const newFields = [...fields];
      newFields.splice(index + 1, 0, newField);
      triggerChange(newFields);
    }
    message.success('复制成功');
  };

  // 删除字段
  const handleDelete = (index, parentKey = '') => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个字段吗？',
      onOk: () => {
        if (parentKey) {
          const parentInfo = findField(fields, parentKey);
          if (parentInfo && parentInfo.field && Array.isArray(parentInfo.field.children)) {
            const newChildren = parentInfo.field.children.filter((_, i) => i !== index);
            updateField(parentKey, { children: newChildren });
          }
        } else {
          const newFields = fields.filter((_, i) => i !== index);
          triggerChange(newFields);
        }
        message.success('删除成功');
      },
    });
  };

  // 上移字段
  const handleMoveUp = (index, parentKey = '') => {
    if (index === 0) return;

    if (parentKey) {
      const parentInfo = findField(fields, parentKey);
      if (parentInfo && parentInfo.field && Array.isArray(parentInfo.field.children)) {
        const newChildren = [...parentInfo.field.children];
        [newChildren[index - 1], newChildren[index]] = [newChildren[index], newChildren[index - 1]];
        updateField(parentKey, { children: newChildren });
      }
    } else {
      const newFields = [...fields];
      [newFields[index - 1], newFields[index]] = [newFields[index], newFields[index - 1]];
      triggerChange(newFields);
    }
  };

  // 下移字段
  const handleMoveDown = (index, parentKey = '') => {
    const list = parentKey ? (findField(fields, parentKey)?.field?.children || []) : fields;
    if (index >= list.length - 1) return;

    if (parentKey) {
      const parentInfo = findField(fields, parentKey);
      if (parentInfo && parentInfo.field && Array.isArray(parentInfo.field.children)) {
        const newChildren = [...parentInfo.field.children];
        [newChildren[index], newChildren[index + 1]] = [newChildren[index + 1], newChildren[index]];
        updateField(parentKey, { children: newChildren });
      }
    } else {
      const newFields = [...fields];
      [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
      triggerChange(newFields);
    }
  };

  // 查找字段
  const findField = (list, key, path = []) => {
    for (let i = 0; i < list.length; i++) {
      if (list[i].key === key) {
        return { field: list[i], index: i, path };
      }
      if (list[i].children) {
        const result = findField(list[i].children, key, [...path, { key: list[i].key, index: i }]);
        if (result) return result;
      }
    }
    return null;
  };

  // 更新字段
  const updateField = (key, newData) => {
    const updateRecursive = (list) => {
      return list.map((item) => {
        if (item.key === key) {
          return { ...item, ...newData };
        }
        if (item.children) {
          return { ...item, children: updateRecursive(item.children) };
        }
        return item;
      });
    };
    triggerChange(updateRecursive(fields));
  };

  // 保存字段
  const handleSave = () => {
    form.validateFields().then((values) => {
      const { optionsStr, rulesStr, ...rest } = values;

      let options;
      try {
        options = optionsStr ? JSON.parse(optionsStr) : [];
      } catch (e) {
        message.error('选项配置格式错误');
        return;
      }

      let rules;
      try {
        rules = rulesStr ? JSON.parse(rulesStr) : {};
      } catch (e) {
        message.error('规则配置格式错误');
        return;
      }

      // 保留原有的 children 字段（仅当类型是对象或数组时）
      const isComposite = rest.type === 'object' || rest.type === 'array';
      const existingChildren = (editingField?.children && isComposite) ? editingField.children : [];

      const newField = {
        ...editingField,
        ...rest,
        children: isComposite ? existingChildren : undefined, // 只在复合类型时保留子字段
        options: rest.type === 'select' || rest.type === 'radio' || rest.type === 'checkbox' ? options : [],
        rules,
      };

      if (editingIndex.type === 'add') {
        if (editingIndex.parentKey) {
          const parentInfo = findField(fields, editingIndex.parentKey);
          if (parentInfo && parentInfo.field && Array.isArray(parentInfo.field.children)) {
            const newChildren = [...parentInfo.field.children, newField];
            updateField(editingIndex.parentKey, { children: newChildren });
          } else {
            // 如果父节点不存在或没有 children 数组，创建新的
            updateField(editingIndex.parentKey, { children: [newField] });
          }
        } else {
          triggerChange([...fields, newField]);
        }
      } else {
        if (editingIndex.parentKey) {
          const parentInfo = findField(fields, editingIndex.parentKey);
          if (parentInfo && parentInfo.field && Array.isArray(parentInfo.field.children)) {
            const newChildren = [...parentInfo.field.children];
            newChildren[editingIndex.index] = newField;
            updateField(editingIndex.parentKey, { children: newChildren });
          }
        } else {
          const newFields = [...fields];
          newFields[editingIndex.index] = newField;
          triggerChange(newFields);
        }
      }

      setModalVisible(false);
      setEditingField(null);
      form.resetFields();
      message.success('保存成功');
    });
  };

  // 转换字段类型（转换为对象或数组）
  const handleConvertType = (field, index, parentKey, newType) => {
    Modal.confirm({
      title: `转换为${newType === 'object' ? '嵌套对象' : '数组列表'}`,
      content: '转换后该字段将变为复合类型，可以添加子字段。是否继续？',
      onOk: () => {
        const newField = {
          ...field,
          type: newType,
          children: field.children || [],
        };

        if (parentKey) {
          const parentInfo = findField(fields, parentKey);
          if (parentInfo && parentInfo.field && Array.isArray(parentInfo.field.children)) {
            const newChildren = [...parentInfo.field.children];
            newChildren[index] = newField;
            updateField(parentKey, { children: newChildren });
          }
        } else {
          const newFields = [...fields];
          newFields[index] = newField;
          triggerChange(newFields);
        }
        message.success('转换成功');
      },
    });
  };

  // 转换为基础类型
  const handleConvertToBasic = (field, index, parentKey) => {
    Modal.confirm({
      title: '转换为基础字段',
      content: '转换后将移除所有子字段配置，是否继续？',
      onOk: () => {
        const newField = {
          ...field,
          type: 'string',
          children: undefined,
        };

        if (parentKey) {
          const parentInfo = findField(fields, parentKey);
          if (parentInfo && parentInfo.field && Array.isArray(parentInfo.field.children)) {
            const newChildren = [...parentInfo.field.children];
            newChildren[index] = newField;
            updateField(parentKey, { children: newChildren });
          }
        } else {
          const newFields = [...fields];
          newFields[index] = newField;
          triggerChange(newFields);
        }
        message.success('转换成功');
      },
    });
  };

  // 渲染字段卡片
  const renderFieldCard = (field, index, parentKey = '', level = 0) => {
    const typeInfo = FIELD_TYPES[field.type?.toUpperCase()] || COMPOSITE_TYPES[field.type?.toUpperCase()] || FIELD_TYPES.STRING;
    const isObject = field.type === 'object';
    const isArray = field.type === 'array';
    const isComposite = isObject || isArray;

    // 构建更多操作菜单
    const getMoreMenuItems = () => {
      if (isComposite) {
        return [
          {
            key: 'convert-basic',
            label: '转换为基础字段',
            onClick: () => handleConvertToBasic(field, index, parentKey),
          },
        ];
      } else {
        return [
          {
            key: 'convert-object',
            label: '转换为嵌套对象',
            onClick: () => handleConvertType(field, index, parentKey, 'object'),
          },
          {
            key: 'convert-array',
            label: '转换为数组列表',
            onClick: () => handleConvertType(field, index, parentKey, 'array'),
          },
        ];
      }
    };

    return (
      <Card
        key={field.key}
        size="small"
        style={{ marginBottom: 8, marginLeft: level * 20 }}
        className="schema-field-card"
      >
        <div className="field-header">
          <Space>
            <span style={{ fontSize: '18px' }}>{typeInfo.icon}</span>
            <strong>{field.label || '未命名'}</strong>
            <Tag color="blue">{field.key}</Tag>
            <Tag color={isComposite ? 'orange' : 'purple'}>{typeInfo.label}</Tag>
            {field.required && <Tag color="red">必填</Tag>}
          </Space>
          <Space>
            {index > 0 && (
              <Button
                type="text"
                size="small"
                icon={<ArrowUpOutlined />}
                onClick={() => handleMoveUp(index, parentKey)}
              />
            )}
            <Button
              type="text"
              size="small"
              icon={<ArrowDownOutlined />}
              onClick={() => handleMoveDown(index, parentKey)}
            />
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(field, index, parentKey)}
              title="编辑"
            />
            <Dropdown menu={{ items: getMoreMenuItems() }} trigger={['click']}>
              <Button
                type="text"
                size="small"
                icon={<MoreOutlined />}
                title="更多操作"
              />
            </Dropdown>
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined />}
              onClick={() => handleCopy(field, index, parentKey)}
              title="复制"
            />
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(index, parentKey)}
              title="删除"
            />
          </Space>
        </div>

        {field.placeholder && (
          <div className="field-detail">占位符: {field.placeholder}</div>
        )}

        {(isObject || isArray) && field.children && field.children.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <div style={{ marginBottom: 8, color: '#666', fontSize: 12 }}>
              {isObject ? '子字段:' : '数组项字段:'}
            </div>
            {field.children.map((child, childIndex) =>
              renderFieldCard(child, childIndex, field.key, level + 1)
            )}
            <Button
              size="small"
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() => handleAdd(field.key, field.type)}
              style={{ width: '100%', marginTop: 8 }}
            >
              添加{isArray ? '数组项' : '子'}字段
            </Button>
          </div>
        )}

        {(isObject || isArray) && (!field.children || field.children.length === 0) && (
          <Button
            size="small"
            type="dashed"
            icon={<PlusOutlined />}
            onClick={() => handleAdd(field.key, field.type)}
            style={{ width: '100%', marginTop: 8 }}
          >
            添加{isArray ? '数组项' : '子'}字段
          </Button>
        )}
      </Card>
    );
  };

  return (
    <div className="schema-builder">
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <strong>表单字段配置</strong>
          <Tag color="blue">{fields.length} 个字段</Tag>
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAdd()}>
          添加字段
        </Button>
      </div>

      <Row gutter={16} style={{ minHeight: 400 }}>
        {/* 左侧：字段配置区域 */}
        <Col span={16}>
          <div className="schema-builder-content">
            {fields.length === 0 ? (
              <div className="empty-state">
                <p>暂无字段，点击上方"添加字段"开始配置</p>
              </div>
            ) : (
              <div className="fields-list">
                {fields.map((field, index) => renderFieldCard(field, index))}
              </div>
            )}
          </div>
        </Col>

        {/* 右侧：预览区域 */}
        <Col span={8}>
          <Card size="small" className="preview-card">
            <Tabs
              defaultActiveKey="schema"
              size="small"
              items={[
                {
                  key: 'schema',
                  label: 'Schema 配置',
                  children: (
                    <div className="json-editor-wrapper">
                      <Input.TextArea
                        className="json-editor"
                        value={JSON.stringify(fields, null, 2)}
                        onChange={handleJsonChange}
                        placeholder="请输入 Schema 配置 JSON"
                        autoSize={{ minRows: 15, maxRows: 25 }}
                      />
                      {jsonError && (
                        <div className="json-error">
                          <Tag color="error">JSON 错误</Tag>
                          <span>{jsonError}</span>
                        </div>
                      )}
                    </div>
                  ),
                },
                {
                  key: 'data',
                  label: '数据模板',
                  children: (
                    <pre className="json-preview">
                      {JSON.stringify(generateDataTemplate(fields), null, 2)}
                    </pre>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title={editingIndex?.type === 'add' ? '添加字段' : '编辑字段'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        width={700}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Tabs
            defaultActiveKey="basic"
            items={[
              {
                key: 'basic',
                label: '基本配置',
                children: (
                  <>
                    <Form.Item
                      name="key"
                      label="字段Key"
                      rules={[{ required: true, message: '请输入字段Key' }]}
                    >
                      <Input placeholder="如: userName" />
                    </Form.Item>

                    <Form.Item
                      name="label"
                      label="字段名称"
                      rules={[{ required: true, message: '请输入字段名称' }]}
                    >
                      <Input placeholder="如: 用户名" />
                    </Form.Item>

                    <Form.Item
                      name="type"
                      label="字段类型"
                      rules={[{ required: true, message: '请选择字段类型' }]}
                    >
                      <Select>
                        {Object.values(FIELD_TYPES).map((t) => (
                          <Option key={t.value} value={t.value}>
                            {t.icon} {t.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item name="required" label="是否必填" valuePropName="checked">
                      <Select>
                        <Option value={true}>是</Option>
                        <Option value={false}>否</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item noStyle shouldUpdate={(prev, curr) => prev.type !== curr.type}>
                      {({ getFieldValue }) => {
                        const type = getFieldValue('type');
                        if (type === 'select' || type === 'radio' || type === 'checkbox') {
                          return (
                            <Form.Item
                              name="optionsStr"
                              label="选项配置 (JSON数组)"
                              rules={[{ required: true, message: '请输入选项配置' }]}
                              extra='格式: [{"label": "选项1", "value": "1"}]'
                            >
                              <TextArea rows={4} placeholder='[{"label": "选项1", "value": "1"}]' />
                            </Form.Item>
                          );
                        }
                        return null;
                      }}
                    </Form.Item>

                    <Form.Item name="placeholder" label="占位符">
                      <Input placeholder="请输入占位符" />
                    </Form.Item>

                    <Form.Item name="defaultValue" label="默认值">
                      <Input placeholder="请输入默认值" />
                    </Form.Item>
                  </>
                ),
              },
              {
                key: 'advanced',
                label: '高级配置',
                children: (
                  <>
                    <Form.Item
                      name="rulesStr"
                      label="验证规则 (JSON对象)"
                      extra='格式: {"pattern": "^\\d+$", "message": "请输入数字"}'
                    >
                      <TextArea rows={6} placeholder='{"pattern": "", "message": ""}' />
                    </Form.Item>

                    <Form.Item name="help" label="帮助文本">
                      <Input placeholder="字段说明或帮助信息" />
                    </Form.Item>

                    <Form.Item name="extra" label="额外提示">
                      <Input placeholder="字段下方的额外提示信息" />
                    </Form.Item>
                  </>
                ),
              },
            ]}
          />
        </Form>
      </Modal>
    </div>
  );
};

export default SchemaBuilder;
