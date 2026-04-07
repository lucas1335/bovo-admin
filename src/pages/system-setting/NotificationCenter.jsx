import React, { useState, useEffect } from 'react';
import {
  Card,
  List,
  Badge,
  Typography,
  Space,
  Button,
  Tag,
  Avatar,
  Divider,
  Empty,
  Spin,
  message
} from 'antd';
import {
  BellOutlined,
  CheckOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // 模拟通知数据
  useEffect(() => {
    setLoading(true);
    // 模拟API调用
    setTimeout(() => {
      const mockNotifications = [
        {
          id: 1,
          title: '系统维护通知',
          content: '系统将于今晚22:00-24:00进行维护，期间可能影响正常使用。',
          type: 'warning',
          time: '2024-01-15 10:30:00',
          read: false,
          icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />
        },
        {
          id: 2,
          title: '新用户注册',
          content: '用户 "张三" 已完成注册，请及时审核。',
          type: 'info',
          time: '2024-01-15 09:15:00',
          read: false,
          icon: <InfoCircleOutlined style={{ color: '#1890ff' }} />
        },
        {
          id: 3,
          title: '数据备份完成',
          content: '系统数据备份已完成，备份文件已保存到安全位置。',
          type: 'success',
          time: '2024-01-15 08:45:00',
          read: true,
          icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
        },
        {
          id: 4,
          title: '权限变更提醒',
          content: '用户 "李四" 的角色权限已更新为管理员。',
          type: 'info',
          time: '2024-01-14 16:20:00',
          read: true,
          icon: <InfoCircleOutlined style={{ color: '#1890ff' }} />
        },
        {
          id: 5,
          title: '系统错误警告',
          content: '检测到系统异常，请及时检查服务器状态。',
          type: 'error',
          time: '2024-01-14 14:30:00',
          read: false,
          icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
        }
      ];
      
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.read).length);
      setLoading(false);
    }, 1000);
  }, []);

  const handleMarkAsRead = (id) => {
    setNotifications(prev => 
      prev.map(item => 
        item.id === id ? { ...item, read: true } : item
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    message.success('已标记为已读');
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(item => ({ ...item, read: true }))
    );
    setUnreadCount(0);
    message.success('已全部标记为已读');
  };

  const handleDelete = (id) => {
    setNotifications(prev => prev.filter(item => item.id !== id));
    const item = notifications.find(n => n.id === id);
    if (item && !item.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    message.success('通知已删除');
  };

  const handleDeleteAll = () => {
    setNotifications([]);
    setUnreadCount(0);
    message.success('已清空所有通知');
  };

  const getTypeColor = (type) => {
    const colors = {
      info: 'blue',
      success: 'green',
      warning: 'orange',
      error: 'red'
    };
    return colors[type] || 'blue';
  };

  const renderNotificationItem = (item) => (
    <List.Item
      key={item.id}
      style={{
        backgroundColor: item.read ? '#fafafa' : '#fff',
        border: item.read ? '1px solid #f0f0f0' : '1px solid #d9d9d9',
        borderRadius: '8px',
        marginBottom: '8px',
        padding: '16px'
      }}
      actions={[
        !item.read && (
          <Button
            type="link"
            size="small"
            icon={<CheckOutlined />}
            onClick={() => handleMarkAsRead(item.id)}
          >
            标记已读
          </Button>
        ),
        <Button
          type="link"
          size="small"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(item.id)}
        >
          删除
        </Button>
      ]}
    >
      <List.Item.Meta
        avatar={
          <Badge dot={!item.read}>
            <Avatar icon={item.icon} />
          </Badge>
        }
        title={
          <Space>
            <Text strong={!item.read}>{item.title}</Text>
            <Tag color={getTypeColor(item.type)}>
              {item.type === 'info' && '信息'}
              {item.type === 'success' && '成功'}
              {item.type === 'warning' && '警告'}
              {item.type === 'error' && '错误'}
            </Tag>
            {!item.read && <Badge status="processing" />}
          </Space>
        }
        description={
          <div>
            <Text type="secondary">{item.content}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {item.time}
            </Text>
          </div>
        }
      />
    </List.Item>
  );

  return (
    <div style={{ textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          <BellOutlined style={{ marginRight: 8 }} />
          通知中心
        </Title>
        <Space>
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead}>
              全部标记已读
            </Button>
          )}
          {notifications.length > 0 && (
            <Button danger onClick={handleDeleteAll}>
              清空通知
            </Button>
          )}
        </Space>
      </div>

      <Card>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>加载通知中...</div>
          </div>
        ) : notifications.length > 0 ? (
          <List
            dataSource={notifications}
            renderItem={renderNotificationItem}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `第 ${range[0]}-${range[1]} 条，共 ${total} 条通知`
            }}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无通知"
          />
        )}
      </Card>
    </div>
  );
};

export default NotificationCenter; 