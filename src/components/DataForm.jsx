import React, { useEffect } from 'react';
import { Modal, Drawer, Form, Input, Select, Switch, Space, Button, InputNumber, Radio } from 'antd';
import { CloseOutlined, CheckOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

const DataForm = ({
  visible = false,
  title = '表单',
  fields = [],
  initialValues = {},
  extraValues = {}, // 新增：额外的隐藏字段（如 id, parentId 等），会自动合并到提交数据中
  onCancel,
  onSubmit,
  onClosed, // 新增：表单关闭后的回调（用于清理父组件状态）
  loading = false,
  width = 600,
  formType = 'modal', // 'modal' | 'drawer'
  drawerPlacement = 'right', // 'left' | 'right' | 'top' | 'bottom'
  drawerSize = 'default', // 'default' | 'large'
  footer, // 自定义底部内容
  children, // 自定义表单内容
  disabled = false, // 新增：是否禁用表单（查看模式）
  ...rest
}) => {
  const [form] = Form.useForm();

  // 当 visible 或 initialValues 改变时，重置表单字段
  useEffect(() => {
    if (visible) {
      // 先重置表单，清除之前的状态
      form.resetFields();
      // 然后设置最新的 initialValues 值
      if (initialValues && Object.keys(initialValues).length > 0) {
        form.setFieldsValue(initialValues);
      }
    }
  }, [visible, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (onSubmit) {
        // 自动合并 extraValues 和表单 values
        await onSubmit({ ...extraValues, ...values });
        // 提交成功后，通知父组件清理状态
        if (onClosed) {
          onClosed();
        }
      }
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    if (onCancel) {
      onCancel();
    }
    // 关闭时，通知父组件清理状态（包括取消和保存成功后）
    if (onClosed) {
      onClosed();
    }
  };

  const renderField = (field) => {
    const { type, name, label, rules = [], options = [], mode, render, ...rest } = field;

    switch (type) {
      case 'input':
        return (
          <Form.Item
            key={name}
            name={name}
            label={label}
            rules={rules}
            {...rest}
          >
            <Input placeholder={`请输入${label}`} />
          </Form.Item>
        );

      case 'textarea':
        return (
          <Form.Item
            key={name}
            name={name}
            label={label}
            rules={rules}
            {...rest}
          >
            <TextArea rows={4} placeholder={`请输入${label}`} />
          </Form.Item>
        );

      case 'password':
        return (
          <Form.Item
            key={name}
            name={name}
            label={label}
            rules={rules}
            {...rest}
          >
            <Input.Password placeholder={`请输入${label}`} />
          </Form.Item>
        );

      case 'select':
        return (
          <Form.Item
            key={name}
            name={name}
            label={label}
            rules={rules}
            {...rest}
          >
            <Select
              placeholder={`请选择${label}`}
              mode={mode}
            >
              {options.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        );

      case 'switch':
        return (
          <Form.Item
            key={name}
            name={name}
            label={label}
            valuePropName="checked"
            {...rest}
          >
            <Switch />
          </Form.Item>
        );

      case 'inputNumber':
        return (
          <Form.Item
            key={name}
            name={name}
            label={label}
            rules={rules}
            {...rest}
          >
            <InputNumber placeholder={`请输入${label}`} style={{ width: '100%' }} />
          </Form.Item>
        );

      case 'radio':
        return (
          <Form.Item
            key={name}
            name={name}
            label={label}
            rules={rules}
            {...rest}
          >
            <Radio.Group>
              {options.map(option => (
                <Radio key={option.value} value={option.value}>
                  {option.label}
                </Radio>
              ))}
            </Radio.Group>
          </Form.Item>
        );

      case 'custom':
        // 自定义渲染，通过 renderProps 传递 value 和 onChange
        return (
          <Form.Item
            key={name}
            name={name}
            label={label}
            rules={rules}
            {...rest}
          >
            {render ? (
              ({ value, onChange }) => render({ value, onChange })
            ) : null}
          </Form.Item>
        );

      default:
        return (
          <Form.Item
            key={name}
            name={name}
            label={label}
            rules={rules}
            {...rest}
          >
            <Input placeholder={`请输入${label}`} />
          </Form.Item>
        );
    }
  };

  const renderFormContent = () => {
    // 如果提供了children，则使用children作为表单内容
    if (children) {
      return children;
    }
    
    // 否则根据fields渲染表单字段  
    return (
      <>
        {fields.map(field => renderField(field))}
        {footer && <div style={{ marginTop: 20 }}>{footer}</div>}
      </>
    );
  };

  const renderForm = () => (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      preserve={false}
      disabled={disabled}
    >
      {renderFormContent()}
    </Form>
  );

  // 渲染弹出层形式
  if (formType === 'modal') {
    return (
      <Modal
        title={title}
        open={visible}
        onCancel={handleCancel}
        onOk={disabled ? handleCancel : handleSubmit}
        confirmLoading={loading}
        width={width}
        destroyOnClose
        maskClosable={false} // 点击遮罩层不关闭
        okText={disabled ? '关闭' : '确定'}
        okButtonProps={{ icon: disabled ? null : <CheckOutlined /> }}
        cancelButtonProps={{ style: { display: disabled ? 'none' : 'inline-flex' }, icon: <CloseOutlined /> }}
        {...rest}
      >
        {renderForm()}
      </Modal>
    );
  }

  // 渲染抽屉形式
  return (
    <Drawer
      title={title}
      open={visible}
      onClose={handleCancel}
      width={typeof width === 'string' && width.includes('%') ? width : (width || 600)}
      placement={drawerPlacement}
      destroyOnClose
      maskClosable={false} // 点击遮罩层不关闭
      extra={
        <Space>
          <Button icon={<CloseOutlined />} onClick={handleCancel}>
            {disabled ? '关闭' : '取消'}
          </Button>
          {!disabled && (
            <Button type="primary" icon={<CheckOutlined />} loading={loading} onClick={handleSubmit}>
              确定
            </Button>
          )}
        </Space>
      }
      {...rest}
    >
      {renderForm()}
    </Drawer>
  );
};

export default DataForm;