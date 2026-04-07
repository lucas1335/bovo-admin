import React, { useEffect, useState } from 'react';
import CmBasePage from '@components/CmBasePage';
import { useSearchParams } from 'react-router-dom';

/**
 * 玩家用户数据页面
 */
const PlayUserPage = () => {
  const [searchParams] = useSearchParams();
  const [checkUserId, setCheckUserId] = useState(null);

  // 从 URL 参数获取用户ID
  useEffect(() => {
    const userId = searchParams.get('id');
    if (userId) {
      setCheckUserId(userId);
    }
  }, [searchParams]);

  // 列配置
  const columns = [
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      align: 'center',
      width: 100,
    },
    {
      title: '总充值',
      dataIndex: 'totalRechargeAmount',
      key: 'totalRechargeAmount',
      align: 'center',
      width: 120,
    },
    {
      title: '总提现',
      dataIndex: 'totalWithdrawAmount',
      key: 'totalWithdrawAmount',
      align: 'center',
      width: 120,
    },
    {
      title: '总赠送彩金',
      dataIndex: 'totalWingAmount',
      key: 'totalWingAmount',
      align: 'center',
      width: 120,
    },
    {
      title: '总扣减彩金',
      dataIndex: 'totalSubBousAmount',
      key: 'totalSubBousAmount',
      align: 'center',
      width: 120,
    },
    {
      title: '总人工上分',
      dataIndex: 'totalAddAmount',
      key: 'totalAddAmount',
      align: 'center',
      width: 120,
    },
    {
      title: '总人工下分',
      dataIndex: 'totalSubAmount',
      key: 'totalSubAmount',
      align: 'center',
      width: 120,
    },
    {
      title: '总归集金额',
      dataIndex: 'totalCollectAmount',
      key: 'totalCollectAmount',
      align: 'center',
      width: 120,
    },
    {
      title: '秒合约输赢金额',
      dataIndex: 'rewardAmount',
      key: 'rewardAmount',
      align: 'center',
      width: 140,
      render: (_, record) => {
        const reward = record.rewardAmount || 0;
        const bet = record.betAmount || 0;
        return reward - bet;
      },
    },
    {
      title: 'U本位输赢总金额',
      dataIndex: 'totalContractAmount',
      key: 'totalContractAmount',
      align: 'center',
      width: 140,
    },
    {
      title: '理财总金额',
      dataIndex: 'totalMattersAmount',
      key: 'totalMattersAmount',
      align: 'center',
      width: 120,
    },
  ];

  // 搜索配置
  const searchFieldList = [
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      type: 'text',
    },
  ];

  return (
    <CmBasePage
      columns={columns}
      apiEndpoint="/asset/userStatistics/list"
      apiMethod="get"
      searchFieldList={searchFieldList}
      rowKey="userId"
      extraParams={checkUserId ? { userId: checkUserId } : {}}
      actionButtons={{
        view: false,
        edit: false,
        delete: false,
      }}
      pagination={{
        defaultPageSize: 200,
        showQuickJumper: true,
        showSizeChanger: true,
        showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
      }}
    />
  );
};

export default PlayUserPage;
