import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Form, Input, Button, message } from 'antd';
import { FolderOpenOutlined, KeyOutlined, FileTextOutlined, ReloadOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  listCacheName,
  listCacheKey,
  getCacheValue,
  clearCacheName,
  clearCacheKey,
  clearCacheAll,
} from '@/api/modules/monitor';

const { TextArea } = Input;

const CacheListPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [subLoading, setSubLoading] = useState(false);
  const [cacheNames, setCacheNames] = useState([]);
  const [cacheKeys, setCacheKeys] = useState([]);
  const [cacheForm, setCacheForm] = useState({});
  const [nowCacheName, setNowCacheName] = useState('');
  const [selectedCacheName, setSelectedCacheName] = useState(null);
  const [selectedCacheKey, setSelectedCacheKey] = useState(null);
  const tableHeight = window.innerHeight - 200;

  useEffect(() => {
    getCacheNames();
  }, []);

  const getCacheNames = () => {
    setLoading(true);
    listCacheName().then(res => {
      setCacheNames(res.data || []);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  };

  const refreshCacheNames = () => {
    getCacheNames();
    message.success('刷新缓存列表成功');
  };

  const handleClearCacheName = (row) => {
    clearCacheName(row.cacheName).then(() => {
      message.success('清理缓存名称[' + row.cacheName + ']成功');
      getCacheKeys();
    });
  };

  const getCacheKeys = (row) => {
    const cacheName = row ? row.cacheName : nowCacheName;
    if (!cacheName) {
      return;
    }
    setSubLoading(true);
    listCacheKey(cacheName).then(res => {
      setCacheKeys(res.data || []);
      setSubLoading(false);
      setNowCacheName(cacheName);
    }).catch(() => {
      setSubLoading(false);
    });
  };

  const refreshCacheKeys = () => {
    getCacheKeys();
    message.success('刷新键名列表成功');
  };

  const handleClearCacheKey = (cacheKey) => {
    clearCacheKey(cacheKey).then(() => {
      message.success('清理缓存键名[' + cacheKey + ']成功');
      getCacheKeys();
    });
  };

  const nameFormatter = (row) => {
    return row.cacheName.replace(':', '');
  };

  const keyFormatter = (cacheKey) => {
    return cacheKey.replace(nowCacheName, '');
  };

  const handleCacheValue = (cacheKey) => {
    getCacheValue(nowCacheName, cacheKey).then(res => {
      setCacheForm(res.data || {});
    });
  };

  const handleClearCacheAll = () => {
    clearCacheAll().then(() => {
      message.success('清理全部缓存成功');
    });
  };

  const cacheNameColumns = [
    { title: '序号', width: 60, render: (text, record, index) => index + 1 },
    {
      title: '缓存名称',
      dataIndex: 'cacheName',
      align: 'center',
      ellipsis: true,
      render: (text) => nameFormatter({ cacheName: text }),
    },
    {
      title: '备注',
      dataIndex: 'remark',
      align: 'center',
      ellipsis: true,
    },
    {
      title: '操作',
      width: 60,
      align: 'center',
      render: (text, record) => (
        <Button
          type="link"
          size="small"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleClearCacheName(record)}
        />
      ),
    },
  ];

  const cacheKeyColumns = [
    { title: '序号', width: 60, render: (text, record, index) => index + 1 },
    {
      title: '缓存键名',
      align: 'center',
      ellipsis: true,
      render: (text) => keyFormatter(text),
    },
    {
      title: '操作',
      width: 60,
      align: 'center',
      render: (text, record) => (
        <Button
          type="link"
          size="small"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleClearCacheKey(record)}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={10}>
        {/* 缓存列表 */}
        <Col span={8}>
          <Card
            title={
              <span>
                <FolderOpenOutlined /> 缓存列表
                <Button
                  type="text"
                  size="small"
                  icon={<ReloadOutlined />}
                  onClick={refreshCacheNames}
                  style={{ float: 'right' }}
                />
              </span>
            }
            style={{ height: 'calc(100vh - 125px)' }}
          >
            <Table
              loading={loading}
              dataSource={cacheNames}
              columns={cacheNameColumns}
              pagination={false}
              scroll={{ y: tableHeight }}
              rowKey="cacheName"
              onRow={(record) => ({
                onClick: () => {
                  getCacheKeys(record);
                  setSelectedCacheName(record.cacheName);
                },
                style: {
                  cursor: 'pointer',
                  background: selectedCacheName === record.cacheName ? '#e6f7ff' : '',
                },
              })}
            />
          </Card>
        </Col>

        {/* 键名列表 */}
        <Col span={8}>
          <Card
            title={
              <span>
                <KeyOutlined /> 键名列表
                <Button
                  type="text"
                  size="small"
                  icon={<ReloadOutlined />}
                  onClick={refreshCacheKeys}
                  style={{ float: 'right' }}
                />
              </span>
            }
            style={{ height: 'calc(100vh - 125px)' }}
          >
            <Table
              loading={subLoading}
              dataSource={cacheKeys}
              columns={cacheKeyColumns}
              pagination={false}
              scroll={{ y: tableHeight }}
              rowKey={(record) => record}
              onRow={(record) => ({
                onClick: () => {
                  handleCacheValue(record);
                  setSelectedCacheKey(record);
                },
                style: {
                  cursor: 'pointer',
                  background: selectedCacheKey === record ? '#e6f7ff' : '',
                },
              })}
            />
          </Card>
        </Col>

        {/* 缓存内容 */}
        <Col span={8}>
          <Card
            title={
              <span>
                <FileTextOutlined /> 缓存内容
                <Button
                  type="text"
                  size="small"
                  onClick={handleClearCacheAll}
                  style={{ float: 'right' }}
                >
                  清理全部
                </Button>
              </span>
            }
            style={{ height: 'calc(100vh - 125px)' }}
          >
            <Form form={form} layout="vertical">
              <Form.Item label="缓存名称:">
                <Input value={cacheForm.cacheName} readOnly />
              </Form.Item>
              <Form.Item label="缓存键名:">
                <Input value={cacheForm.cacheKey} readOnly />
              </Form.Item>
              <Form.Item label="缓存内容:">
                <TextArea
                  value={cacheForm.cacheValue}
                  rows={8}
                  readOnly
                  style={{ resize: 'none' }}
                />
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CacheListPage;
