import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

const generateAssessmentPDF = async ({ student, company, assessment }) => {
  const doc = new PDFDocument({ margin: 50 });

  /* ================= CREATE PDF FOLDER ================= */
  const pdfDir = path.resolve("./pdfs");
  if (!fs.existsSync(pdfDir)) {
    fs.mkdirSync(pdfDir, { recursive: true });
  }

  const filePath = path.join(pdfDir, `${student.student_id}_assessment.pdf`);

  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  /* ================= HEADER ================= */

  doc
    .fontSize(16)
    .text("BAHIR DAR INSTITUTE OF TECHNOLOGY", { align: "center" })
    .moveDown(0.3)
    .fontSize(14)
    .text("COMPANY ASSESSMENT FORM", { align: "center" })
    .moveDown(1);

  doc.fontSize(11);
  doc.text(`Student Name: ${student.name}`);
  doc.text(`Student ID: ${student.student_id}`);
  doc.text(`Department: ${student.department}`);
  doc.text(`Hosting Company: ${company}`);
  doc.text(`Company Supervisor: ${student.supervisor || ""}`);
  doc.moveDown(1);

  /* ================= ASSESSMENT SECTION ================= */

  doc.fontSize(13).text("ASSESSMENT MARKS", { underline: true });
  doc.moveDown(0.5);

  const renderSection = (title, sectionData = {}) => {
    doc.fontSize(12).text(title);
    doc.moveDown(0.3);

    Object.entries(sectionData).forEach(([key, value]) => {
      doc.text(`${key.replace(/_/g, " ")} : ${value}`);
    });

    doc.moveDown(0.7);
  };

  if (assessment) {
    renderSection("General", assessment.general);
    renderSection("Personal", assessment.personal);
    renderSection("Professional", assessment.professional);
  } else {
    doc.text("No assessment data provided.");
  }

  /* ================= FOOTER ================= */

  doc.moveDown(1);
  doc.text("Company Supervisor Signature: __________________________");

  doc.moveDown(1);
  doc.text("Company Stamp: __________________________");

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on("finish", () => resolve(filePath));
    stream.on("error", reject);
  });
};

export default generateAssessmentPDF;
