import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import moment from 'moment';
import 'moment/locale/zh-cn';
import { BitablePluginSDK } from '@lark-open/bitable-plugin-sdk';

import TablePage from './pages/TablePage';
import './App.css';

// 设置moment中文语言
moment.locale('zh-cn');

// 初始化飞书多维表格 SDK
const sdk = new BitablePluginSDK();

function App() {
  const [userInfo, setUserInfo] = useState({});
  const [loading, setLoading] = useState(true);

  // 获取用户信息
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const { data } = await sdk.getUserInfo();
        setUserInfo(data);
      } catch (error) {
        console.error('获取用户信息失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <Routes>
          <Route path="/" element={<TablePage userInfo={userInfo} />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
