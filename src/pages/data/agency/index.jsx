import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  TreeSelect,
  DatePicker,
  Button,
  Table,
  Form,
  InputNumber,
  message,
  Modal,
  Alert,
  Tag,
  Row,
  Col,
} from 'antd';
import {
  SearchOutlined,
  SettingOutlined,
  DownloadOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { getAgencyCommunityList, getAgencyCommunityRelation, getMerchandiserConfig, updateMerchandiserConfig } from '@api/modules/data';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

/**
 * 代理社区统计页面
 */
const AgencyPage = () => {
  const [form] = Form.useForm();
  const [configForm] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [detailList, setDetailList] = useState([]);
  const [treeData, setTreeData] = useState([]);
  const [merchandiserConfig, setMerchandiserConfig] = useState({});
  const [configDialogVisible, setConfigDialogVisible] = useState(false);
  const [configFormValues, setConfigFormValues] = useState({
    valid_user_threshold: 500,
    levels: [],
  });
  const [timeRange, setTimeRange] = useState(null);
  const [summaryData, setSummaryData] = useState(null);

  // 检查是否可以显示配置按钮（根据角色权限）
  const canShowConfigButton = useMemo(() => {
    // 这里需要根据实际的用户角色逻辑来判断
    // 暂时返回true，实际使用时需要结合用户权限系统
    const roles = JSON.parse(localStorage.getItem('roles') || '[]');
    return roles.includes('admin') || roles.includes('Admin');
  }, []);

  // 扁平化表格数据，只展示一层
  const flattenedDetailList = useMemo(() => {
    if (!detailList || !Array.isArray(detailList)) {
      return [];
    }
    return detailList.map((item, index) => ({
      ...item,
      uniqueId: `main_${item.appUserId}_${index}`,
      hasChildren: false,
      children: [],
      level: 0,
    }));
  }, [detailList]);

  /**
   * 设置默认时间范围（最近7天）
   */
  const setDefaultTimeRange = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);

    const range = [dayjs(startDate), dayjs(endDate)];
    setTimeRange(range);
    form.setFieldsValue({
      timeRange: range,
    });

    return {
      beginTime: dayjs(startDate).format('YYYY-MM-DD HH:mm:ss'),
      endTime: dayjs(endDate).format('YYYY-MM-DD HH:mm:ss'),
    };
  };

  /**
   * 查询代理社区列表
   */
  const getList = async (inviterUserIdArr = []) => {
    setLoading(true);
    try {
      const timeParams = timeRange && timeRange.length === 2 ? {
        beginTime: dayjs(timeRange[0]).format('YYYY-MM-DD HH:mm:ss'),
        endTime: dayjs(timeRange[1]).format('YYYY-MM-DD HH:mm:ss'),
      } : {};

      const requestParams = {
        pageNum: 1,
        pageSize: 200,
        inviterUserIdArr,
        ...timeParams,
      };

      const response = await getAgencyCommunityList(requestParams);
      if (response.code === 200) {
        const allData = response.data || [];

        // 查找合计行（agencyUserName === '合计'）
        const summaryItem = allData.find(item => item.agencyUserName === '合计');

        if (summaryItem) {
          // 分离合计数据和表格数据
          setDetailList(allData.filter(item => item.agencyUserName !== '合计'));
          setSummaryData(summaryItem);
        } else {
          // 没有合计数据
          setDetailList(allData);
          setSummaryData(null);
        }
      } else {
        message.error(response.msg || '获取数据失败');
      }

      // 获取代理选择树形数据
      const treeResponse = await getAgencyCommunityRelation();
      if (treeResponse.code === 200) {
        setTreeData(convertToTreeSelectFormat(treeResponse.data));
      }
    } catch (error) {
      message.error('获取数据失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 将新的数据结构转换为 treeselect 组件需要的格式
   */
  const convertToTreeSelectFormat = (data, parentPath = '') => {
    if (!data || !Array.isArray(data)) {
      return [];
    }

    return data.map((item, index) => {
      const nodePath = parentPath ? `${parentPath}_${index}` : `${index}`;
      const treeNode = {
        title: `代理 ${item.id}`,
        value: item.id,
        key: `node_${item.id}_${nodePath}`,
      };

      if (item.children && Array.isArray(item.children) && item.children.length > 0) {
        treeNode.children = convertToTreeSelectFormat(item.children, nodePath);
      }

      return treeNode;
    });
  };

  /**
   * 获取跟单配置
   */
  const getMerchandiserConfigData = async () => {
    try {
      const response = await getMerchandiserConfig();
      if (response.code === 200) {
        setMerchandiserConfig(response.data.content || {});
      }
    } catch (error) {
      console.error('获取配置失败:', error);
    }
  };

  /**
   * 时间范围变化处理
   */
  const handleTimeRangeChange = (dates) => {
    setTimeRange(dates);
    if (dates && dates.length === 2) {
      // 清空代理选择
      form.setFieldsValue({ agencySelect: null });
      // 调用接口查询
      getList([]);
    } else {
      // 重新获取所有数据
      getList([]);
    }
  };

  /**
   * 代理选择变化处理
   */
  const handleAgencyChange = (value) => {
    if (value) {
      // 收集选中代理及其所有下级ID
      const inviterUserIdArr = collectAllSubIds(value);
      // 调用接口查询指定代理的数据
      getList(inviterUserIdArr);
    } else {
      getList([]);
    }
  };

  /**
   * 收集选中代理及其所有下级ID
   */
  const collectAllSubIds = (selectedId) => {
    const allIds = [];

    const findAndCollectIds = (data, targetId) => {
      for (const item of data) {
        if (item.value === targetId) {
          collectSubIdsRecursively(item, allIds);
          return true;
        }
        if (item.children && item.children.length > 0) {
          if (findAndCollectIds(item.children, targetId)) {
            return true;
          }
        }
      }
      return false;
    };

    findAndCollectIds(treeData, selectedId);
    return allIds;
  };

  /**
   * 递归收集节点及其所有下级ID
   */
  const collectSubIdsRecursively = (node, allIds) => {
    allIds.push(node.value);

    if (node.children && node.children.length > 0) {
      node.children.forEach((child) => {
        collectSubIdsRecursively(child, allIds);
      });
    }
  };

  /**
   * 搜索按钮操作
   */
  const handleQuery = () => {
    const agencySelect = form.getFieldValue('agencySelect');
    const inviterUserIdArr = agencySelect ? collectAllSubIds(agencySelect) : [];
    getList(inviterUserIdArr);
  };

  /**
   * 打开配置弹窗
   */
  const handleMerchandiserConfig = () => {
    if (merchandiserConfig && Object.keys(merchandiserConfig).length > 0) {
      setConfigFormValues(JSON.parse(JSON.stringify(merchandiserConfig)));
    } else {
      setConfigFormValues({
        valid_user_threshold: 500,
        levels: [
          { level: 0, min: 0, max: 0, rebate_ratio: 0 },
          { level: 1, min: 1, max: 5, rebate_ratio: 0.1 },
          { level: 2, min: 6, max: 15, rebate_ratio: 0.15 },
          { level: 3, min: 16, max: 50, rebate_ratio: 0.25 },
          { level: 4, min: 51, max: 150, rebate_ratio: 0.35 },
          { level: 5, min: 151, max: 500, rebate_ratio: 0.45 },
          { level: 6, min: 501, max: 1500, rebate_ratio: 0.55 },
          { level: 7, min: 1501, max: 5000, rebate_ratio: 0.65 },
          { level: 8, min: 5001, max: 15000, rebate_ratio: 0.75 },
          { level: 9, min: 15001, max: 50000, rebate_ratio: 0.85 },
          { level: 10, min: 50001, max: null, rebate_ratio: 0.95 },
        ],
      });
    }
    setConfigDialogVisible(true);
  };

  /**
   * 添加等级
   */
  const addLevel = () => {
    const newLevel = {
      level: configFormValues.levels.length,
      min: 0,
      max: null,
      rebate_ratio: 0,
    };
    setConfigFormValues({
      ...configFormValues,
      levels: [...configFormValues.levels, newLevel],
    });
  };

  /**
   * 删除等级
   */
  const removeLevel = (index) => {
    if (configFormValues.levels.length > 1) {
      const newLevels = configFormValues.levels.filter((_, i) => i !== index);
      // 重新调整等级编号
      newLevels.forEach((level, idx) => {
        level.level = idx;
      });
      setConfigFormValues({
        ...configFormValues,
        levels: newLevels,
      });
    }
  };

  /**
   * 提交配置
   */
  const submitConfig = async () => {
    try {
      await configForm.validateFields();

      // 验证等级配置
      if (!validateLevels()) {
        return;
      }

      const response = await updateMerchandiserConfig({ content: configFormValues });
      if (response.code === 200) {
        message.success('配置更新成功');
        setConfigDialogVisible(false);
        getMerchandiserConfigData();
      } else {
        message.error(response.msg || '配置更新失败');
      }
    } catch (error) {
      if (error.errorFields) {
        return;
      }
      message.error('配置更新失败: ' + error.message);
    }
  };

  /**
   * 验证等级配置
   */
  const validateLevels = () => {
    const levels = configFormValues.levels;

    if (levels.length === 0) {
      message.error('至少需要一个等级配置');
      return false;
    }

    for (let i = 0; i < levels.length; i++) {
      if (levels[i].level !== i) {
        message.error('等级编号必须连续');
        return false;
      }
    }

    for (let i = 0; i < levels.length; i++) {
      const level = levels[i];
      if (level.min < 0) {
        message.error(`等级${level.level}的最小值不能小于0`);
        return false;
      }

      if (level.max !== null && level.max < level.min) {
        message.error(`等级${level.level}的最大值不能小于最小值`);
        return false;
      }

      if (level.rebate_ratio < 0 || level.rebate_ratio > 1) {
        message.error(`等级${level.level}的返佣比例应在0-1之间`);
        return false;
      }
    }

    return true;
  };

  /**
   * 导出数据
   */
  const handleExport = () => {
    if (!flattenedDetailList || flattenedDetailList.length === 0) {
      message.warning('暂无数据可导出');
      return;
    }

    setExportLoading(true);

    try {
      const exportData = flattenedDetailList.map((item, index) => ({
        序号: index + 1,
        用户ID: item.appUserId || '',
        用户名: item.userName || '',
        代理ID: item.agencyUserId || '',
        社区注册人数: item.communityUserCount || 0,
        实际跟单人数: item.merchandiserFollowCount || 0,
        跟单总额: item.merchandiserAmount || 0,
        充值总额: item.totalRechargeAmount || 0,
        提币总额: item.totalWithdrawAmount || 0,
        总充值人数: item.totalRechargeCount || 0,
        总提现人数: item.totalWithdrawCount || 0,
        今日充值: item.todayRechargeAmount || 0,
        今日提币: item.todayWithdrawAmount || 0,
        今日提币人数: item.todayWithdrawCount || 0,
        今日充值人数: item.todayRechargeCount || 0,
        当日客损: item.todayProfitLoss || 0,
        总资产: item.totalAssetAmount || 0,
      }));

      const csvContent = generateCSV(exportData);
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `代理数据_${getCurrentDateTime()}.csv`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      message.success('数据导出成功');
    } catch (error) {
      console.error('导出失败:', error);
      message.error('数据导出失败，请重试');
    } finally {
      setExportLoading(false);
    }
  };

  /**
   * 生成CSV内容
   */
  const generateCSV = (data) => {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [];

    csvRows.push(headers.join(','));

    data.forEach((row) => {
      const values = headers.map((header) => {
        const value = row[header];
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvRows.push(values.join(','));
    });

    return csvRows.join('\n');
  };

  /**
   * 获取当前日期时间字符串
   */
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}_${hours}${minutes}${seconds}`;
  };

  useEffect(() => {
    const defaultTimes = setDefaultTimeRange();
    setTimeRange([dayjs(defaultTimes.beginTime), dayjs(defaultTimes.endTime)]);
    getList([]);

    const roles = JSON.parse(localStorage.getItem('roles') || '[]');
    if (!roles.includes('agent')) {
      getMerchandiserConfigData();
    }
  }, []);

  const columns = [
    {
      title: '用户ID',
      dataIndex: 'appUserId',
      key: 'appUserId',
      width: 100,
      align: 'center',
    },
    {
      title: '用户名',
      dataIndex: 'userName',
      key: 'userName',
      width: 200,
      align: 'center',
      render: (text, record) => (
        <span style={{ paddingLeft: (record.level || 0) * 20 + 'px' }}>{text}</span>
      ),
    },
    {
      title: '代理ID',
      dataIndex: 'agencyUserId',
      key: 'agencyUserId',
      width: 100,
      align: 'center',
    },
    {
      title: '社区注册人数',
      dataIndex: 'communityUserCount',
      key: 'communityUserCount',
      width: 120,
      align: 'center',
    },
    {
      title: '实际跟单人数',
      dataIndex: 'merchandiserFollowCount',
      key: 'merchandiserFollowCount',
      width: 120,
      align: 'center',
    },
    {
      title: '跟单总额',
      dataIndex: 'merchandiserAmount',
      key: 'merchandiserAmount',
      width: 120,
      align: 'center',
    },
    {
      title: '充值总额',
      dataIndex: 'totalRechargeAmount',
      key: 'totalRechargeAmount',
      width: 120,
      align: 'center',
    },
    {
      title: '提币总额',
      dataIndex: 'totalWithdrawAmount',
      key: 'totalWithdrawAmount',
      width: 120,
      align: 'center',
    },
    {
      title: '总充值人数',
      dataIndex: 'totalRechargeCount',
      key: 'totalRechargeCount',
      width: 120,
      align: 'center',
    },
    {
      title: '总提现人数',
      dataIndex: 'totalWithdrawCount',
      key: 'totalWithdrawCount',
      width: 120,
      align: 'center',
    },
    {
      title: '今日充值',
      dataIndex: 'todayRechargeAmount',
      key: 'todayRechargeAmount',
      width: 120,
      align: 'center',
    },
    {
      title: '今日提币',
      dataIndex: 'todayWithdrawAmount',
      key: 'todayWithdrawAmount',
      width: 120,
      align: 'center',
    },
    {
      title: '今日提币人数',
      dataIndex: 'todayWithdrawCount',
      key: 'todayWithdrawCount',
      width: 120,
      align: 'center',
    },
    {
      title: '今日充值人数',
      dataIndex: 'todayRechargeCount',
      key: 'todayRechargeCount',
      width: 120,
      align: 'center',
    },
    {
      title: '当日客损',
      dataIndex: 'todayProfitLoss',
      key: 'todayProfitLoss',
      align: 'center',
      render: (value) => (
        <span style={{ color: value > 0 ? 'rgba(80, 228, 6, 1)' : 'rgba(255, 0, 0, 1)' }}>
          {value || 0}
        </span>
      ),
    },
    {
      title: '总资产',
      dataIndex: 'totalAssetAmount',
      key: 'totalAssetAmount',
      width: 120,
      align: 'center',
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
          <Form.Item label="代理选择" name="agencySelect">
            <TreeSelect
              style={{ width: 300 }}
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              placeholder="请选择代理"
              allowClear
              showSearch
              treeDefaultExpandAll
              onChange={handleAgencyChange}
              treeData={treeData}
            />
          </Form.Item>
          <Form.Item label="时间范围" name="timeRange">
            <RangePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              style={{ width: 360 }}
              onChange={handleTimeRangeChange}
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleQuery}
            >
              搜索
            </Button>
          </Form.Item>
          {canShowConfigButton && (
            <Form.Item>
              <Button
                type="primary"
                danger
                icon={<SettingOutlined />}
                onClick={handleMerchandiserConfig}
              >
                获取跟单配置
              </Button>
            </Form.Item>
          )}
        </Form>
      </Card>

      {/* 数据合计卡片 */}
      {summaryData && (
        <Card style={{ marginBottom: 16 }} title="数据合计">
          <Row gutter={[20, 8]}>
            <Col span={6}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span>社区注册人数：</span>
                <span style={{ fontWeight: 'bold' }}>{summaryData.communityUserCount || 0}</span>
              </div>
            </Col>
            <Col span={6}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span>实际跟单人数：</span>
                <span style={{ fontWeight: 'bold' }}>{summaryData.merchandiserFollowCount || 0}</span>
              </div>
            </Col>
            <Col span={6}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span>充值总额：</span>
                <span style={{ fontWeight: 'bold' }}>{summaryData.recharge || 0}</span>
              </div>
            </Col>
            <Col span={6}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span>提现总额：</span>
                <span style={{ fontWeight: 'bold' }}>{summaryData.withdraw || 0}</span>
              </div>
            </Col>
          </Row>
          <Row gutter={[20, 8]}>
            <Col span={6}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span>充值人数：</span>
                <span style={{ fontWeight: 'bold' }}>{summaryData.rechargeNum || 0}</span>
              </div>
            </Col>
            <Col span={6}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span>提款人数：</span>
                <span style={{ fontWeight: 'bold' }}>{summaryData.withdrawNum || 0}</span>
              </div>
            </Col>
            <Col span={6}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span>跟单资产总额：</span>
                <span style={{ fontWeight: 'bold' }}>{summaryData.merchandiserAmount || 0}</span>
              </div>
            </Col>
            <Col span={6}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span>资产总额：</span>
                <span style={{ fontWeight: 'bold' }}>{summaryData.totalAsset || 0}</span>
              </div>
            </Col>
          </Row>
          <Row gutter={[20, 8]}>
            <Col span={6}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span>当日注册人数：</span>
                <span style={{ fontWeight: 'bold' }}>{summaryData.todayRegister || 0}</span>
              </div>
            </Col>
            <Col span={6}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span>当日提币人数：</span>
                <span style={{ fontWeight: 'bold' }}>{summaryData.todayWithdrawManNum || 0}</span>
              </div>
            </Col>
            <Col span={6}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span>当日充币人数：</span>
                <span style={{ fontWeight: 'bold' }}>{summaryData.todayRechargeManNum || 0}</span>
              </div>
            </Col>
            <Col span={6}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span>当日充币：</span>
                <span style={{ fontWeight: 'bold' }}>{summaryData.todayRecharge || 0}</span>
              </div>
            </Col>
          </Row>
          <Row gutter={[20, 8]}>
            <Col span={6}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span>当日提币：</span>
                <span style={{ fontWeight: 'bold' }}>{summaryData.todayWithdraw || 0}</span>
              </div>
            </Col>
            <Col span={6}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span>当日客损：</span>
                <span
                  style={{
                    fontWeight: 'bold',
                    color: summaryData.todayProfitLoss > 0 ? 'rgba(80, 228, 6, 1)' : 'rgba(255, 0, 0, 1)',
                  }}
                >
                  {summaryData.todayProfitLoss || 0}
                </span>
              </div>
            </Col>
          </Row>
        </Card>
      )}

      {/* 提示信息区域 */}
      <div style={{ margin: '16px 0' }}>
        <Alert
          message="数据查询说明"
          description={
            <div>
              <p>此表格默认显示最近7天数据，如需查询其他时间段请选择时间区间</p>
              <p>注意：查询大量数据可能导致页面卡顿，系统持续优化中</p>
            </div>
          }
          type="info"
          showIcon
          closable={false}
        />
      </div>

      <Card>
        {/* 表格操作按钮 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
            padding: '12px 16px',
            backgroundColor: '#f8f9fa',
            borderRadius: 8,
            border: '1px solid #e9ecef',
          }}
        >
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            loading={exportLoading}
            onClick={handleExport}
          >
            导出数据
          </Button>
          <span style={{ color: '#666', fontSize: 14, fontWeight: 500 }}>
            共 {flattenedDetailList.length} 条数据
          </span>
        </div>

        <Table
          rowKey="uniqueId"
          loading={loading}
          dataSource={flattenedDetailList}
          columns={columns}
          scroll={{ x: 'max-content', y: 'calc(100vh - 360px)' }}
          pagination={false}
        />
      </Card>

      {/* 跟单配置弹窗 */}
      <Modal
        title="跟单配置"
        open={configDialogVisible}
        onOk={submitConfig}
        onCancel={() => setConfigDialogVisible(false)}
        width={800}
        okText="确定"
        cancelText="取消"
      >
        <Form
          form={configForm}
          layout="vertical"
          initialValues={configFormValues}
          onValuesChange={(changedValues, allValues) => setConfigFormValues(allValues)}
        >
          <Form.Item
            label="返佣门槛"
            name="valid_user_threshold"
            rules={[{ required: true, message: '请输入有效用户阈值' }]}
          >
            <InputNumber min={0} precision={0} style={{ width: 200 }} />
          </Form.Item>

          <Form.Item label="等级配置">
            <div>
              {configFormValues.levels.map((level, index) => (
                <div
                  key={level.level}
                  style={{
                    border: '1px solid #dcdfe6',
                    borderRadius: 4,
                    marginBottom: 16,
                    padding: 16,
                    backgroundColor: '#fafafa',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 16,
                    }}
                  >
                    <span style={{ fontWeight: 'bold', fontSize: 16, color: '#303133' }}>
                      等级 {level.level}
                    </span>
                    {index > 0 && (
                      <Button
                        type="primary"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => removeLevel(index)}
                      >
                        删除
                      </Button>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                    <Form.Item
                      label="最小值"
                      name={['levels', index, 'min']}
                      rules={[{ required: true, message: '请输入最小值' }]}
                      style={{ marginBottom: 0 }}
                    >
                      <InputNumber min={0} precision={0} style={{ width: 120 }} />
                    </Form.Item>
                    <Form.Item
                      label="最大值"
                      name={['levels', index, 'max']}
                      rules={[{ required: true, message: '请输入最大值' }]}
                      style={{ marginBottom: 0 }}
                    >
                      <InputNumber
                        min={configFormValues.levels[index]?.min || 0}
                        precision={0}
                        style={{ width: 120 }}
                        placeholder="留空表示无限制"
                      />
                    </Form.Item>
                    <Form.Item
                      label="返佣比例"
                      name={['levels', index, 'rebate_ratio']}
                      rules={[
                        { required: true, message: '请输入返佣比例' },
                        { type: 'number', min: 0, max: 1, message: '返佣比例应在0-1之间' },
                      ]}
                      style={{ marginBottom: 0 }}
                    >
                      <InputNumber
                        min={0}
                        max={1}
                        precision={2}
                        step={0.01}
                        style={{ width: 120 }}
                      />
                    </Form.Item>
                  </div>
                </div>
              ))}
              <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={addLevel}
              >
                添加等级
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AgencyPage;
