import React, { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Table, Spin, message } from 'antd';
import { CloudServerOutlined, DatabaseOutlined, MonitorOutlined, CoffeeOutlined, HddOutlined } from '@ant-design/icons';
import { getServer } from '@/api/modules/monitor';

const ServerPage = () => {
  const [loading, setLoading] = useState(true);
  const [server, setServer] = useState({});

  useEffect(() => {
    getList();
  }, []);

  const getList = () => {
    setLoading(true);
    getServer().then(res => {
      setServer(res.data || {});
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  };

  // CPU表格列
  const cpuColumns = [
    { title: '属性', dataIndex: 'attr', key: 'attr', width: 120 },
    { title: '值', dataIndex: 'value', key: 'value' },
  ];

  const cpuData = server.cpu ? [
    { key: '1', attr: '核心数', value: server.cpu.cpuNum },
    { key: '2', attr: '用户使用率', value: server.cpu.used + '%' },
    { key: '3', attr: '系统使用率', value: server.cpu.sys + '%' },
    { key: '4', attr: '当前空闲率', value: server.cpu.free + '%' },
  ] : [];

  // 内存表格列
  const memColumns = [
    { title: '属性', dataIndex: 'attr', key: 'attr', width: 120 },
    { title: '内存', dataIndex: 'mem', key: 'mem' },
    { title: 'JVM', dataIndex: 'jvm', key: 'jvm' },
  ];

  const memData = server.mem && server.jvm ? [
    { key: '1', attr: '总内存', mem: server.mem.total + 'G', jvm: server.jvm.total + 'M' },
    { key: '2', attr: '已用内存', mem: server.mem.used + 'G', jvm: server.jvm.used + 'M' },
    { key: '3', attr: '剩余内存', mem: server.mem.free + 'G', jvm: server.jvm.free + 'M' },
    {
      key: '4',
      attr: '使用率',
      mem: <span style={{ color: server.mem.usage > 80 ? '#ff4d4f' : 'inherit' }}>{server.mem.usage}%</span>,
      jvm: <span style={{ color: server.jvm.usage > 80 ? '#ff4d4f' : 'inherit' }}>{server.jvm.usage}%</span>,
    },
  ] : [];

  // 服务器信息
  const sysData = server.sys ? [
    { key: '1', name: '服务器名称', value1: server.sys.computerName, name2: '操作系统', value2: server.sys.osName },
    { key: '2', name: '服务器IP', value1: server.sys.computerIp, name2: '系统架构', value2: server.sys.osArch },
  ] : [];

  // JVM信息
  const jvmData = server.jvm && server.sys ? [
    { key: '1', name: 'Java名称', value1: server.jvm.name, name2: 'Java版本', value2: server.jvm.version },
    { key: '2', name: '启动时间', value1: server.jvm.startTime, name2: '运行时长', value2: server.jvm.runTime },
    { key: '3', name: '安装路径', value1: server.jvm.home, value2: '' },
    { key: '4', name: '项目路径', value1: server.sys.userDir, value2: '' },
    { key: '5', name: '运行参数', value1: server.jvm.inputArgs, value2: '' },
  ] : [];

  // 磁盘状态
  const diskColumns = [
    { title: '盘符路径', dataIndex: 'dirName', key: 'dirName' },
    { title: '文件系统', dataIndex: 'sysTypeName', key: 'sysTypeName' },
    { title: '盘符类型', dataIndex: 'typeName', key: 'typeName' },
    { title: '总大小', dataIndex: 'total', key: 'total' },
    { title: '可用大小', dataIndex: 'free', key: 'free' },
    { title: '已用大小', dataIndex: 'used', key: 'used' },
    {
      title: '已用百分比',
      dataIndex: 'usage',
      key: 'usage',
      render: (text) => <span style={{ color: text > 80 ? '#ff4d4f' : 'inherit' }}>{text}%</span>,
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Spin spinning={loading} tip="正在加载服务监控数据，请稍候！">
        <Row gutter={16}>
          {/* CPU信息 */}
          <Col span={12} style={{ marginBottom: 16 }}>
            <Card title={<><CloudServerOutlined /> CPU</>}>
              <Table
                columns={cpuColumns}
                dataSource={cpuData}
                pagination={false}
                size="small"
                showHeader={false}
              />
            </Card>
          </Col>

          {/* 内存信息 */}
          <Col span={12} style={{ marginBottom: 16 }}>
            <Card title={<><DatabaseOutlined /> 内存</>}>
              <Table
                columns={memColumns}
                dataSource={memData}
                pagination={false}
                size="small"
                showHeader={false}
              />
            </Card>
          </Col>

          {/* 服务器信息 */}
          <Col span={24} style={{ marginBottom: 16 }}>
            <Card title={<><MonitorOutlined /> 服务器信息</>}>
              <Table
                columns={[
                  { title: '名称', dataIndex: 'name', key: 'name', width: 120 },
                  { title: '值1', dataIndex: 'value1', key: 'value1' },
                  { title: '名称2', dataIndex: 'name2', key: 'name2', width: 120 },
                  { title: '值2', dataIndex: 'value2', key: 'value2' },
                ]}
                dataSource={sysData}
                pagination={false}
                size="small"
                showHeader={false}
              />
            </Card>
          </Col>

          {/* Java虚拟机信息 */}
          <Col span={24} style={{ marginBottom: 16 }}>
            <Card title={<><CoffeeOutlined /> Java虚拟机信息</>}>
              <Table
                columns={[
                  { title: '名称', dataIndex: 'name', key: 'name', width: 120 },
                  { title: '值', dataIndex: 'value1', key: 'value1' },
                  { title: '名称2', dataIndex: 'name2', key: 'name2', width: 120 },
                  { title: '值2', dataIndex: 'value2', key: 'value2' },
                ]}
                dataSource={jvmData}
                pagination={false}
                size="small"
                showHeader={false}
              />
            </Card>
          </Col>

          {/* 磁盘状态 */}
          <Col span={24}>
            <Card title={<><HddOutlined /> 磁盘状态</>}>
              <Table
                columns={diskColumns}
                dataSource={server.sysFiles || []}
                pagination={false}
                size="small"
                rowKey={(record) => record.dirName}
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default ServerPage;
