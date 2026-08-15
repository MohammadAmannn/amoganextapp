async function testDownloadProxy() {
  const url = "http://localhost:3000/api/download?url=%2Fuploads%2Fmail-attachments%2F1786696236217_report__21_.pdf&name=report.pdf";
  console.log("Testing Download Proxy GET:", url);
  try {
    const res = await fetch(url);
    console.log("Status:", res.status, res.statusText);
    console.log("Content-Type:", res.headers.get("content-type"));
    console.log("Content-Disposition:", res.headers.get("content-disposition"));
    console.log("Content-Length:", res.headers.get("content-length"));
  } catch (err) {
    console.error("Download proxy error:", err);
  }
}

testDownloadProxy();
