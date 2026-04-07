import React, { useState } from 'react';
import { message, Tag, Form, Input, Radio, Switch, DatePicker, InputNumber } from 'antd';
import dayjs from 'dayjs';
import CmBasePage from '@components/CmBasePage';
import DataForm from '@components/DataForm';
import CmUpload from '@components/CmUpload';
import CmEditor from '@components/CmEditor';
import CmImage from '@components/CmImage';
import { savePRecruitmentInfo, updatePRecruitmentInfo, deletePRecruitmentInfo, getPRecruitmentInfoList } from '@api';

const { TextArea } = Input;

/**
 * 招聘信息管理页面
 */
const JobListPage = () => {
  const [formVisible, setFormVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAdd = () => {
    setEditingRecord(null);
    setViewMode(false);
    setFormVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setViewMode(false);
    setFormVisible(true);
  };

  const handleView = (record) => {
    setEditingRecord(record);
    setViewMode(true);
    setFormVisible(true);
  };

  const handleDelete = async (record) => {
    try {
      const response = await deletePRecruitmentInfo({ id: record.id });
      if (response.code === 0 || response.code === 200) {
        message.success('删除成功');
        document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
          new CustomEvent('reload')
        );
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
      const response = editingRecord
        ? await updatePRecruitmentInfo(values)
        : await savePRecruitmentInfo(values);

      if (response.code === 0 || response.code === 200) {
        message.success(editingRecord ? '更新成功' : '创建成功');
        setFormVisible(false);
        document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
          new CustomEvent('reload')
        );
      } else {
        message.error(response.msg || '操作失败');
      }
    } catch (error) {
      message.error('操作失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '招聘岗位',
      dataIndex: 'positionName',
      key: 'positionName',
      width: 200,
    },
    {
      title: '招聘部门',
      dataIndex: 'department',
      key: 'department',
      width: 150,
    },
    {
      title: '招聘专业',
      dataIndex: 'major',
      key: 'major',
      width: 150,
    },
    {
      title: '招聘名额',
      dataIndex: 'quota',
      key: 'quota',
      width: 100,
    },
    {
      title: '学历要求',
      dataIndex: 'education',
      key: 'education',
      width: 120,
    },
    {
      title: '封面图',
      dataIndex: 'coverImage',
      key: 'coverImage',
      width: 120,
      render: (text) => <CmImage src={text} width={100} height={60} />,
    },
    {
      title: '招聘开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 180,
    },
    {
      title: '招聘结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 180,
    },
    {
      title: '状态',
      dataIndex: 'state',
      key: 'state',
      width: 100,
      render: (state) => {
        const stateMap = {
          '1': { text: '上架', color: 'success' },
          '0': { text: '下架', color: 'error' },
        };
        const s = stateMap[state] || { text: '未知', color: 'default' };
        return <Tag color={s.color}>{s.text}</Tag>;
      }
    },
    {
      title: '排序',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 80,
    },
    {
      title: '阅读量',
      dataIndex: 'readNum',
      key: 'readNum',
      width: 100,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
    },
  ];

  const searchFieldList = [
    {
      title: '招聘岗位',
      dataIndex: 'positionName',
      key: 'SEARCH_LIKE_positionName',
      type: 'text',
    },
    {
      title: '招聘部门',
      dataIndex: 'department',
      key: 'SEARCH_LIKE_department',
      type: 'text',
    },
    {
      title: '状态',
      dataIndex: 'state',
      key: 'SEARCH_EQ_state',
      type: 'select',
      options: [
        { label: '上架', value: '1' },
        { label: '下架', value: '0' }
      ]
    },
  ];

  // 自定义数据加载函数
  const loadData = async (params) => {
    try {
      const response = await getPRecruitmentInfoList(params);

      if (response.code === 0 || response.code === 200) {
        return {
          data: response.data?.records || response.data?.list || response.data || [],
          success: true,
          total: response.data?.total || 0
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

  return (
    <div style={{ textAlign: 'left' }}>
      <CmBasePage
        columns={columns}
        onLoadData={loadData}
        searchFieldList={searchFieldList}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        rowKey="id"
      />

      <DataForm
        visible={formVisible}
        title={viewMode ? '查看招聘信息' : (editingRecord ? '编辑招聘信息' : '新增招聘信息')}
        initialValues={editingRecord || {}}
        extraValues={{ id: editingRecord?.id }}
        onCancel={() => setFormVisible(false)}
        onSubmit={handleSubmit}
        onClosed={() => setEditingRecord(null)}
        loading={loading}
        formType="drawer"
        width="80%"
        disabled={viewMode}
      >
        <Form.Item
          name="department"
          label="招聘部门"
          rules={[{ required: true, message: '请输入招聘部门' }]}
        >
          <Input placeholder="请输入招聘部门" />
        </Form.Item>

        <Form.Item
          name="major"
          label="招聘专业"
          rules={[{ required: true, message: '请输入招聘专业' }]}
        >
          <Input placeholder="请输入招聘专业" />
        </Form.Item>

        <Form.Item
          name="quota"
          label="招聘名额"
          rules={[{ required: true, message: '请输入招聘名额' }]}
        >
          <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入招聘名额" />
        </Form.Item>

        <Form.Item
          name="education"
          label="学历要求"
          rules={[{ required: true, message: '请输入学历要求' }]}
        >
          <Input placeholder="请输入学历要求，如：本科、硕士、博士" />
        </Form.Item>

        <Form.Item
          name="positionName"
          label="岗位名称"
          rules={[{ required: true, message: '请输入岗位名称' }]}
        >
          <Input placeholder="请输入岗位名称" />
        </Form.Item>

        <Form.Item
          name="positionDescription"
          label="岗位描述"
        >
          <TextArea rows={4} placeholder="请输入岗位描述" />
        </Form.Item>

        <Form.Item
          name="positionRequirements"
          label="岗位需求"
        >
          <CmEditor height={300} />
        </Form.Item>

        <Form.Item
          name="salaryBenefits"
          label="招聘待遇"
        >
          <TextArea rows={4} placeholder="请输入招聘待遇" />
        </Form.Item>

        <Form.Item
          name="startTime"
          label="招聘开始时间"
          rules={[{ required: true, message: '请选择招聘开始时间' }]}
          getValueProps={(value) => ({ value: value ? dayjs(value) : null })}
          getValueFromEvent={(value) => value && value.format('YYYY-MM-DD HH:mm:ss')}
        >
          <DatePicker showTime style={{ width: '100%' }} format="YYYY-MM-DD HH:mm:ss" />
        </Form.Item>

        <Form.Item
          name="endTime"
          label="招聘结束时间"
          rules={[{ required: true, message: '请选择招聘结束时间' }]}
          getValueProps={(value) => ({ value: value ? dayjs(value) : null })}
          getValueFromEvent={(value) => value && value.format('YYYY-MM-DD HH:mm:ss')}
        >
          <DatePicker showTime style={{ width: '100%' }} format="YYYY-MM-DD HH:mm:ss" />
        </Form.Item>

        <Form.Item
          name="coverImage"
          label="封面图"
        >
          <CmUpload />
        </Form.Item>

        <Form.Item
          name="state"
          label="状态"
          rules={[{ required: true, message: '请选择状态' }]}
        >
          <Radio.Group>
            <Radio value={1}>上架</Radio>
            <Radio value={0}>下架</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="orderNo"
          label="排序号码"
          rules={[{ required: true, message: '请输入排序号码' }]}
        >
          <Input type="number" placeholder="请输入排序号码" />
        </Form.Item>

        <Form.Item
          name="remark"
          label="备注"
        >
          <TextArea rows={3} placeholder="请输入备注" />
        </Form.Item>
      </DataForm>
    </div>
  );
};

export default JobListPage;
