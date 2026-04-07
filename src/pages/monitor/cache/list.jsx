import React, { useState, useEffect } from 'react';
import { Card, Table, Button, message, Popconfirm, Tag } from 'antd';
import { DeleteOutlined, ReloadOutlined, KeyOutlined, DatabaseOutlined } from '@ant-design/icons';
import { getCacheNames, getCacheKeys, getCacheValue, clearCacheName, clearCacheKey, clearCacheAll } from '@api/modules/monitor';

/**
 * 缓存列表页面
 * 三栏布局：缓存名称 | 键名列表 | 缓存内容
 */
const CacheListPage = () => {
  const [loading, setLoading] = useState(false);
  const [subLoading, setSubLoading] = useState(false);
  const [valueLoading, setValueLoading] = useState(false);

  const [cacheNames, setCacheNames] = useState([]);
  const [cacheKeys, setCacheKeys] = useState([]);
  const [cacheValue, setCacheValue] = useState(null);

  const [selectedCacheName, setSelectedCacheName] = useState(null);
  const [selectedCacheKey, setSelectedCacheKey] = useState(null);

  // 表格高度
  const tableHeight = window.innerHeight - 200;

  // 获取缓存名称列表
  const fetchCacheNames = async () => {
    setLoading(true);
    try {
      const res = await getCacheNames();
      setCacheNames(res.data || []);
    } catch (error) {
      message.error('获取缓存列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取缓存键名列表
  const fetchCacheKeys = async (cacheName) => {
    setSubLoading(true);
    setSelectedCacheName(cacheName);
    setSelectedCacheKey(null);
    setCacheValue(null);
    try {
      const res = await getCacheKeys(cacheName);
      setCacheKeys(res.data || []);
    } catch (error) {
      message.error('获取键名列表失败');
    } finally {
      setSubLoading(false);
    }
  };

  // 获取缓存内容
  const fetchCacheValue = async (cacheKey) => {
    setValueLoading(true);
    setSelectedCacheKey(cacheKey);
    try {
      const res = await getCacheValue(selectedCacheName, cacheKey);
      setCacheValue(res.data);
    } catch (error) {
      message.error('获取缓存内容失败');
    } finally {
      setValueLoading(false);
    }
  };

  // 清除缓存名称
  const handleClearCacheName = async (record) => {
    try {
      await clearCacheName(record.cacheName);
      message.success('清除成功');
      fetchCacheNames();
      setCacheKeys([]);
      setCacheValue(null);
    } catch (error) {
      message.error('清除失败');
    }
  };

  // 清除缓存键
  const handleClearCacheKey = async () => {
    if (!selectedCacheKey) return;
    try {
      await clearCacheKey(selectedCacheName, selectedCacheKey);
      message.success('清除成功');
      fetchCacheKeys(selectedCacheName);
      setCacheValue(null);
    } catch (error) {
      message.error('清除失败');
    }
  };

  // 清除全部缓存
  const handleClearCacheAll = async () => {
    try {
      await clearCacheAll();
      message.success('清除成功');
      fetchCacheNames();
      setCacheKeys([]);
      setCacheValue(null);
    } catch (error) {
      message.error('清除失败');
    }
  };

  // 初始化
  useEffect(() => {
    fetchCacheNames();
  }, []);

  // 缓存名称列表列
  const cacheNameColumns = [
    { title: '序号', width: 60, render: (_, __, index) => index + 1 },
    { 
      title: '缓存名称', 
      dataIndex: 'cacheName',
      ellipsis: true,
      render: (text) => {
        const displayNames = {
          'redis_keys': 'Redis键名',
          'redis_cache': 'Redis缓存',
          'token_cache': 'Token缓存',
          'user_info': '用户信息',
        };
        return displayNames[text] || text;
      }
    },
    { title: '备注', dataIndex: 'remark', ellipsis: true },
    {
      title: '操作',
      width: 80,
      render: (_, record) => (
        <Popconfirm
          title="确定清除该缓存吗？"
          onConfirm={() => handleClearCacheName(record)}
          okText="确定"
          cancelText="取消"
        >
          <Button type="link" danger icon={<DeleteOutlined />} size="small" />
        </Popconfirm>
      )
    }
  ];

  // 键名列表列
  const cacheKeyColumns = [
    { title: '序号', width: 60, render: (_, __, index) => index + 1 },
    { title: '缓存键名', dataIndex: 'cacheKey', ellipsis: true }
  ];

  return (
    <div style={{ padding: '16px' }}>
      <Button 
        type="primary" 
        danger 
        onClick={handleClearCacheAll}
        style={{ marginBottom: '16px' }}
      >
        清除全部缓存
      </Button>

      <div style={{ display: 'flex', gap: '16px' }}>
        {/* 左侧：缓存名称列表 */}
        <Card 
          title={
            <span>
              <DatabaseOutlined /> 缓存列表
            </span>
          }
          extra={
            <Button 
              type="text" 
              icon={<ReloadOutlined />} 
              onClick={fetchCacheNames}
            />
          }
          style={{ width: '33.33%', height: tableHeight }}
        >
          <Table
            loading={loading}
            columns={cacheNameColumns}
            dataSource={cacheNames}
            rowKey="cacheName"
            pagination={false}
            scroll={{ y: tableHeight - 100 }}
            size="small"
            onRow={(record) => ({
              onClick: () => fetchCacheKeys(record.cacheName)
            })}
            rowClassName={(record) => 
              selectedCacheName === record.cacheName ? 'ant-table-row-selected' : ''
            }
          />
        </Card>

        {/* 中间：键名列表 */}
        <Card 
          title={
            <span>
              <KeyOutlined /> 键名列表
            </span>
          }
          extra={
            <Button 
              type="text" 
              icon={<ReloadOutlined />} 
              onClick={() => selectedCacheName && fetchCacheKeys(selectedCacheName)}
              disabled={!selectedCacheName}
            />
          }
          style={{ width: '33.33%', height: tableHeight }}
        >
          <Table
            loading={subLoading}
            columns={cacheKeyColumns}
            dataSource={cacheKeys}
            rowKey="cacheKey"
            pagination={false}
            scroll={{ y: tableHeight - 100 }}
            size="small"
            onRow={(record) => ({
              onClick: () => fetchCacheValue(record.cacheKey)
            })}
            rowClassName={(record) => 
              selectedCacheKey === record.cacheKey ? 'ant-table-row-selected' : ''
            }
          />
        </Card>

        {/* 右侧：缓存内容 */}
        <Card 
          title="缓存内容"
          extra={
            selectedCacheKey && (
              <Popconfirm
                title="确定清除该缓存键吗？"
                onConfirm={handleClearCacheKey}
                okText="确定"
                cancelText="取消"
              >
                <Button type="link" danger icon={<DeleteOutlined />}>
                  清除
                </Button>
              </Popconfirm>
            )
          }
          style={{ width: '33.33%', height: tableHeight }}
        >
          {valueLoading ? (
            <div style={{ textAlign: 'center', padding: '50px 0' }}>加载中...</div>
          ) : cacheValue ? (
            <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: tableHeight - 100, overflow: 'auto' }}>
              {typeof cacheValue === 'object' 
                ? JSON.stringify(cacheValue, null, 2)
                : String(cacheValue)
              }
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '50px 0', color: '#999' }}>
              {selectedCacheKey ? '无缓存内容' : '请选择缓存键'}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CacheListPage;
