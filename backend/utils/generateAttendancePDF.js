import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

const generateAttendancePDF = async ({ student, company, attendanceData }) => {
  const doc = new PDFDocument({ margin: 40, size: "A4" });
  // ✅ Create pdf directory safely
  const pdfDir = path.resolve("./pdfs");
  if (!fs.existsSync(pdfDir)) {
    fs.mkdirSync(pdfDir, { recursive: true });
  }

  // ✅ Now student exists here
  const filePath = path.join(pdfDir, `${student.student_id}_attendance.pdf`);

  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  /* ================= HEADER ================= */
  doc
    .fontSize(16)
    .text("BAHIR DAR INSTITUTE OF TECHNOLOGY", { align: "center" })
    .moveDown(0.3)
    .fontSize(14)
    .text("STUDENT INTERNSHIP ATTENDANCE SHEET", { align: "center" })
    .moveDown(1);

  doc.fontSize(11);
  doc.text(`Student Name: ${student.name}`);
  doc.text(`Student ID: ${student.student_id}`);
  doc.text(`Department: ${student.department}`);
  doc.text(`Hosting Company: ${company}`);
  doc.moveDown(1);

  /* ================= TABLE HELPERS ================= */
  const drawMonthHeader = (title) => {
    doc.font("Helvetica-Bold").text(title);
    doc.font("Helvetica");
  };

  const drawTableHeader = (y) => {
    const headers = ["Week", "Mon", "Tue", "Wed", "Thu", "Fri"];
    let x = 50;

    headers.forEach((h, i) => {
      doc.rect(x, y, i === 0 ? 60 : 60, 20).stroke();
      doc.text(h, x + 15, y + 5);
      x += 60;
    });
  };

  const drawRow = (y, week, days) => {
    let x = 50;
    doc.rect(x, y, 60, 20).stroke();
    doc.text(week, x + 15, y + 5);
    x += 60;

    ["Mon", "Tue", "Wed", "Thu", "Fri"].forEach((day) => {
      doc.rect(x, y, 60, 20).stroke();
      doc.text(days[day] || "-", x + 25, y + 5);
      x += 60;
    });
  };

  /* ================= MONTH LOOP ================= */
  Object.entries(attendanceData.records).forEach(([month, weeks], index) => {
    if (doc.y > 650) doc.addPage();

    drawMonthHeader(`Month ${index + 1}: ${month}`);
    let y = doc.y + 10;

    drawTableHeader(y);
    y += 20;

    let absentCount = 0;

    Object.entries(weeks).forEach(([week, days]) => {
      drawRow(y, week, days);
      y += 20;

      Object.values(days).forEach((v) => {
        if (v === "A") absentCount++;
      });
    });

    doc.moveDown(0.5);
    doc.text(`Total Absent Days in the Month: ${absentCount}`);
    doc.moveDown(1);
    doc.text(`Supervisor/Coach Name & Signature: ________________________`);
    doc.moveDown(1);
    doc.text(`Company Stamp`);
    doc.moveDown(2);
  });

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on("finish", () => resolve(filePath));
    stream.on("error", reject);
  });
};

export default generateAttendancePDF;
