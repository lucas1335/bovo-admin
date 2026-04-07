import React, { useEffect, useRef, useMemo } from 'react';

const Watermark = ({ 
  content = 'Admin Dashboard', 
  fontSize = 16, 
  fontColor = 'rgba(0, 0, 0, 0.1)', 
  rotate = -20,
  gapX = 200,
  gapY = 100,
  offsetX = 0,
  offsetY = 0,
  zIndex = 9999,
  children,
  disabled = false
}) => {
  const watermarkRef = useRef(null);
  const containerRef = useRef(null);

  // 使用useMemo优化水印创建过程
  const watermarkStyle = useMemo(() => {
    if (disabled) return null;

    // 创建画布
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // 设置画布大小
    canvas.width = gapX;
    canvas.height = gapY;

    // 设置文字样式
    ctx.font = `normal normal normal ${fontSize}px Arial`;
    ctx.fillStyle = fontColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 旋转画布
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((Math.PI / 180) * rotate);

    // 绘制文字
    ctx.fillText(content, 0, 0);

    // 返回背景图像URL
    return `url(${canvas.toDataURL()})`;
  }, [content, fontSize, fontColor, rotate, gapX, gapY, disabled]);

  useEffect(() => {
    if (disabled || !watermarkRef.current || !containerRef.current || !watermarkStyle) return;

    // 清除现有的水印
    watermarkRef.current.innerHTML = '';

    // 创建水印容器
    const watermarkContainer = document.createElement('div');
    watermarkContainer.style.position = 'fixed';
    watermarkContainer.style.top = '0';
    watermarkContainer.style.left = '0';
    watermarkContainer.style.width = '100%';
    watermarkContainer.style.height = '100%';
    watermarkContainer.style.pointerEvents = 'none';
    watermarkContainer.style.backgroundImage = watermarkStyle;
    watermarkContainer.style.backgroundPosition = `${offsetX}px ${offsetY}px`;
    watermarkContainer.style.zIndex = zIndex;
    
    // 添加水印到容器
    watermarkRef.current.appendChild(watermarkContainer);

    // 监听窗口大小变化，重新创建水印
    const handleResize = () => {
      if (watermarkRef.current && watermarkRef.current.firstChild) {
        watermarkRef.current.innerHTML = '';
        watermarkRef.current.appendChild(watermarkContainer.cloneNode(true));
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [watermarkStyle, offsetX, offsetY, zIndex, disabled]);

  if (disabled) {
    return <div ref={containerRef}>{children}</div>;
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
      {children}
      <div ref={watermarkRef} />
    </div>
  );
};

export default Watermark;