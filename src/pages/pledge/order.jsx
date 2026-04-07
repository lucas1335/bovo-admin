import React, { useState } from 'react';
import { message, Tag, Descriptions, Modal, Progress } from 'antd';
import CmBasePage from '@components/CmBasePage';
import DataForm from '@components/DataForm';
import { getPledgeOrderList, deletePledgeOrder } from '@api/modules/pledge';

/**
 * 抵押借贷订单管理页面
 * 功能：抵押订单列表展示、搜索、详情查看、删除管理
 */
const PledgeOrderPage = () => {
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);

  /**
   * 查看订单详情
   */
  const handleView = (record) => {
    setCurrentRecord(record);
    setDetailVisible(true);
  };

  /**
   * 删除订单
   */
  const handleDelete = async (record) => {
    try {
      const response = await deletePledgeOrder({ id: record.id });
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
   * 刷新表格数据
   */
  const refreshTable = () => {
    document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
      new CustomEvent('reload')
    );
  };

  /**
   * 计算抵押率并返回对应颜色
   * 抵押率 = 抵押金额 / 资产价值
   * 风险等级：安全(<70%) 警告(70-85%) 危险(>85%)
   */
  const getPledgeRateColor = (rate) => {
    if (rate < 70) return { color: '#52c41a', text: '安全', percent: rate };
    if (rate < 85) return { color: '#faad14', text: '警告', percent: rate };
    return { color: '#f5222d', text: '危险', percent: rate };
  };

  /**
   * 渲染抵押率进度条
   */
  const renderPledgeRate = (minOdds, maxOdds) => {
    const rate = ((parseFloat(maxOdds || 0) / parseFloat(minOdds || 1)) * 100).toFixed(2);
    const rateInfo = getPledgeRateColor(parseFloat(rate));

    return (
      <div>
        <Progress
          percent={Math.min(parseFloat(rate), 100)}
          strokeColor={rateInfo.color}
          size="small"
          format={(percent) => `${percent}%`}
        />
        <Tag color={rateInfo.color} style={{ marginTop: 4 }}>
          {rateInfo.text}
        </Tag>
      </div>
    );
  };

  // 订单状态映射
  const orderStatusMap = {
    0: { color: 'blue', text: '收益中' },
    1: { color: 'default', text: '已结算' },
  };

  /**
   * 列配置定义
   */
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: true,
    },
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 100,
      sorter: true,
    },
    {
      title: '投资金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (amount) => `¥${(parseFloat(amount || 0)).toFixed(2)}`,
      sorter: true,
    },
    {
      title: '投资期限',
      dataIndex: 'days',
      key: 'days',
      width: 100,
      render: (days) => `${days}天`,
      sorter: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusInfo = orderStatusMap[status] || { color: 'default', text: '未知' };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
    },
    {
      title: '项目ID',
      dataIndex: 'planId',
      key: 'planId',
      width: 100,
      sorter: true,
    },
    {
      title: '项目名称',
      dataIndex: 'planTitle',
      key: 'planTitle',
      width: 150,
      ellipsis: true,
    },
    {
      title: '订单编号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 180,
      sorter: true,
    },
    {
      title: '抵押率',
      key: 'pledgeRate',
      width: 150,
      render: (_, record) => renderPledgeRate(record.minOdds, record.maxOdds),
    },
    {
      title: '累计收益',
      dataIndex: 'accumulaEarn',
      key: 'accumulaEarn',
      width: 120,
      render: (earn) => `¥${(parseFloat(earn || 0)).toFixed(2)}`,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      sorter: true,
    },
    {
      title: '到期时间',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 180,
      sorter: true,
    },
    {
      title: '结算时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 180,
      sorter: true,
    },
  ];

  /**
   * 搜索字段配置
   */
  const searchFieldList = [
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'SEARCH_EQ_userId',
      type: 'text',
    },
    {
      title: '项目ID',
      dataIndex: 'planId',
      key: 'SEARCH_EQ_planId',
      type: 'text',
    },
    {
      title: '项目名称',
      dataIndex: 'planTitle',
      key: 'SEARCH_LIKE_planTitle',
      type: 'text',
    },
    {
      title: '订单编号',
      dataIndex: 'orderNo',
      key: 'SEARCH_LIKE_orderNo',
      type: 'text',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'SEARCH_EQ_status',
      type: 'select',
      options: [
        { label: '收益中', value: 0 },
        { label: '已结算', value: 1 },
      ],
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'SEARCH_GTE_createTime',
      type: 'date',
    },
  ];

  return (
    <div>
      {/* 抵押订单列表 */}
      <CmBasePage
        columns={columns}
        apiEndpoint="/contract/mingOrder/list"
        apiMethod="get"
        searchFieldList={searchFieldList}
        onView={handleView}
        onDelete={handleDelete}
        actionButtons={{
          view: true,
          edit: false,
          delete: true,
        }}
        rowKey="id"
      />

      {/* 订单详情弹窗 */}
      <Modal
        title="抵押订单详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <button
            key="close"
            className="ant-btn"
            onClick={() => setDetailVisible(false)}
          >
            关闭
          </button>,
        ]}
        width={900}
      >
        {currentRecord && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="订单ID" span={1}>
              {currentRecord.id}
            </Descriptions.Item>
            <Descriptions.Item label="用户ID" span={1}>
              {currentRecord.userId}
            </Descriptions.Item>
            <Descriptions.Item label="投资金额" span={1}>
              ¥{(parseFloat(currentRecord.amount || 0)).toFixed(2)}
            </Descriptions.Item>
            <Descriptions.Item label="投资期限" span={1}>
              {currentRecord.days}天
            </Descriptions.Item>
            <Descriptions.Item label="订单状态" span={1}>
              <Tag color={orderStatusMap[currentRecord.status]?.color}>
                {orderStatusMap[currentRecord.status]?.text}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="项目ID" span={1}>
              {currentRecord.planId}
            </Descriptions.Item>
            <Descriptions.Item label="项目名称" span={2}>
              {currentRecord.planTitle}
            </Descriptions.Item>
            <Descriptions.Item label="订单编号" span={2}>
              {currentRecord.orderNo}
            </Descriptions.Item>
            <Descriptions.Item label="抵押率监控" span={2}>
              {renderPledgeRate(currentRecord.minOdds, currentRecord.maxOdds)}
            </Descriptions.Item>
            <Descriptions.Item label="最小利率" span={1}>
              {(parseFloat(currentRecord.minOdds || 0)).toFixed(4)}%
            </Descriptions.Item>
            <Descriptions.Item label="最大利率" span={1}>
              {(parseFloat(currentRecord.maxOdds || 0)).toFixed(4)}%
            </Descriptions.Item>
            <Descriptions.Item label="累计收益" span={1}>
              ¥{(parseFloat(currentRecord.accumulaEarn || 0)).toFixed(2)}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间" span={1}>
              {currentRecord.createTime}
            </Descriptions.Item>
            <Descriptions.Item label="到期时间" span={1}>
              {currentRecord.endTime}
            </Descriptions.Item>
            <Descriptions.Item label="结算时间" span={1}>
              {currentRecord.updateTime || '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default PledgeOrderPage;
