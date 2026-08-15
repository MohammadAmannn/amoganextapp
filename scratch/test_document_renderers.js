async function testAllAttachments() {
  console.log("=== TESTING ALL SAMPLE ATTACHMENTS FOR DOCUMENT VIEWER ===");

  const testFiles = [
    { name: "PDF File", url: "http://localhost:3000/uploads/mail-attachments/1786696236217_report__21_.pdf" },
    { name: "CSV File", url: "http://localhost:3000/uploads/mail-attachments/1786696236208_bank-full.csv" },
    { name: "DOCX File", url: "http://localhost:3000/uploads/mail-attachments/1786696236213_file-sample_1MB.docx" },
    { name: "XLSX File", url: "http://localhost:3000/uploads/mail-attachments/1786696236215_report__1_.xlsx" },
    { name: "JPG Image", url: "http://localhost:3000/uploads/mail-attachments/1786696230355_96990.jpg" }
  ];

  for (const file of testFiles) {
    try {
      const res = await fetch(file.url);
      console.log(`[${file.name}] ${file.url}`);
      console.log(`   Status: ${res.status} ${res.statusText}`);
      console.log(`   Content-Type: ${res.headers.get("content-type")}`);
      console.log(`   Content-Length: ${res.headers.get("content-length")} bytes\n`);
    } catch (err) {
      console.error(`[${file.name}] FAILED:`, err.message);
    }
  }
}

testAllAttachments();
