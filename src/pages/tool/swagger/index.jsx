import React from 'react';

const SwaggerPage = () => {
  // Swagger页面 - 使用iframe嵌入swagger-ui
  // const url = import.meta.env.VITE_API_BASE_URL + '/swagger-ui/index.html';

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      {/* 原Vue版本使用iframe组件，React版本可根据需要实现 */}
      {/* <iframe src={url} style={{ width: '100%', height: '100%', border: 'none' }} /> */}
      <div style={{ padding: 24, textAlign: 'center' }}>
        <h3>Swagger接口文档</h3>
        <p>请配置后端API地址后访问：/swagger-ui/index.html</p>
      </div>
    </div>
  );
};

export default SwaggerPage;
