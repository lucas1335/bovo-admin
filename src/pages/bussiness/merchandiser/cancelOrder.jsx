import React, { useState, useEffect } from 'react';
import { Card, DatePicker, Form, Input, Button, Table } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import CmBasePage from '@components/CmBasePage';
import { listCancelFollowLog } from '@api/modules/merchandiser';

const { RangePicker } = DatePicker;

/**
 * 取消跟单页面
 * 显示跟单员的取消跟单记录
 */
const CancelOrderPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [total, setTotal] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // 默认时间范围（最近24小时）
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(24, 'hour'),
    dayjs()
  ]);

  // 获取数据
  const fetchData = async (params = {}) => {
    setLoading(true);
    try {
      const queryParams = {
        pageNum: params.current || 1,
        pageSize: params.pageSize || 20,
        beginTime: dateRange[0].format('YYYY-MM-DD HH:mm:ss'),
        endTime: dateRange[1].format('YYYY-MM-DD HH:mm:ss'),
        ...form.getFieldsValue()
      };
      
      const res = await listCancelFollowLog(queryParams);
      setDataSource(res.rows || []);
      setTotal(res.total || 0);
    } catch (error) {
      console.error('获取数据失败', error);
    } finally {
      setLoading(false);
    }
  };

  // 搜索
  const handleSearch = () => {
    fetchData({ current: 1, pageSize: 20 });
  };

  // 重置
  const handleReset = () => {
    form.resetFields();
    setDateRange([dayjs().subtract(24, 'hour'), dayjs()]);
    fetchData({ current: 1, pageSize: 20 });
  };

  // 日期范围变化
  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };

  // 表格列配置
  const columns = [
    {
      title: '跟单员ID',
      dataIndex: 'merchandiserId',
      align: 'center',
      width: 120
    },
    {
      title: '跟单用户ID',
      dataIndex: 'followUserId',
      align: 'center',
      width: 120
    },
    {
      title: '跟单金额',
      dataIndex: 'merchandiserAmount',
      align: 'center',
      width: 120,
      render: (text) => text || 0
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      align: 'center',
      width: 180
    },
    {
      title: '取消次数',
      dataIndex: 'cancelNum',
      align: 'center',
      width: 100
    }
  ];

  // 初始化
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="app-container">
      <Card size="small" style={{ marginBottom: 16 }}>
        <Form
          form={form}
          layout="inline"
          style={{ marginBottom: 0 }}
        >
          <Form.Item label="跟单员ID" name="merchandiserId">
            <Input placeholder="请输入" allowClear style={{ width: 150 }} />
          </Form.Item>
          <Form.Item label="跟单用户ID" name="followUserId">
            <Input placeholder="请输入" allowClear style={{ width: 150 }} />
          </Form.Item>
          <Form.Item label="查询时间">
            <RangePicker
              showTime
              value={dateRange}
              onChange={handleDateRangeChange}
              style={{ width: 350 }}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
              搜索
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleReset} style={{ marginLeft: 8 }}>
              重置
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Table
        loading={loading}
        columns={columns}
        dataSource={dataSource}
        rowKey="id"
        scroll={{ y: 'calc(100vh - 360px)' }}
        bordered
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys
        }}
        pagination={{
          current: 1,
          pageSize: 20,
          total,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (page, pageSize) => fetchData({ current: page, pageSize })
        }}
      />
    </div>
  );
};

export default CancelOrderPage;
