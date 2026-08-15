async function testFile() {
  const url = "http://localhost:3000/uploads/mail-attachments/1786696236217_report__21_.pdf";
  console.log("Testing GET:", url);
  try {
    const res = await fetch(url);
    console.log("Status:", res.status, res.statusText);
    console.log("Content-Type:", res.headers.get("content-type"));
    console.log("Content-Length:", res.headers.get("content-length"));
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

testFile();
