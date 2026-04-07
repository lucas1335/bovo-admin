import React, { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Table, Spin, message } from 'antd';
import { MonitorOutlined, PieChartOutlined, DashboardOutlined } from '@ant-design/icons';
import { getCache } from '@/api/modules/monitor';
import * as echarts from 'echarts';

const CachePage = () => {
  const [loading, setLoading] = useState(true);
  const [cache, setCache] = useState({});
  const commandstatsRef = useRef(null);
  const usedmemoryRef = useRef(null);
  const commandstatsChartRef = useRef(null);
  const usedmemoryChartRef = useRef(null);

  useEffect(() => {
    getList();
    return () => {
      // 清理图表实例
      if (commandstatsChartRef.current) {
        commandstatsChartRef.current.dispose();
      }
      if (usedmemoryChartRef.current) {
        usedmemoryChartRef.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (cache.info && cache.commandStats && !loading) {
      initCharts();
    }
  }, [cache, loading]);

  const getList = () => {
    setLoading(true);
    getCache().then(res => {
      setCache(res.data || {});
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  };

  const initCharts = () => {
    // 初始化命令统计图表
    if (commandstatsRef.current) {
      if (commandstatsChartRef.current) {
        commandstatsChartRef.current.dispose();
      }
      commandstatsChartRef.current = echarts.init(commandstatsRef.current, 'macarons');
      commandstatsChartRef.current.setOption({
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)',
        },
        series: [
          {
            name: '命令',
            type: 'pie',
            roseType: 'radius',
            radius: [15, 95],
            center: ['50%', '38%'],
            data: cache.commandStats,
            animationEasing: 'cubicInOut',
            animationDuration: 1000,
          },
        ],
      });
    }

    // 初始化内存使用图表
    if (usedmemoryRef.current && cache.info) {
      if (usedmemoryChartRef.current) {
        usedmemoryChartRef.current.dispose();
      }
      usedmemoryChartRef.current = echarts.init(usedmemoryRef.current, 'macarons');
      const usedMemoryValue = parseFloat(cache.info.used_memory_human) || 0;
      usedmemoryChartRef.current.setOption({
        tooltip: {
          formatter: '{b} <br/>{a} : ' + cache.info.used_memory_human,
        },
        series: [
          {
            name: '峰值',
            type: 'gauge',
            min: 0,
            max: 1000,
            detail: {
              formatter: cache.info.used_memory_human,
            },
            data: [
              {
                value: usedMemoryValue,
                name: '内存消耗',
              },
            ],
          },
        ],
      });
    }
  };

  // 基本信息数据
  const infoData = cache.info ? [
    {
      key: '1',
      name1: 'Redis版本',
      value1: cache.info.redis_version,
      name2: '运行模式',
      value2: cache.info.redis_mode === 'standalone' ? '单机' : '集群',
      name3: '端口',
      value3: cache.info.tcp_port,
      name4: '客户端数',
      value4: cache.info.connected_clients,
    },
    {
      key: '2',
      name1: '运行时间(天)',
      value1: cache.info.uptime_in_days,
      name2: '使用内存',
      value2: cache.info.used_memory_human,
      name3: '使用CPU',
      value3: parseFloat(cache.info.used_cpu_user_children).toFixed(2),
      name4: '内存配置',
      value4: cache.info.maxmemory_human,
    },
    {
      key: '3',
      name1: 'AOF是否开启',
      value1: cache.info.aof_enabled === '0' ? '否' : '是',
      name2: 'RDB是否成功',
      value2: cache.info.rdb_last_bgsave_status,
      name3: 'Key数量',
      value3: cache.dbSize,
      name4: '网络入口/出口',
      value4: `${cache.info.instantaneous_input_kbps}kps/${cache.info.instantaneous_output_kbps}kps`,
    },
  ] : [];

  const infoColumns = [
    { title: '名称', dataIndex: 'name1', key: 'name1', width: 120 },
    { title: '值', dataIndex: 'value1', key: 'value1' },
    { title: '名称2', dataIndex: 'name2', key: 'name2', width: 120 },
    { title: '值2', dataIndex: 'value2', key: 'value2' },
    { title: '名称3', dataIndex: 'name3', key: 'name3', width: 120 },
    { title: '值3', dataIndex: 'value3', key: 'value3' },
    { title: '名称4', dataIndex: 'name4', key: 'name4', width: 120 },
    { title: '值4', dataIndex: 'value4', key: 'value4' },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Spin spinning={loading} tip="正在加载缓存监控数据，请稍候！">
        <Row gutter={16}>
          {/* 基本信息 */}
          <Col span={24} style={{ marginBottom: 16 }}>
            <Card title={<><MonitorOutlined /> 基本信息</>}>
              <Table
                columns={infoColumns}
                dataSource={infoData}
                pagination={false}
                size="small"
                showHeader={false}
              />
            </Card>
          </Col>

          {/* 命令统计 */}
          <Col span={12} style={{ marginBottom: 16 }}>
            <Card title={<><PieChartOutlined /> 命令统计</>}>
              <div ref={commandstatsRef} style={{ height: 420 }} />
            </Card>
          </Col>

          {/* 内存信息 */}
          <Col span={12} style={{ marginBottom: 16 }}>
            <Card title={<><DashboardOutlined /> 内存信息</>}>
              <div ref={usedmemoryRef} style={{ height: 420 }} />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default CachePage;
