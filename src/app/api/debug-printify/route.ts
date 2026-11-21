import { NextResponse } from 'next/server';
import fs from 'fs';

export async function GET() {
  const envKeys = Object.keys(process.env).filter(k => k.includes('PRINTIFY'));
  
  const token = process.env.PRINTIFY_API_TOKEN;
  
  const debugInfo: any = {
    tokenExists: !!token,
    tokenPrefix: token ? token.substring(0, 10) + '...' : null,
    allPrintifyKeys: envKeys,
    timestamp: new Date().toISOString()
  };

  if (token) {
    try {
      const res = await fetch('https://api.printify.com/v1/shops.json', {
        headers: { Authorization: `Bearer ${token}` }
      });
      debugInfo.status = res.status;
      debugInfo.body = await res.text();
    } catch (e: any) {
      debugInfo.error = e.message;
    }
  }

  return NextResponse.json(debugInfo);
}
