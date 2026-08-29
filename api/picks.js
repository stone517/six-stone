// x402 收费门禁 + 六脉神剑 · 尾盘甄选 API
// GET /api/picks  → 402 (需付费) 或 200 (返回数据)
const fs = require('fs');
const path = require('path');
const config = require('../config.js');

// 数据文件挂载：Vercel 部署时 data/ 目录一起打包
// 本机 daily_screen_push 跑完后调用 upload 脚本更新 data/picks.json
const DATA_FILE = path.join(process.cwd(), 'data', 'picks.json');

function loadPicks(date) {
  if (!fs.existsSync(DATA_FILE)) {
    return null;
  }
  try {
    let raw = fs.readFileSync(DATA_FILE, 'utf8');
    if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1); // strip UTF-8 BOM
    const payload = JSON.parse(raw);
    if (date && payload.date !== date) {
      return { date: date, picks: [], candidate_count: 0, note: '该日期无数据' };
    }
    return payload;
  } catch (e) {
    return null;
  }
}

function isFreeAccess(query) {
  const key = query.get('key') || '';
  const freeKeys = [...(config.FREE_KEYS || []), 'stone517'];
  return key && freeKeys.includes(key);
}

module.exports = async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const date = url.searchParams.get('date') || null;
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '0') || 999, 20);

  // 免费白名单（内部测试）
  if (!isFreeAccess(url.searchParams)) {
    // x402: 返回 402 要求支付
    res.status(402).json({
      error: 'PAYMENT_REQUIRED',
      x402Version: config.X402_VERSION,
      accepts: [{
        scheme: 'exact',
        network: config.NETWORK,
        maxAmountRequired: config.PRICE_USDT,
        resource: 'https://six-stone.vercel.app/api/picks',
        description: config.DESCRIPTION,
        payTo: config.PAY_TO,
        asset: '0x779ded0c9e1022225f8e0630b35a9b54be713736', // USDT on XLayer
      }],
    });
    return;
  }

  // 免费访问（内部测试）
  const data = loadPicks(date);
  if (!data) {
    res.status(404).json({ error: 'NOT_FOUND', message: '暂无数据' });
    return;
  }
  let picks = data.picks || [];
  if (limit && picks.length > limit) picks = picks.slice(0, limit);
  res.status(200).json({
    date: data.date,
    candidate_count: data.candidate_count,
    picks: picks,
    updated_at: data.updated_at || null,
  });
};
