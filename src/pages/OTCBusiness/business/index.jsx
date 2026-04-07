/**
 * OTC业务管理页面
 *
 * 功能：管理OTC商户配置
 *
 * @author System
 * @date 2026-04-02
 */

import React, { useState } from 'react';
import { message, Form, Input, Tag, Popconfirm } from 'antd';
import CmBasePage from '@components/CmBasePage';
import DataForm from '@components/DataForm';
import {
  getOtcBusinessList,
  getOtcBusinessDetail,
  addOtcBusiness,
  updateOtcBusiness,
  deleteOtcBusiness,
  releaseOtcBusiness
} from '@api/modules/otcBusiness';

/** OTC业务管理页面 */
const OTCBusinessPage = () => {
  const [formVisible, setFormVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);

  // 刷新表格
  const refreshTable = () => {
    document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
      new CustomEvent('reload')
    );
  };

  // 新增按钮
  const handleAdd = () => {
    setEditingRecord(null);
    setFormVisible(true);
  };

  // 编辑按钮
  const handleEdit = async (record) => {
    try {
      const response = await getOtcBusinessDetail(record.id);
      if (response.code === 0 || response.code === 200) {
        setEditingRecord(response.data);
        setFormVisible(true);
      } else {
        message.error(response.msg || '获取详情失败');
      }
    } catch (error) {
      message.error('获取详情失败: ' + error.message);
    }
  };

  // 删除按钮
  const handleDelete = async (record) => {
    try {
      const response = await deleteOtcBusiness(record.id);
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

  // 发布按钮
  const handleRelease = async (record) => {
    try {
      const response = await releaseOtcBusiness(record.id);
      if (response.code === 0 || response.code === 200) {
        message.success('发布成功');
        refreshTable();
      } else {
        message.error(response.msg || '发布失败');
      }
    } catch (error) {
      message.error('发布失败: ' + error.message);
    }
  };

  // 跳转购买
  const handleBuy = (record) => {
    const url = 'https://' + record.buyUrl + '?id=' + record.id;
    window.open(url, '_blank');
  };

  // 提交表单
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const submitData = {
        ...values,
        price: values.price ? Number(values.price) : 0,
        num: values.num ? Number(values.num) : 0,
        limitNum: values.limitNum ? Number(values.limitNum) : 0,
        dealNum: values.dealNum ? Number(values.dealNum) : 0,
        dealRate: values.dealRate ? Number(values.dealRate) : 0,
      };

      let response;
      if (editingRecord && editingRecord.id) {
        response = await updateOtcBusiness({ ...submitData, id: editingRecord.id });
      } else {
        response = await addOtcBusiness(submitData);
      }

      if (response.code === 0 || response.code === 200) {
        message.success(editingRecord ? '修改成功' : '新增成功');
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

  // 表格列配置
  const columns = [
    {
      title: '编号',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      align: 'center',
    },
    {
      title: '商家名称',
      dataIndex: 'otcName',
      key: 'otcName',
      width: 150,
      align: 'center',
    },
    {
      title: '单价',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      align: 'center',
    },
    {
      title: '数量/限额',
      key: 'numLimit',
      width: 150,
      align: 'center',
      render: (_, record) => (
        <span>{record.num}/{record.limitNum}</span>
      ),
    },
    {
      title: '购买链接',
      dataIndex: 'buyUrl',
      key: 'buyUrl',
      width: 200,
      align: 'center',
      render: (buyUrl, record) => (
        <span
          style={{ color: '#1890ff', cursor: 'pointer' }}
          onClick={() => handleBuy(record)}
        >
          {buyUrl}
        </span>
      ),
    },
    {
      title: '成交单数',
      dataIndex: 'dealNum',
      key: 'dealNum',
      width: 100,
      align: 'center',
    },
    {
      title: '成交率',
      dataIndex: 'dealRate',
      key: 'dealRate',
      width: 100,
      align: 'center',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status) => (
        <Tag color={status == '1' ? 'success' : 'default'}>
          {status == '1' ? '已发布' : '未发布'}
        </Tag>
      ),
    },
  ];

  // 搜索配置
  const searchFieldList = [
    {
      title: '商家名称',
      dataIndex: 'otcName',
      key: 'SEARCH_LIKE_otcName',
      type: 'text',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      type: 'select',
      options: [
        { label: '未发布', value: '0' },
        { label: '已发布', value: '1' },
      ],
    },
  ];

  return (
    <div>
      <CmBasePage
        columns={columns}
        apiEndpoint="/system/otc/list"
        apiMethod="get"
        searchFieldList={searchFieldList}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        rowKey="id"
        actionButtons={{
          view: false,
          edit: true,
          delete: true,
        }}
        renderAction={(record) => (
          record.status != '1' && (
            <Popconfirm
              title="确认发布"
              description={`是否发布商户编号为"${record.id}"的数据项？`}
              onConfirm={() => handleRelease(record)}
              okText="确认"
              cancelText="取消"
            >
              <button style={{ border: 'none', background: 'none', color: '#52c41a', cursor: 'pointer' }}>
                发布
              </button>
            </Popconfirm>
          )
        )}
      />

      <DataForm
        visible={formVisible}
        title={editingRecord ? '修改OTC商家' : '新增OTC商家'}
        initialValues={editingRecord || {}}
        onCancel={() => setFormVisible(false)}
        onSubmit={handleSubmit}
        onClosed={() => setEditingRecord(null)}
        loading={loading}
        formType="modal"
        width="500px"
      >
        <Form.Item
          name="otcName"
          label="商家名称"
          rules={[{ required: true, message: '商家名称不能为空' }]}
        >
          <Input placeholder="请输入商家名称" />
        </Form.Item>

        <Form.Item
          name="price"
          label="单价"
          rules={[{ required: true, message: '单价不能为空' }]}
        >
          <Input placeholder="请输入单价" />
        </Form.Item>

        <Form.Item
          name="num"
          label="数量"
          rules={[{ required: true, message: '数量不能为空' }]}
        >
          <Input placeholder="请输入数量" />
        </Form.Item>

        <Form.Item
          name="limitNum"
          label="限额"
          rules={[{ required: true, message: '限额不能为空' }]}
        >
          <Input placeholder="请输入限额" />
        </Form.Item>

        <Form.Item
          name="buyUrl"
          label="购买链接"
          rules={[{ required: true, message: '购买链接不能为空' }]}
        >
          <Input placeholder="请输入购买链接" />
        </Form.Item>

        <Form.Item
          name="dealNum"
          label="成交单数"
          rules={[{ required: true, message: '成交单数不能为空' }]}
        >
          <Input placeholder="请输入成交单数" />
        </Form.Item>

        <Form.Item
          name="dealRate"
          label="成交率"
          rules={[{ required: true, message: '成交率不能为空' }]}
        >
          <Input placeholder="请输入成交率" />
        </Form.Item>
      </DataForm>
    </div>
  );
};

export default OTCBusinessPage;
