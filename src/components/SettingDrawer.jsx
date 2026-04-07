import React from 'react';
import { Drawer, Switch, Select, Radio, Divider, Typography, Space , Button } from 'antd';
import { CloseOutlined, CopyOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const SettingDrawer = ({ visible, onClose, settings, onSettingChange }) => {
  const handleChange = (field, value) => {
    const newSettings = {
      ...settings,
      [field]: value
    };
    onSettingChange(newSettings);
  };
 
  return (
    <Drawer
      title="系统设置"
      placement="right"
      onClose={onClose}
      open={visible}
      width={300}
      styles={{ body: { paddingBottom: 80 } }}
      extra={
        <Button
          type="primary"
           
          icon={<CopyOutlined />}
        >
          复制设置
        </Button>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* 主题设置 */}
        <div>
          <Title level={5}>主题设置</Title>
          <Divider style={{ margin: '12px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text>主题颜色</Text>
            <input
              type="color"
              value={settings.primaryColor}
              onChange={(e) => handleChange('primaryColor', e.target.value)}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
            />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text>主题模式</Text>
            <Select
              value={settings.theme}
              onChange={(value) => handleChange('theme', value)}
              style={{ width: 120 }}
              size="small"
            >
              <Option value="light">亮色</Option>
              <Option value="dark">暗色</Option>
            </Select>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text>色弱模式</Text>
            <Switch
              checked={settings.colorWeak}
              onChange={(checked) => handleChange('colorWeak', checked)}
            />
          </div>
        </div>

        {/* 布局设置 */}
        <div>
          <Title level={5}>布局设置</Title>
          <Divider style={{ margin: '12px 0' }} />
          <div style={{ marginBottom: 12 }}>
            <Text style={{ display: 'block', marginBottom: 8 }}>导航模式</Text>
            <Radio.Group
              value={settings.layout}
              onChange={(e) => handleChange('layout', e.target.value)}
              style={{ width: '100%' }}
            >
              <Radio.Button value="side" style={{ width: '33%', textAlign: 'center' }}>侧栏</Radio.Button>
              <Radio.Button value="top" style={{ width: '33%', textAlign: 'center' }}>顶部</Radio.Button>
              <Radio.Button value="mix" style={{ width: '33%', textAlign: 'center' }}>混合</Radio.Button>
            </Radio.Group>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text>固定顶栏</Text>
            <Switch
              checked={settings.fixedHeader}
              onChange={(checked) => handleChange('fixedHeader', checked)}
            />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text>固定侧边栏</Text>
            <Switch
              checked={settings.fixedSider}
              onChange={(checked) => handleChange('fixedSider', checked)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text>侧边栏深色</Text>
            <Switch
              checked={settings.siderTheme === 'dark'}
              onChange={(checked) => handleChange('siderTheme', checked ? 'dark' : 'light')}
            />
          </div>
        </div>

        {/* 水印设置 */}
        <div>
          <Title level={5}>水印设置</Title>
          <Divider style={{ margin: '12px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text>显示水印</Text>
            <Switch
              checked={!settings.watermarkDisabled}
              onChange={(checked) => handleChange('watermarkDisabled', !checked)}
            />
          </div>
        </div>

        {/* 其他设置 */}
        <div>
          <Title level={5}>其他设置</Title>
          <Divider style={{ margin: '12px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text>内容宽度</Text>
            <Select
              value={settings.contentWidth}
              onChange={(value) => handleChange('contentWidth', value)}
              style={{ width: 120 }}
              size="small"
            >
              <Option value="Fixed">固定</Option>
              <Option value="Fluid">流式</Option>
            </Select>
          </div>
        </div>
      </Space>
    </Drawer>
  );
};

export default SettingDrawer;