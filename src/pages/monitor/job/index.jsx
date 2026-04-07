import React, { useState } from 'react';
import { message, Tag, Button, Popconfirm, Form, Input, Radio, Select, Space, Tooltip, Modal, Switch } from 'antd';
import { QuestionCircleOutlined, PlayCircleOutlined, ClockCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import CmBasePage from '@components/CmBasePage';
import DataForm from '@components/DataForm';
import { getJobList, saveJob, updateJob, deleteJob, changeJobStatus, runJob } from '@api';

/**
 * 定时任务管理页面
 */
const JobPage = () => {
  // 1. 状态管理（按固定顺序）
  const [formVisible, setFormVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewVisible, setViewVisible] = useState(false);
  const [viewRecord, setViewRecord] = useState(null);

  // 2. 列配置
  const columns = [
    {
      title: '任务编号',
      dataIndex: 'jobId',
      key: 'jobId',
      width: 100,
      sorter: true,
    },
    {
      title: '任务名称',
      dataIndex: 'jobName',
      key: 'jobName',
      width: 200,
      sorter: true,
    },
    {
      title: '任务组名',
      dataIndex: 'jobGroup',
      key: 'jobGroup',
      width: 120,
      render: (jobGroup) => {
        const groupMap = {
          'DEFAULT': { color: 'blue', text: '默认' },
          'SYSTEM': { color: 'green', text: '系统' },
        };
        const groupInfo = groupMap[jobGroup] || { color: 'default', text: jobGroup };
        return <Tag color={groupInfo.color}>{groupInfo.text}</Tag>;
      },
    },
    {
      title: '调用目标字符串',
      dataIndex: 'invokeTarget',
      key: 'invokeTarget',
      width: 250,
      ellipsis: true,
    },
    {
      title: 'cron执行表达式',
      dataIndex: 'cronExpression',
      key: 'cronExpression',
      width: 150,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status, record) => {
        return (
          <Switch
            checked={status === '0'}
            onChange={(checked) => handleStatusChange(record, checked)}
            checkedChildren="启用"
            unCheckedChildren="停用"
          />
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
    },
  ];

  // 3. 搜索配置
  const searchFieldList = [
    {
      title: '任务名称',
      dataIndex: 'jobName',
      key: 'SEARCH_LIKE_jobName',
      type: 'text',
    },
    {
      title: '任务组名',
      dataIndex: 'jobGroup',
      key: 'SEARCH_EQ_jobGroup',
      type: 'select',
      options: [
        { label: '默认', value: 'DEFAULT' },
        { label: '系统', value: 'SYSTEM' }
      ]
    },
    {
      title: '任务状态',
      dataIndex: 'status',
      key: 'SEARCH_EQ_status',
      type: 'select',
      options: [
        { label: '启用', value: '0' },
        { label: '停用', value: '1' }
      ]
    },
  ];

  // 4. 事件处理
  /**
   * 新增任务
   */
  const handleAdd = () => {
    setEditingRecord(null);
    setFormVisible(true);
  };

  /**
   * 编辑任务
   */
  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormVisible(true);
  };

  /**
   * 查看任务详情
   */
  const handleView = (record) => {
    setViewRecord(record);
    setViewVisible(true);
  };

  /**
   * 删除任务
   */
  const handleDelete = async (record) => {
    try {
      const response = await deleteJob(record.jobId);
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

  /**
   * 修改任务状态
   */
  const handleStatusChange = async (record, checked) => {
    const newStatus = checked ? '0' : '1';
    const statusText = checked ? '启用' : '停用';

    try {
      const response = await changeJobStatus({
        jobId: record.jobId,
        status: newStatus
      });
      if (response.code === 0 || response.code === 200) {
        message.success(`${statusText}成功`);
        refreshTable();
      } else {
        message.error(response.msg || `${statusText}失败`);
        // 如果失败，刷新表格以恢复原状态
        refreshTable();
      }
    } catch (error) {
      message.error(`${statusText}失败: ` + error.message);
      refreshTable();
    }
  };

  /**
   * 立即执行任务
   */
  const handleRun = async (record) => {
    Modal.confirm({
      title: '执行确认',
      content: `确认要立即执行一次"${record.jobName}"任务吗？`,
      onOk: async () => {
        try {
          const response = await runJob({
            jobId: record.jobId,
            jobGroup: record.jobGroup
          });
          if (response.code === 0 || response.code === 200) {
            message.success('执行成功');
          } else {
            message.error(response.msg || '执行失败');
          }
        } catch (error) {
          message.error('执行失败: ' + error.message);
        }
      },
    });
  };

  /**
   * 查看任务日志（跳转到日志页面）
   */
  const handleJobLog = (record) => {
    // 跳转到任务日志页面，传递任务ID
    message.info('跳转到任务日志页面，任务ID: ' + record.jobId);
    // TODO: 实现跳转到日志页面的逻辑
    // navigate('/system/job-log/' + record.jobId);
  };

  /**
   * 提交表单
   */
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = editingRecord
        ? await updateJob(values)
        : await saveJob(values);

      if (response.code === 0 || response.code === 200) {
        message.success(editingRecord ? '更新成功' : '创建成功');
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

  /**
   * 刷新表格
   */
  const refreshTable = () => {
    document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
      new CustomEvent('reload')
    );
  };

  /**
   * 自定义操作列渲染
   */
  const renderActionButtons = (record) => {
    return (
      <Space size="small">
        <Button
          type="link"
          size="small"
          icon={<PlayCircleOutlined />}
          onClick={() => handleRun(record)}
        >
          执行一次
        </Button>
        <Button
          type="link"
          size="small"
          icon={<FileTextOutlined />}
          onClick={() => handleJobLog(record)}
        >
          日志
        </Button>
      </Space>
    );
  };

  // 5. 渲染
  return (
    <div>
      <CmBasePage
        columns={columns}
        apiEndpoint="/monitor/job/list"
        apiMethod="get"
        searchFieldList={searchFieldList}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        rowKey="jobId"
        actionButtons={{
          view: true,
          edit: true,
          delete: true,
        }}
        renderCustomActions={renderActionButtons}
        toolBarExtraButtons={[
          <Button
            key="jobLog"
            icon={<ClockCircleOutlined />}
            onClick={() => handleJobLog({ jobId: 0 })}
          >
            日志
          </Button>
        ]}
      />

      {/* 新增/编辑表单 */}
      <DataForm
        visible={formVisible}
        title={editingRecord ? '编辑定时任务' : '新增定时任务'}
        initialValues={editingRecord || {
          misfirePolicy: '1',
          concurrent: '1',
          status: '0',
          jobGroup: 'DEFAULT'
        }}
        extraValues={{ jobId: editingRecord?.jobId }}
        onCancel={() => setFormVisible(false)}
        onSubmit={handleSubmit}
        onClosed={() => setEditingRecord(null)}
        loading={loading}
        formType="modal"
        width={800}
      >
        <Form.Item
          name="jobName"
          label="任务名称"
          rules={[{ required: true, message: '请输入任务名称' }]}
        >
          <Input placeholder="请输入任务名称" />
        </Form.Item>

        <Form.Item
          name="jobGroup"
          label="任务分组"
          rules={[{ required: true, message: '请选择任务分组' }]}
        >
          <Select placeholder="请选择任务分组">
            <Select.Option value="DEFAULT">默认</Select.Option>
            <Select.Option value="SYSTEM">系统</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="invokeTarget"
          label={
            <span>
              调用方法
              <Tooltip title={
                <div>
                  Bean调用示例：ryTask.ryParams('ry')<br/>
                  Class类调用示例：com.ruoyi.quartz.task.RyTask.ryParams('ry')<br/>
                  参数说明：支持字符串，布尔类型，长整型，浮点型，整型
                </div>
              }>
                <QuestionCircleOutlined style={{ marginLeft: 4 }} />
              </Tooltip>
            </span>
          }
          rules={[{ required: true, message: '请输入调用目标字符串' }]}
        >
          <Input placeholder="请输入调用目标字符串" />
        </Form.Item>

        <Form.Item
          name="cronExpression"
          label={
            <span>
              cron表达式
              <Tooltip title="例如: 0/5 * * * * ? 表示每5秒执行一次">
                <QuestionCircleOutlined style={{ marginLeft: 4 }} />
              </Tooltip>
            </span>
          }
          rules={[{ required: true, message: '请输入cron执行表达式' }]}
        >
          <Input
            placeholder="请输入cron执行表达式，如: 0/5 * * * * ?"
            addonAfter={
              <Button type="link" size="small" style={{ padding: 0 }}>
                生成表达式
              </Button>
            }
          />
        </Form.Item>

        <Form.Item
          name="misfirePolicy"
          label="执行策略"
          rules={[{ required: true, message: '请选择执行策略' }]}
        >
          <Radio.Group>
            <Radio.Button value="1">立即执行</Radio.Button>
            <Radio.Button value="2">执行一次</Radio.Button>
            <Radio.Button value="3">放弃执行</Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="concurrent"
          label="是否并发"
          rules={[{ required: true, message: '请选择是否允许并发' }]}
        >
          <Radio.Group>
            <Radio.Button value="0">允许</Radio.Button>
            <Radio.Button value="1">禁止</Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="status"
          label="状态"
          rules={[{ required: true, message: '请选择状态' }]}
        >
          <Radio.Group>
            <Radio value="0">启用</Radio>
            <Radio value="1">停用</Radio>
          </Radio.Group>
        </Form.Item>
      </DataForm>

      {/* 任务详情查看对话框 */}
      <Modal
        title="任务详细"
        open={viewVisible}
        onCancel={() => setViewVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewVisible(false)}>
            关闭
          </Button>
        ]}
        width={700}
      >
        {viewRecord && (
          <Form labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
            <Form.Item label="任务编号">{viewRecord.jobId}</Form.Item>
            <Form.Item label="任务名称">{viewRecord.jobName}</Form.Item>
            <Form.Item label="任务分组">
              {viewRecord.jobGroup === 'DEFAULT' ? '默认' : '系统'}
            </Form.Item>
            <Form.Item label="创建时间">{viewRecord.createTime}</Form.Item>
            <Form.Item label="cron表达式">{viewRecord.cronExpression}</Form.Item>
            <Form.Item label="下次执行时间">{viewRecord.nextValidTime}</Form.Item>
            <Form.Item label="调用目标方法">{viewRecord.invokeTarget}</Form.Item>
            <Form.Item label="任务状态">
              {viewRecord.status === '0' ? <Tag color="green">正常</Tag> : <Tag color="orange">停用</Tag>}
            </Form.Item>
            <Form.Item label="是否并发">
              {viewRecord.concurrent === '0' ? '允许' : '禁止'}
            </Form.Item>
            <Form.Item label="执行策略">
              {viewRecord.misfirePolicy === '1' ? '立即执行' :
               viewRecord.misfirePolicy === '2' ? '执行一次' :
               viewRecord.misfirePolicy === '3' ? '放弃执行' : '默认策略'}
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default JobPage;
