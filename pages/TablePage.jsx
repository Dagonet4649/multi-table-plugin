import React from 'react';
import { Layout, Menu, message } from 'antd';
import { HomeOutlined, TableOutlined, SettingOutlined } from '@ant-design/icons';
import { BitablePluginSDK } from '@lark-open/bitable-plugin-sdk';
import TableWithBackground from '../components/TableWithBackground';

const { Header, Content, Sider } = Layout;

// 初始化飞书多维表格 SDK
const sdk = new BitablePluginSDK();

const TablePage = () => {
  // 检查环境变量是否存在
  useEffect(() => {
    const checkEnvVars = () => {
      const requiredEnvVars = [
        'REACT_APP_APP_ID',
        'REACT_APP_APP_SECRET',
        'REACT_APP_BITABLE_APP_TOKEN',
        'REACT_APP_BITABLE_TABLE_ID'
      ];
      
      const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
      
      if (missingVars.length > 0) {
        message.error(`缺少必要的环境变量: ${missingVars.join(', ')}`);
        console.error('请在.env文件中配置以下环境变量:', missingVars);
      }
    };
    
    checkEnvVars();
  }, []);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200} className="site-layout-background">
        <div className="logo">
          <h1>多维表格插件</h1>
        </div>
        <Menu
          mode="inline"
          defaultSelectedKeys={['1']}
          style={{ height: '100%', borderRight: 0 }}
        >
          <Menu.Item key="1" icon={<TableOutlined />}>
            表格展示
          </Menu.Item>
          <Menu.Item key="2" icon={<HomeOutlined />}>
            首页
          </Menu.Item>
          <Menu.Item key="3" icon={<SettingOutlined />}>
            设置
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout className="site-layout">
        <Header className="site-layout-background" style={{ padding: 0 }}>
          <div className="header-content">
            <div className="title">多维表格自定义展示</div>
            <div className="user-info">
              <span>当前用户: {userInfo.name}</span>
            </div>
          </div>
        </Header>
        <Content style={{ margin: '16px 16px' }}>
          <div className="content-container">
            <TableWithBackground />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default TablePage;
