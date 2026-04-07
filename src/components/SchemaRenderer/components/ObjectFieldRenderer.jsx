import React from 'react';
import { Form, Input, InputNumber, Select, Radio, Checkbox, DatePicker, Switch } from 'antd';
import CmEditor from '@components/CmEditor';
import CmUpload from '@components/CmUpload';
import CmUploadMore from '@components/CmUploadMore';
import CmUploadFile from '@components/CmUploadFile';
import ArrayFieldRenderer from './ArrayFieldRenderer';

const { TextArea } = Input;
const { Option } = Select;

/**
 * 生成字段默认值
 */
const generateDefaultValue = (fieldConfig) => {
  if (!fieldConfig?.type) return '';

  switch (fieldConfig.type) {
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
 * 渲染嵌套对象中的字段
 */
const renderObjectField = (child, disabled) => {
  const childLabel = child.label || child.key || '该字段';
  const commonProps = {
    placeholder: `请输入${childLabel}`,
    disabled,
  };

  let inputElement;
  switch (child.type) {
    case 'string':
      inputElement = <Input {...commonProps} />;
      break;
    case 'number':
      inputElement = <InputNumber {...commonProps} style={{ width: '100%' }} />;
      break;
    case 'textarea':
      inputElement = <TextArea rows={4} {...commonProps} />;
      break;
    case 'select':
      inputElement = (
        <Select {...commonProps} allowClear>
          {child.options?.map((opt) => (
            <Option key={opt.value} value={opt.value}>{opt.label}</Option>
          ))}
        </Select>
      );
      break;
    case 'radio':
      inputElement = (
        <Radio.Group disabled={disabled}>
          {child.options?.map((opt) => (
            <Radio key={opt.value} value={opt.value}>{opt.label}</Radio>
          ))}
        </Radio.Group>
      );
      break;
    case 'checkbox':
      inputElement = (
        <Checkbox.Group disabled={disabled}>
          {child.options?.map((opt) => (
            <Checkbox key={opt.value} value={opt.value}>{opt.label}</Checkbox>
          ))}
        </Checkbox.Group>
      );
      break;
    case 'date':
      inputElement = <DatePicker style={{ width: '100%' }} {...commonProps} format="YYYY-MM-DD" />;
      break;
    case 'datetime':
      inputElement = <DatePicker style={{ width: '100%' }} showTime {...commonProps} format="YYYY-MM-DD HH:mm:ss" />;
      break;
    case 'switch':
      inputElement = <Switch disabled={disabled} checkedChildren="开启" unCheckedChildren="关闭" />;
      break;
    case 'image':
      inputElement = <CmUpload disabled={disabled} />;
      break;
    case 'images':
      inputElement = <CmUploadMore disabled={disabled} />;
      break;
    case 'file':
      inputElement = <CmUploadFile disabled={disabled} />;
      break;
    case 'editor':
      inputElement = <CmEditor height={300} disabled={disabled} />;
      break;
    case 'array':
      return (
        <ArrayFieldRenderer
          field={child}
          fieldLabel={childLabel}
          generateDefaultValue={generateDefaultValue}
          disabled={disabled}
        />
      );
    default:
      inputElement = <Input {...commonProps} />;
  }

  const rules = [];
  if (child.required) {
    rules.push({ required: true, message: `请输入${childLabel}` });
  }

  return (
    <Form.Item
      key={child.key}
      name={[child.key]}
      label={childLabel}
      rules={rules}
    >
      {inputElement}
    </Form.Item>
  );
};

/**
 * ObjectFieldRenderer - 嵌套对象字段渲染器
 *
 * @param {Object} field - 字段配置
 * @param {string} fieldLabel - 字段标签
 * @param {Boolean} disabled - 是否禁用
 */
const ObjectFieldRenderer = ({
  field,
  fieldLabel,
  disabled = false,
}) => {
  const validChildren = field.children?.filter(child => child?.key) || [];

  return (
    <div className="nested-object" style={{ marginTop: 16 }}>
      <div style={{
        fontSize: 14,
        fontWeight: 500,
        marginBottom: 12,
        paddingBottom: 8,
        borderBottom: '1px solid #f0f0f0'
      }}>
        {fieldLabel}
      </div>
      <div style={{ paddingLeft: 12 }}>
        <Form.Item name={field.key} style={{ display: 'none' }}>
          <Input type="hidden" />
        </Form.Item>
        {validChildren.map(child => renderObjectField(child, disabled))}
      </div>
    </div>
  );
};

export default ObjectFieldRenderer;
