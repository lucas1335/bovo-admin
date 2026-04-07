import React, { useState } from 'react';
import { Card, Form, Button, message, Input } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import CmEditor from '@components/CmEditor';

// Schema 配置
const schemaJSON = [
  {
    "key": "leftContent",
    "label": "左侧内容",
    "type": "editor",
    "options": [],
    "rules": {}
  },
  {
    "key": "itemList",
    "label": "数据信息",
    "type": "array",
    "options": [],
    "rules": {},
    "children": [
      {
        "key": "label",
        "label": "标题",
        "type": "string",
        "required": true,
        "options": [],
        "rules": {}
      },
      {
        "key": "number",
        "label": "数量",
        "type": "string",
        "required": true,
        "options": [],
        "rules": {}
      }
    ]
  }
];

const DemoForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 表单提交
  const handleSubmit = async (values) => {
    setLoading(true);
    console.log('提交的数据:', values);
    message.success('提交成功！');
    setLoading(false);
  };

  // 渲染字段
  const renderField = (field) => {
    const { key, label, type, required } = field;

    switch (type) {
      case 'editor':
        return (
          <Form.Item
            key={key}
            name={key}
            label={label}
            rules={required ? [{ required: true, message: `请输入${label}` }] : []}
          >
            <CmEditor height={300} />
          </Form.Item>
        );

      case 'array':
        return (
          <div key={key}>
            <div style={{
              fontSize: 14,
              fontWeight: 500,
              marginBottom: 12,
              paddingBottom: 8,
              borderBottom: '1px solid #f0f0f0'
            }}>
              {label}
            </div>
            <Form.List name={key}>
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key: itemKey, name: index, ...restField }) => (
                    <div key={itemKey} style={{
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
                        <MinusCircleOutlined
                          onClick={() => remove(index)}
                          style={{ color: 'red', cursor: 'pointer' }}
                        />
                      </div>
                      {field.children?.map(child => (
                        <Form.Item
                          key={`${key}_${index}_${child.key}`}
                          name={[index, child.key]}
                          label={child.label}
                          rules={child.required ? [{ required: true, message: `请输入${child.label}` }] : []}
                          style={{ marginBottom: 12 }}
                        >
                          <Input placeholder={`请输入${child.label}`} />
                        </Form.Item>
                      ))}
                    </div>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => add({ label: '', number: '' })}
                    block
                    icon={<PlusOutlined />}
                  >
                    添加{label}
                  </Button>
                </>
              )}
            </Form.List>
          </div>
        );

      default:
        return (
          <Form.Item
            key={key}
            name={key}
            label={label}
            rules={required ? [{ required: true, message: `请输入${label}` }] : []}
          >
            <Input placeholder={`请输入${label}`} />
          </Form.Item>
        );
    }
  };

  return (
    <Card title="Schema 动态表单 Demo">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        {schemaJSON.map(field => renderField(field))}

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            提交
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={() => form.resetFields()}>
            重置
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={() => console.log(form.getFieldsValue())}>
            查看数据
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default DemoForm;
