import React, { useState, useEffect, useRef } from 'react';
import { Card, DatePicker, Button, Table, Form, message } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { getUserMoneyInfo } from '@api';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

/**
 * 每日数据统计页面
 */
const DayDataPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(null);
  const [userMoneyList, setUserMoneyList] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 200,
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const tableRef = useRef(null);

  /**
   * 初始化默认时间范围（24小时）
   */
  const initDefaultDateRange = () => {
    const endTime = new Date();
    const beginTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);
    const range = [dayjs(beginTime), dayjs(endTime)];
    setDateRange(range);
    return {
      startTime: dayjs(beginTime).format('YYYY-MM-DD HH:mm:ss'),
      endTime: dayjs(endTime).format('YYYY-MM-DD HH:mm:ss'),
    };
  };

  /**
   * 查询用户资金信息列表
   */
  const getList = async (params = {}) => {
    setLoading(true);
    try {
      const timeParams = dateRange && dateRange.length === 2 ? {
        startTime: dayjs(dateRange[0]).format('YYYY-MM-DD HH:mm:ss'),
        endTime: dayjs(dateRange[1]).format('YYYY-MM-DD HH:mm:ss'),
      } : {};

      const requestParams = {
        pageNum: params.current || pagination.current,
        pageSize: params.pageSize || pagination.pageSize,
        ...timeParams,
      };

      const response = await getUserMoneyInfo(requestParams);
      if (response.code === 200) {
        setUserMoneyList(response.rows || response.data || []);
        setTotal(response.total || 0);
      } else {
        message.error(response.msg || '获取数据失败');
      }
    } catch (error) {
      message.error('获取数据失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 日期范围变化处理
   */
  const handleDateChange = (dates) => {
    setDateRange(dates);
  };

  /**
   * 搜索按钮操作
   */
  const handleQuery = () => {
    setPagination({ ...pagination, current: 1 });
    getList({ current: 1, pageSize: pagination.pageSize });
  };

  /**
   * 重置按钮操作
   */
  const resetQuery = () => {
    const defaultTimes = initDefaultDateRange();
    form.resetFields();
    setDateRange([dayjs(defaultTimes.startTime), dayjs(defaultTimes.endTime)]);
    setPagination({ ...pagination, current: 1 });
    getList({ current: 1, pageSize: pagination.pageSize });
  };

  /**
   * 表格分页变化
   */
  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
    getList({ current: newPagination.current, pageSize: newPagination.pageSize });
  };

  /**
   * 多选框选中数据
   */
  const handleSelectionChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  useEffect(() => {
    const defaultTimes = initDefaultDateRange();
    form.setFieldsValue({
      dateRange: [dayjs(defaultTimes.startTime), dayjs(defaultTimes.endTime)],
    });
    getList();
  }, []);

  const columns = [
    {
      title: '日期',
      dataIndex: 'statisticDate',
      key: 'statisticDate',
      width: 150,
      align: 'center',
    },
    {
      title: '总注册人数',
      dataIndex: 'totalRegistUserNum',
      key: 'totalRegistUserNum',
      width: 150,
      align: 'center',
    },
    {
      title: '新增注册人数',
      dataIndex: 'newAddRegistUserNum',
      key: 'newAddRegistUserNum',
      width: 150,
      align: 'center',
    },
    {
      title: '日充人数',
      dataIndex: 'chargeUserNum',
      key: 'chargeUserNum',
      width: 150,
      align: 'center',
    },
    {
      title: '日充金额',
      dataIndex: 'chargeMoney',
      key: 'chargeMoney',
      width: 200,
      align: 'center',
    },
    {
      title: '总充人数',
      dataIndex: 'totalChargeUserNum',
      key: 'totalChargeUserNum',
      width: 150,
      align: 'center',
    },
    {
      title: '总充金额',
      dataIndex: 'totalChargeMoney',
      key: 'totalChargeMoney',
      width: 200,
      align: 'center',
    },
    {
      title: '日提人数',
      dataIndex: 'withdrawUserNum',
      key: 'withdrawUserNum',
      width: 150,
      align: 'center',
    },
    {
      title: '日提金额',
      dataIndex: 'withdrawMoney',
      key: 'withdrawMoney',
      width: 200,
      align: 'center',
    },
    {
      title: '总提人数',
      dataIndex: 'totalWithdrawNum',
      key: 'totalWithdrawNum',
      width: 150,
      align: 'center',
    },
    {
      title: '总提金额',
      dataIndex: 'totalWithdrawMoney',
      key: 'totalWithdrawMoney',
      width: 200,
      align: 'center',
    },
    {
      title: '普通跟单：当日跟单人数',
      dataIndex: 'followOrderUserNum',
      key: 'followOrderUserNum',
      width: 150,
      align: 'center',
    },
    {
      title: '普通跟单：当日跟单金额',
      dataIndex: 'followOrderMoney',
      key: 'followOrderMoney',
      width: 200,
      align: 'center',
    },
    {
      title: '百分百赔付跟单：当日跟单人数',
      dataIndex: 'followOrderUserNumPay100',
      key: 'followOrderUserNumPay100',
      width: 150,
      align: 'center',
    },
    {
      title: '百分百赔付跟单：当日跟单金额',
      dataIndex: 'followOrderMoneyPay100',
      key: 'followOrderMoneyPay100',
      width: 200,
      align: 'center',
    },
    {
      title: '当日跟单损益',
      dataIndex: 'decreaseFollowOrderMoney',
      key: 'decreaseFollowOrderMoney',
      width: 200,
      align: 'center',
    },
    {
      title: '当日合约玩家数量',
      dataIndex: 'contractPlayerNum',
      key: 'contractPlayerNum',
      width: 150,
      align: 'center',
    },
    {
      title: '当日合约损益',
      dataIndex: 'decreaseContractMoney',
      key: 'decreaseContractMoney',
      width: 200,
      align: 'center',
    },
    {
      title: '用户本金',
      dataIndex: 'userMoney',
      key: 'userMoney',
      width: 200,
      align: 'center',
    },
    {
      title: '总资产',
      dataIndex: 'totalMoney',
      key: 'totalMoney',
      width: 200,
      align: 'center',
      fixed: 'right',
    },
  ];

  return (
    <div>
      <Card>
        <Form
          form={form}
          layout="inline"
          style={{ marginBottom: 16 }}
        >
          <Form.Item label="查询时间" name="dateRange">
            <RangePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              onChange={handleDateChange}
              style={{ width: 380 }}
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleQuery}
              style={{ marginRight: 8 }}
            >
              搜索
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={resetQuery}
            >
              重置
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card style={{ marginTop: 16 }}>
        <Table
          ref={tableRef}
          rowKey="id"
          loading={loading}
          dataSource={userMoneyList}
          columns={columns}
          rowSelection={{
            selectedRowKeys,
            onChange: handleSelectionChange,
          }}
          scroll={{ x: 'max-content', y: 'calc(100vh - 360px)' }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => handleTableChange({ current: page, pageSize }),
          }}
        />
      </Card>
    </div>
  );
};

export default DayDataPage;
