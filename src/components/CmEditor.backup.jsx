import React, { useState, useEffect, useRef } from 'react';
import { Button, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { getToken } from '@utils/auth';
import './CmEditor.css';

/**
 * 富文本编辑器组件
 * 基于 contenteditable 实现，支持图片上传
 */
const CmEditor = ({
  value = '',
  onChange,
  height = 360,
  toolbar = true,
}) => {
  const [html, setHtml] = useState(value);
  const editorRef = useRef(null);
  const token = getToken();
  const uploadAction = '/api/system/upload';

  // 更新内容
  useEffect(() => {
    setHtml(value);
    if (editorRef.current) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  // 处理内容变化
  const handleInput = (e) => {
    const newHtml = e.target.innerHTML;
    setHtml(newHtml);
    if (onChange) {
      onChange(newHtml);
    }
  };

  // 执行命令
  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  // 图片上传
  const handleImageUpload = ({ file }) => {
    const formData = new FormData();
    formData.append('file', file);

    fetch(uploadAction, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.code === 0 || res.code === 200) {
          const imageUrl = res.data?.path || res.path;
          const imgHtml = `<img src="${imageUrl}" style="max-width:100%;" />`;
          execCommand('insertHTML', imgHtml);
        } else {
          message.error('图片上传失败');
        }
      })
      .catch(() => {
        message.error('图片上传失败');
      });

    return false; // 阻止默认上传行为
  };

  // 工具栏
  const renderToolbar = () => {
    if (!toolbar) return null;

    return (
      <div className="cm-editor-toolbar">
        <Button size="small" onClick={() => execCommand('bold')}>
          <b>B</b>
        </Button>
        <Button size="small" onClick={() => execCommand('italic')}>
          <i>I</i>
        </Button>
        <Button size="small" onClick={() => execCommand('underline')}>
          <u>U</u>
        </Button>
        <Button size="small" onClick={() => execCommand('strikeThrough')}>
          <s>S</s>
        </Button>

        <div className="toolbar-divider" />

        <Button size="small" onClick={() => execCommand('justifyLeft')}>
          左对齐
        </Button>
        <Button size="small" onClick={() => execCommand('justifyCenter')}>
          居中
        </Button>
        <Button size="small" onClick={() => execCommand('justifyRight')}>
          右对齐
        </Button>

        <div className="toolbar-divider" />

        <Button size="small" onClick={() => execCommand('insertUnorderedList')}>
          无序列表
        </Button>
        <Button size="small" onClick={() => execCommand('insertOrderedList')}>
          有序列表
        </Button>

        <div className="toolbar-divider" />

        <select
          onChange={(e) => execCommand('fontSize', e.target.value)}
          className="toolbar-select"
        >
          <option value="">字号</option>
          <option value="1">小</option>
          <option value="3">中</option>
          <option value="5">大</option>
          <option value="7">特大</option>
        </select>

        <select
          onChange={(e) => execCommand('formatBlock', e.target.value)}
          className="toolbar-select"
        >
          <option value="">段落格式</option>
          <option value="p">段落</option>
          <option value="h1">标题1</option>
          <option value="h2">标题2</option>
          <option value="h3">标题3</option>
          <option value="h4">标题4</option>
        </select>

        <Upload
          accept="image/*"
          showUploadList={false}
          beforeUpload={handleImageUpload}
          headers={{ Authorization: `Bearer ${token}` }}
        >
          <Button size="small" icon={<UploadOutlined />}>
            插入图片
          </Button>
        </Upload>

        <Button size="small" onClick={() => execCommand('removeFormat')}>
          清除格式
        </Button>
      </div>
    );
  };

  return (
    <div className="cm-editor">
      {renderToolbar()}
      <div
        ref={editorRef}
        className="cm-editor-content"
        contentEditable
        onInput={handleInput}
        style={{ height: `${height}px` }}
        suppressContentEditableWarning
      />
    </div>
  );
};

export default CmEditor;
