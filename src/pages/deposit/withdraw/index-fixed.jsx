import React, { useState, useRef } from 'react';
import { message, Modal, Button, Tag, Space, Descriptions, Divider } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import CmBasePage from '@components/CmBasePage';
import DataForm from '@components/DataForm';
import {
  getWithdrawOrderList,
  lockWithdrawOrder,
  unlockWithdrawOrder,
  tryCheckWithdraw,
  passWithdrawOrder,
  rejectWithdrawOrder,
  getAllWithdrawAmount,
  getUserAllWithdrawAmount,
  rollBackWithdrawOrder,
  retryWithdrawOrder,
  batchRejectWithdrawOrder
} from '@api/modules/withdraw';

/**
 * 提现订单管理页面
 */
const WithdrawOrderPage = () => {
  // ==================== 状态管理 ====================
  const [detailVisible, setDetailVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [allUserTotalAmount, setAllUserTotalAmount] = useState(0);
  const actionRef = useRef();

  // ==================== 订单状态映射 ====================
  const statusMap = {
    1: { color: 'success', text: '待审核' },
    2: { color: 'error', text: '审核失败' },
    3: { color: 'processing', text: '审核中' },
    5: { color: 'success', text: '已完成' },
    7: { color: 'warning', text: '待锁定' },
    8: { color: 'orange', text: '已锁定' }
  };

  const orderTypeMap = {
    1: { color: 'blue', text: '提现' },
    2: { color: 'purple', text: '彩金' }
  };

  const userTypeMap = {
    0: { color: 'default', text: '正常用户' },
    1: { color: 'gold', text: '测试用户' }
  };

  // ==================== 列配置 ====================
  const columns = [
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 100,
      sorter: true
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 120,
      sorter: true
    },
    {
      title: '用户类型',
      dataIndex: 'isTest',
      key: 'isTest',
      width: 100,
      render: (isTest) => {
        const status = userTypeMap[isTest] || { color: 'default', text: '未知' };
        return <Tag color={status.color}>{status.text}</Tag>;
      }
    },
    {
      title: '提现地址',
      dataIndex: 'toAdress',
      key: 'toAdress',
      width: 200,
      ellipsis: true
    },
    {
      title: '提现金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      sorter: true,
      render: (amount) => <span style={{ fontWeight: 'bold', color: '#f50' }}>{amount}</span>
    },
    {
      title: '手续费',
      dataIndex: 'fee',
      key: 'fee',
      width: 100
    },
    {
      title: '实际金额',
      dataIndex: 'realAmount',
      key: 'realAmount',
      width: 120,
      render: (amount) => <span style={{ fontWeight: 'bold' }}>{amount}</span>
    },
    {
      title: '审核状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const state = statusMap[status] || { color: 'default', text: '未知' };
        return <Tag color={state.color}>{state.text}</Tag>;
      }
    },
    {
      title: '订单类型',
      dataIndex: 'orderType',
      key: 'orderType',
      width: 100,
      render: (orderType) => {
        const type = orderTypeMap[orderType] || { color: 'default', text: '未知' };
        return <Tag color={type.color}>{type.text}</Tag>;
      }
    },
    {
      title: '提现类型',
      dataIndex: 'type',
      key: 'type',
      width: 120
    },
    {
      title: '币种',
      dataIndex: 'coin',
      key: 'coin',
      width: 80
    },
    {
      title: '订单号',
      dataIndex: 'serialId',
      key: 'serialId',
      width: 180,
      ellipsis: true
    },
    {
      title: '提现时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      sorter: true
    },
    {
      title: '操作时间',
      dataIndex: 'operateTime',
      key: 'operateTime',
      width: 180,
      sorter: true
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 150,
      ellipsis: true
    },
    {
      title: '提现说明',
      dataIndex: 'withDrawRemark',
      key: 'withDrawRemark',
      width: 150,
      ellipsis: true
    }
  ];

  // ==================== 搜索配置 ====================
  const searchFieldList = [
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'SEARCH_EQ_userId',
      type: 'text'
    },
    {
      title: '提现地址',
      dataIndex: 'toAdress',
      key: 'SEARCH_LIKE_toAdress',
      type: 'text'
    },
    {
      title: '订单号',
      dataIndex: 'serialId',
      key: 'SEARCH_LIKE_serialId',
      type: 'text'
    },
    {
      title: '审核状态',
      dataIndex: 'status',
      key: 'SEARCH_EQ_status',
      type: 'select',
      options: [
        { label: '全部', value: '' },
        { label: '待审核', value: 1 },
        { label: '审核失败', value: 2 },
        { label: '审核中', value: 3 },
        { label: '已完成', value: 5 },
        { label: '待锁定', value: 7 },
        { label: '已锁定', value: 8 }
      ]
    },
    {
      title: '用户类型',
      dataIndex: 'isTest',
      key: 'SEARCH_EQ_isTest',
      type: 'select',
      options: [
        { label: '全部', value: '' },
        { label: '正常用户', value: 0 },
        { label: '测试用户', value: 1 }
      ]
    },
    {
      title: '订单类型',
      dataIndex: 'orderType',
      key: 'SEARCH_EQ_orderType',
      type: 'select',
      options: [
        { label: '全部', value: -1 },
        { label: '提现', value: 1 },
        { label: '彩金', value: 2 }
      ]
    },
    {
      title: '最小金额',
      dataIndex: 'minAmount',
      key: 'SEARCH_GTE_amount',
      type: 'digit'
    },
    {
      title: '最大金额',
      dataIndex: 'maxAmount',
      key: 'SEARCH_LTE_amount',
      type: 'digit'
    },
    {
      title: '创建时间-开始',
      dataIndex: 'beginTime',
      key: 'SEARCH_GTE_createTime',
      type: 'dateTime'
    },
    {
      title: '创建时间-结束',
      dataIndex: 'endTime',
      key: 'SEARCH_LTE_createTime',
      type: 'dateTime'
    }
  ];

  // ==================== 数据加载 ====================
  const loadData = async (params, sorter, filter) => {
    console.log('Loading withdrawal orders with params:', params);

    // 处理排序参数
    const sortParam = {};
    if (sorter && Object.keys(sorter).length > 0) {
      Object.keys(sorter).forEach(field => {
        if (sorter[field]) {
          sortParam[field] = sorter[field] === 'ascend';
        }
      });
    }

    // 构造请求参数
    const requestParams = {
      pageNum: params.current || 1,
      pageSize: params.pageSize || 10,
      ...sortParam
    };

    // 处理搜索参数
    if (params.searchParam) {
      try {
        const searchParam = JSON.parse(params.searchParam);
        Object.keys(searchParam).forEach(key => {
          if (searchParam[key] !== undefined && searchParam[key] !== null && searchParam[key] !== '') {
            // 映射搜索字段
            if (key === 'minAmount') {
              requestParam.searchParam = requestParam.searchParam || {};
              requestParam.searchParam.SEARCH_GTE_amount = searchParam[key];
            } else if (key === 'maxAmount') {
              requestParam.searchParam = requestParam.searchParam || {};
              requestParam.searchParam.SEARCH_LTE_amount = searchParam[key];
            } else if (key === 'beginTime') {
              requestParam.searchParam = requestParam.searchParam || {};
              requestParam.searchParam.SEARCH_GTE_createTime = searchParam[key];
            } else if (key === 'endTime') {
              requestParam.searchParam = requestParam.searchParam || {};
              requestParam.searchParam.SEARCH_LTE_createTime = searchParam[key];
            } else {
              requestParam[key] = searchParam[key];
            }
          }
        });
      } catch (e) {
        console.error('Failed to parse searchParam:', e);
      }
    }

    try {
      const response = await getWithdrawOrderList(requestParams);

      // 获取总提现金额统计
      fetchTotalAmount();

      return {
        data: response.data?.rows || response.data?.list || [],
        success: response.code === 0 || response.code === 200,
        total: response.data?.total || 0
      };
    } catch (error) {
      message.error('获取提现订单列表失败: ' + error.message);
      return {
        data: [],
        success: false,
        total: 0
      };
    }
  };

  // ==================== 获取统计数据 ====================
  const fetchTotalAmount = async () => {
    try {
      const [totalRes, allUserRes] = await Promise.all([
        getAllWithdrawAmount({ type: 2 }),
        getUserAllWithdrawAmount()
      ]);

      if (totalRes.code === 0 || totalRes.code === 200) {
        setTotalAmount(totalRes.data || 0);
      }

      if (allUserRes.code === 0 || allUserRes.code === 200) {
        setAllUserTotalAmount(allUserRes.data?.usdt || 0);
      }
    } catch (error) {
      console.error('Failed to fetch total amount:', error);
    }
  };

  // ==================== 刷新表格 ====================
  const refreshTable = () => {
    if (actionRef.current) {
      actionRef.current.reload();
    }
  };

  // ==================== 查看详情 ====================
  const handleView = (record) => {
    setEditingRecord({
      ...record,
      recentAddress: record.recentAddress ? record.recentAddress.replace(/,/g, '\n') : '',
      recentIps: record.recentIps ? record.recentIps.replace(/,/g, '\n') : ''
    });
    setDetailVisible(true);
  };

  // ==================== 锁定订单 ====================
  const handleLock = async (record) => {
    Modal.confirm({
      title: '确认锁定',
      icon: <ExclamationCircleOutlined />,
      content: `确定要锁定订单 "${record.serialId}" 吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await lockWithdrawOrder({
            id: record.id,
            toAdress: record.toAdress,
            remark: record.remark,
            withDrawRemark: record.withDrawRemark
          });

          if (response.code === 0 || response.code === 200) {
            message.success('锁定成功');
            refreshTable();
          } else {
            message.error(response.msg || '锁定失败');
          }
        } catch (error) {
          message.error('锁定失败: ' + error.message);
        }
      }
    });
  };

  // ==================== 解锁订单 ====================
  const handleUnlock = async (record) => {
    Modal.confirm({
      title: '确认解锁',
      icon: <ExclamationCircleOutlined />,
      content: `确定要解锁订单 "${record.serialId}" 吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await unlockWithdrawOrder({
            id: record.id,
            toAdress: record.toAdress,
            remark: record.remark,
            withDrawRemark: record.withDrawRemark
          });

          if (response.code === 0 || response.code === 200) {
            message.success('解锁成功');
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

  // ==================== 审核 ====================
  const handleReview = async (record) => {
    try {
      // 先检查是否可以审核
      const checkResponse = await tryCheckWithdraw({
        id: record.id,
        toAdress: record.toAdress,
        remark: record.remark,
        withDrawRemark: record.withDrawRemark
      });

      if (checkResponse.code !== 0 && checkResponse.code !== 200) {
        message.error(checkResponse.msg || '无法审核该订单');
        return;
      }

      // 显示详情并进行审核
      setEditingRecord({
        ...record,
        recentAddress: record.recentAddress ? record.recentAddress.replace(/,/g, '\n') : '',
        recentIps: record.recentIps ? record.recentIps.replace(/,/g, '\n') : ''
      });
      setDetailVisible(true);
    } catch (error) {
      message.error('审核检查失败: ' + error.message);
    }
  };

  // ==================== 审核通过 ====================
  const handlePass = async () => {
    Modal.confirm({
      title: '确认通过',
      icon: <ExclamationCircleOutlined />,
      content: `确定要通过订单 "${editingRecord.serialId}" 的审核吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        setLoading(true);
        try {
          const response = await passWithdrawOrder({
            id: editingRecord.id,
            toAdress: editingRecord.toAdress,
            remark: editingRecord.remark,
            withDrawRemark: editingRecord.withDrawRemark
          });

          if (response.code === 0 || response.code === 200) {
            message.success('审核通过成功');
            setDetailVisible(false);
            refreshTable();
          } else {
            message.error(response.msg || '审核通过失败');
          }
        } catch (error) {
          message.error('审核通过失败: ' + error.message);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // ==================== 审核拒绝 ====================
  const handleReject = async () => {
    Modal.confirm({
      title: '确认拒绝',
      icon: <ExclamationCircleOutlined />,
      content: `确定要拒绝订单 "${editingRecord.serialId}" 的审核吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        setLoading(true);
        try {
          const response = await rejectWithdrawOrder({
            id: editingRecord.id,
            toAdress: editingRecord.toAdress,
            remark: editingRecord.remark,
            withDrawRemark: editingRecord.withDrawRemark
          });

          if (response.code === 0 || response.code === 200) {
            message.success('拒绝成功');
            setDetailVisible(false);
            refreshTable();
          } else {
            message.error(response.msg || '拒绝失败');
          }
        } catch (error) {
          message.error('拒绝失败: ' + error.message);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // ==================== 回退用户 ====================
  const handleRollBack = async (record) => {
    let remark = '';

    Modal.confirm({
      title: '⚠️ 警告：此操作将回退用户提现订单，可能导致资产丢失！',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>订单号：{record.serialId}</p>
          <p>用户ID：{record.userId}</p>
          <p>提现金额：{record.amount}</p>
          <Divider />
          <p>请输入操作备注（必填，至少5个字符）：</p>
          <input
            type="text"
            placeholder="请输入回退原因或备注信息..."
            onChange={(e) => { remark = e.target.value; }}
            style={{ width: '100%', padding: '8px', border: '1px solid #d9d9d9', borderRadius: '4px' }}
          />
        </div>
      ),
      okText: '确认回退',
      cancelText: '取消',
      onOk: async () => {
        if (!remark || remark.trim().length < 5) {
          message.error('操作备注不能为空且至少需要5个字符！');
          return Promise.reject();
        }

        try {
          const response = await rollBackWithdrawOrder({
            id: record.id,
            remark: remark.trim()
          });

          if (response.code === 0 || response.code === 200) {
            message.success('回退用户操作成功');
            refreshTable();
          } else {
            message.error(response.msg || '回退失败');
          }
        } catch (error) {
          message.error('回退失败: ' + error.message);
          return Promise.reject();
        }
      }
    });
  };

  // ==================== 重新发起提现 ====================
  const handleRetry = async (record) => {
    let remark = '';

    Modal.confirm({
      title: '⚠️ 警告：此操作将重新发起提现请求，可能导致资产丢失！',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>订单号：{record.serialId}</p>
          <p>用户ID：{record.userId}</p>
          <p>提现金额：{record.amount}</p>
          <Divider />
          <p>请输入操作备注（必填，至少5个字符）：</p>
          <input
            type="text"
            placeholder="请输入重新发起原因或备注信息..."
            onChange={(e) => { remark = e.target.value; }}
            style={{ width: '100%', padding: '8px', border: '1px solid #d9d9d9', borderRadius: '4px' }}
          />
        </div>
      ),
      okText: '确认重新发起',
      cancelText: '取消',
      onOk: async () => {
        if (!remark || remark.trim().length < 5) {
          message.error('操作备注不能为空且至少需要5个字符！');
          return Promise.reject();
        }

        try {
          const response = await retryWithdrawOrder({
            id: record.id,
            remark: remark.trim()
          });

          if (response.code === 0 || response.code === 200) {
            message.success('重新发起提现操作成功');
            refreshTable();
          } else {
            message.error(response.msg || '重新发起失败');
          }
        } catch (error) {
          message.error('重新发起失败: ' + error.message);
          return Promise.reject();
        }
      }
    });
  };

  // ==================== 批量拒绝 ====================
  const handleBatchReject = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要拒绝的订单');
      return;
    }

    Modal.confirm({
      title: '确认批量拒绝',
      icon: <ExclamationCircleOutlined />,
      content: `确定要批量拒绝已选中的 ${selectedRowKeys.length} 条订单吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await batchRejectWithdrawOrder({ ids: selectedRowKeys });

          if (response.code === 0 || response.code === 200) {
            message.success('批量拒绝成功');
            setSelectedRowKeys([]);
            refreshTable();
          } else {
            message.error(response.msg || '批量拒绝失败');
          }
        } catch (error) {
          message.error('批量拒绝失败: ' + error.message);
        }
      }
    });
  };

  // ==================== 渲染操作按钮 ====================
  const renderActionButtons = (record) => {
    const status = record.status;

    // 待锁定状态 (7) - 显示锁定按钮
    if (status === 7) {
      return (
        <Button
          type="link"
          size="small"
          onClick={() => handleLock(record)}
          style={{ color: '#faad14' }}
        >
          锁定
        </Button>
      );
    }

    // 待审核或已完成状态 (1, 5) - 显示查看按钮
    if (status === 1 || status === 5) {
      return (
        <Button
          type="link"
          size="small"
          onClick={() => handleView(record)}
        >
          查看
        </Button>
      );
    }

    // 审核失败状态 (2) - 显示回退用户按钮
    if (status === 2) {
      return (
        <Button
          type="link"
          size="small"
          danger
          onClick={() => handleRollBack(record)}
        >
          回退用户
        </Button>
      );
    }

    // 审核中状态 (3) - 提示前往钱包后台审核
    if (status === 3) {
      return <span style={{ color: '#999' }}>请前往钱包后台审核</span>;
    }

    // 已锁定状态 (8) - 显示审核和解锁按钮
    if (status === 8) {
      return (
        <Space size="small">
          <Button
            type="link"
            size="small"
            onClick={() => handleReview(record)}
            style={{ color: '#52c41a' }}
          >
            审核或拒绝
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => handleUnlock(record)}
          >
            解锁
          </Button>
        </Space>
      );
    }

    return null;
  };

  // ==================== 工具栏额外按钮 ====================
  const toolBarExtraButtons = [
    <Button
      key="totalAmount"
      type="default"
      style={{ marginRight: 8 }}
    >
      总金额: {totalAmount}
    </Button>,
    <Button
      key="allUserTotalAmount"
      type="default"
      style={{ marginRight: 8 }}
    >
      所有用户总提现金额: {allUserTotalAmount}
    </Button>,
    <Button
      key="batchReject"
      type="primary"
      danger
      disabled={selectedRowKeys.length === 0}
      onClick={handleBatchReject}
    >
      批量拒绝
    </Button>
  ];

  // ==================== 渲染 ====================
  return (
    <div>
      <CmBasePage
        actionRef={actionRef}
        onLoadData={loadData}
        searchFieldList={searchFieldList}
        searchVisible={true}
        toolBarExtraButtons={toolBarExtraButtons}
        rowKey="id"
        actionButtons={{
          view: false,
          edit: false,
          delete: false
        }}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys)
        }}
        columns={[
          ...columns,
          {
            title: '操作',
            key: 'action',
            fixed: 'right',
            width: 200,
            render: (_, record) => renderActionButtons(record)
          }
        ]}
      />

      {/* 订单详情/审核弹窗 */}
      <DataForm
        visible={detailVisible}
        title={editingRecord?.status === 8 ? '审核订单' : '订单详情'}
        initialValues={editingRecord || {}}
        onCancel={() => setDetailVisible(false)}
        onClosed={() => setEditingRecord(null)}
        loading={loading}
        width={800}
        formType="modal"
        disabled={editingRecord?.status !== 8}
        footer={
          editingRecord?.status === 8 ? (
            <Space>
              <Button onClick={() => setDetailVisible(false)}>取消</Button>
              <Button danger onClick={handleReject}>拒绝</Button>
              <Button type="primary" onClick={handlePass}>通过</Button>
            </Space>
          ) : null
        }
      >
        <Descriptions column={2} bordered>
          <Descriptions.Item label="用户ID">{editingRecord?.userId}</Descriptions.Item>
          <Descriptions.Item label="用户名">{editingRecord?.username}</Descriptions.Item>
          <Descriptions.Item label="用户类型">
            {editingRecord?.isTest !== undefined && (
              <Tag color={userTypeMap[editingRecord.isTest]?.color || 'default'}>
                {userTypeMap[editingRecord.isTest]?.text || '未知'}
              </Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="提现地址" span={2}>{editingRecord?.toAdress}</Descriptions.Item>
          <Descriptions.Item label="提现金额">{editingRecord?.amount}</Descriptions.Item>
          <Descriptions.Item label="手续费">{editingRecord?.fee}</Descriptions.Item>
          <Descriptions.Item label="实际金额">{editingRecord?.realAmount}</Descriptions.Item>
          <Descriptions.Item label="币种">{editingRecord?.coin}</Descriptions.Item>
          <Descriptions.Item label="订单号" span={2}>{editingRecord?.serialId}</Descriptions.Item>
          <Descriptions.Item label="审核状态">
            {editingRecord?.status !== undefined && (
              <Tag color={statusMap[editingRecord.status]?.color || 'default'}>
                {statusMap[editingRecord.status]?.text || '未知'}
              </Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="订单类型">
            {editingRecord?.orderType !== undefined && (
              <Tag color={orderTypeMap[editingRecord.orderType]?.color || 'default'}>
                {orderTypeMap[editingRecord.orderType]?.text || '未知'}
              </Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="提现类型">{editingRecord?.type}</Descriptions.Item>
          <Descriptions.Item label="提现时间">{editingRecord?.createTime}</Descriptions.Item>
          <Descriptions.Item label="操作时间">{editingRecord?.operateTime}</Descriptions.Item>
          <Descriptions.Item label="用户创建时间">{editingRecord?.userCreateTime}</Descriptions.Item>
          <Descriptions.Item label="登录时间">{editingRecord?.userLoginTime}</Descriptions.Item>
          <Descriptions.Item label="最近三次提现地址" span={2}>
            <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{editingRecord?.recentAddress || '-'}</pre>
          </Descriptions.Item>
          <Descriptions.Item label="最近三次登录IP" span={2}>
            <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{editingRecord?.recentIps || '-'}</pre>
          </Descriptions.Item>
          <Descriptions.Item label="备注" span={2}>{editingRecord?.remark || '-'}</Descriptions.Item>
          <Descriptions.Item label="提现说明" span={2}>{editingRecord?.withDrawRemark || '-'}</Descriptions.Item>
        </Descriptions>
      </DataForm>
    </div>
  );
};

export default WithdrawOrderPage;
