/**
 * CmEditor 组件测试页面
 * 用于测试和演示 CKEditor 编辑器的各种功能
 */
import React, { useState } from 'react';
import { Card, Button, Space, Typography, Divider } from 'antd';
import CmEditor from '@components/CmEditor';
import CmEditorOld from '@components/CmEditor.backup';
import { CopyOutlined, CheckOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const EditorTestPage = () => {
  const [content, setContent] = useState('<h2>欢迎使用 CKEditor 5</h2><p>这是一个功能强大的富文本编辑器。</p><ul><li>支持图片上传</li><li>支持表格编辑</li><li>支持代码高亮</li></ul>');
  const [showOld, setShowOld] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleClear = () => {
    setContent('');
  };

  const handleReset = () => {
    setContent('<h2>欢迎使用 CKEditor 5</h2><p>这是一个功能强大的富文本编辑器。</p>');
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <Title level={2}>CmEditor 编辑器测试</Title>

      <Card title="功能说明" style={{ marginBottom: '16px' }}>
        <Paragraph>
          <Text strong>当前版本:</Text> CKEditor 5 专业富文本编辑器
        </Paragraph>
        <Paragraph>
          <Text strong>原版备份:</Text> src/components/CmEditor.backup.jsx
        </Paragraph>
        <Paragraph>
          <Text strong>主要功能:</Text>
        </Paragraph>
        <ul>
          <li>✅ 基础文本编辑 (粗体、斜体、下划线等)</li>
          <li>✅ 段落格式 (标题 H1-H6、引用块、代码块)</li>
          <li>✅ 列表和缩进 (有序/无序列表)</li>
          <li>✅ 对齐方式 (左中右对齐)</li>
          <li>✅ 链接插入</li>
          <li>✅ 图片上传 (支持拖拽、粘贴)</li>
          <li>✅ 表格编辑</li>
          <li>✅ 媒体嵌入 (视频等)</li>
          <li>✅ 字体颜色、背景色</li>
          <li>✅ 撤销/重做</li>
        </ul>
      </Card>

      <Card title="编辑器操作" style={{ marginBottom: '16px' }}>
        <Space>
          <Button onClick={() => setShowOld(!showOld)}>
            {showOld ? '显示新版编辑器' : '显示原版编辑器'}
          </Button>
          <Button icon={<CopyOutlined />} onClick={handleCopyHtml}>
            {copied ? '已复制!' : '复制HTML'}
          </Button>
          <Button onClick={handleClear}>清空内容</Button>
          <Button onClick={handleReset}>重置内容</Button>
        </Space>
      </Card>

      <Card title={showOld ? '原版编辑器 (contenteditable)' : 'CKEditor 5 编辑器'}>
        {showOld ? (
          <CmEditorOld
            value={content}
            onChange={setContent}
            height={500}
          />
        ) : (
          <CmEditor
            value={content}
            onChange={setContent}
            height={500}
          />
        )}
      </Card>

      <Divider />

      <Card title="HTML 源代码预览">
        <pre style={{
          background: '#f5f5f5',
          padding: '16px',
          borderRadius: '4px',
          maxHeight: '300px',
          overflow: 'auto',
          fontSize: '12px',
        }}>
          {content || '<空内容>'}
        </pre>
      </Card>

      <Card title="使用示例" style={{ marginTop: '16px' }}>
        <Paragraph>
          <Text code>{'<CmEditor value={content} onChange={setContent} height={500} />'}</Text>
        </Paragraph>
        <Paragraph>
          在 DataForm 中使用:
        </Paragraph>
        <pre style={{
          background: '#f5f5f5',
          padding: '16px',
          borderRadius: '4px',
        }}>
{`<DataForm.Field
  type="custom"
  name="content"
  label="文章内容"
  render={() => <CmEditor />}
/>`}
        </pre>
      </Card>
    </div>
  );
};

export default EditorTestPage;
