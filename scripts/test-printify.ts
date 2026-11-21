import 'dotenv/config';

async function test() {
  const token = process.env.PRINTIFY_API_TOKEN;
  console.log("Token exists:", !!token);
  if (token) {
    console.log("Token starts with:", token.substring(0, 10) + "...");
  } else {
    console.log("PRINTIFY_API_TOKEN is not set in the environment.");
  }

  try {
    console.log("Fetching shops from Printify...");
    const res = await fetch('https://api.printify.com/v1/shops.json', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log("Response Status:", res.status);
    const text = await res.text();
    console.log("Response Body:", text);
  } catch (e) {
    console.error("Fetch failed:", e);
  }
}

test();
