 
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// 接收多维表格调用的接口
app.get('/api/hello', (req, res) => {
  const name = req.query.name || '多维表格';
  res.json({
    success: true,
    message: `你好，${name}！这是一个插件服务示例`,
    timestamp: new Date().toISOString()
  });
});

app.listen(port, () => {
  console.log(`服务运行在 http://localhost:${port}`);
});