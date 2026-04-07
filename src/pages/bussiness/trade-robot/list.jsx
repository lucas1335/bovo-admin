import React from 'react';
import { Button, message, Popconfirm, Space } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import CmBasePage from '@components/CmBasePage';
import { deleteTradeRobot } from '@api/modules/tradeRobot';
import dayjs from 'dayjs';

/**
 * 控盘记录列表页面
 * 功能：控盘记录列表展示、搜索、预览、修改、删除
 */
const TradeRobotListPage = () => {
  const navigate = useNavigate();

  // 控盘策略列表
  const modelList = [
    { value: 0, label: '跟随型趋势' },
    { value: 2, label: '秒杀型趋势' },
  ];

  /**
   * 获取策略名称
   */
  const getModelName = (value) => {
    return modelList.find((item) => item.value === value)?.label || '-';
  };

  /**
   * 预览
   */
  const handlePreview = (record) => {
    navigate('/bussiness/trade-robot', {
      state: { id: record.id, type: 'priview' },
    });
  };

  /**
   * 修改
   */
  const handleUpdate = (record) => {
    navigate('/bussiness/trade-robot', {
      state: { id: record.id, type: 'update' },
    });
  };

  /**
   * 删除
   */
  const handleDelete = async (record) => {
    try {
      const response = await deleteTradeRobot(record.id);
      if (response.code === 200) {
        message.success(response.msg || '删除成功');
      } else {
        message.error(response.msg || '删除失败');
      }
    } catch (error) {
      message.error('删除失败: ' + error.message);
    }
  };

  // 列配置（包含自定义操作列）
  const columns = [
    {
      title: '交易对',
      dataIndex: 'symbol',
      key: 'symbol',
      width: 120,
    },
    {
      title: '控盘策略',
      dataIndex: 'model',
      key: 'model',
      width: 150,
      render: (model) => getModelName(model),
    },
    {
      title: '控制粒度 (分钟)',
      dataIndex: 'granularity',
      key: 'granularity',
      width: 150,
    },
    {
      title: '浮动比例 (%)',
      dataIndex: 'pricePencent',
      key: 'pricePencent',
      width: 130,
    },
    {
      title: '最大涨幅',
      dataIndex: 'increase',
      key: 'increase',
      width: 100,
    },
    {
      title: '最大跌幅',
      dataIndex: 'decline',
      key: 'decline',
      width: 100,
    },
    {
      title: '开始时间',
      dataIndex: 'beginTime',
      key: 'beginTime',
      width: 160,
      render: (time) => (time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 160,
      render: (time) => (time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handlePreview(record)}
          >
            预览
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleUpdate(record)}
            style={{ color: '#faad14' }}
          >
            修改
          </Button>
          <Popconfirm
            title="删除确认"
            description="确定要删除这条数据吗？"
            onConfirm={() => handleDelete(record)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 搜索配置
  const searchFieldList = [
    {
      title: '交易对',
      dataIndex: 'symbol',
      key: 'SEARCH_LIKE_symbol',
      type: 'text',
    },
    {
      title: '控制粒度 (分钟)',
      dataIndex: 'granularity',
      key: 'SEARCH_LIKE_granularity',
      type: 'text',
    },
  ];

  return (
    <CmBasePage
      columns={columns}
      apiEndpoint="/match-engine/bot/kline/list"
      apiMethod="get"
      searchFieldList={searchFieldList}
      rowKey="id"
      actionButtons={{
        view: false,
        edit: false,
        delete: false,
      }}
    />
  );
};

export default TradeRobotListPage;
