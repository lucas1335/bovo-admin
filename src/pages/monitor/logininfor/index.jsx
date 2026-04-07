import React, { useState, useRef } from 'react';
import { message, Tag, Modal, Descriptions, Button, Space } from 'antd';
import {
  EyeOutlined,
  DeleteOutlined,
  UnlockOutlined,
  ClearOutlined
} from '@ant-design/icons';
import CmBasePage from '@components/CmBasePage';
import {
  getLogininforList,
  deleteLogininfor,
  unlockLogininfor,
  cleanLogininfor
} from '@api';

/**
 * 登录日志管理页面
 * 功能：
 * - 登录日志列表展示
 * - 日志搜索功能（用户名、IP地址、状态、时间范围）
 * - 日志详情查看
 * - 删除单条日志
 * - 清空所有日志
 * - 解锁用户（如果用户被锁定）
 */
const LoginLogPage = () => {
  // 状态管理
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewRecord, setViewRecord] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const actionRef = useRef(null);

  /**
   * 查看日志详情
   * @param {Object} record - 日志记录
   */
  const handleView = (record) => {
    setViewRecord(record);
    setViewModalVisible(true);
  };

  /**
   * 删除登录日志
   * @param {Object} record - 日志记录
   */
  const handleDelete = async (record) => {
    try {
      const infoId = record.infoId || record.id;
      const response = await deleteLogininfor(infoId);
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
   * 清空所有登录日志
   */
  const handleClean = async () => {
    Modal.confirm({
      title: '清空确认',
      content: '是否确认清空所有登录日志数据？',
      okText: '确定',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const response = await cleanLogininfor();
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
   * 解锁用户
   * 当用户因多次登录失败被锁定时，可通过此功能解锁
   */
  const handleUnlock = async () => {
    if (selectedRows.length === 0) {
      message.warning('请选择要解锁的用户');
      return;
    }

    // 获取选中的用户名（可能有重复，需要去重）
    const userNames = [...new Set(selectedRows.map(row => row.userName || row.username))];

    if (userNames.length > 1) {
      message.warning('请只选择一个用户进行解锁');
      return;
    }

    const userName = userNames[0];

    Modal.confirm({
      title: '解锁确认',
      content: `是否确认解锁用户"${userName}"？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await unlockLogininfor(userName);
          if (response.code === 0 || response.code === 200) {
            message.success(`用户"${userName}"解锁成功`);
            refreshTable();
          } else {
            message.error(response.msg || '解锁失败');
          }
        } catch (error) {
          message.error('解锁失败: ' + error.message);
        }
      }
    });
  };

  /**
   * 批量删除选中的日志
   */
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的日志');
      return;
    }

    Modal.confirm({
      title: '批量删除确认',
      content: `是否确认删除选中的 ${selectedRowKeys.length} 条日志？`,
      okText: '确定',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          // 注意：根据实际API，可能需要循环删除或支持批量删除
          // 这里假设API支持批量删除（使用逗号分隔的ID）
          const infoIds = selectedRowKeys.join(',');
          const response = await deleteLogininfor(infoIds);
          if (response.code === 0 || response.code === 200) {
            message.success('删除成功');
            setSelectedRowKeys([]);
            setSelectedRows([]);
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
   * 刷新表格数据
   */
  const refreshTable = () => {
    if (actionRef.current) {
      actionRef.current.reload();
    }
  };

  /**
   * 表格行选择变化回调
   */
  const handleRowSelectionChange = (keys, rows) => {
    setSelectedRowKeys(keys);
    setSelectedRows(rows);
  };

  // 列配置
  const columns = [
    {
      title: '访问编号',
      dataIndex: 'infoId',
      key: 'infoId',
      width: 100,
      sorter: true,
    },
    {
      title: '用户名称',
      dataIndex: 'userName',
      key: 'userName',
      width: 120,
      sorter: true,
    },
    {
      title: '登录地址',
      dataIndex: 'ipaddr',
      key: 'ipaddr',
      width: 130,
      ellipsis: true,
    },
    {
      title: '登录地点',
      dataIndex: 'loginLocation',
      key: 'loginLocation',
      width: 150,
      ellipsis: true,
    },
    {
      title: '浏览器',
      dataIndex: 'browser',
      key: 'browser',
      width: 120,
      ellipsis: true,
    },
    {
      title: '操作系统',
      dataIndex: 'os',
      key: 'os',
      width: 120,
      ellipsis: true,
    },
    {
      title: '登录状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        // 状态映射：0-成功，1-失败
        const statusMap = {
          '0': { color: 'green', text: '成功' },
          '1': { color: 'red', text: '失败' },
        };
        const s = statusMap[status] || { color: 'default', text: '未知' };
        return <Tag color={s.color}>{s.text}</Tag>;
      },
    },
    {
      title: '操作信息',
      dataIndex: 'msg',
      key: 'msg',
      width: 200,
      ellipsis: true,
    },
    {
      title: '登录日期',
      dataIndex: 'loginTime',
      key: 'loginTime',
      width: 160,
      sorter: true,
    },
  ];

  // 搜索字段配置
  const searchFieldList = [
    {
      title: '登录地址',
      dataIndex: 'ipaddr',
      key: 'SEARCH_LIKE_ipaddr',
      type: 'text',
    },
    {
      title: '用户名称',
      dataIndex: 'userName',
      key: 'SEARCH_LIKE_userName',
      type: 'text',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'SEARCH_EQ_status',
      type: 'select',
      options: [
        { label: '成功', value: '0' },
        { label: '失败', value: '1' }
      ]
    },
    {
      title: '登录时间',
      dataIndex: 'loginTime',
      key: 'SEARCH_GTE_loginTime',
      type: 'date',
    },
  ];

  // 自定义工具栏按钮
  const toolBarExtraButtons = [
    <Button
      key="batchDelete"
      danger
      icon={<DeleteOutlined />}
      disabled={selectedRowKeys.length === 0}
      onClick={handleBatchDelete}
    >
      删除
    </Button>,
    <Button
      key="clean"
      danger
      icon={<ClearOutlined />}
      onClick={handleClean}
    >
      清空
    </Button>,
    <Button
      key="unlock"
      type="primary"
      icon={<UnlockOutlined />}
      disabled={selectedRows.length !== 1}
      onClick={handleUnlock}
    >
      解锁
    </Button>,
  ];

  return (
    <div style={{ textAlign: 'left' }}>
      <CmBasePage
        actionRef={actionRef}
        columns={columns}
        apiEndpoint="/monitor/logininfor/list"
        apiMethod="get"
        searchFieldList={searchFieldList}
        rowKey="infoId"
        actionButtons={{
          view: true,
          edit: false,
          delete: true,
        }}
        onView={handleView}
        onDelete={handleDelete}
        toolBarExtraButtons={toolBarExtraButtons}
        // 行选择配置
        rowSelection={{
          selectedRowKeys,
          onChange: handleRowSelectionChange,
        }}
        // 分页配置
        pagination={{
          defaultPageSize: 10,
          showQuickJumper: true,
          showSizeChanger: true,
          showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
        }}
      />

      {/* 查看详情模态框 */}
      <Modal
        title="登录日志详情"
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
          <Descriptions column={2} bordered>
            <Descriptions.Item label="访问编号">
              {viewRecord.infoId || viewRecord.id}
            </Descriptions.Item>
            <Descriptions.Item label="用户名称">
              {viewRecord.userName || viewRecord.username}
            </Descriptions.Item>
            <Descriptions.Item label="登录地址">
              {viewRecord.ipaddr}
            </Descriptions.Item>
            <Descriptions.Item label="登录地点">
              {viewRecord.loginLocation}
            </Descriptions.Item>
            <Descriptions.Item label="浏览器">
              {viewRecord.browser}
            </Descriptions.Item>
            <Descriptions.Item label="操作系统">
              {viewRecord.os}
            </Descriptions.Item>
            <Descriptions.Item label="登录状态">
              <Tag color={viewRecord.status === '0' ? 'green' : 'red'}>
                {viewRecord.status === '0' ? '成功' : '失败'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="登录日期">
              {viewRecord.loginTime}
            </Descriptions.Item>
            <Descriptions.Item label="操作信息" span={2}>
              {viewRecord.msg || '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default LoginLogPage;
