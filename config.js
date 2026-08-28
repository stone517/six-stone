// x402 收费中间件配置
// 定价：0.5 USDT/次调用
// 收款地址：Stone · 石光电火 的 Agentic Wallet (XLayer)
module.exports = {
  PAY_TO: '0x9934420053cc570b46d73d487ed7f5235b58c1a2',
  PRICE_USDT: '0.5',
  NETWORK: 'xlayer',
  // x402 协议版本
  X402_VERSION: 1,
  // 描述信息（402 响应里给买方看）
  DESCRIPTION: '六脉神剑 · 尾盘甄选 - A股尾盘甄选信号（每日更新）',
  // MIME 类型
  MIME_TYPE: 'application/json',
  // 免费白名单（内部测试用，通过 ?key= 查询参数匹配）
  FREE_KEYS: (process.env.FREE_ACCESS_KEYS || '').split(',').filter(Boolean),
};
