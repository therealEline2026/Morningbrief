const FRED_KEY = process.env.FRED_KEY || 'efca4b17a73f3ddac0661aed999f178a';
const FMP_KEY = process.env.FMP_KEY || 'ifKtk3Kfi3fmbUGOzH3enzz8p2R4Dqn7';

async function yahooQuotes(symbols) {
  try {
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols.join(',')}`;
    const r = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'application/json',
      }
    });
    const d = await r.json();
    const result = {};
    (d.quoteResponse?.result || []).forEach(q => {
      result[q.symbol] = {
        price: q.regularMarketPrice,
        chg: q.regularMarketChangePercent,
        chgAbs: q.regularMarketChange,
        name: q.shortName || q.longName || q.symbol,
      };
    });
    return result;
  } catch (e) {
    return {};
  }
}

async function fredSeries(seriesId) {
  try {
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${FRED_KEY}&file_type=json&limit=2&sort_order=desc`;
    const r = await fetch(url);
    const d = await r.json();
    const obs = (d.observations || []).filter(o => o.value !== '.');
    return obs[0] ? { value: parseFloat(obs[0].value), date: obs[0].date } : null;
  } catch (e) {
    return null;
  }
}

async function fetchEarnings() {
  try {
    const now = new Date();
    const end = new Date(); end.setDate(end.getDate() + 7);
    const fmt = d => d.toISOString().split('T')[0];
    const url = `https://financialmodelingprep.com/stable/earnings-calendar?from=${fmt(now)}&to=${fmt(end)}&apikey=${FMP_KEY}`;
    const r = await fetch(url);
    const d = await r.json();
    if (!Array.isArray(d)) return [];
    return d
      .filter(e => e.symbol && e.date)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 15)
      .map(e => ({
        symbol: e.symbol,
        name: e.name || '',
        date: e.date,
        time: e.time || '',
        epsEstimated: e.epsEstimated || null,
        revenueEstimated: e.revenueEstimated || null,
      }));
  } catch (e) {
    return [];
  }
}

async function fetchFearGreed() {
  try {
    const r = await fetch('https://production.dataviz.cnn.io/index/fearandgreed/graphdata');
    const d = await r.json();
    return {
      score: Math.round(d.fear_and_greed?.score ?? 50),
      rating: d.fear_and_greed?.rating ?? 'Neutral',
    };
  } catch (e) {
    return { score: 50, rating: 'Neutral' };
  }
}

export default async function handler(req, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=300', // cache 5 min
  };

  try {
    const [indices, stocks, commodities, sectors, macro, fred, fearGreed, earnings] = await Promise.all([
      // Indices
      yahooQuotes(['^GSPC', '^IXIC', '^AEX', '^VIX', 'DX-Y.NYB']),
      // Mag 7 + ASML
      yahooQuotes(['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'META', 'TSLA', 'ASML']),
      // Commodities
      yahooQuotes(['GC=F', 'SI=F', 'CL=F', 'BZ=F']),
      // Sectors
      yahooQuotes(['XLK', 'XLC', 'XLF', 'XLV', 'XLI', 'XLY', 'XLP', 'XLE', 'XLB', 'XLU', 'XLRE']),
      // Macro (rente, EUR/USD)
      yahooQuotes(['^TNX', '^TYX', 'EURUSD=X']),
      // FRED
      Promise.all([
        fredSeries('FEDFUNDS'),
        fredSeries('CPIAUCSL'),
        fredSeries('UNRATE'),
        fredSeries('M2SL'),
      ]),
      // Fear & Greed
      fetchFearGreed(),
      // Earnings
      fetchEarnings(),
    ]);

    return new Response(JSON.stringify({
      timestamp: new Date().toISOString(),
      indices,
      stocks,
      commodities,
      sectors,
      macro,
      fred: {
        fedFunds: fred[0],
        cpi: fred[1],
        unemployment: fred[2],
        m2: fred[3],
      },
      fearGreed,
      earnings,
    }), { status: 200, headers });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}

export const config = { path: '/api/market-data' };
