import React, { useState, useEffect } from 'react';
import { Card, Button, Form, message, Space } from 'antd';
import { SchemaBuilder, SchemaRenderer } from '@components/SchemaBuilder';

/**
 * 示例页面：展示如何使用 SchemaBuilder 和 SchemaRenderer
 *
 * SchemaBuilder - 用于配置管理页面，可视化配置表单结构
 * SchemaRenderer - 用于业务页面，根据配置动态渲染表单
 */

const RuleExamplePage = () => {
  const [form] = Form.useForm();
  const [schema, setSchema] = useState([]);
  const [formData, setFormData] = useState({});
  const [mode, setMode] = useState('config'); // 'config' | 'render'

  // 示例：从 API 加载配置
  useEffect(() => {
    loadSchemaConfig();
  }, []);

  // 加载 schema 配置（实际项目中从 API 获取）
  const loadSchemaConfig = async () => {
    try {
      // 模拟 API 请求
      // const response = await getSchemaConfig({ code: 'PRODUCT_CONFIG' });
      // if (response.code === 0) {
      //   const schemaJson = JSON.parse(response.data.schemaJson);
      //   setSchema(schemaJson);
      // }

      // 示例配置
      const exampleSchema = [
        {
          key: 'productName',
          label: '产品名称',
          type: 'string',
          required: true,
          placeholder: '请输入产品名称',
        },
        {
          key: 'productType',
          label: '产品类型',
          type: 'select',
          required: true,
          options: [
            { label: '实物商品', value: 'physical' },
            { label: '虚拟商品', value: 'virtual' },
            { label: '服务商品', value: 'service' },
          ],
        },
        {
          key: 'price',
          label: '价格',
          type: 'number',
          required: true,
          placeholder: '请输入价格',
        },
        {
          key: 'isOnSale',
          label: '是否上架',
          type: 'switch',
          defaultValue: false,
        },
        {
          key: 'saleDate',
          label: '上架日期',
          type: 'date',
          placeholder: '请选择上架日期',
        },
        {
          key: 'description',
          label: '产品描述',
          type: 'textarea',
          placeholder: '请输入产品描述',
        },
        {
          key: 'productImages',
          label: '产品图片',
          type: 'array',
          children: [
            {
              key: 'imageUrl',
              label: '图片URL',
              type: 'string',
              required: true,
            },
            {
              key: 'imageType',
              label: '图片类型',
              type: 'select',
              options: [
                { label: '主图', value: 'main' },
                { label: '详情图', value: 'detail' },
              ],
            },
          ],
        },
        {
          key: 'specifications',
          label: '规格参数',
          type: 'object',
          children: [
            {
              key: 'weight',
              label: '重量(kg)',
              type: 'number',
            },
            {
              key: 'dimensions',
              label: '尺寸',
              type: 'string',
            },
            {
              key: 'material',
              label: '材质',
              type: 'string',
            },
          ],
        },
      ];
      setSchema(exampleSchema);
    } catch (error) {
      message.error('加载配置失败');
    }
  };

  // 保存表单数据
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      console.log('表单数据:', values);
      message.success('保存成功');
      // 实际项目中调用 API 保存
      // await saveData(values);
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  // Schema 配置变更
  const handleSchemaChange = (newSchema) => {
    setSchema(newSchema);
  };

  // 表单数据变更
  const handleFormDataChange = (newFormData) => {
    setFormData(newFormData);
    console.log('表单数据变更:', newFormData);
  };

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Button
            type={mode === 'config' ? 'primary' : 'default'}
            onClick={() => setMode('config')}
          >
            配置模式
          </Button>
          <Button
            type={mode === 'render' ? 'primary' : 'default'}
            onClick={() => setMode('render')}
          >
            渲染模式
          </Button>
        </Space>

        {mode === 'config' && (
          <div>
            <h2>配置表单结构</h2>
            <p style={{ color: '#666', marginBottom: 16 }}>
              使用 SchemaBuilder 可视化配置表单字段，支持嵌套对象和数组结构
            </p>
            <SchemaBuilder value={schema} onChange={handleSchemaChange} />

            <div style={{ marginTop: 24 }}>
              <h4>当前配置 (JSON):</h4>
              <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 4 }}>
                {JSON.stringify(schema, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {mode === 'render' && (
          <div>
            <h2>动态表单渲染</h2>
            <p style={{ color: '#666', marginBottom: 16 }}>
              使用 SchemaRenderer 根据配置自动渲染表单，业务页面只需填充数据
            </p>

            <Card title="业务表单" style={{ marginBottom: 16 }}>
              <SchemaRenderer
                schema={schema}
                formData={formData}
                onFormDataChange={handleFormDataChange}
                form={form}
              />

              <div style={{ marginTop: 24, textAlign: 'center' }}>
                <Space>
                  <Button onClick={() => form.resetFields()}>重置</Button>
                  <Button type="primary" onClick={handleSave}>
                    保存
                  </Button>
                </Space>
              </div>
            </Card>

            <div>
              <h4>表单数据:</h4>
              <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 4 }}>
                {JSON.stringify(formData, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default RuleExamplePage;
