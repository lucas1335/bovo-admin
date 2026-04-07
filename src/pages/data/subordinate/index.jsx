import React, { useState, useEffect } from 'react';
import {
  Card,
  Input,
  DatePicker,
  Button,
  Table,
  Modal,
  Tag,
  Row,
  Col,
  message,
} from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { agencyList } from '@api';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

/**
 * 下级代理用户页面
 */
const SubordinatePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tableData, setTableData] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 200,
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [nameList, setNameList] = useState([]);
  const [uidModalVisible, setUidModalVisible] = useState(false);
  const [uidList, setUidList] = useState([]);
  const [uidWithNames, setUidWithNames] = useState([]);
  const [uidSearchText, setUidSearchText] = useState('');
  const [currentRow, setCurrentRow] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  /**
   * 获取合并后的 UID 列表
   */
  const getMergedUidList = (row) => {
    const appUserId = row.appUserId;
    const directFollowerIds = row.directFollowerIds || [];
    const appAllFollowId = row.appAllFollowId || [];

    // appAllFollowId 中不在 directFollowerIds 里的部分（去重）
    const remaining = appAllFollowId.filter((id) => !directFollowerIds.includes(id));

    // 合并：appUserId 在最前面，directFollowerIds 在中间，剩余的在最后
    return [appUserId, ...directFollowerIds, ...remaining];
  };

  /**
   * 判断某个 UID 是否在 directFollowerIds 中
   */
  const isDirectFollower = (uid, row) => {
    const directFollowerIds = row.directFollowerIds || [];
    const uidStr = String(uid).trim();
    return directFollowerIds.some((id) => String(id).trim() === uidStr);
  };

  /**
   * 查看下级用户
   */
  const check = (row) => {
    const appAllUserId = row.appAllUserId;
    const firstUserId = appAllUserId.toString().split(',')[0];
    navigate(`/platform/subordinate?id=${firstUserId}`);
  };

  /**
   * 根据指定UID查看下级用户
   */
  const checkByUid = (uid) => {
    navigate(`/platform/subordinate?id=${uid}`);
  };

  /**
   * 显示名称弹窗
   */
  const showNameModal = (names) => {
    setNameList(names.toString().split(','));
    setNameModalVisible(true);
  };

  /**
   * 显示UID弹窗
   */
  const showUidModal = (uids, row) => {
    const uidArray = uids.toString().split(',');
    const nameArray = row.agencyUserName ? row.agencyUserName.toString().split(',') : [];

    const uidWithNameList = uidArray.map((uid, index) => ({
      uid: uid.trim(),
      name: nameArray[index] ? nameArray[index].trim() : '未知',
    }));

    setUidList(uidArray);
    setUidWithNames(uidWithNameList);
    setCurrentRow(row);
    setUidSearchText('');
    setUidModalVisible(true);
  };

  /**
   * 过滤后的UID列表
   */
  const filteredUidList = uidWithNames.filter(
    (item) =>
      item.uid.trim().toLowerCase().includes(uidSearchText.toLowerCase()) ||
      item.name.trim().toLowerCase().includes(uidSearchText.toLowerCase())
  );

  /**
   * 查询下级代理列表
   */
  const getList = async (params = {}) => {
    setLoading(true);
    try {
      const requestParams = {
        pageNum: params.current || pagination.current,
        pageSize: params.pageSize || pagination.pageSize,
        userId: null,
        startTime: startTime ? dayjs(startTime).format('YYYY-MM-DD') : null,
        endTime: endTime ? dayjs(endTime).format('YYYY-MM-DD') : null,
      };

      const response = await agencyList(requestParams);
      if (response.code === 200) {
        const allData = response.rows;
        const summaryItem = allData.find((item) => item.agencyUserName === '合计');

        if (summaryItem) {
          const tableDataWithoutSummary = allData.filter((item) => item.agencyUserName !== '合计');
          setTableData(tableDataWithoutSummary);
          setSummaryData(summaryItem);
          setTotal(response.total - 1);
        } else {
          setTableData(allData);
          setSummaryData(null);
          setTotal(response.total);
        }
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
    setStartTime(null);
    setEndTime(null);
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
    const userId = new URLSearchParams(window.location.search).get('id');
    if (userId) {
      // 这里需要设置userId到查询参数
    }
    getList();
  }, []);

  const columns = [
    {
      title: '上级代理id',
      dataIndex: 'agencyId',
      key: 'agencyId',
      align: 'center',
    },
    {
      title: '代理id',
      dataIndex: 'appUserId',
      key: 'appUserId',
      align: 'center',
    },
    {
      title: '下级代理uid',
      dataIndex: 'appUserId',
      key: 'subordinateUid',
      width: 200,
      align: 'center',
      render: (appUserId, record) => {
        if (!appUserId) return <div>-</div>;

        const mergedUidList = getMergedUidList(record);

        if (record.appAllFollowId && record.appAllFollowId.length > 0) {
          if (mergedUidList.length <= 2) {
            return (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, justifyContent: 'center' }}>
                {mergedUidList.map((uid, index) => (
                  <span key={index}>
                    {isDirectFollower(uid, record) ? (
                      <Tag color="warning">
                        <span
                          style={{ cursor: 'pointer' }}
                          onClick={() =>
                            record.agencyUserName !== '合计' && checkByUid(uid, record)
                          }
                        >
                          {uid}
                        </span>
                      </Tag>
                    ) : (
                      <span
                        style={{
                          cursor: record.agencyUserName !== '合计' ? 'pointer' : 'default',
                          color: record.agencyUserName !== '合计' ? '#409EFF' : 'inherit',
                        }}
                        onClick={() =>
                          record.agencyUserName !== '合计' && checkByUid(uid, record)
                        }
                      >
                        {uid}
                      </span>
                    )}
                    {index < mergedUidList.length - 1 && ', '}
                  </span>
                ))}
              </div>
            );
          } else {
            return (
              <div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, justifyContent: 'center' }}>
                  {mergedUidList.slice(0, 2).map((uid, index) => (
                    <span key={index}>
                      {isDirectFollower(uid, record) ? (
                        <Tag color="warning">
                          <span
                            style={{ cursor: 'pointer' }}
                            onClick={() =>
                              record.agencyUserName !== '合计' && checkByUid(uid, record)
                            }
                          >
                            {uid}
                          </span>
                        </Tag>
                      ) : (
                        <span
                          style={{
                            cursor: record.agencyUserName !== '合计' ? 'pointer' : 'default',
                            color: record.agencyUserName !== '合计' ? '#409EFF' : 'inherit',
                          }}
                          onClick={() =>
                            record.agencyUserName !== '合计' && checkByUid(uid, record)
                          }
                        >
                          {uid}
                        </span>
                      )}
                      {index < 1 && ', '}
                    </span>
                  ))}
                </div>
                {record.agencyUserName !== '合计' ? (
                  <Button
                    type="link"
                    size="small"
                    onClick={() => showUidModal(mergedUidList, record)}
                    style={{ padding: 0, marginTop: 5 }}
                  >
                    <Tag color="default">+{mergedUidList.length - 2}</Tag>
                  </Button>
                ) : (
                  <Tag color="default">+{mergedUidList.length - 2}</Tag>
                )}
              </div>
            );
          }
        } else {
          return (
            <div>
              {record.agencyUserName !== '合计' ? (
                <span
                  style={{
                    cursor: 'pointer',
                    color: '#409EFF',
                  }}
                  onClick={() => check(record)}
                >
                  {appUserId}
                </span>
              ) : (
                <span>{appUserId}</span>
              )}
            </div>
          );
        }
      },
    },
    {
      title: '下级代理名称',
      dataIndex: 'agencyUserName',
      key: 'agencyUserName',
      width: 150,
      align: 'center',
      render: (agencyUserName) => {
        if (!agencyUserName) return <div>-</div>;

        if (agencyUserName.toString().includes(',')) {
          const names = agencyUserName.toString().split(',');
          return (
            <Button
              type="link"
              size="small"
              onClick={() => showNameModal(agencyUserName)}
              style={{ padding: 0 }}
            >
              {names[0].trim()}
              <Tag color="default" style={{ marginLeft: 5 }}>
                +{names.length - 1}
              </Tag>
            </Button>
          );
        } else {
          return <span>{agencyUserName}</span>;
        }
      },
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      align: 'center',
    },
    {
      title: '社区注册人数',
      dataIndex: 'communityUserCount',
      key: 'communityUserCount',
      align: 'center',
    },
    {
      title: '实际跟单人数',
      dataIndex: 'merchandiserFollowCount',
      key: 'merchandiserFollowCount',
      align: 'center',
    },
    {
      title: '充值总额',
      dataIndex: 'recharge',
      key: 'recharge',
      align: 'center',
    },
    {
      title: '提现总额',
      dataIndex: 'withdraw',
      key: 'withdraw',
      align: 'center',
    },
    {
      title: '充值人数',
      dataIndex: 'rechargeNum',
      key: 'rechargeNum',
      align: 'center',
    },
    {
      title: '提款人数',
      dataIndex: 'withdrawNum',
      key: 'withdrawNum',
      align: 'center',
    },
    {
      title: '跟单资产总额',
      dataIndex: 'merchandiserAmount',
      key: 'merchandiserAmount',
      align: 'center',
    },
    {
      title: '资产总额',
      dataIndex: 'totalAsset',
      key: 'totalAsset',
      align: 'center',
    },
    {
      title: '当日注册人数',
      dataIndex: 'todayRegister',
      key: 'todayRegister',
      align: 'center',
    },
    {
      title: '当日提币人数',
      dataIndex: 'todayWithdrawManNum',
      key: 'todayWithdrawManNum',
      align: 'center',
    },
    {
      title: '当日充币人数',
      dataIndex: 'todayRechargeManNum',
      key: 'todayRechargeManNum',
      align: 'center',
    },
    {
      title: '当日充币',
      dataIndex: 'todayRecharge',
      key: 'todayRecharge',
      align: 'center',
    },
    {
      title: '当日提币',
      dataIndex: 'todayWithdraw',
      key: 'todayWithdraw',
      align: 'center',
    },
    {
      title: '当日客损',
      dataIndex: 'todayProfitLoss',
      key: 'todayProfitLoss',
      align: 'center',
      render: (value) => (
        <span style={{ color: value > 0 ? 'rgba(80, 228, 6, 1)' : 'rgba(255, 0, 0, 1)' }}>
          {value}
        </span>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <Input
          placeholder="下级代理ID"
          style={{ width: 200, marginRight: 16 }}
          onPressEnter={handleQuery}
        />
        <RangePicker
          style={{ marginRight: 16 }}
          onChange={(dates) => {
            setStartTime(dates?.[0] || null);
            setEndTime(dates?.[1] || null);
          }}
        />
        <Button type="primary" icon={<SearchOutlined />} onClick={handleQuery} style={{ marginRight: 8 }}>
          搜索
        </Button>
        <Button icon={<ReloadOutlined />} onClick={resetQuery}>
          重置
        </Button>
      </Card>

      <Card style={{ marginTop: 16 }}>
        <Table
          rowKey="id"
          loading={loading}
          dataSource={tableData}
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

      {/* 合计信息显示区域 */}
      {summaryData && (
        <Card style={{ marginTop: 20 }} title="数据合计">
          <Row gutter={20}>
            <Col span={6}>
              <div>
                <span style={{ fontWeight: 500, color: '#606266', fontSize: 13 }}>社区注册人数：</span>
                <span style={{ fontWeight: 'bold', color: '#303133', fontSize: 13 }}>
                  {summaryData.communityUserCount || 0}
                </span>
              </div>
            </Col>
            <Col span={6}>
              <div>
                <span style={{ fontWeight: 500, color: '#606266', fontSize: 13 }}>实际跟单人数：</span>
                <span style={{ fontWeight: 'bold', color: '#303133', fontSize: 13 }}>
                  {summaryData.merchandiserFollowCount || 0}
                </span>
              </div>
            </Col>
            <Col span={6}>
              <div>
                <span style={{ fontWeight: 500, color: '#606266', fontSize: 13 }}>充值总额：</span>
                <span style={{ fontWeight: 'bold', color: '#303133', fontSize: 13 }}>
                  {summaryData.recharge || 0}
                </span>
              </div>
            </Col>
            <Col span={6}>
              <div>
                <span style={{ fontWeight: 500, color: '#606266', fontSize: 13 }}>提现总额：</span>
                <span style={{ fontWeight: 'bold', color: '#303133', fontSize: 13 }}>
                  {summaryData.withdraw || 0}
                </span>
              </div>
            </Col>
          </Row>
          <Row gutter={20} style={{ marginTop: 8 }}>
            <Col span={6}>
              <div>
                <span style={{ fontWeight: 500, color: '#606266', fontSize: 13 }}>充值人数：</span>
                <span style={{ fontWeight: 'bold', color: '#303133', fontSize: 13 }}>
                  {summaryData.rechargeNum || 0}
                </span>
              </div>
            </Col>
            <Col span={6}>
              <div>
                <span style={{ fontWeight: 500, color: '#606266', fontSize: 13 }}>提款人数：</span>
                <span style={{ fontWeight: 'bold', color: '#303133', fontSize: 13 }}>
                  {summaryData.withdrawNum || 0}
                </span>
              </div>
            </Col>
            <Col span={6}>
              <div>
                <span style={{ fontWeight: 500, color: '#606266', fontSize: 13 }}>跟单资产总额：</span>
                <span style={{ fontWeight: 'bold', color: '#303133', fontSize: 13 }}>
                  {summaryData.merchandiserAmount || 0}
                </span>
              </div>
            </Col>
            <Col span={6}>
              <div>
                <span style={{ fontWeight: 500, color: '#606266', fontSize: 13 }}>资产总额：</span>
                <span style={{ fontWeight: 'bold', color: '#303133', fontSize: 13 }}>
                  {summaryData.totalAsset || 0}
                </span>
              </div>
            </Col>
          </Row>
          <Row gutter={20} style={{ marginTop: 8 }}>
            <Col span={6}>
              <div>
                <span style={{ fontWeight: 500, color: '#606266', fontSize: 13 }}>当日注册人数：</span>
                <span style={{ fontWeight: 'bold', color: '#303133', fontSize: 13 }}>
                  {summaryData.todayRegister || 0}
                </span>
              </div>
            </Col>
            <Col span={6}>
              <div>
                <span style={{ fontWeight: 500, color: '#606266', fontSize: 13 }}>当日提币人数：</span>
                <span style={{ fontWeight: 'bold', color: '#303133', fontSize: 13 }}>
                  {summaryData.todayWithdrawManNum || 0}
                </span>
              </div>
            </Col>
            <Col span={6}>
              <div>
                <span style={{ fontWeight: 500, color: '#606266', fontSize: 13 }}>当日充币人数：</span>
                <span style={{ fontWeight: 'bold', color: '#303133', fontSize: 13 }}>
                  {summaryData.todayRechargeManNum || 0}
                </span>
              </div>
            </Col>
            <Col span={6}>
              <div>
                <span style={{ fontWeight: 500, color: '#606266', fontSize: 13 }}>当日充币：</span>
                <span style={{ fontWeight: 'bold', color: '#303133', fontSize: 13 }}>
                  {summaryData.todayRecharge || 0}
                </span>
              </div>
            </Col>
          </Row>
          <Row gutter={20} style={{ marginTop: 8 }}>
            <Col span={6}>
              <div>
                <span style={{ fontWeight: 500, color: '#606266', fontSize: 13 }}>当日提币：</span>
                <span style={{ fontWeight: 'bold', color: '#303133', fontSize: 13 }}>
                  {summaryData.todayWithdraw || 0}
                </span>
              </div>
            </Col>
            <Col span={6}>
              <div>
                <span style={{ fontWeight: 500, color: '#606266', fontSize: 13 }}>当日客损：</span>
                <span
                  style={{
                    fontWeight: 'bold',
                    fontSize: 13,
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

      {/* 名称列表弹窗 */}
      <Modal
        title="下级代理名称列表"
        open={nameModalVisible}
        onCancel={() => setNameModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setNameModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={400}
      >
        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
          {nameList.map((name, index) => (
            <div
              key={index}
              style={{
                padding: '8px 0',
                borderBottom: index < nameList.length - 1 ? '1px solid #f0f0f0' : 'none',
              }}
            >
              {index + 1}. {name.trim()}
            </div>
          ))}
        </div>
      </Modal>

      {/* UID列表弹窗 */}
      <Modal
        title="下级代理UID列表"
        open={uidModalVisible}
        onCancel={() => setUidModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setUidModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        <Input
          placeholder="搜索UID..."
          value={uidSearchText}
          onChange={(e) => setUidSearchText(e.target.value)}
          style={{ marginBottom: 15 }}
          allowClear
        />
        <div
          style={{
            maxHeight: 400,
            overflowY: 'auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
            padding: '10px 0',
          }}
        >
          {filteredUidList.map((item, index) => (
            <div
              key={index}
              style={{
                background: isDirectFollower(item.uid, currentRow) ? '#fdf6ec' : '#f8f9fa',
                border: isDirectFollower(item.uid, currentRow) ? '1px solid #f5dab1' : '1px solid #e9ecef',
                borderRadius: 8,
                padding: 12,
                cursor: 'pointer',
              }}
              onClick={() => checkByUid(item.uid)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span
                  style={{
                    background: '#409EFF',
                    color: 'white',
                    fontSize: 10,
                    fontWeight: 'bold',
                    padding: '2px 6px',
                    borderRadius: 10,
                    minWidth: 20,
                    textAlign: 'center',
                  }}
                >
                  {index + 1}
                </span>
                <span
                  style={{
                    fontWeight: 600,
                    color: isDirectFollower(item.uid, currentRow) ? '#e6a23c' : '#333',
                    fontSize: 14,
                  }}
                >
                  {item.uid}
                </span>
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: '#666',
                  background: 'white',
                  padding: '4px 8px',
                  borderRadius: 4,
                  border: '1px solid #e9ecef',
                  textAlign: 'center',
                  wordBreak: 'break-all',
                }}
              >
                {item.name}
              </div>
            </div>
          ))}
          {filteredUidList.length === 0 && (
            <div
              style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '40px 20px',
                color: '#999',
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 10 }}>🔍</div>
              <p style={{ margin: 0, fontSize: 14 }}>未找到匹配的UID</p>
            </div>
          )}
        </div>
        {uidWithNames.length > 0 && (
          <div
            style={{
              marginTop: 15,
              padding: 10,
              backgroundColor: '#f5f7fa',
              borderRadius: 4,
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: 12, color: '#666' }}>
              共 {uidWithNames.length} 个 UID
              {uidSearchText && filteredUidList.length !== uidWithNames.length && (
                <span>，显示 {filteredUidList.length} 个</span>
              )}
            </span>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SubordinatePage;
