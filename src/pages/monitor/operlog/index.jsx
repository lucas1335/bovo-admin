import React, { useState } from 'react';
import { message, Tag, Modal, Descriptions } from 'antd';
import { DeleteOutlined, ClearOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import CmBasePage from '@components/CmBasePage';
import { deleteOperLog, cleanOperLog } from '@api';

/**
 * 操作日志管理页面
 * 功能：日志列表展示、日志搜索、日志详情查看、删除日志、清空日志
 */
const OperLogPage = () => {
  // 详情模态框状态
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewRecord, setViewRecord] = useState(null);

  /**
   * 查看日志详情
   */
  const handleView = (record) => {
    setViewRecord(record);
    setViewModalVisible(true);
  };

  /**
   * 删除单条日志
   */
  const handleDelete = async (record) => {
    try {
      const response = await deleteOperLog(record.operId);
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
   * 清空所有日志
   */
  const handleClean = async () => {
    Modal.confirm({
      title: '清空确认',
      content: '是否确认清空所有操作日志数据项？',
      okText: '确定',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const response = await cleanOperLog();
          if (response.code === 0 || response.code === 200) {
            message.success('清空成功');
            refreshTable();
          } else {
            message.error(response.msg || '清空失败');
          }
        } catch (error) {
          message.error('清空失败: ' + error.message);
        }
      }
    });
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
   * 操作类型字典翻译
   */
  const businessTypeMap = {
    0: { color: 'blue', text: '其它' },
    1: { color: 'green', text: '新增' },
    2: { color: 'orange', text: '修改' },
    3: { color: 'red', text: '删除' },
    4: { color: 'cyan', text: '授权' },
    5: { color: 'purple', text: '导出' },
    6: { color: 'magenta', text: '导入' },
    7: { color: 'geekblue', text: '强退' },
    8: { color: 'volcano', text: '生成代码' },
    9: { color: 'gold', text: '清空数据' }
  };

  /**
   * 操作状态字典翻译
   */
  const statusMap = {
    0: { color: 'green', text: '正常' },
    1: { color: 'red', text: '失败' }
  };

  /**
   * 表格列配置
   */
  const columns = [
    {
      title: '日志编号',
      dataIndex: 'operId',
      key: 'operId',
      width: 100,
      sorter: true,
    },
    {
      title: '系统模块',
      dataIndex: 'title',
      key: 'title',
      width: 150,
      ellipsis: true,
    },
    {
      title: '操作类型',
      dataIndex: 'businessType',
      key: 'businessType',
      width: 120,
      render: (businessType) => {
        const type = businessTypeMap[businessType] || { color: 'default', text: '未知' };
        return <Tag color={type.color}>{type.text}</Tag>;
      },
    },
    {
      title: '操作人员',
      dataIndex: 'operName',
      key: 'operName',
      width: 120,
      ellipsis: true,
      sorter: true,
    },
    {
      title: '操作地址',
      dataIndex: 'operIp',
      key: 'operIp',
      width: 140,
      ellipsis: true,
    },
    {
      title: '操作地点',
      dataIndex: 'operLocation',
      key: 'operLocation',
      width: 160,
      ellipsis: true,
    },
    {
      title: '操作状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const state = statusMap[status] || { color: 'default', text: '未知' };
        return <Tag color={state.color}>{state.text}</Tag>;
      },
    },
    {
      title: '操作日期',
      dataIndex: 'operTime',
      key: 'operTime',
      width: 180,
      sorter: true,
    },
    {
      title: '消耗时间',
      dataIndex: 'costTime',
      key: 'costTime',
      width: 120,
      render: (costTime) => `${costTime} 毫秒`,
      sorter: true,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          onClick={() => handleView(record)}
        >
          详细
        </Button>
      ),
    },
  ];

  /**
   * 搜索字段配置
   */
  const searchFieldList = [
    {
      title: '系统模块',
      dataIndex: 'title',
      key: 'SEARCH_LIKE_title',
      type: 'text',
    },
    {
      title: '操作人员',
      dataIndex: 'operName',
      key: 'SEARCH_LIKE_operName',
      type: 'text',
    },
    {
      title: '操作类型',
      dataIndex: 'businessType',
      key: 'SEARCH_EQ_businessType',
      type: 'select',
      options: [
        { label: '其它', value: 0 },
        { label: '新增', value: 1 },
        { label: '修改', value: 2 },
        { label: '删除', value: 3 },
        { label: '授权', value: 4 },
        { label: '导出', value: 5 },
        { label: '导入', value: 6 },
        { label: '强退', value: 7 },
        { label: '生成代码', value: 8 },
        { label: '清空数据', value: 9 }
      ]
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'SEARCH_EQ_status',
      type: 'select',
      options: [
        { label: '正常', value: 0 },
        { label: '失败', value: 1 }
      ]
    },
    {
      title: '操作时间',
      dataIndex: 'operTime',
      key: 'SEARCH_GTE_operTime',
      type: 'date',
    }
  ];

  /**
   * 工具栏额外按钮
   */
  const toolBarExtraButtons = [
    <Button
      key="clean"
      danger
      icon={<ClearOutlined />}
      onClick={handleClean}
    >
      清空
    </Button>
  ];

  return (
    <div style={{ textAlign: 'left' }}>
      <CmBasePage
        columns={columns}
        apiEndpoint="/monitor/operlog/list"
        apiMethod="get"
        searchFieldList={searchFieldList}
        rowKey="operId"
        actionButtons={{
          view: false,
          edit: false,
          delete: true,
        }}
        onDelete={handleDelete}
        toolBarExtraButtons={toolBarExtraButtons}
      />

      {/* 查看详情模态框 */}
      <Modal
        title="操作日志详细"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {viewRecord && (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="操作模块">
              {viewRecord.title} / {businessTypeMap[viewRecord.businessType]?.text || '未知'}
            </Descriptions.Item>
            <Descriptions.Item label="登录信息">
              {viewRecord.operName} / {viewRecord.operIp} / {viewRecord.operLocation}
            </Descriptions.Item>
            <Descriptions.Item label="请求地址" span={2}>
              {viewRecord.operUrl || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="请求方式">
              {viewRecord.requestMethod || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="消耗时间">
              {viewRecord.costTime} 毫秒
            </Descriptions.Item>
            <Descriptions.Item label="操作方法" span={2}>
              <div style={{ wordBreak: 'break-all', fontSize: '12px' }}>
                {viewRecord.method || '-'}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="请求参数" span={2}>
              <div style={{ maxHeight: 200, overflow: 'auto', wordBreak: 'break-all', whiteSpace: 'pre-wrap', fontSize: '12px' }}>
                {viewRecord.operParam || '-'}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="返回参数" span={2}>
              <div style={{ maxHeight: 200, overflow: 'auto', wordBreak: 'break-all', whiteSpace: 'pre-wrap', fontSize: '12px' }}>
                {viewRecord.jsonResult || '-'}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="操作状态">
              <Tag color={statusMap[viewRecord.status]?.color || 'default'}>
                {statusMap[viewRecord.status]?.text || '未知'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="操作时间">
              {viewRecord.operTime}
            </Descriptions.Item>
            {viewRecord.status === 1 && (
              <Descriptions.Item label="异常信息" span={2}>
                <div style={{ color: 'red', maxHeight: 150, overflow: 'auto', wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>
                  {viewRecord.errorMsg || '-'}
                </div>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default OperLogPage;
