import React, { useState, useEffect } from 'react';
import { Upload, Modal, message, Image } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { getToken } from '../utils/auth';

/**
 * 多图上传组件
 * 专门用于多图片上传场景
 */
const CmUploadMore = ({
  value = '',
  onChange,
  limit = 5,
  width = 104,
  height = 104,
  accept = 'image/jpeg,image/gif,image/png',
}) => {
  const [fileList, setFileList] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const token = getToken();

  // 上传地址
  const uploadAction  = `${import.meta.env.VITE_API_BASE_URL}system/upload`;

  // 初始化文件列表
  useEffect(() => {
    if (value) {
      const urls = value.split(',').filter(Boolean);
      const list = urls.map((url, index) => ({
        uid: `-${Date.now()}-${index}`,
        name: `image-${index}.png`,
        status: 'done',
        url: url,
        response: { data: { path: url } },
      }));
      setFileList(list);
    } else {
      setFileList([]);
    }
  }, [value]);

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

  // 上传超出限制
  const handleExceed = () => {
    message.warning(`最多上传${limit}张图片`);
  };

  // 预览图片
  const handlePreview = (file) => {
    setPreviewImage(file.url || file.response?.data?.path);
    setPreviewVisible(true);
  };

  // 上传按钮
  const uploadButton = (
    <div>
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
        onExceed={handleExceed}
        headers={{
          Authorization: `Bearer ${token}`,
        }}
        accept={accept}
        multiple
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

export default CmUploadMore;
