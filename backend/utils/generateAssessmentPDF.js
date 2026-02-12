import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

/**
 * assessment object structure expected:
 * {
 *  general: { grooming, work_attitude, consistency, self_confidence, communication },
 *  personal: { quality_work, engagement, creativity, independency, teamwork },
 *  professional: { technical, organization, coordination, responsibility, problem_solving }
 * }
 */

const generateAssessmentPDF = async ({
  student,
  company,
  supervisor,
  assessment,
}) => {
  const doc = new PDFDocument({ margin: 50 });
  const filePath = path.resolve(`./pdfs/${student.student_id}_assessment.pdf`);

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
  doc.text(`Company Supervisor: ${supervisor}`);
  doc.moveDown(1);

  /* ================= TABLE HELPERS ================= */
  const drawHeader = (y) => {
    doc.font("Helvetica-Bold");
    doc.rect(50, y, 260, 22).stroke();
    doc.rect(310, y, 80, 22).stroke();
    doc.rect(390, y, 80, 22).stroke();

    doc.text("Assessment Criteria", 55, y + 6);
    doc.text("Score", 330, y + 6);
    doc.text("Weight", 405, y + 6);

    doc.font("Helvetica");
  };

  const drawRow = (y, label, score, weight) => {
    doc.rect(50, y, 260, 22).stroke();
    doc.rect(310, y, 80, 22).stroke();
    doc.rect(390, y, 80, 22).stroke();

    doc.text(label, 55, y + 6);
    doc.text(score.toString(), 330, y + 6, { align: "center" });
    doc.text(weight.toString(), 405, y + 6, { align: "center" });
  };

  const drawSectionTitle = (title, y) => {
    doc.font("Helvetica-Bold").text(title, 50, y).font("Helvetica");
  };

  let y = doc.y + 10;

  /* ================= PART I ================= */
  drawSectionTitle("PART I: GENERAL ASSESSMENT (2 marks each)", y);
  y += 15;
  drawHeader(y);
  y += 22;

  drawRow(y, "Grooming", assessment.general.grooming, 2);
  y += 22;
  drawRow(y, "Work Attitude", assessment.general.work_attitude, 2);
  y += 22;
  drawRow(y, "Consistency", assessment.general.consistency, 2);
  y += 22;
  drawRow(y, "Self Confidence", assessment.general.self_confidence, 2);
  y += 22;
  drawRow(y, "Communication Skills", assessment.general.communication, 2);
  y += 30;

  /* ================= PART II ================= */
  drawSectionTitle("PART II: PERSONAL SKILL ASSESSMENT (2 marks each)", y);
  y += 15;
  drawHeader(y);
  y += 22;

  drawRow(y, "Quality of Work", assessment.personal.quality_work, 2);
  y += 22;
  drawRow(y, "Engagement", assessment.personal.engagement, 2);
  y += 22;
  drawRow(y, "Creativity", assessment.personal.creativity, 2);
  y += 22;
  drawRow(y, "Independency", assessment.personal.independency, 2);
  y += 22;
  drawRow(y, "Team Work", assessment.personal.teamwork, 2);
  y += 30;

  /* ================= PART III ================= */
  drawSectionTitle("PART III: PROFESSIONAL SKILL ASSESSMENT (4 marks each)", y);
  y += 15;
  drawHeader(y);
  y += 22;

  drawRow(y, "Technical Skill", assessment.professional.technical, 4);
  y += 22;
  drawRow(y, "Organization Skill", assessment.professional.organization, 4);
  y += 22;
  drawRow(y, "Coordination Skill", assessment.professional.coordination, 4);
  y += 22;
  drawRow(y, "Responsibility Skill", assessment.professional.responsibility, 4);
  y += 22;
  drawRow(
    y,
    "Problem Solving Skill",
    assessment.professional.problem_solving,
    4
  );
  y += 30;

  /* ================= TOTAL ================= */
  const total =
    Object.values(assessment.general).reduce((a, b) => a + b, 0) +
    Object.values(assessment.personal).reduce((a, b) => a + b, 0) +
    Object.values(assessment.professional).reduce((a, b) => a + b, 0);

  doc
    .font("Helvetica-Bold")
    .text(`TOTAL MARK: ${total} / 40`, 50, y + 10)
    .moveDown(2);

  /* ================= SIGNATURE ================= */
  doc.font("Helvetica");
  doc.text("Company Supervisor Signature: ________________________");
  doc.text("Date: ________________________");

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on("finish", () => resolve(filePath));
    stream.on("error", reject);
  });
};

export default generateAssessmentPDF;
