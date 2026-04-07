import React, { useState, useEffect } from 'react';
import { Card, Row, Col, List, Tag, Empty, Spin, message } from 'antd';
import ListConfigContent from './components/ListConfigContent';
import ObjectConfigContent from './components/ObjectConfigContent';
import EditorConfigContent from './components/EditorConfigContent';
import { getPModuleRuleList } from '@api';

/**
 * 配置管理页面
 * 左侧显示规则配置列表，右侧根据配置类型显示不同的编辑界面
 */
const ConfigPage = () => {
  const [loading, setLoading] = useState(false);
  const [ruleList, setRuleList] = useState([]);
  const [selectedRule, setSelectedRule] = useState(null);

  // 配置类型映射
  const configTypeMap = {
    'SINGLE_PAGE': { text: '单页', color: 'blue' },
    'LIST': { text: '列表', color: 'green' },
    'OBJECT': { text: '对象', color: 'orange' },
    'RICH_TEXT': { text: '富文本', color: 'purple' },
  };

  // 加载规则配置列表
  const loadRuleList = async () => {
    setLoading(true);
    try {
      const response = await getPModuleRuleList({
        pageNum: 1,
        pageSize: 1000,
        searchParam: JSON.stringify({ SEARCH_EQ_state: 1 }) // 只加载启用的配置
      });

      if (response.code === 0 || response.code === 200) {
        const list = response.data?.records || response.data?.list || response.data || [];
        setRuleList(list);

        // 默认选中第一条
        if (list.length > 0 && !selectedRule) {
          setSelectedRule(list[0]);
        }
      } else {
        message.error(response.msg || '加载配置列表失败');
      }
    } catch (error) {
      message.error('加载配置列表失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRuleList();
  }, []);

  // 处理规则选择
  const handleRuleSelect = (rule) => {
    setSelectedRule(rule);
  };

  // 渲染右侧内容区域
  const renderContent = () => {
    if (!selectedRule) {
      return (
        <Card>
          <Empty description="请从左侧选择一个配置项" />
        </Card>
      );
    }

    const { configType } = selectedRule;

    // 根据配置类型渲染不同的内容组件
    switch (configType) {
      case 'LIST':
        return <ListConfigContent ruleConfig={selectedRule} />;
      case 'OBJECT':
        return <ObjectConfigContent ruleConfig={selectedRule} />;
      case 'SINGLE_PAGE':
      case 'RICH_TEXT':
        return <EditorConfigContent ruleConfig={selectedRule} />;
      default:
        return (
          <Card>
            <Empty description={`未支持的配置类型: ${configType}`} />
          </Card>
        );
    }
  };

  return (
    <div style={{ height: 'calc(100vh - 140px)' }}>
      <Row gutter={16} style={{ height: '100%' }}>
        {/* 左侧：配置列表 */}
        <Col span={6} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Card
            title="配置项列表"
            style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
            styles={{ body: { flex: 1, overflow: 'auto', padding: 0 } }}
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <Spin />
              </div>
            ) : (
              <List
                dataSource={ruleList}
                renderItem={(item) => {
                  const typeInfo = configTypeMap[item.configType] || { text: item.configType || '未知', color: 'default' };
                  const isSelected = selectedRule?.id === item.id;

                  return (
                    <List.Item
                      key={item.id}
                      onClick={() => handleRuleSelect(item)}
                      style={{
                        cursor: 'pointer',
                        padding: '16px 24px',
                        background: isSelected ? '#e6f7ff' : 'transparent',
                        transition: 'background 0.3s',
                        borderLeft: isSelected ? '3px solid #1890ff' : '3px solid transparent',
                      }}
                    >
                      <List.Item.Meta
                        title={
                          <div style={{ marginBottom: 4 }}>
                            {item.name}
                            <Tag color={typeInfo.color} style={{ marginLeft: 8 }}>
                              {typeInfo.text}
                            </Tag>
                          </div>
                        }
                        description={
                          <div style={{ fontSize: 12, color: '#999' }}>
                            <div>编码: {item.code}</div>
                            {item.groupName && <div>分组: {item.groupName}</div>}
                            {item.remark && <div>备注: {item.remark}</div>}
                          </div>
                        }
                      />
                    </List.Item>
                  );
                }}
              />
            )}
          </Card>
        </Col>

        {/* 右侧：内容编辑区域 */}
        <Col span={18} style={{ height: '100%', overflow: 'auto' }}>
          {renderContent()}
        </Col>
      </Row>
    </div>
  );
};

export default ConfigPage;
