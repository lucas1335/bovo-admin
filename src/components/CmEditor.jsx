import React, { useState, useEffect } from 'react';
import { Editor, Toolbar } from '@wangeditor/editor-for-react';
import '@wangeditor/editor/dist/css/style.css';
import './CmEditor.css';
import { getToken } from '../utils/auth';

/**
 * WangEditor 富文本编辑器组件
 * @param {Object} props
 * @param {string} props.value - 编辑器内容（HTML格式）
 * @param {function} props.onChange - 内容变化回调函数
 * @param {number} props.height - 编辑器高度，默认400px
 * @param {boolean} props.disabled - 是否禁用编辑器
 * @param {Object} props.config - 自定义配置，会合并到默认配置
 * @param {string} props.className - 自定义CSS类名
 */
const CmEditor = ({
  value = '',
  onChange,
  height = 400,
  disabled = false,
  config = {},
  className = '',
}) => {
  const [editor, setEditor] = useState(null);
  const [html, setHtml] = useState(value);
  const token = getToken();

  // 自定义上传图片
  const handleUploadImage = async (file, insertFn) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/system/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();
      if (result.code === 0 || result.code === 200) {
        const url = result.data?.path || result.data;
        insertFn(url, file.name, url);
      } else {
        throw new Error(result.msg || '上传失败');
      }
    } catch (error) {
      console.error('图片上传失败:', error);
      // 降级使用 base64
      const reader = new FileReader();
      reader.onload = (e) => {
        insertFn(e.target.result, file.name, e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 更新内容
  useEffect(() => {
    if (value !== html) {
      setHtml(value || '');
    }
  }, [value]);

  // 及时销毁 editor，重要！
  useEffect(() => {
    return () => {
      if (editor == null) return;
      editor.destroy();
      setEditor(null);
    };
  }, [editor]);

  // 处理 disabled/readonly 模式
  useEffect(() => {
    if (editor && disabled) {
      editor.disable();
    } else if (editor && !disabled) {
      editor.enable();
    }
  }, [editor, disabled]);

  // 工具栏配置
  const toolbarConfig = {
    excludeKeys: [
      'group-video' // 排除视频
    ]
  };

  // 编辑器配置
  const editorConfig = {
    placeholder: '请输入内容...',
    MENU_CONF: {
      fontSize: {
        fontSizeList: [
          '12px', '13px', '14px', '15px', '16px', '17px', '18px', '19px',
          '20px', '22px', '24px', '26px', '28px', '30px', '36px', '48px'
        ]
      },
      lineHeight: {
        lineHeightList: ['1', '1.5', '2', '2.5', '3']
      },
      uploadImage: {
        // 自定义上传图片
        customUpload: handleUploadImage
      }
    },
    ...config
  };

  // 内容变化
  const handleChange = (editor) => {
    const newHtml = editor.getHtml();
    setHtml(newHtml);
    if (onChange) {
      onChange(newHtml);
    }
  };

  return (
    <div className={`cm-editor-wangeditor ${className}`} style={{ height: `${height}px` }}>
      <Toolbar
        editor={editor}
        defaultConfig={toolbarConfig}
        mode="default"
        style={{ borderBottom: '1px solid #d9d9d9' }}
      />
      <Editor
        defaultConfig={editorConfig}
        value={html}
        onCreated={setEditor}
        onChange={handleChange}
        mode="default"
        style={{ height: 'calc(100% - 41px)', overflowY: 'hidden' }}
      />
    </div>
  );
};

export default CmEditor;
