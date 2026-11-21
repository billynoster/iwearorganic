async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/debug-printify');
    const text = await res.text();
    console.log("Localhost API Response:", text);
  } catch (e) {
    console.error("Failed to fetch from localhost:", e);
  }
}

test();
