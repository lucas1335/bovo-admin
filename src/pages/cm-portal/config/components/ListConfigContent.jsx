import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, message, Spin, Popconfirm, Space, InputNumber } from 'antd';
import { SchemaRenderer } from '@components/SchemaBuilder';
import { savePModuleConfig, updatePModuleConfig, deletePModuleConfig, getPModuleConfigList } from '@api';

/**
 * LIST 类型配置内容组件
 * 支持添加多条记录
 */
const ListConfigContent = ({ ruleConfig }) => {
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null); // 当前编辑的记录

  // 加载已保存的配置数据列表
  useEffect(() => {
    const loadConfigList = async () => {
      if (!ruleConfig?.id) return;

      console.log('[ListConfigContent] ===== 加载配置数据列表 ===== 规则ID:', ruleConfig.id);
      setLoading(true);

      try {
        const response = await getPModuleConfigList({
          pageNum: 1,
          pageSize: 1000,
          searchParam: JSON.stringify({ SEARCH_EQ_configId: ruleConfig.id })
        });

        if ((response.code === 0 || response.code === 200) && response.data) {
          const list = response.data?.records || response.data?.list || response.data || [];

          // 解析每条记录的 content 字段
          const parsedList = list.map(item => {
            try {
              const contentObj = typeof item.content === 'string' ? JSON.parse(item.content) : item.content;
              return {
                ...item,
                ...contentObj,
                key: item.id,
              };
            } catch {
              return {
                ...item,
                key: item.id,
              };
            }
          });

          console.log('[ListConfigContent] 从接口获取到数据列表:', parsedList);
          setDataSource(parsedList);
        } else {
          console.log('[ListConfigContent] 接口未返回数据');
          setDataSource([]);
        }
      } catch (error) {
        console.error('[ListConfigContent] 加载配置数据失败:', error);
        message.error('加载配置数据失败，请刷新重试');
        setDataSource([]);
      } finally {
        setLoading(false);
      }
    };

    loadConfigList();
  }, [ruleConfig?.id]);

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

  // 生成表格列
  const columns = React.useMemo(() => {
    const baseColumns = schema.map(field => ({
      title: field.label,
      dataIndex: field.key,
      key: field.key,
      width: 200,
      ellipsis: true,
    }));

    return [
      ...baseColumns,
      {
        title: '排序号码',
        dataIndex: 'orderNo',
        key: 'orderNo',
        width: 120,
        sorter: (a, b) => (a.orderNo || 0) - (b.orderNo || 0),
        defaultSortOrder: 'ascend',
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        key: 'createTime',
        width: 180,
      },
      {
        title: '操作',
        key: 'action',
        width: 150,
        fixed: 'right',
        render: (_, record) => (
          <Space>
            <Button
              type="link"
              size="small"
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
            <Popconfirm
              title="确定删除这条记录吗？"
              onConfirm={() => handleDelete(record)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ];
  }, [schema]);

  // 添加记录
  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    // 设置默认排序号码（当前列表最大值 + 1）
    const maxOrderNo = dataSource.length > 0
      ? Math.max(...dataSource.map(item => item.orderNo || 0))
      : 0;
    form.setFieldsValue({ orderNo: maxOrderNo + 1 });
    setModalVisible(true);
  };

  // 编辑记录
  const handleEdit = (record) => {
    console.log('[ListConfigContent] 编辑记录:', record);
    // 从记录中提取 content 字段的数据（去掉其他字段如 id, createTime 等）
    const contentData = {};
    schema.forEach(field => {
      if (field && field.key && record[field.key] !== undefined) {
        contentData[field.key] = record[field.key];
      }
    });
    // 同时设置 orderNo 字段
    contentData.orderNo = record.orderNo;
    form.setFieldsValue(contentData);
    setEditingRecord(record);
    setModalVisible(true);
  };

  // 删除记录
  const handleDelete = async (record) => {
    try {
      const response = await deletePModuleConfig({ id: record.id });
      if (response.code === 0 || response.code === 200) {
        message.success('删除成功');
        // 从列表中移除该记录
        setDataSource(dataSource.filter(item => item.id !== record.id));
      } else {
        message.error(response.msg || '删除失败');
      }
    } catch (error) {
      console.error('删除失败:', error);
      message.error('删除失败，请稍后重试');
    }
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      // 从 values 中提取 orderNo（条目级别字段），剩余的放入 content
      const { orderNo, ...contentValues } = values;

      let response;
      if (editingRecord) {
        // 编辑模式：调用更新接口
        console.log('[ListConfigContent] 更新记录，记录ID:', editingRecord.id);
        response = await updatePModuleConfig({
          id: editingRecord.id,
          configId: ruleConfig.id,
          configCode: ruleConfig.code,
          orderNo: orderNo || 0,
          content: JSON.stringify(contentValues),
        });
      } else {
        // 新增模式：调用新增接口
        console.log('[ListConfigContent] 新增记录');
        response = await savePModuleConfig({
          configId: ruleConfig.id,
          configCode: ruleConfig.code,
          orderNo: orderNo || 0,
          content: JSON.stringify(contentValues),
          state: 1,
        });
      }

      if (response.code === 0 || response.code === 200) {
        message.success(editingRecord ? '更新成功' : '添加成功');
        setModalVisible(false);
        form.resetFields();
        setEditingRecord(null);

        // 重新加载列表数据
        const reloadResponse = await getPModuleConfigList({
          pageNum: 1,
          pageSize: 1000,
          searchParam: JSON.stringify({ SEARCH_EQ_configId: ruleConfig.id })
        });

        if ((reloadResponse.code === 0 || reloadResponse.code === 200) && reloadResponse.data) {
          const list = reloadResponse.data?.records || reloadResponse.data?.list || reloadResponse.data || [];
          const parsedList = list.map(item => {
            try {
              const contentObj = typeof item.content === 'string' ? JSON.parse(item.content) : item.content;
              return {
                ...item,
                ...contentObj,
                key: item.id,
              };
            } catch {
              return {
                ...item,
                key: item.id,
              };
            }
          });
          setDataSource(parsedList);
        }
      } else {
        message.error(response.msg || '操作失败');
      }
    } catch (error) {
      console.error('表单验证失败:', error);
      message.error('操作失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button type="primary" onClick={handleAdd}>
          添加记录
        </Button>
      </div>

      <Spin spinning={loading} tip="加载配置数据...">
        <Table
          columns={columns}
          dataSource={dataSource}
          rowKey="key"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          scroll={{ x: 'max-content' }}
        />
      </Spin>

      <Modal
        title={editingRecord ? '编辑记录' : '添加记录'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          setEditingRecord(null);
          form.resetFields();
        }}
        confirmLoading={submitting}
        width={800}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          preserve={false}
        >
          <Form.Item
            name="orderNo"
            label="排序号码"
            rules={[{ required: true, message: '请输入排序号码' }]}
            initialValue={1}
          >
            <InputNumber
              min={0}
              max={999999}
              style={{ width: '100%' }}
              placeholder="请输入排序号码，数字越小越靠前"
            />
          </Form.Item>
          <SchemaRenderer schema={schema} form={form} wrapWithForm={false} />
        </Form>
      </Modal>
    </div>
  );
};

export default ListConfigContent;
