import React, { useState, useEffect } from 'react';
import { Upload, Button, Table, Select, Tooltip, message, Skeleton, Space } from 'antd';
import { UploadOutlined, DownloadOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { BitablePluginSDK } from '@lark-open/bitable-plugin-sdk';

const { Option } = Select;

// 飞书多维表格插件 SDK 实例
const sdk = new BitablePluginSDK();

const TableWithBackground = () => {
  // 状态管理
  const [backgroundImage, setBackgroundImage] = useState('');
  const [tableData, setTableData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [tableWidth, setTableWidth] = useState('90%');

  // 初始化数据
  useEffect(() => {
    fetchTableSchema();
    fetchTableData();
  }, []);

  // 获取表格结构
  const fetchTableSchema = async () => {
    try {
      const { data } = await sdk.bitable.getTableMeta({
        appToken: process.env.REACT_APP_BITABLE_APP_TOKEN,
        tableId: process.env.REACT_APP_BITABLE_TABLE_ID,
      });
      
      // 转换字段为表格列配置
      const tableColumns = data.fields.map(field => ({
        title: field.name,
        dataIndex: field.id,
        key: field.id,
        ellipsis: true,
        render: (text) => (
          <Tooltip title={text}>
            <span>{text}</span>
          </Tooltip>
        ),
      }));
      
      setColumns(tableColumns);
      setSelectedColumns(tableColumns.map(col => col.key));
    } catch (error) {
      console.error('获取表格结构失败:', error);
      message.error('获取表格结构失败，请检查配置');
    }
  };

  // 获取表格数据
  const fetchTableData = async () => {
    setLoading(true);
    try {
      const { data } = await sdk.bitable.getRecords({
        appToken: process.env.REACT_APP_BITABLE_APP_TOKEN,
        tableId: process.env.REACT_APP_BITABLE_TABLE_ID,
      });
      
      // 转换记录数据格式
      const formattedData = data.records.map(record => {
        const formattedRecord = { key: record.recordId };
        Object.entries(record.fields).forEach(([key, value]) => {
          formattedRecord[key] = value;
        });
        return formattedRecord;
      });
      
      setTableData(formattedData);
    } catch (error) {
      console.error('获取表格数据失败:', error);
      message.error('获取表格数据失败，请检查配置');
    } finally {
      setLoading(false);
    }
  };

  // 处理背景图片上传
  const handleUpload = ({ file }) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setBackgroundImage(e.target.result);
      message.success('背景图片上传成功');
    };
    reader.onerror = () => {
      message.error('图片上传失败，请重试');
    };
    reader.readAsDataURL(file);
    return false; // 阻止默认上传行为
  };

  // 处理列选择变更
  const handleColumnChange = (keys) => {
    setSelectedColumns(keys);
  };

  // 导出数据为CSV
  const exportToCSV = () => {
    if (!tableData.length) {
      message.warning('没有数据可导出');
      return;
    }
    
    const selectedColumnsObj = columns.filter(col => selectedColumns.includes(col.key));
    
    // 构建CSV内容
    const headers = selectedColumnsObj.map(col => col.title).join(',');
    const rows = tableData.map(row => {
      return selectedColumnsObj.map(col => {
        const value = row[col.key] || '';
        // 处理包含逗号的值
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      }).join(',');
    });
    
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // 创建下载链接
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `table_data_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    message.success('数据导出成功');
  };

  // 切换深色/浅色模式
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // 调整表格宽度
  const adjustTableWidth = (width) => {
    setTableWidth(width);
  };

  // 构建表格样式
  const tableContainerStyle = {
    width: tableWidth,
    margin: '0 auto',
    marginTop: '20px',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
  };

  const tableStyle = {
    backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    minHeight: '400px',
    position: 'relative',
  };

  const tableContentStyle = {
    backgroundColor: isDarkMode ? 'rgba(30, 30, 30, 0.85)' : 'rgba(255, 255, 255, 0.85)',
    borderRadius: '4px',
    padding: '10px',
  };

  // 过滤选中的列
  const filteredColumns = columns.filter(col => selectedColumns.includes(col.key));

  return (
    <div className="table-with-background-container">
      <div className="control-panel">
        <h3 className="title">飞书多维表格自定义展示</h3>
        <div className="actions">
          <Upload
            beforeUpload={handleUpload}
            showUploadList={false}
            accept="image/*"
            disabled={loading}
          >
            <Button icon={<UploadOutlined />} disabled={loading}>
              上传背景图片
            </Button>
          </Upload>
          
          <Button 
            icon={<DownloadOutlined />} 
            onClick={exportToCSV} 
            disabled={loading || !tableData.length}
          >
            导出数据
          </Button>
          
          <Button 
            icon={isDarkMode ? <EyeOutlined /> : <EyeInvisibleOutlined />} 
            onClick={toggleTheme}
          >
            {isDarkMode ? '浅色模式' : '深色模式'}
          </Button>
          
          <Select
            mode="multiple"
            placeholder="选择要显示的列"
            style={{ width: '300px', marginLeft: '10px' }}
            value={selectedColumns}
            onChange={handleColumnChange}
            disabled={loading}
          >
            {columns.map(col => (
              <Option key={col.key} value={col.key}>
                {col.title}
              </Option>
            ))}
          </Select>
          
          <Select
            defaultValue="90%"
            style={{ width: '120px', marginLeft: '10px' }}
            onChange={adjustTableWidth}
            disabled={loading}
          >
            <Option value="70%">窄（70%）</Option>
            <Option value="80%">中（80%）</Option>
            <Option value="90%">宽（90%）</Option>
            <Option value="100%">全屏（100%）</Option>
          </Select>
        </div>
      </div>
      
      <div style={tableContainerStyle}>
        <div style={tableStyle}>
          <div style={tableContentStyle}>
            {loading ? (
              <Skeleton active paragraph={{ rows: 5 }} />
            ) : tableData.length > 0 ? (
              <Table
                columns={filteredColumns}
                dataSource={tableData}
                rowKey="key"
                pagination={{
                  pageSize: 10,
                  showQuickJumper: true,
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '20', '50', '100'],
                }}
                scroll={{ x: 'max-content' }}
                locale={{
                  emptyText: '暂无数据',
                }}
              />
            ) : (
              <div className="empty-state">
                <div className="empty-icon">
                  <i className="anticon anticon-folder-open"></i>
                </div>
                <div className="empty-text">表格中暂无数据</div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="footer">
        <p>© {new Date().getFullYear()} 飞书多维表格自定义组件</p>
      </div>
    </div>
  );
};

export default TableWithBackground;
