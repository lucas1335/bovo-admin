import React, { useState } from 'react';
import { Image, Tooltip } from 'antd';
import { PictureOutlined } from '@ant-design/icons';

/**
 * 通用图片组件
 * 支持点击预览、默认占位图、自定义宽高、加载失败处理
 */
const CmImage = ({ src, width, height, style, alt = '图片', ...restProps }) => {
  const [loadError, setLoadError] = useState(false);

  // 默认样式
  const imageStyle = {
    width: width || 40,
    height: height || 40,
    objectFit: 'cover',
    borderRadius: 4,
    ...style,
  };

  // 如果没有图片或加载失败，显示占位图标
  if (!src || loadError) {
    const placeholder = (
      <div
        style={{
          width: imageStyle.width,
          height: imageStyle.height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          borderRadius: imageStyle.borderRadius,
          border: '1px solid #d9d9d9',
          cursor: 'not-allowed',
          margin: 'auto'
        }}
      >
        <PictureOutlined style={{ fontSize: 24, color: '#bfbfbf' }} />
      </div>
    );

    // 如果是加载失败，添加提示
    if (loadError && src) {
      return (
        <Tooltip title="图片加载失败">
          {placeholder}
        </Tooltip>
      );
    }

    return placeholder;
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={imageStyle.width}
      height={imageStyle.height}
      style={imageStyle}
      preview={{
        mask: '点击预览',
      }}
      onError={() => {
        setLoadError(true);
      }}
      {...restProps}
    />
  );
};

export default CmImage;
