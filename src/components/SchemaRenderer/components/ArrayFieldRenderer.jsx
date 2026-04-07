import React from 'react';
import { Form, Button, Input, InputNumber, Select, Radio, Checkbox, DatePicker, Switch } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import CmEditor from '@components/CmEditor';
import CmUpload from '@components/CmUpload';
import CmUploadMore from '@components/CmUploadMore';
import CmUploadFile from '@components/CmUploadFile';

const { Option } = Select;

/**
 * 渲染数组子项中的字段
 */
const renderArrayFieldItem = (child, index, arrayKey, disabled) => {
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
      inputElement = <Input.TextArea rows={4} {...commonProps} />;
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
    default:
      inputElement = <Input {...commonProps} />;
  }

  const rules = [];
  if (child.required) {
    rules.push({ required: true, message: `请输入${childLabel}` });
  }

  return (
    <Form.Item
      key={`${arrayKey}_${index}_${child.key}`}
      name={[index, child.key]}
      label={childLabel}
      rules={rules}
      style={{ marginBottom: 12 }}
    >
      {inputElement}
    </Form.Item>
  );
};

/**
 * ArrayFieldRenderer - 数组列表字段渲染器
 *
 * @param {Object} field - 字段配置
 * @param {string} fieldLabel - 字段标签
 * @param {Function} generateDefaultValue - 生成默认值的函数
 * @param {Boolean} disabled - 是否禁用
 */
const ArrayFieldRenderer = ({
  field,
  fieldLabel,
  generateDefaultValue,
  disabled = false,
}) => {
  // 有效的子字段
  const validChildren = field.children?.filter(child => child && child.key) || [];

  // 生成新添加项的默认值
  const generateNewItem = () => {
    const item = {};
    validChildren.forEach(child => {
      if (child.key) {
        item[child.key] = generateDefaultValue(child);
      }
    });
    return item;
  };

  return (
    <div className="array-fields">
      <div style={{
        fontSize: 14,
        fontWeight: 500,
        marginBottom: 12,
        paddingBottom: 8,
        borderBottom: '1px solid #f0f0f0'
      }}>
        {fieldLabel}
      </div>
      <Form.List name={field.key}>
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name: index }) => (
              <div key={key} style={{
                marginBottom: 16,
                padding: 16,
                background: '#fafafa',
                borderRadius: 4,
                border: '1px solid #f0f0f0'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 12
                }}>
                  <span style={{ fontWeight: 500 }}>项 #{index + 1}</span>
                  {!disabled && (
                    <MinusCircleOutlined
                      onClick={() => remove(index)}
                      style={{ color: 'red', cursor: 'pointer' }}
                    />
                  )}
                </div>
                {validChildren.map(child => renderArrayFieldItem(child, index, key, disabled))}
              </div>
            ))}
            {!disabled && (
              <Button
                type="dashed"
                onClick={() => add(generateNewItem())}
                block
                icon={<PlusOutlined />}
              >
                添加{fieldLabel}
              </Button>
            )}
          </>
        )}
      </Form.List>
    </div>
  );
};

export default ArrayFieldRenderer;
