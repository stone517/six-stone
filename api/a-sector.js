// A股热点板块榜 API
// GET /api/a-sector → 行业板块涨幅排名 + 涨停板块分布（x402 收费 0.05 USDT）
const fs = require('fs');
const path = require('path');
const config = require('../config.js');

const PRICE = '0.02';
const DATA_FILE = path.join(process.cwd(), 'data', 'a_sector.json');
const FREE_KEYS = [...(process.env.FREE_ACCESS_KEYS || '').split(',').filter(Boolean), 'stone517'];

module.exports = async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const key = url.searchParams.get('key') || '';
  const isFree = key && FREE_KEYS.includes(key);
  const top = Math.min(parseInt(url.searchParams.get('top') || '0') || 0, 90);

  if (!isFree) {
    res.status(402).json({
      error: 'PAYMENT_REQUIRED',
      x402Version: 1,
      accepts: [{
        scheme: 'exact',
        network: config.NETWORK,
        maxAmountRequired: PRICE,
        resource: 'https://six-stone-nine.vercel.app/api/a-sector',
        description: 'A股热点板块榜 - 行业板块涨幅排名 + 涨停板块分布（每日更新）',
        payTo: config.PAY_TO,
        asset: '0x779ded0c9e1022225f8e0630b35a9b54be713736',
      }],
    });
    return;
  }

  if (!fs.existsSync(DATA_FILE)) {
    res.status(404).json({ error: 'NOT_FOUND', message: '暂无数据' });
    return;
  }
  try {
    let raw = fs.readFileSync(DATA_FILE, 'utf8');
    if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
    const data = JSON.parse(raw);
    if (top > 0) data.sectors = data.sectors.slice(0, top);
    res.status(200).json(data);
  } catch {
    res.status(500).json({ error: 'PARSE_ERROR' });
  }
};
