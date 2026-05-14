CREATE TABLE IF NOT EXISTS notifications (
  notification_id int NOT NULL AUTO_INCREMENT,
  recipient_role varchar(50) NOT NULL,
  recipient_id varchar(50) NOT NULL,
  title varchar(150) NOT NULL,
  message text,
  type varchar(50) DEFAULT 'info',
  link varchar(255) DEFAULT NULL,
  is_read tinyint(1) DEFAULT 0,
  created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  read_at datetime DEFAULT NULL,
  PRIMARY KEY (notification_id),
  KEY idx_notifications_recipient (recipient_role, recipient_id, is_read, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
