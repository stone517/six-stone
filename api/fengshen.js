// 封神榜 · 涨停复盘 API
// GET /api/fengshen → 涨停全景数据（x402 收费 0.02 USDT）
const fs = require('fs');
const path = require('path');
const config = require('../config.js');

const PRICE = '0.02';
const DATA_FILE = path.join(process.cwd(), 'data', 'fengshen.json');
const FREE_KEYS = [...(process.env.FREE_ACCESS_KEYS || '').split(',').filter(Boolean), 'stone517'];

function loadData(date) {
  if (!fs.existsSync(DATA_FILE)) return null;
  try {
    let raw = fs.readFileSync(DATA_FILE, 'utf8');
    if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
    const payload = JSON.parse(raw);
    if (date && payload.date !== date) {
      return { date: date, error: '该日期无数据' };
    }
    return payload;
  } catch { return null; }
}

module.exports = async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const date = url.searchParams.get('date') || null;
  const minBoards = parseInt(url.searchParams.get('min_boards') || '0') || 0;
  const key = url.searchParams.get('key') || '';
  const freeKeys = (process.env.FREE_ACCESS_KEYS || '').split(',').filter(Boolean);

  const isFree = key && FREE_KEYS.includes(key);

  if (!isFree) {
    res.status(402).json({
      error: 'PAYMENT_REQUIRED',
      x402Version: 1,
      accepts: [{
        scheme: 'exact',
        network: config.NETWORK,
        maxAmountRequired: PRICE,
        resource: 'https://six-stone-nine.vercel.app/api/fengshen',
        description: '封神榜 · 涨停复盘 - A股每日涨停全景数据',
        payTo: config.PAY_TO,
        asset: '0x779ded0c9e1022225f8e0630b35a9b54be713736',
      }],
    });
    return;
  }

  const data = loadData(date);
  if (!data) {
    res.status(404).json({ error: 'NOT_FOUND', message: '暂无数据' });
    return;
  }

  // min_boards 过滤连板梯队
  let ladder = data.ladder || [];
  if (minBoards > 0) ladder = ladder.filter(l => l.boards >= minBoards);

  res.status(200).json({
    date: data.date,
    updated_at: data.updated_at,
    limit_up_count: data.limit_up_count,
    max_boards: data.max_boards,
    broken_rate: data.broken_rate,
    hot_sector: data.hot_sector,
    sectors: data.sectors,
    ladder: ladder,
    stocks_total: (data.stocks || []).length,
  });
};
