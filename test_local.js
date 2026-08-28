// 本地测试 picks.js API 逻辑
const p = require('./api/picks.js');
const res = {
  status(code) { console.log('HTTP', code); return { json(d) { console.log(JSON.stringify(d, null, 2).substring(0, 400)); } }; }
};
// 模拟免费访问（带 key）
p({ url: 'http://localhost/api/picks?key=test', searchParams: new URLSearchParams('key=test') }, res);
