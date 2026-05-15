import db from "./config/mysql.js";

async function createPaymentTable() {
  try {
    console.log("Checking if payment table exists...");
    
    await db.query(`
      CREATE TABLE IF NOT EXISTS payment (
        payment_id INT AUTO_INCREMENT PRIMARY KEY,
        student_id VARCHAR(20) NOT NULL,
        bank_name VARCHAR(100) NOT NULL,
        account_holder VARCHAR(150) NOT NULL,
        account_number VARCHAR(100) NOT NULL,
        acceptance_letter_url VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending Approval',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE
      )
    `);
    
    console.log("Payment table created successfully (or already exists).");
    process.exit(0);
  } catch (error) {
    console.error("Error creating payment table:", error);
    process.exit(1);
  }
}

createPaymentTable();
