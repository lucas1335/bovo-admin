import React, { useState, useEffect } from 'react';
import { Card, Form, Button, message, Space, Modal, Spin } from 'antd';
import { SchemaRenderer } from '@components/SchemaBuilder';
import { savePModuleConfig, updatePModuleConfig, getPModuleConfigList } from '@api';

/**
 * OBJECT 类型配置内容组件
 * 单条记录的编辑表单
 */
const ObjectConfigContent = ({ ruleConfig }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recordId, setRecordId] = useState(null); // 保存记录ID，用于判断是新增还是更新

  // 解析 schemaJson
  const schema = React.useMemo(() => {
    if (!ruleConfig?.schemaJson) return [];
    try {
      const parsed = typeof ruleConfig.schemaJson === 'string'
        ? JSON.parse(ruleConfig.schemaJson)
        : ruleConfig.schemaJson;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [ruleConfig?.schemaJson]);

  // 根据 schema 生成初始数据结构
  const generateInitialData = (schema) => {
    const data = {};

    const processField = (field) => {
      if (!field || !field.type) return '';

      switch (field.type) {
        case 'object':
          if (field.children && field.children.length > 0) {
            const obj = {};
            field.children.forEach(child => {
              if (child && child.key) {
                obj[child.key] = processField(child);
              }
            });
            return obj;
          }
          return {};
          
        case 'array':
          if (field.children && field.children.length > 0) {
            // 生成一个示例项
            const exampleItem = {};
            field.children.forEach(child => {
              if (child && child.key) {
                exampleItem[child.key] = processField(child);
              }
            });
            return [exampleItem];
          }
          return [];
          
        case 'number':
          return 0;
          
        case 'switch':
          return false;
          
        case 'checkbox':
          return [];
          
        case 'radio':
        case 'select':
          return '';
          
        case 'date':
        case 'datetime':
          return null;
          
        default:
          return '';
      }
    };

    schema.forEach(field => {
      if (field && field.key) {
        data[field.key] = processField(field);
      }
    });

    console.log('生成的初始数据:', data);
    return data;
  };

  // 从已有数据中生成表单数据
  const generateFormDataFromContent = (content, schema) => {
    if (!content) return generateInitialData(schema);

    try {
      const parsedContent = typeof content === 'string' ? JSON.parse(content) : content;

      // 递归处理数据，确保与 schema 结构匹配
      const processData = (data, currentSchema) => {
        if (!currentSchema || !currentSchema.key) return data;

        const result = {};
        Object.keys(data).forEach(key => {
          const fieldSchema = currentSchema.children?.find(child => child.key === key);
          const value = data[key];

          if (fieldSchema) {
            // 关键修复：当数据类型与 schema 定义不匹配时，使用默认值
            if (fieldSchema.type === 'array') {
              if (Array.isArray(value)) {
                result[key] = value.map(item => processData(item, fieldSchema));
              } else {
                // 数据类型不匹配：schema 定义是 array，但数据不是数组
                console.warn(`[generateFormDataFromContent] 字段 ${key} 类型不匹配，期望 array，实际是 ${typeof value}，使用默认值`);
                result[key] = processField(fieldSchema);
              }
            } else if (fieldSchema.type === 'object') {
              if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                result[key] = processData(value, fieldSchema);
              } else {
                // 数据类型不匹配：schema 定义是 object，但数据不是对象
                console.warn(`[generateFormDataFromContent] 字段 ${key} 类型不匹配，期望 object，实际是 ${typeof value}，使用默认值`);
                result[key] = processField(fieldSchema);
              }
            } else if ((fieldSchema.type === 'date' || fieldSchema.type === 'datetime') && value) {
              // 日期类型保持原样，由 SchemaRenderer 处理
              result[key] = value;
            } else {
              result[key] = value;
            }
          } else {
            result[key] = value;
          }
        });

        // 确保 schema 中定义的字段都有值
        if (currentSchema.children) {
          currentSchema.children.forEach(child => {
            if (child && child.key && result[child.key] === undefined) {
              // 修复：直接使用 child（它就是 schema），不要在顶层 schema 中查找
              result[child.key] = processField(child);
            }
          });
        }

        return result;
      };

      // 处理顶层数据
      const processedData = {};
      schema.forEach(field => {
        if (field && field.key) {
          if (parsedContent[field.key] !== undefined) {
            // 顶层字段也要检查类型是否匹配
            if (field.type === 'array') {
              if (Array.isArray(parsedContent[field.key])) {
                processedData[field.key] = parsedContent[field.key];
              } else {
                console.warn(`[generateFormDataFromContent] 顶层字段 ${field.key} 类型不匹配，期望 array，使用默认值`);
                processedData[field.key] = processField(field);
              }
            } else if (field.type === 'object') {
              if (typeof parsedContent[field.key] === 'object' && parsedContent[field.key] !== null && !Array.isArray(parsedContent[field.key])) {
                processedData[field.key] = processData(parsedContent[field.key], field);
              } else {
                console.warn(`[generateFormDataFromContent] 顶层字段 ${field.key} 类型不匹配，期望 object，使用默认值`);
                processedData[field.key] = processField(field);
              }
            } else {
              processedData[field.key] = parsedContent[field.key];
            }
          } else {
            processedData[field.key] = processField(field);
          }
        }
      });

      console.log('从已有内容生成的数据:', processedData);
      return processedData;
    } catch (error) {
      console.error('解析已有数据失败:', error);
      return generateInitialData(schema);
    }
  };

  // 辅助函数：处理字段数据
  const processField = (field) => {
    if (!field || !field.type) return '';

    switch (field.type) {
      case 'object':
        if (field.children && field.children.length > 0) {
          const obj = {};
          field.children.forEach(child => {
            if (child && child.key) {
              obj[child.key] = processField(child);
            }
          });
          return obj;
        }
        return {};
        
      case 'array':
        if (field.children && field.children.length > 0) {
          const exampleItem = {};
          field.children.forEach(child => {
            if (child && child.key) {
              exampleItem[child.key] = processField(child);
            }
          });
          return [exampleItem];
        }
        return [];
        
      case 'number':
        return 0;
        
      case 'switch':
        return false;
        
      case 'checkbox':
        return [];
        
      default:
        return '';
    }
  };

  // 加载配置数据 - 调用接口获取已保存的配置数据
  useEffect(() => {
    const loadConfigData = async () => {
      if (ruleConfig && schema.length > 0) {
        console.log('[ObjectConfigContent] ===== 加载配置数据 ===== 规则ID:', ruleConfig.id);

        setLoading(true);
        // 重置表单（清空旧数据）
        form.resetFields();
        setRecordId(null); // 重置记录ID

        try {
          // 调用接口获取已保存的配置数据
          const response = await getPModuleConfigList({
            pageNum: 1,
            pageSize: 1,
            searchParam: JSON.stringify({ SEARCH_EQ_configId: ruleConfig.id })
          });

          let formData;
          // 如果接口返回了数据，使用接口数据回显
          if ((response.code === 0 || response.code === 200) && response.data) {
            const list = response.data?.records || response.data?.list || response.data || [];
            if (list.length > 0) {
              console.log('[ObjectConfigContent] 从接口获取到数据:', list[0]);
              if (list[0].content) {
                formData = generateFormDataFromContent(list[0].content, schema);
              } else {
                formData = generateInitialData(schema);
              }
              setRecordId(list[0].id); // 保存记录ID
            } else {
              console.log('[ObjectConfigContent] 接口未返回数据，使用初始值');
              formData = generateInitialData(schema);
              setRecordId(null);
            }
          } else {
            console.log('[ObjectConfigContent] 接口调用失败，使用初始值');
            formData = generateInitialData(schema);
          }

          console.log('[ObjectConfigContent] 设置表单数据:', formData);

          // 设置表单值
          form.setFieldsValue(formData);

          // 验证设置是否成功
          setTimeout(() => {
            const valuesAfterSet = form.getFieldsValue(true);
            console.log('[ObjectConfigContent] setFieldsValue 后的表单值:', valuesAfterSet);
            console.log('[ObjectConfigContent] setFieldsValue 后的表单值 JSON:', JSON.stringify(valuesAfterSet, null, 2));
          }, 100);
        } catch (error) {
          console.error('[ObjectConfigContent] 加载配置数据失败:', error);
          message.error('加载配置数据失败，请刷新重试');
          // 失败时使用初始值
          const formData = generateInitialData(schema);
          form.setFieldsValue(formData);
        } finally {
          setLoading(false);
        }
      } else {
        console.log('[ObjectConfigContent] 跳过初始化:', {
          hasRuleConfig: !!ruleConfig,
          schemaLength: schema.length
        });
      }
    };

    loadConfigData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ruleConfig?.id, schema.length]); // 依赖 ruleConfig.id 和 schema.length

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      console.log('保存的表单数据:', values);
      console.log('JSON字符串:', JSON.stringify(values, null, 2));
      setSubmitting(true);

      let response;
      // 判断是新增还是更新
      if (recordId) {
        // 已有记录ID，调用更新接口
        console.log('[ObjectConfigContent] 更新配置，记录ID:', recordId);
        response = await updatePModuleConfig({
          id: recordId,
          configId: ruleConfig.id,
          configCode: ruleConfig.code,
          content: JSON.stringify(values),
        });
      } else {
        // 没有记录ID，调用新增接口
        console.log('[ObjectConfigContent] 新增配置');
        response = await savePModuleConfig({
          configId: ruleConfig.id,
          configCode: ruleConfig.code,
          content: JSON.stringify(values),
           state: 1,
        });
        // 保存成功后记录ID，下次就是更新操作
        if (response.code === 0 || response.code === 200) {
          setRecordId(response.data?.id || response.data);
        }
      }

      if (response.code === 0 || response.code === 200) {
        message.success(recordId ? '更新成功' : '保存成功');
      } else {
        message.error(response.msg || '操作失败');
      }
    } catch (error) {
      console.error('表单验证失败:', error);
      if (error.errorFields) {
        console.error('错误字段:', error.errorFields);
        message.error('表单验证失败，请检查必填字段');
      } else {
        message.error('保存失败，请稍后重试');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // 预览当前数据
  const handlePreview = () => {
    try {
      const values = form.getFieldsValue(true);
      console.log('预览数据:', values);
      console.log('预览数据JSON:', JSON.stringify(values, null, 2));
      setPreviewData(values);
      setPreviewVisible(true);
    } catch (error) {
      console.error('获取数据失败:', error);
      message.error('获取数据失败');
    }
  };

  // 检查表单值（调试用）
  const handleCheckForm = () => {
    const values = form.getFieldsValue(true);
    console.log('===== 当前表单值 =====');
    console.log(JSON.stringify(values, null, 2));

    // 检查特定嵌套路径的值
    if (values && values.name2 && values.name2[0] && values.name2[0].child1) {
      console.log('name2[0].child1:', values.name2[0].child1);
      if (values.name2[0].child1.child11 && values.name2[0].child1.child11[0]) {
        console.log('name2[0].child1.child11[0]:', values.name2[0].child1.child11[0]);
      }
    }

    message.success('请查看控制台输出');
  };

  // 重置表单
  const handleReset = () => {
    Modal.confirm({
      title: '确认重置',
      content: '确定要重置表单吗？所有未保存的修改将会丢失。',
      onOk: () => {
        const initialData = generateInitialData(schema);
        form.setFieldsValue(initialData);
        message.success('表单已重置');
      },
    });
  };

  return (
    <Card
      title={ruleConfig?.name || '配置编辑'}
      loading={loading}
      extra={
        <Space>
          <Button onClick={handleCheckForm} type="dashed">
            检查表单值
          </Button>
          <Button onClick={handleReset}>
            重置
          </Button>
          <Button onClick={handlePreview}>
            预览
          </Button>
          <Button type="primary" onClick={handleSubmit} loading={submitting}>
            保存配置
          </Button>
        </Space>
      }
    >
      <Spin spinning={loading} tip="加载配置数据...">
        <Form
          form={form}
          layout="vertical"
          autoComplete="off"
        >
          <SchemaRenderer schema={schema} form={form} wrapWithForm={false} />
        </Form>
      </Spin>

      {/* 预览模态框 */}
      <Modal
        title="数据预览"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        <pre style={{
          background: '#f5f5f5',
          padding: 16,
          borderRadius: 4,
          overflow: 'auto',
          maxHeight: 500,
          fontSize: 12,
        }}>
          {previewData ? JSON.stringify(previewData, null, 2) : '// 暂无数据'}
        </pre>
      </Modal>
    </Card>
  );
};

export default ObjectConfigContent;