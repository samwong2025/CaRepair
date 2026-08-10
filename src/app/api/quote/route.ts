import { NextResponse } from 'next/server';
import { getModelById } from '../../../data/devices';
import { getSymptomById } from '../../../data/symptoms';
import { calculateQuote } from '../../../lib/quote-engine';
import { loadPricing } from '../../../lib/pricing-store';

interface QuoteRequest {
  deviceModelId?: string;
  symptomIds?: string[];
}

/**
 * POST /api/quote
 * 依機型與故障組合計算報價（配件費／人工費分列）。
 * 前台落單精靈以純函數即時計算，本路由供外部系統與服務端二次校驗使用。
 */
export async function POST(request: Request) {
  const body = (await request.json().catch((error: unknown) => {
    console.error('解析報價請求失敗', error);
    return null;
  })) as QuoteRequest | null;

  if (!body?.deviceModelId || !Array.isArray(body.symptomIds) || body.symptomIds.length === 0) {
    return NextResponse.json(
      { message: '請提供 deviceModelId 及至少一項 symptomIds' },
      { status: 400 },
    );
  }

  const model = getModelById(body.deviceModelId);
  if (!model) {
    return NextResponse.json({ message: `找不到型號：${body.deviceModelId}` }, { status: 404 });
  }

  const unknown = body.symptomIds.filter((id) => !getSymptomById(id));
  if (unknown.length > 0) {
    return NextResponse.json(
      { message: `未知的故障項目：${unknown.join('、')}` },
      { status: 400 },
    );
  }

  const pricing = await loadPricing();
  const quote = calculateQuote(model.id, body.symptomIds, pricing);

  return NextResponse.json({
    deviceModelId: model.id,
    deviceModelName: model.name,
    quote,
  });
}
