ALTER TABLE mentor_feedback
  ADD COLUMN attachment_url varchar(500) DEFAULT NULL AFTER overall_comment,
  ADD COLUMN attachment_name varchar(255) DEFAULT NULL AFTER attachment_url;
