import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Space, Spin, Alert } from 'antd';
import {
  UserOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  TransactionOutlined,
  TrophyOutlined,
  TeamOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ThunderboltOutlined,
  FileTextOutlined,
  SettingOutlined,
  MessageOutlined,
  WalletOutlined,
  FundOutlined,
  PieChartOutlined,
  BuildOutlined
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { getStatisticsData } from '../api/modules/system';
import './Dashboard.css';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState({
    platformProfit: 0,
    totalUserCount: 0,
    rechargeUserCount: 0,
    withdrawUserCount: 0,
    rechargeAmount: 0,
    withdrawAmount: 0,
    totalAmount: 0,
    recentRechargeInfo: [],
    recentWithdrawInfo: [],
    recentWithdrawFailedInfo: [],
    recentRegisterCount: []
  });
  const [chartType, setChartType] = useState('platformProfit');
  const [chartData, setChartData] = useState({
    expectedData: [],
    actualData: [],
    xAxisDate: [],
    legendData: []
  });
  const [playerDetailVisible, setPlayerDetailVisible] = useState(false);
  const chartRef = useRef(null);

  // 快捷入口 - 9个，3x3布局
  const quickLinks = [
    { title: '账变信息', icon: <WalletOutlined />, color: '#1890ff', path: '/platform/record' },
    { title: '玩家管理', icon: <UserOutlined />, color: '#52c41a', path: '/bussiness/user' },
    { title: '实名认证', icon: <FileTextOutlined />, color: '#faad14', path: '/bussiness/certified' },
    { title: '充值列表', icon: <DollarOutlined />, color: '#722ed1', path: '/deposit/rechargelist' },
    { title: '提现列表', icon: <TransactionOutlined />, color: '#eb2f96', path: '/deposit/withdrawlist' },
    { title: '通知公告', icon: <MessageOutlined />, color: '#13c2c2', path: '/announcement/notice' },
    { title: '跟单信息', icon: <TeamOutlined />, color: '#fa8c16', path: '/otc/merchandiser/kopieerSpeler' },
    { title: '合约持仓', icon: <FundOutlined />, color: '#a0d911', path: '/uContract/positionOrderList' },
    { title: '参数配置', icon: <SettingOutlined />, color: '#f759ab', path: '/bussiness/basicConfiguration' },
  ];

  // 待办事项
  const todoList = [
    { id: 1, title: '审核用户提现申请', priority: 'high', time: '10分钟前' },
    { id: 2, title: '回复用户反馈', priority: 'medium', time: '1小时前' },
    { id: 3, title: '更新系统公告', priority: 'low', time: '2小时前' },
    { id: 4, title: '检查数据备份', priority: 'medium', time: '3小时前' },
  ];

  const todoColumns = [
    {
      title: '任务',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => {
        const colorMap = {
          high: 'red',
          medium: 'orange',
          low: 'green'
        };
        const textMap = {
          high: '高',
          medium: '中',
          low: '低'
        };
        return <Tag color={colorMap[priority]}>{textMap[priority]}</Tag>;
      },
    },
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
      width: 100,
    },
  ];

  // 统计卡片配置
  const getStatsCards = () => [
    {
      title: '平台收益',
      value: dataSource.platformProfit,
      icon: <TrophyOutlined />,
      color: '#7fb1ff',
      bgColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      type: 'platformProfit'
    },
    {
      title: '总用户数',
      value: dataSource.totalUserCount,
      icon: <TeamOutlined />,
      color: '#f48d8b',
      bgColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      type: 'totalUserCount'
    },
    {
      title: '充值金额',
      value: dataSource.rechargeAmount,
      icon: <DollarOutlined />,
      color: '#f8b931',
      bgColor: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
      type: 'rechargeAmount'
    },
    {
      title: '提现金额',
      value: dataSource.withdrawAmount,
      icon: <TransactionOutlined />,
      color: '#4ac19b',
      bgColor: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      type: 'withdrawAmount'
    },
    {
      title: '总金额',
      value: dataSource.totalAmount,
      icon: <DollarOutlined />,
      color: '#7fb1ff',
      bgColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      type: 'totalAmount'
    },
    {
      title: '近7天注册',
      value: dataSource.recentRegisterCount.reduce((sum, item) => sum + Number(item.cnt || 0), 0),
      icon: <UserOutlined />,
      color: '#ff6b6b',
      bgColor: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
      type: 'registerCount'
    }
  ];

  // 获取统计数据
  useEffect(() => {
    fetchStatisticsData();
  }, []);

  const fetchStatisticsData = async () => {
    try {
      setLoading(true);
      const res = await getStatisticsData();
      console.log('Dashboard统计数据返回:', res);

      const fillToSevenDays = (arr, type) => {
        const result = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dayStr = date.toISOString().split('T')[0];

          const existingData = arr.find(item => item.day === dayStr);

          if (existingData) {
            result.push(existingData);
          } else {
            if (type === 'registerCount') {
              result.push({ cnt: 0, day: dayStr });
            } else {
              result.push({ amount: 0, userCount: 0, day: dayStr });
            }
          }
        }

        return result;
      };

      setDataSource({
        ...res.data,
        recentRechargeInfo: fillToSevenDays(res.data.recentRechargeInfo || [], 'amountUserCount'),
        recentWithdrawInfo: fillToSevenDays(res.data.recentWithdrawInfo || [], 'amountUserCount'),
        recentWithdrawFailedInfo: fillToSevenDays(res.data.recentWithdrawFailedInfo || [], 'amountUserCount'),
        recentRegisterCount: fillToSevenDays(res.data.recentRegisterCount || [], 'registerCount')
      });

      // 默认显示平台收益图表
      updateChartData(res.data, 'platformProfit');
    } catch (error) {
      console.error('获取统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateChartData = (data, type) => {
    let chartData = {};

    switch (type) {
      case 'platformProfit':
        chartData = {
          expectedData: data.recentRechargeInfo?.map(item => item.amount) || [],
          actualData: data.recentWithdrawInfo?.map(item => item.amount) || [],
          xAxisDate: data.recentRechargeInfo?.map(item => item.day) || [],
          legendData: ['充值金额', '提现金额']
        };
        break;
      case 'rechargeAmount':
        chartData = {
          expectedData: data.recentRechargeInfo?.map(item => item.amount) || [],
          actualData: data.recentRechargeInfo?.map(item => item.userCount) || [],
          xAxisDate: data.recentRechargeInfo?.map(item => item.day) || [],
          legendData: ['充值金额', '充值人数']
        };
        break;
      case 'withdrawAmount':
        chartData = {
          expectedData: data.recentWithdrawInfo?.map(item => item.amount) || [],
          actualData: data.recentWithdrawFailedInfo?.map(item => item.amount) || [],
          xAxisDate: data.recentWithdrawInfo?.map(item => item.day) || [],
          legendData: ['提现金额', '提现失败金额']
        };
        break;
      case 'totalAmount':
        chartData = {
          expectedData: data.recentRechargeInfo?.map(item => item.amount) || [],
          actualData: data.recentWithdrawInfo?.map(item => item.amount) || [],
          xAxisDate: data.recentRechargeInfo?.map(item => item.day) || [],
          legendData: ['充值金额', '提现金额']
        };
        break;
      case 'registerCount':
        chartData = {
          expectedData: data.recentRegisterCount?.map(item => Number(item.cnt || 0)) || [],
          actualData: data.recentRechargeInfo?.map(item => item.userCount) || [],
          xAxisDate: data.recentRegisterCount?.map(item => item.day) || [],
          legendData: ['注册数量', '充值人数']
        };
        break;
      default:
        chartData = {
          expectedData: [],
          actualData: [],
          xAxisDate: [],
          legendData: []
        };
    }

    setChartData(chartData);
    setChartType(type);
  };

  const handleCardClick = (type) => {
    if (type === 'totalUserCount') {
      setPlayerDetailVisible(true);
    } else {
      updateChartData(dataSource, type);
    }
  };

  // 格式化数值，过长时自动缩小字体
  const formatValue = (value) => {
    const num = Number(value) || 0;
    const str = num.toLocaleString();
    // 如果超过8位数字，缩小字体
    if (str.length > 8) {
      return { value: str, fontSize: '14px' };
    } else if (str.length > 12) {
      return { value: str, fontSize: '12px' };
    }
    return { value: str, fontSize: '18px' };
  };

  // 图表配置
  const getChartOption = () => {
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        }
      },
      legend: {
        data: chartData.legendData,
        textStyle: {
          color: '#666'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: chartData.xAxisDate,
        axisLine: {
          lineStyle: {
            color: '#ddd'
          }
        },
        axisLabel: {
          color: '#666'
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          lineStyle: {
            color: '#ddd'
          }
        },
        axisLabel: {
          color: '#666'
        },
        splitLine: {
          lineStyle: {
            color: '#f0f0f0'
          }
        }
      },
      series: [
        {
          name: chartData.legendData[0],
          type: 'line',
          stack: 'Total',
          smooth: true,
          lineStyle: {
            width: 2,
            color: '#5470c6'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(84, 112, 198, 0.3)' },
              { offset: 1, color: 'rgba(84, 112, 198, 0.05)' }
            ])
          },
          emphasis: {
            focus: 'series'
          },
          data: chartData.expectedData
        },
        {
          name: chartData.legendData[1],
          type: 'line',
          stack: 'Total',
          smooth: true,
          lineStyle: {
            width: 2,
            color: '#91cc75'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(145, 204, 117, 0.3)' },
              { offset: 1, color: 'rgba(145, 204, 117, 0.05)' }
            ])
          },
          emphasis: {
            focus: 'series'
          },
          data: chartData.actualData
        }
      ]
    };
  };

  const statsCards = getStatsCards();

  return (
    <div className="dashboard-container">
      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" tip="加载中..." />
        </div>
      ) : (
        <>
          {/* 统计卡片 */}
          <Row gutter={[16, 16]} className="stats-row">
            {statsCards.map((stat, index) => {
              const formattedValue = formatValue(stat.value);
              return (
                <Col xs={12} sm={12} md={8} lg={4} key={index}>
                  <Card
                    className="stat-card"
                    style={{
                      background: stat.bgColor,
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    hoverable
                    onClick={() => handleCardClick(stat.type)}
                    bodyStyle={{ padding: '24px' }}
                  >
                    <div className="stat-content">
                      <div className="stat-icon">{stat.icon}</div>
                      <div className="stat-info">
                        <div className="stat-value" style={{ fontSize: formattedValue.fontSize }}>
                          {formattedValue.value}
                        </div>
                        <div className="stat-title">{stat.title}</div>
                      </div>
                    </div>
                    <div className="stat-wave"></div>
                  </Card>
                </Col>
              );
            })}
          </Row>

          {/* 快捷入口和数据趋势 - 同一行展示 */}
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            {/* 快捷入口 - 左侧 */}
            <Col xs={24} lg={8}>
              <Card
                title={
                  <Space>
                    <ThunderboltOutlined />
                    <span>快捷入口</span>
                  </Space>
                }
                className="quick-links-card"
              >
                <Row gutter={[12, 12]}>
                  {quickLinks.map((link, index) => (
                    <Col xs={8} sm={8} md={8} lg={8} key={index}>
                      <div
                        className="quick-link-item"
                        style={{ borderColor: link.color }}
                        onClick={() => window.location.href = link.path}
                      >
                        <div className="quick-link-icon" style={{ color: link.color }}>
                          {link.icon}
                        </div>
                        <div className="quick-link-title">{link.title}</div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card>
            </Col>

            {/* 数据趋势 - 右侧 */}
            <Col xs={24} lg={16}>
              <Card
                title={
                  <Space>
                    <ThunderboltOutlined />
                    <span>数据趋势</span>
                  </Space>
                }
                className="chart-card"
              >
                <ReactECharts
                  ref={chartRef}
                  option={getChartOption()}
                  style={{ height: '350px' }}
                  notMerge={true}
                  lazyUpdate={true}
                />
              </Card>
            </Col>
          </Row>

          {/* 待办事项 */}
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24}>
              <Card
                title={
                  <Space>
                    <FileTextOutlined />
                    <span>待办事项</span>
                  </Space>
                }
                className="todo-card"
              >
                <Table
                  columns={todoColumns}
                  dataSource={todoList}
                  pagination={false}
                  size="small"
                  rowKey="id"
                />
              </Card>
            </Col>
          </Row>

          {/* 用户详情弹窗 */}
          {playerDetailVisible && (
            <div className="player-detail-modal">
              <div className="modal-backdrop" onClick={() => setPlayerDetailVisible(false)}></div>
              <div className="modal-content">
                <div className="modal-header">
                  <h3>玩家详情</h3>
                  <button
                    className="close-btn"
                    onClick={() => setPlayerDetailVisible(false)}
                  >
                    ×
                  </button>
                </div>
                <div className="modal-body">
                  <div className="detail-item">
                    <span className="label">注册人数：</span>
                    <span className="value">{dataSource.totalUserCount || 0}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">充值人数：</span>
                    <span className="value">{dataSource.rechargeUserCount || 0}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">提现人数：</span>
                    <span className="value">{dataSource.withdrawUserCount || 0}</span>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setPlayerDetailVisible(false)}
                  >
                    关闭
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
