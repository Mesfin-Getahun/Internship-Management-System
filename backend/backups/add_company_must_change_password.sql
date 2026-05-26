ALTER TABLE company
  ADD COLUMN must_change_password tinyint(1) DEFAULT 0 AFTER password;
