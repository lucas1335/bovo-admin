import React, { useState, useEffect, useContext } from 'react';
import { Card, Form, DatePicker, Button, Table, Alert, Modal, InputNumber, message, TreeSelect } from 'antd';
import { SearchOutlined, ReloadOutlined, DownloadOutlined, SettingOutlined } from '@ant-design/icons';
import { getAgencyCommunityList, getAgencyCommunityRelation, getMerchandiserConfig, updateMerchandiserConfig } from '@api/modules/data';
import { useAuth } from '@contexts/AuthContext';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

/**
 * 代理社区数据列表页面
 */
const MyListPage = () => {
  const { hasRole } = useAuth();
  const [form] = Form.useForm();
  const [configForm] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [detailList, setDetailList] = useState([]);
  const [flattenedDetailList, setFlattenedDetailList] = useState([]);
  const [treeData, setTreeData] = useState([]);
  const [merchandiserConfig, setMerchandiserConfig] = useState({});
  const [configDialogVisible, setConfigDialogVisible] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [timeRange, setTimeRange] = useState(null);

  /**
   * 设置默认时间范围（最近7天）
   */
  const setDefaultTimeRange = () => {
    const endDate = dayjs();
    const startDate = dayjs().subtract(7, 'day');
    const defaultRange = [startDate, endDate];
    setTimeRange(defaultRange);
    form.setFieldValue('timeRange', defaultRange);
    return {
      beginTime: startDate.format('YYYY-MM-DD HH:mm:ss'),
      endTime: endDate.format('YYYY-MM-DD HH:mm:ss')
    };
  };

  /**
   * 查询列表数据
   */
  const getList = async (params = {}) => {
    setLoading(true);
    try {
      const timeRangeValues = form.getFieldValue('timeRange');
      const beginTime = timeRangeValues && timeRangeValues[0]
        ? timeRangeValues[0].format('YYYY-MM-DD HH:mm:ss')
        : null;
      const endTime = timeRangeValues && timeRangeValues[1]
        ? timeRangeValues[1].format('YYYY-MM-DD HH:mm:ss')
        : null;

      const requestParams = {
        pageNum: 1,
        pageSize: 200,
        inviterUserIdArr: selectedAgency ? collectAllSubIds(selectedAgency) : [],
        beginTime,
        endTime,
        ...params
      };

      // 获取代理关系树
      const relationResponse = await getAgencyCommunityRelation();
      if (relationResponse.code === 200) {
        const convertedTreeData = convertToTreeSelectFormat(relationResponse.data);
        setTreeData(convertedTreeData);
      }

      // 获取列表数据
      const response = await getAgencyCommunityList(requestParams);
      if (response.code === 200) {
        setDetailList(response.data || []);
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
   * 将数据转换为TreeSelect格式
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
        key: `node_${item.id}_${nodePath}`
      };

      if (item.children && Array.isArray(item.children) && item.children.length > 0) {
        treeNode.children = convertToTreeSelectFormat(item.children, nodePath);
      }

      return treeNode;
    });
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
      node.children.forEach(child => {
        collectSubIdsRecursively(child, allIds);
      });
    }
  };

  /**
   * 扁平化表格数据
   */
  useEffect(() => {
    if (!detailList || !Array.isArray(detailList)) {
      setFlattenedDetailList([]);
      return;
    }

    const flattened = detailList.map((item, index) => ({
      ...item,
      uniqueId: `main_${item.appUserId}_${index}`,
      key: `main_${item.appUserId}_${index}`,
      level: 0
    }));

    setFlattenedDetailList(flattened);
  }, [detailList]);

  /**
   * 获取跟单配置
   */
  const fetchMerchandiserConfig = async () => {
    try {
      const response = await getMerchandiserConfig();
      if (response.code === 200 && response.data) {
        setMerchandiserConfig(response.data.content || {});
      }
    } catch (error) {
      console.error('获取跟单配置失败:', error);
    }
  };

  /**
   * 打开配置弹窗
   */
  const handleMerchandiserConfig = () => {
    if (merchandiserConfig && Object.keys(merchandiserConfig).length > 0) {
      configForm.setFieldsValue(JSON.parse(JSON.stringify(merchandiserConfig)));
    } else {
      const defaultConfig = {
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
          { level: 10, min: 50001, max: null, rebate_ratio: 0.95 }
        ]
      };
      configForm.setFieldsValue(defaultConfig);
    }
    setConfigDialogVisible(true);
  };

  /**
   * 提交配置
   */
  const submitConfig = async () => {
    try {
      const values = await configForm.validateFields();

      // 验证等级配置
      if (!validateLevels(values.levels)) {
        return;
      }

      const response = await updateMerchandiserConfig({ content: values });
      if (response.code === 200) {
        message.success('配置更新成功');
        setConfigDialogVisible(false);
        fetchMerchandiserConfig();
      } else {
        message.error(response.msg || '配置更新失败');
      }
    } catch (error) {
      console.error('更新配置失败:', error);
      message.error('配置更新失败');
    }
  };

  /**
   * 验证等级配置
   */
  const validateLevels = (levels) => {
    if (!levels || levels.length === 0) {
      message.error('至少需要一个等级配置');
      return false;
    }

    for (let i = 0; i < levels.length; i++) {
      const level = levels[i];
      if (level.level !== i) {
        message.error('等级编号必须连续');
        return false;
      }
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
   * 搜索按钮操作
   */
  const handleQuery = () => {
    getList();
  };

  /**
   * 重置按钮操作
   */
  const resetQuery = () => {
    form.resetFields();
    const defaultTimes = setDefaultTimeRange();
    setSelectedAgency(null);
    getList();
  };

  /**
   * 代理选择变化
   */
  const handleAgencyChange = (value) => {
    setSelectedAgency(value);
  };

  /**
   * 时间范围变化
   */
  const handleTimeRangeChange = (dates) => {
    setTimeRange(dates);
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
        '序号': index + 1,
        '用户ID': item.appUserId || '',
        '用户名': item.userName || '',
        '代理ID': item.agencyUserId || '',
        '社区注册人数': item.communityUserCount || 0,
        '实际跟单人数': item.merchandiserFollowCount || 0,
        '跟单总额': item.merchandiserAmount || 0,
        '充值总额': item.totalRechargeAmount || 0,
        '提币总额': item.totalWithdrawAmount || 0,
        '总充值人数': item.totalRechargeCount || 0,
        '总提现人数': item.totalWithdrawCount || 0,
        '今日充值': item.todayRechargeAmount || 0,
        '今日提币': item.todayWithdrawAmount || 0,
        '今日提币人数': item.todayWithdrawCount || 0,
        '今日充值人数': item.todayRechargeCount || 0,
        '当日客损': item.todayProfitLoss || 0,
        '总资产': item.totalAssetAmount || 0
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

    data.forEach(row => {
      const values = headers.map(header => {
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

  /**
   * 检查是否显示配置按钮
   */
  const canShowConfigButton = () => {
    return hasRole('admin') || hasRole('agent');
  };

  /**
   * 禁用未来日期
   */
  const disabledDate = (current) => {
    return current && current > dayjs().endOf('day');
  };

  useEffect(() => {
    const defaultTimes = setDefaultTimeRange();
    getList({
      beginTime: defaultTimes.beginTime,
      endTime: defaultTimes.endTime
    });

    // 非代理角色获取跟单配置
    if (!hasRole('agent')) {
      fetchMerchandiserConfig();
    }
  }, []);

  const columns = [
    {
      title: '用户ID',
      dataIndex: 'appUserId',
      key: 'appUserId',
      align: 'center',
      width: 100,
    },
    {
      title: '用户名',
      dataIndex: 'userName',
      key: 'userName',
      align: 'center',
      width: 200,
      render: (text, record) => (
        <span style={{ paddingLeft: `${(record.level || 0) * 20}px` }}>
          {text}
        </span>
      ),
    },
    {
      title: '代理ID',
      dataIndex: 'agencyUserId',
      key: 'agencyUserId',
      align: 'center',
      width: 100,
    },
    {
      title: '社区注册人数',
      dataIndex: 'communityUserCount',
      key: 'communityUserCount',
      align: 'center',
      width: 120,
    },
    {
      title: '实际跟单人数',
      dataIndex: 'merchandiserFollowCount',
      key: 'merchandiserFollowCount',
      align: 'center',
      width: 120,
    },
    {
      title: '跟单总额',
      dataIndex: 'merchandiserAmount',
      key: 'merchandiserAmount',
      align: 'center',
      width: 120,
    },
    {
      title: '充值总额',
      dataIndex: 'totalRechargeAmount',
      key: 'totalRechargeAmount',
      align: 'center',
      width: 120,
    },
    {
      title: '提币总额',
      dataIndex: 'totalWithdrawAmount',
      key: 'totalWithdrawAmount',
      align: 'center',
      width: 120,
    },
    {
      title: '总充值人数',
      dataIndex: 'totalRechargeCount',
      key: 'totalRechargeCount',
      align: 'center',
      width: 120,
    },
    {
      title: '总提现人数',
      dataIndex: 'totalWithdrawCount',
      key: 'totalWithdrawCount',
      align: 'center',
      width: 120,
    },
    {
      title: '今日充值',
      dataIndex: 'todayRechargeAmount',
      key: 'todayRechargeAmount',
      align: 'center',
      width: 120,
    },
    {
      title: '今日提币',
      dataIndex: 'todayWithdrawAmount',
      key: 'todayWithdrawAmount',
      align: 'center',
      width: 120,
    },
    {
      title: '今日提币人数',
      dataIndex: 'todayWithdrawCount',
      key: 'todayWithdrawCount',
      align: 'center',
      width: 120,
    },
    {
      title: '今日充值人数',
      dataIndex: 'todayRechargeCount',
      key: 'todayRechargeCount',
      align: 'center',
      width: 120,
    },
    {
      title: '当日客损',
      dataIndex: 'todayProfitLoss',
      key: 'todayProfitLoss',
      align: 'center',
      render: (text) => (
        <span style={{ color: text > 0 ? 'rgba(80, 228, 6, 1)' : 'rgba(255, 0, 0, 1)' }}>
          {text || 0}
        </span>
      ),
    },
    {
      title: '总资产',
      dataIndex: 'totalAssetAmount',
      key: 'totalAssetAmount',
      align: 'center',
      width: 120,
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
              treeData={treeData}
              onChange={handleAgencyChange}
            />
          </Form.Item>

          <Form.Item label="时间范围" name="timeRange">
            <RangePicker
              style={{ width: 360 }}
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              disabledDate={disabledDate}
              onChange={handleTimeRangeChange}
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

          {canShowConfigButton() && (
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
        style={{ marginBottom: 16 }}
      />

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Button
            type="primary"
            ghost
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
          loading={loading}
          dataSource={flattenedDetailList}
          columns={columns}
          scroll={{ x: 'max-content', y: 'calc(100vh - 360px)' }}
          pagination={false}
          rowKey="uniqueId"
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
          initialValues={{ valid_user_threshold: 500, levels: [] }}
        >
          <Form.Item
            label="返佣门槛"
            name="valid_user_threshold"
            rules={[{ required: true, message: '请输入有效用户阈值' }]}
          >
            <InputNumber min={0} precision={0} style={{ width: 200 }} />
          </Form.Item>

          <Form.Item label="等级配置">
            <Form.List name="levels">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Card
                      key={key}
                      size="small"
                      style={{ marginBottom: 16 }}
                      title={`等级 ${name}`}
                      extra={
                        name > 0 ? (
                          <Button
                            type="link"
                            danger
                            onClick={() => remove(name)}
                          >
                            删除
                          </Button>
                        ) : null
                      }
                    >
                      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                        <Form.Item
                          {...restField}
                          name={[name, 'level']}
                          initialValue={name}
                          hidden
                        >
                          <InputNumber />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          name={[name, 'min']}
                          label="最小值"
                          rules={[{ required: true, message: '请输入最小值' }]}
                        >
                          <InputNumber min={0} precision={0} style={{ width: 120 }} />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          name={[name, 'max']}
                          label="最大值"
                          rules={[{ required: true, message: '请输入最大值' }]}
                        >
                          <InputNumber min={0} precision={0} style={{ width: 120 }} />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          name={[name, 'rebate_ratio']}
                          label="返佣比例"
                          rules={[
                            { required: true, message: '请输入返佣比例' },
                            { type: 'number', min: 0, max: 1, message: '返佣比例应在0-1之间' }
                          ]}
                        >
                          <InputNumber min={0} max={1} precision={2} step={0.01} style={{ width: 120 }} />
                        </Form.Item>
                      </div>
                    </Card>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => add({ level: fields.length, min: 0, max: null, rebate_ratio: 0 })}
                    block
                    icon={<SearchOutlined />}
                  >
                    添加等级
                  </Button>
                </>
              )}
            </Form.List>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MyListPage;
