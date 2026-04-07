import React from 'react';
import { Card, Typography, Divider } from 'antd';

const { Title, Text, Paragraph } = Typography;

const PageTemplate = ({ moduleName, pageName, path }) => {
  return (
    <Card>
      <Title level={2}>{pageName}</Title>
      <Divider />
      <Paragraph>
        <Text strong>模块名称:</Text> {moduleName}
      </Paragraph>
      <Paragraph>
        <Text strong>页面路径:</Text> {path}
      </Paragraph>
      <Paragraph>
        <Text strong>说明:</Text> 这是 {moduleName} 模块下的 {pageName} 页面，基础页面模板，待填充业务逻辑。
      </Paragraph>
      <Paragraph>
        <Text type="secondary">此页面是根据菜单结构自动生成的基础页面</Text>
      </Paragraph>
    </Card>
  );
};

export default PageTemplate;