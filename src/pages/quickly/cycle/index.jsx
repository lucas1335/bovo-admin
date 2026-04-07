import React, { useState, useEffect } from 'react';
import { message, Form, Input, InputNumber, Radio, Modal, Tag } from 'antd';
import { useParams } from 'react-router-dom';
import CmBasePage from '@components/CmBasePage';
import DataForm from '@components/DataForm';
import {
  getQuicklyCycleList,
  getQuicklyCycleDetail,
  saveQuicklyCycle,
  updateQuicklyCycle,
  deleteQuicklyCycle
} from '@api';

/**
 * 秒合约币种周期配置页面
 * 功能：周期配置列表展示、搜索、新增、编辑、删除
 */
const CyclePage = () => {
  // 1. 获取路由参数
  const params = useParams();
  const secondId = params.id;
  const coin = params.coin || '';

  // 2. 状态管理
  const [formVisible, setFormVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);

  // 3. 验证周期（环境相关）
  const checkPeriod = async (rule, value) => {
    const env = process.env.REACT_APP_ENV || 'production';
    if (['coolcoinex', 'dev'].includes(env)) {
      if (value >= 3600 && value % 3600 !== 0) {
        return Promise.reject(new Error('请输入3600的倍数'));
      }
    }
    return Promise.resolve();
  };

  // 4. 事件处理
  const handleAdd = () => {
    setEditingRecord({
      flag: true
    });
    setFormVisible(true);
  };

  const handleEdit = async (record) => {
    try {
      const response = await getQuicklyCycleDetail(record.id);
      if (response.code === 0 || response.code === 200) {
        setEditingRecord(response.data);
        setFormVisible(true);
      }
    } catch (error) {
      message.error('获取详情失败');
    }
  };

  const handleDelete = async (record) => {
    try {
      const response = await deleteQuicklyCycle(record.id);
      if (response.code === 0 || response.code === 200) {
        message.success('删除成功');
        refreshTable();
      } else {
        message.error(response.msg || '删除失败');
      }
    } catch (error) {
      message.error('删除失败: ' + error.message);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      let submitData = {
        ...values,
        secondId: secondId
      };

      const response = editingRecord?.id
        ? await updateQuicklyCycle(submitData)
        : await saveQuicklyCycle(submitData);

      if (response.code === 0 || response.code === 200) {
        message.success(editingRecord?.id ? '修改成功' : '新增成功');
        setFormVisible(false);
        refreshTable();
      } else {
        message.error(response.msg || '操作失败');
      }
    } catch (error) {
      message.error('操作失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshTable = () => {
    document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
      new CustomEvent('reload')
    );
  };

  // 5. 赔偿方式映射
  const flagMap = {
    true: { color: 'orange', text: '本金全输' },
    false: { color: 'default', text: '本金按比例输' },
  };

  // 6. 列配置
  const columns = [
    {
      title: '币种',
      key: 'coin',
      width: 100,
      render: () => <span>{coin || '-'}</span>
    },
    {
      title: '周期 (秒)',
      dataIndex: 'period',
      key: 'period',
      width: 100,
    },
    {
      title: '最大金额',
      dataIndex: 'maxAmount',
      key: 'maxAmount',
      width: 100,
    },
    {
      title: '最小金额',
      dataIndex: 'minAmount',
      key: 'minAmount',
      width: 100,
    },
    {
      title: '赔率',
      dataIndex: 'odds',
      key: 'odds',
      width: 80,
    },
    {
      title: '买入量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'flag',
      key: 'flag',
      width: 120,
      render: (flag) => {
        const item = flagMap[flag] || { color: 'default', text: '未知' };
        return <Tag color={item.color}>{item.text}</Tag>;
      }
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 150,
      ellipsis: true,
    },
  ];

  // 7. 搜索配置
  const searchFieldList = [
    {
      title: '周期 (秒)',
      dataIndex: 'period',
      key: 'SEARCH_EQ_period',
      type: 'text',
    },
    {
      title: '最大金额',
      dataIndex: 'maxAmount',
      key: 'SEARCH_EQ_maxAmount',
      type: 'text',
    },
    {
      title: '最小金额',
      dataIndex: 'minAmount',
      key: 'SEARCH_EQ_minAmount',
      type: 'text',
    },
  ];

  // 8. 渲染
  return (
    <div>
      <CmBasePage
        columns={columns}
        apiEndpoint="/contract/secondPeriod/list"
        apiMethod="get"
        searchFieldList={searchFieldList}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        actionButtons={{ edit: true, delete: true }}
        rowKey="id"
        extraParams={{ secondId }}
      />

      {/* 新增/编辑表单 */}
      <DataForm
        visible={formVisible}
        title={editingRecord?.id ? '修改周期配置' : '添加周期配置'}
        initialValues={editingRecord || {
          flag: true
        }}
        extraValues={{ id: editingRecord?.id }}
        onCancel={() => setFormVisible(false)}
        onSubmit={handleSubmit}
        onClosed={() => {
          setEditingRecord(null);
        }}
        loading={loading}
        formType="modal"
        width={500}
      >
        <Form.Item
          name="period"
          label="周期 (秒)"
          rules={[
            { required: true, message: '请输入周期' },
            { validator: checkPeriod }
          ]}
        >
          <InputNumber
            placeholder="请输入时间周期，单位：秒"
            min={0}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          name="minAmount"
          label="最小金额"
          rules={[{ required: true, message: '请输入最小金额' }]}
        >
          <InputNumber
            placeholder="请输入最小金额"
            min={0}
            precision={2}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          name="maxAmount"
          label="最大金额"
          rules={[{ required: true, message: '请输入最大金额' }]}
        >
          <InputNumber
            placeholder="请输入最大金额"
            min={0}
            precision={2}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          name="odds"
          label="赔率"
        >
          <InputNumber
            placeholder="请输入赔率"
            min={0}
            max={1}
            step={0.01}
            precision={2}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          name="quantity"
          label="买入量"
          rules={[{ required: true, message: '请输入买入量' }]}
        >
          <Input placeholder="请输入买入量" />
        </Form.Item>

        <Form.Item
          name="flag"
          label="赔偿方式"
          rules={[{ required: true, message: '请选择赔偿方式' }]}
        >
          <Radio.Group>
            <Radio value={true}>本金全输</Radio>
            <Radio value={false}>本金按比例输</Radio>
          </Radio.Group>
        </Form.Item>
      </DataForm>
    </div>
  );
};

export default CyclePage;
