import React, { useState, useEffect } from 'react';
import { Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { getToken } from '../utils/auth';

/**
 * 文件上传组件
 * 支持多种文件格式上传
 */
const CmUploadFile = ({
  value = '', // JSON 字符串格式: [{name: '文件名', url: '文件路径'}]
  onChange,
  limit = 5,
  accept = '*',
  size = 'default',
  tip = '建议文件大小不超过10MB',
}) => {
  const [fileList, setFileList] = useState([]);
  const token = getToken();

  // 上传地址
  const uploadAction = `${import.meta.env.VITE_API_BASE_URL}system/upload`;

  // 初始化文件列表
  useEffect(() => {
    if (value) {
      try {
        const files = JSON.parse(value);
        const list = files.map((file, index) => ({
          uid: `-${Date.now()}-${index}`,
          name: file.name,
          status: 'done',
          url: file.url,
          response: { data: { path: file.url } },
        }));
        setFileList(list);
      } catch (e) {
        console.error('解析文件列表失败:', e);
        setFileList([]);
      }
    } else {
      setFileList([]);
    }
  }, [value]);

  // 处理文件变化
  const handleChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);

    // 只保留上传成功的文件
    const successFiles = newFileList
      .filter((file) => file.status === 'done')
      .map((file) => {
        if (file.response?.data?.path) {
          return {
            name: file.name,
            url: file.response.data.path,
          };
        }
        return {
          name: file.name,
          url: file.url || '',
        };
      });

    const valueStr = JSON.stringify(successFiles);
    if (onChange) {
      onChange(valueStr);
    }
  };

  // 上传超出限制
  const handleExceed = () => {
    message.warning(`最多上传${limit}个文件`);
  };

  // 上传错误
  const handleError = () => {
    message.error('上传失败');
  };

  return (
    <Upload
      action={uploadAction}
      fileList={fileList}
      onChange={handleChange}
      onExceed={handleExceed}
      onError={handleError}
      headers={{
        Authorization: `Bearer ${token}`,
      }}
      accept={accept}
      multiple
      maxCount={limit}
    >
      <Button icon={<UploadOutlined />} size={size}>
        点击上传
      </Button>
    </Upload>
  );
};

export default CmUploadFile;
