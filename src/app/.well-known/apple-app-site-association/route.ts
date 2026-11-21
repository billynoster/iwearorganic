import { NextResponse } from 'next/server';

export async function GET() {
  const data = {
    applinks: {
      details: [
        {
          appIDs: ["CDSSHSL45C.com.blendamerica.app"],
          components: [
            { "/": "/__/auth/*" },
            { "/": "/product/*" }
          ]
        }
      ]
    }
  };

  return NextResponse.json(data, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
