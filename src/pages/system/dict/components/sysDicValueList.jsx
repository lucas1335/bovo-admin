import React, { useState, useEffect } from 'react';
import { message, Tag, Form, Input, InputNumber, Select, Button, Modal, Table } from 'antd';
import { listData, getData, delData, addData, updateData } from '@api/modules/dictData';
import { optionselect as getDictOptionselect } from '@api/modules/dictType';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

/**
 * 字典数据管理组件
 * 用于在字典管理页面中管理字典数据
 */
const SysDicValueList = ({ visible, dictType, dictId, onClose }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dataList, setDataList] = useState([]);
  const [total, setTotal] = useState(0);
  const [dictOptions, setDictOptions] = useState([]); // 字典类型选项
  const [formVisible, setFormVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  // 回显样式选项
  const listClassOptions = [
    { value: 'default', label: '默认' },
    { value: 'primary', label: '主要' },
    { value: 'success', label: '成功' },
    { value: 'info', label: '信息' },
    { value: 'warning', label: '警告' },
    { value: 'danger', label: '危险' }
  ];

  /**
   * 加载字典数据列表
   */
  const loadData = async (page = 1, pageSize = 10) => {
    if (!dictType) return;

    setLoading(true);
    try {
      const response = await listData({
        dictType,
        pageNum: page,
        pageSize: pageSize
      });
      if (response.code === 0 || response.code === 200) {
        setDataList(response.rows || []);
        setTotal(response.total || 0);
        setPagination({ current: page, pageSize });
      }
    } catch (error) {
      message.error('获取字典数据失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 加载字典类型选项
   */
  const loadDictOptions = async () => {
    try {
      const response = await getDictOptionselect();
      if (response.code === 0 || response.code === 200) {
        setDictOptions(response.data || []);
      }
    } catch (error) {
      console.error('获取字典类型失败:', error);
    }
  };

  useEffect(() => {
    if (visible) {
      loadData(1, 10);
      loadDictOptions();
    }
  }, [visible, dictType]);

  /**
   * 新增
   */
  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({ dictType, status: '0', isDefault: 'N', listClass: 'default' });
    setFormVisible(true);
  };

  /**
   * 编辑
   */
  const handleEdit = async (record) => {
    try {
      const response = await getData(record.dictCode);
      if (response.code === 0 || response.code === 200) {
        setEditingRecord(response.data);
        form.setFieldsValue(response.data);
        setFormVisible(true);
      }
    } catch (error) {
      message.error('获取详情失败: ' + error.message);
    }
  };

  /**
   * 删除
   */
  const handleDelete = async (record) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除字典数据"${record.dictLabel}"吗？`,
      onOk: async () => {
        try {
          const response = await delData(record.dictCode);
          if (response.code === 0 || response.code === 200) {
            message.success('删除成功');
            loadData(pagination.current, pagination.pageSize);
          } else {
            message.error(response.msg || '删除失败');
          }
        } catch (error) {
          message.error('删除失败: ' + error.message);
        }
      }
    });
  };

  /**
   * 提交表单
   */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const response = editingRecord
        ? await updateData(values)
        : await addData(values);

      if (response.code === 0 || response.code === 200) {
        message.success(editingRecord ? '修改成功' : '新增成功');
        setFormVisible(false);
        loadData(pagination.current, pagination.pageSize);
      } else {
        message.error(response.msg || '操作失败');
      }
    } catch (error) {
      if (error.errorFields) {
        message.warning('请检查表单填写');
      } else {
        message.error('操作失败: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * 分页改变
   */
  const handleTableChange = (pagination) => {
    loadData(pagination.current, pagination.pageSize);
  };

  // 列配置
  const columns = [
    {
      title: '字典编码',
      dataIndex: 'dictCode',
      key: 'dictCode',
      width: 120
    },
    {
      title: '字典标签',
      dataIndex: 'dictLabel',
      key: 'dictLabel',
      width: 150,
      render: (text, record) => {
        const listClass = record.listClass;
        if (!listClass || listClass === 'default') {
          return text;
        }
        const colorMap = {
          primary: 'blue',
          success: 'green',
          info: 'cyan',
          warning: 'orange',
          danger: 'red'
        };
        return <Tag color={colorMap[listClass] || 'default'}>{text}</Tag>;
      }
    },
    {
      title: '字典键值',
      dataIndex: 'dictValue',
      key: 'dictValue',
      width: 120
    },
    {
      title: '字典排序',
      dataIndex: 'dictSort',
      key: 'dictSort',
      width: 100
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => (
        <Tag color={status === '0' ? 'green' : 'red'}>
          {status === '0' ? '正常' : '停用'}
        </Tag>
      )
    },
    {
      title: '是否默认',
      dataIndex: 'isDefault',
      key: 'isDefault',
      width: 100,
      render: (isDefault) => (
        <span>{isDefault === 'Y' ? '是' : '否'}</span>
      )
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 150,
      ellipsis: true
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            修改
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </>
      )
    }
  ];

  return (
    <Modal
      title={`字典数据维护 [${dictType}]`}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={1200}
      destroyOnClose
    >
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={dataList}
        loading={loading}
        rowKey="dictCode"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: total,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: handleTableChange
        }}
        scroll={{ x: 1200 }}
      />

      {/* 新增/编辑表单 */}
      <Modal
        title={editingRecord ? '修改字典数据' : '新增字典数据'}
        open={formVisible}
        onCancel={() => setFormVisible(false)}
        onOk={handleSubmit}
        confirmLoading={loading}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          preserve={false}
        >
          <Form.Item
            name="dictType"
            label="字典类型"
            rules={[{ required: true, message: '请选择字典类型' }]}
          >
            <Select placeholder="请选择字典类型">
              {dictOptions.map(item => (
                <Option key={item.dictId} value={item.dictType}>
                  {item.dictName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="dictLabel"
            label="字典标签"
            rules={[{ required: true, message: '请输入字典标签' }]}
          >
            <Input placeholder="请输入字典标签" />
          </Form.Item>

          <Form.Item
            name="dictValue"
            label="字典键值"
            rules={[{ required: true, message: '请输入字典键值' }]}
          >
            <Input placeholder="请输入字典键值" />
          </Form.Item>

          <Form.Item
            name="dictSort"
            label="字典排序"
            rules={[{ required: true, message: '请输入字典排序' }]}
          >
            <InputNumber min={0} placeholder="请输入字典排序" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="listClass"
            label="回显样式"
          >
            <Select placeholder="请选择回显样式">
              {listClassOptions.map(item => (
                <Option key={item.value} value={item.value}>
                  {item.label} ({item.value})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select>
              <Option value="0">正常</Option>
              <Option value="1">停用</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="isDefault"
            label="是否默认"
            rules={[{ required: true, message: '请选择是否默认' }]}
          >
            <Select>
              <Option value="Y">是</Option>
              <Option value="N">否</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="remark"
            label="备注"
          >
            <TextArea rows={3} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Modal>
  );
};

export default SysDicValueList;
