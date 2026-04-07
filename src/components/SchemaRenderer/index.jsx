import React from 'react';
import { Form, Input, InputNumber, Select, Radio, Checkbox, DatePicker, Switch } from 'antd';
import dayjs from 'dayjs';
import CmEditor from '@components/CmEditor';
import CmUpload from '@components/CmUpload';
import CmUploadMore from '@components/CmUploadMore';
import CmUploadFile from '@components/CmUploadFile';
import ObjectFieldRenderer from './components/ObjectFieldRenderer';
import ArrayFieldRenderer from './components/ArrayFieldRenderer';
import './index.css';

const { TextArea } = Input;
const { Option } = Select;

/**
 * 生成字段默认值
 */
const generateDefaultValue = (fieldConfig) => {
  if (!fieldConfig?.type) return '';

  switch (fieldConfig.type) {
    case 'object':
      if (fieldConfig.children?.length > 0) {
        const obj = {};
        fieldConfig.children.forEach(child => {
          if (child?.key) obj[child.key] = generateDefaultValue(child);
        });
        return obj;
      }
      return {};
    case 'array':
      if (fieldConfig.children?.length > 0) {
        const item = {};
        fieldConfig.children.forEach(child => {
          if (child?.key) item[child.key] = generateDefaultValue(child);
        });
        return [item];
      }
      return [];
    case 'number':
      return 0;
    case 'switch':
      return false;
    case 'checkbox':
      return [];
    case 'date':
    case 'datetime':
      return null;
    default:
      return '';
  }
};

/**
 * SchemaRenderer - 动态表单渲染器
 *
 * @param {Array} schema - 表单配置 schema
 * @param {Object} formData - 表单数据
 * @param {Function} onFormDataChange - 数据变化回调
 * @param {Boolean} disabled - 是否禁用
 * @param {Form} form - Form 实例
 * @param {Boolean} wrapWithForm - 是否包裹 Form 标签（默认 true）
 * @param {String} layout - 表单布局（默认 vertical）
 */
const SchemaRenderer = ({
  schema = [],
  formData = {},
  onFormDataChange,
  disabled = false,
  form,
  layout = 'vertical',
  wrapWithForm = true,
}) => {
  // 渲染输入控件
  const renderInput = (field) => {
    const fieldLabel = field.label || field.key || '该字段';
    const commonProps = {
      placeholder: field.placeholder || `请输入${fieldLabel}`,
      disabled,
    };

    switch (field.type) {
      case 'string':
        return <Input {...commonProps} />;

      case 'number':
        return <InputNumber {...commonProps} style={{ width: '100%' }} />;

      case 'textarea':
        return <TextArea rows={4} {...commonProps} />;

      case 'editor':
        return <CmEditor height={300} disabled={disabled} />;

      case 'select':
        return (
          <Select {...commonProps} allowClear>
            {field.options?.map((opt) => (
              <Option key={opt.value} value={opt.value}>{opt.label}</Option>
            ))}
          </Select>
        );

      case 'radio':
        return (
          <Radio.Group disabled={disabled}>
            {field.options?.map((opt) => (
              <Radio key={opt.value} value={opt.value}>{opt.label}</Radio>
            ))}
          </Radio.Group>
        );

      case 'checkbox':
        return (
          <Checkbox.Group disabled={disabled}>
            {field.options?.map((opt) => (
              <Checkbox key={opt.value} value={opt.value}>{opt.label}</Checkbox>
            ))}
          </Checkbox.Group>
        );

      case 'date':
        return <DatePicker style={{ width: '100%' }} {...commonProps} format="YYYY-MM-DD" />;

      case 'datetime':
        return <DatePicker style={{ width: '100%' }} showTime {...commonProps} format="YYYY-MM-DD HH:mm:ss" />;

      case 'switch':
        return <Switch disabled={disabled} checkedChildren="开启" unCheckedChildren="关闭" />;

      case 'image':
        return <CmUpload disabled={disabled} />;

      case 'images':
        return <CmUploadMore disabled={disabled} />;

      case 'file':
        return <CmUploadFile disabled={disabled} />;

      case 'object':
        return (
          <ObjectFieldRenderer
            field={field}
            fieldLabel={fieldLabel}
            disabled={disabled}
            generateDefaultValue={generateDefaultValue}
          />
        );

      case 'array':
        return (
          <ArrayFieldRenderer
            field={field}
            fieldLabel={fieldLabel}
            generateDefaultValue={generateDefaultValue}
            disabled={disabled}
          />
        );

      default:
        return <Input {...commonProps} />;
    }
  };

  // 渲染字段
  const renderField = (field) => {
    if (!field?.key) return null;

    const fieldLabel = field.label || field.key || '该字段';
    const rules = [];
    if (field.required) {
      rules.push({ required: true, message: `请输入${fieldLabel}` });
    }

    // object 和 array 类型不需要 Form.Item 包裹
    if (field.type === 'object' || field.type === 'array') {
      return renderInput(field);
    }

    return (
      <Form.Item key={field.key} name={field.key} label={fieldLabel} rules={rules}>
        {renderInput(field)}
      </Form.Item>
    );
  };

  if (!schema?.length) {
    return <div className="empty-schema">暂无表单配置</div>;
  }

  // 处理表单值变化
  const handleValuesChange = (changedValues, allValues) => {
    if (!onFormDataChange) return;

    // 转换 dayjs 对象为字符串
    const processDates = (value) => {
      if (dayjs.isDayjs(value)) {
        return value.format('YYYY-MM-DD HH:mm:ss');
      }
      if (Array.isArray(value)) {
        return value.map(item => processDates(item));
      }
      if (typeof value === 'object' && value !== null) {
        const result = {};
        Object.keys(value).forEach(key => {
          result[key] = processDates(value[key]);
        });
        return result;
      }
      return value;
    };

    onFormDataChange(processDates(allValues));
  };

  const fieldsContent = (
    <div className="schema-renderer-fields">
      {schema.map(field => renderField(field))}
    </div>
  );

  if (!wrapWithForm) {
    return fieldsContent;
  }

  return (
    <Form
      form={form}
      layout={layout}
      disabled={disabled}
      onValuesChange={handleValuesChange}
    >
      {fieldsContent}
    </Form>
  );
};

export default SchemaRenderer;