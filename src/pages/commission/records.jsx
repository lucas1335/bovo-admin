import React, { useState } from 'react';
import { Card, Tabs, Tag, message } from 'antd';
import CmBasePage from '@components/CmBasePage';
import { getCommissionRecordList, getCommissionSettlementList } from '@api';
import './records.css';

/**
 * 佣金记录查询页面
 * 功能：
 * 1. 佣金记录列表
 * 2. 佣金结算记录列表
 */
const CommissionRecordsPage = () => {
  const [activeTab, setActiveTab] = useState('record');

  // 佣金类型映射
  const commissionTypeMap = {
    1: { color: 'blue', text: '充值返佣' },
    2: { color: 'green', text: '理财返佣' },
    3: { color: 'orange', text: '交易返佣' },
    4: { color: 'purple', text: '其他返佣' },
  };

  // 佣金状态映射
  const commissionStatusMap = {
    0: { color: 'default', text: '待结算' },
    1: { color: 'processing', text: '结算中' },
    2: { color: 'green', text: '已结算' },
    3: { color: 'red', text: '已失效' },
  };

  // 结算状态映射
  const settlementStatusMap = {
    0: { color: 'default', text: '待审核' },
    1: { color: 'processing', text: '审核中' },
    2: { color: 'green', text: '已通过' },
    3: { color: 'red', text: '已拒绝' },
  };

  /**
   * 佣金记录列表配置
   */
  const recordColumns = [
    {
      title: '用户名',
      dataIndex: 'userName',
      key: 'userName',
      width: 120,
      sorter: true,
    },
    {
      title: '用户手机号',
      dataIndex: 'userPhone',
      key: 'userPhone',
      width: 130,
    },
    {
      title: '佣金类型',
      dataIndex: 'commissionType',
      key: 'commissionType',
      width: 100,
      render: (type) => {
        const status = commissionTypeMap[type] || { color: 'default', text: '未知' };
        return <Tag color={status.color}>{status.text}</Tag>;
      },
    },
    {
      title: '佣金金额',
      dataIndex: 'commissionAmount',
      key: 'commissionAmount',
      width: 120,
      render: (amount) => `¥${(amount || 0).toFixed(2)}`,
      align: 'right',
    },
    {
      title: '返点比例（%）',
      dataIndex: 'ratio',
      key: 'ratio',
      width: 120,
      render: (ratio) => `${(ratio || 0).toFixed(2)}%`,
      align: 'right',
    },
    {
      title: '佣金状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const item = commissionStatusMap[status] || { color: 'default', text: '未知' };
        return <Tag color={item.color}>{item.text}</Tag>;
      },
    },
    {
      title: '关联订单号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 180,
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      sorter: true,
    },
    {
      title: '结算时间',
      dataIndex: 'settleTime',
      key: 'settleTime',
      width: 180,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 150,
      ellipsis: true,
    },
  ];

  /**
   * 佣金结算记录列表配置
   */
  const settlementColumns = [
    {
      title: '结算单号',
      dataIndex: 'settleNo',
      key: 'settleNo',
      width: 180,
      sorter: true,
    },
    {
      title: '用户名',
      dataIndex: 'userName',
      key: 'userName',
      width: 120,
      sorter: true,
    },
    {
      title: '用户手机号',
      dataIndex: 'userPhone',
      key: 'userPhone',
      width: 130,
    },
    {
      title: '结算金额',
      dataIndex: 'settleAmount',
      key: 'settleAmount',
      width: 120,
      render: (amount) => `¥${(amount || 0).toFixed(2)}`,
      align: 'right',
    },
    {
      title: '佣金笔数',
      dataIndex: 'commissionCount',
      key: 'commissionCount',
      width: 100,
      align: 'right',
    },
    {
      title: '结算状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const item = settlementStatusMap[status] || { color: 'default', text: '未知' };
        return <Tag color={item.color}>{item.text}</Tag>;
      },
    },
    {
      title: '申请时间',
      dataIndex: 'applyTime',
      key: 'applyTime',
      width: 180,
      sorter: true,
    },
    {
      title: '审核时间',
      dataIndex: 'auditTime',
      key: 'auditTime',
      width: 180,
    },
    {
      title: '审核人',
      dataIndex: 'auditor',
      key: 'auditor',
      width: 100,
    },
    {
      title: '审核备注',
      dataIndex: 'auditRemark',
      key: 'auditRemark',
      width: 150,
      ellipsis: true,
    },
  ];

  /**
   * 佣金记录搜索字段配置
   */
  const recordSearchFields = [
    {
      title: '用户名',
      dataIndex: 'userName',
      key: 'SEARCH_LIKE_userName',
      type: 'text',
    },
    {
      title: '用户手机号',
      dataIndex: 'userPhone',
      key: 'SEARCH_LIKE_userPhone',
      type: 'text',
    },
    {
      title: '佣金类型',
      dataIndex: 'commissionType',
      key: 'SEARCH_EQ_commissionType',
      type: 'select',
      options: [
        { label: '充值返佣', value: 1 },
        { label: '理财返佣', value: 2 },
        { label: '交易返佣', value: 3 },
        { label: '其他返佣', value: 4 },
      ],
    },
    {
      title: '佣金状态',
      dataIndex: 'status',
      key: 'SEARCH_EQ_status',
      type: 'select',
      options: [
        { label: '待结算', value: 0 },
        { label: '结算中', value: 1 },
        { label: '已结算', value: 2 },
        { label: '已失效', value: 3 },
      ],
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'SEARCH_GTE_createTime',
      type: 'date',
    },
  ];

  /**
   * 结算记录搜索字段配置
   */
  const settlementSearchFields = [
    {
      title: '用户名',
      dataIndex: 'userName',
      key: 'SEARCH_LIKE_userName',
      type: 'text',
    },
    {
      title: '用户手机号',
      dataIndex: 'userPhone',
      key: 'SEARCH_LIKE_userPhone',
      type: 'text',
    },
    {
      title: '结算单号',
      dataIndex: 'settleNo',
      key: 'SEARCH_LIKE_settleNo',
      type: 'text',
    },
    {
      title: '结算状态',
      dataIndex: 'status',
      key: 'SEARCH_EQ_status',
      type: 'select',
      options: [
        { label: '待审核', value: 0 },
        { label: '审核中', value: 1 },
        { label: '已通过', value: 2 },
        { label: '已拒绝', value: 3 },
      ],
    },
    {
      title: '申请时间',
      dataIndex: 'applyTime',
      key: 'SEARCH_GTE_applyTime',
      type: 'date',
    },
  ];

  /**
   * 查看详情
   */
  const handleView = (record) => {
    console.log('查看详情:', record);
    // 这里可以打开详情弹窗
  };

  return (
    <div className="commission-records-container">
      <Card title="佣金记录查询" className="commission-records-card">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'record',
              label: '佣金记录',
              children: activeTab === 'record' && (
                <CmBasePage
                  columns={recordColumns}
                  apiEndpoint="/commission/record/getList"
                  apiMethod="get"
                  searchFieldList={recordSearchFields}
                  onView={handleView}
                  actionButtons={{
                    view: true,
                    edit: false,
                    delete: false,
                  }}
                  rowKey="id"
                />
              ),
            },
            {
              key: 'settlement',
              label: '结算记录',
              children: activeTab === 'settlement' && (
                <CmBasePage
                  columns={settlementColumns}
                  apiEndpoint="/commission/settlement/getList"
                  apiMethod="get"
                  searchFieldList={settlementSearchFields}
                  onView={handleView}
                  actionButtons={{
                    view: true,
                    edit: false,
                    delete: false,
                  }}
                  rowKey="id"
                />
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default CommissionRecordsPage;
