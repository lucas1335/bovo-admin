import React, { useState, useEffect } from 'react';
import { Upload, Modal, message, Image } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { getToken } from '../utils/auth';

/**
 * 图片上传组件
 * 支持：单图上传/多图上传、预览、删除
 */
const CmUpload = ({
  value = '',
  onChange,
  multiple = false,
  limit = multiple ? 5 : 1,
  width = 148,
  height = 148,
  accept = 'image/jpeg,image/gif,image/png',
}) => {
  const [fileList, setFileList] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const token = getToken();

  // 上传地址配置
  const uploadAction =   `${import.meta.env.VITE_API_BASE_URL}system/upload`;

  // 初始化文件列表
  useEffect(() => {
    if (value) {
      const list = multiple
        ? value.split(',').filter(Boolean).map((url) => ({
            uid: `-${Date.now()}-${Math.random()}`,
            name: 'image.png',
            status: 'done',
            url: url,
            response: { data: { path: url } },
          }))
        : value
        ? [{
            uid: `-${Date.now()}`,
            name: 'image.png',
            status: 'done',
            url: value,
            response: { data: { path: value } },
          }]
        : [];

      setFileList(list);
    } else {
      setFileList([]);
    }
  }, [value, multiple]);

  // 处理文件变化
  const handleChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);

    // 提取所有成功上传的文件路径
    const urls = newFileList
      .filter((file) => file.status === 'done')
      .map((file) => {
        if (file.response?.data?.path) {
          return file.response.data.path;
        }
        return file.url || '';
      })
      .filter(Boolean);

    const valueStr = urls.join(',');
    if (onChange) {
      onChange(valueStr);
    }
  };

  // 预览图片
  const handlePreview = (file) => {
    setPreviewImage(file.url || file.response?.data?.path);
    setPreviewVisible(true);
  };

  // 删除文件
  const handleRemove = (file) => {
    const newFileList = fileList.filter((item) => item.uid !== file.uid);
    setFileList(newFileList);

    const urls = newFileList
      .map((file) => {
        if (file.response?.data?.path) {
          return file.response.data.path;
        }
        return file.url || '';
      })
      .filter(Boolean);

    const valueStr = urls.join(',');
    if (onChange) {
      onChange(valueStr);
    }
  };

  // 上传按钮
  const uploadButton = (
    <div style={{
      width,
      height,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>上传</div>
    </div>
  );

  return (
    <>
      <Upload
        action={uploadAction}
        listType="picture-card"
        fileList={fileList}
        onChange={handleChange}
        onPreview={handlePreview}
        onRemove={handleRemove}
        headers={{
          Authorization: `${token}`,
        }}
        accept={accept}
        multiple={multiple}
        maxCount={limit}
      >
        {fileList.length >= limit ? null : uploadButton}
      </Upload>

      <Modal
        open={previewVisible}
        title="图片预览"
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width="80%"
        style={{ top: 20 }}
      >
        <Image
          alt="preview"
          style={{ width: '100%' }}
          src={previewImage}
          preview={false}
        />
      </Modal>
    </>
  );
};

export default CmUpload;
