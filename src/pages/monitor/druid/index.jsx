import React from 'react';

const DruidPage = () => {
  // Druid数据库监控页面 - 使用iframe嵌入druid监控页面
  const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';
  const url = baseURL + '/druid/login.html';

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <iframe
        src={url}
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="Druid监控"
      />
    </div>
  );
};

export default DruidPage;
