import React, { useState } from 'react';
import { message, Tag, Form, Input, InputNumber, Select, Button, Modal } from 'antd';
import CmBasePage from '@components/CmBasePage';
import SysDicValueList from './components/sysDicValueList';
import { listType, addType, updateType, delType, refreshCache } from '@api/modules/dictType';
import { EditOutlined, DeleteOutlined, SettingOutlined, ReloadOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

/**
 * 字典类型管理页面
 * 功能：字典类型的增删改查，以及字典数据维护
 */
const DictPage = () => {
  const [form] = Form.useForm();
  const [formVisible, setFormVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [valueModalVisible, setValueModalVisible] = useState(false);
  const [currentDict, setCurrentDict] = useState(null);

  /**
   * 刷新表格
   */
  const refreshTable = () => {
    document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
      new CustomEvent('reload')
    );
  };

  /**
   * 新增
   */
  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({ status: '0' });
    setFormVisible(true);
  };

  /**
   * 编辑
   */
  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setFormVisible(true);
  };

  /**
   * 删除
   */
  const handleDelete = async (record) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除字典"${record.dictName}"吗？`,
      onOk: async () => {
        try {
          const response = await delType(record.dictId);
          if (response.code === 0 || response.code === 200) {
            message.success('删除成功');
            refreshTable();
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
   * 刷新缓存
   */
  const handleRefreshCache = async () => {
    try {
      const response = await refreshCache();
      if (response.code === 0 || response.code === 200) {
        message.success('刷新缓存成功');
      } else {
        message.error(response.msg || '刷新缓存失败');
      }
    } catch (error) {
      message.error('刷新缓存失败: ' + error.message);
    }
  };

  /**
   * 提交表单
   */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const response = editingRecord
        ? await updateType(values)
        : await addType(values);

      if (response.code === 0 || response.code === 200) {
        message.success(editingRecord ? '修改成功' : '新增成功');
        setFormVisible(false);
        refreshTable();
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
   * 打开数据维护
   */
  const handleValueMaintain = (record) => {
    setCurrentDict(record);
    setValueModalVisible(true);
  };

  /**
   * 数据加载
   */
  const loadData = async (params) => {
    try {
      const requestParams = {
        pageNum: params.current || 1,
        pageSize: params.pageSize || 10,
        ...params
      };

      const response = await listType(requestParams);

      if (response.code === 0 || response.code === 200) {
        return {
          data: response.rows || [],
          success: true,
          total: response.total || 0
        };
      } else {
        message.error(response.msg || '获取数据失败');
        return {
          data: [],
          success: false,
          total: 0
        };
      }
    } catch (error) {
      message.error('获取数据失败: ' + error.message);
      return {
        data: [],
        success: false,
        total: 0
      };
    }
  };

  // 列配置
  const columns = [
    {
      title: '字典编号',
      dataIndex: 'dictId',
      key: 'dictId',
      width: 100
    },
    {
      title: '字典名称',
      dataIndex: 'dictName',
      key: 'dictName',
      width: 200
    },
    {
      title: '字典类型',
      dataIndex: 'dictType',
      key: 'dictType',
      width: 200,
      render: (text, record) => (
        <Button
          type="link"
          onClick={() => handleValueMaintain(record)}
          style={{ padding: 0 }}
        >
          {text}
        </Button>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === '0' ? 'green' : 'red'}>
          {status === '0' ? '正常' : '停用'}
        </Tag>
      )
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 200,
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
      width: 250,
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
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
          <Button
            type="link"
            size="small"
            icon={<SettingOutlined />}
            onClick={() => handleValueMaintain(record)}
          >
            数据维护
          </Button>
        </>
      )
    }
  ];

  // 搜索字段配置
  const searchFieldList = [
    {
      title: '字典名称',
      dataIndex: 'dictName',
      key: 'SEARCH_LIKE_dictName',
      type: 'text'
    },
    {
      title: '字典类型',
      dataIndex: 'dictType',
      key: 'SEARCH_LIKE_dictType',
      type: 'text'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'SEARCH_EQ_status',
      type: 'select',
      options: [
        { label: '正常', value: '0' },
        { label: '停用', value: '1' }
      ]
    }
  ];

  // 工具栏额外按钮
  const toolBarExtraButtons = [
    <Button
      key="refreshCache"
      icon={<ReloadOutlined />}
      onClick={handleRefreshCache}
    >
      刷新缓存
    </Button>
  ];

  return (
    <div>
      <CmBasePage
        columns={columns}
        onLoadData={loadData}
        searchFieldList={searchFieldList}
        toolBarExtraButtons={toolBarExtraButtons}
        onAdd={handleAdd}
        rowKey="dictId"
      />

      {/* 新增/编辑表单 */}
      <Modal
        title={editingRecord ? '修改字典类型' : '新增字典类型'}
        open={formVisible}
        onCancel={() => setFormVisible(false)}
        onOk={handleSubmit}
        confirmLoading={loading}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          preserve={false}
        >
          <Form.Item
            name="dictName"
            label="字典名称"
            rules={[{ required: true, message: '请输入字典名称' }]}
          >
            <Input placeholder="请输入字典名称" />
          </Form.Item>

          <Form.Item
            name="dictType"
            label="字典类型"
            rules={[{ required: true, message: '请输入字典类型' }]}
          >
            <Input placeholder="请输入字典类型" disabled={!!editingRecord} />
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
            name="remark"
            label="备注"
          >
            <TextArea rows={3} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 字典数据维护 */}
      <SysDicValueList
        visible={valueModalVisible}
        dictType={currentDict?.dictType}
        dictId={currentDict?.dictId}
        onClose={() => setValueModalVisible(false)}
      />
    </div>
  );
};

export default DictPage;
