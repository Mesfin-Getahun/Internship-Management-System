-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: InternshipDB
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin`
--

DROP TABLE IF EXISTS `admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin` (
  `admin_id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(200) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone_number` varchar(15) DEFAULT NULL,
  `password` varchar(100) DEFAULT NULL,
  `must_change_password` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`admin_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin`
--

LOCK TABLES `admin` WRITE;
/*!40000 ALTER TABLE `admin` DISABLE KEYS */;
INSERT INTO `admin` VALUES (1,NULL,'admin1234@gmail.com',NULL,'$2b$10$zaKJwCGGfxYyY/sMfob7aukqu.DXYC3TSmdUOXk8R0cxLiCoiGJfu',0);
/*!40000 ALTER TABLE `admin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `application`
--

DROP TABLE IF EXISTS `application`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `application` (
  `application_id` int NOT NULL AUTO_INCREMENT,
  `student_id` varchar(20) DEFAULT NULL,
  `internship_id` int DEFAULT NULL,
  `applied_date` date DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `statement` text,
  `cv_file` varchar(250) DEFAULT NULL,
  `academic_doc` varchar(250) DEFAULT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`application_id`),
  KEY `student_id` (`student_id`),
  KEY `internship_id` (`internship_id`),
  CONSTRAINT `application_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`),
  CONSTRAINT `application_ibfk_2` FOREIGN KEY (`internship_id`) REFERENCES `internship` (`internship_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `application`
--

LOCK TABLES `application` WRITE;
/*!40000 ALTER TABLE `application` DISABLE KEYS */;
INSERT INTO `application` VALUES (1,'BDU-ETS-1234',1,'2026-02-17','rejected','i am here for seeking an internship as a software developer','https://res.cloudinary.com/dg5e8w4b7/raw/upload/v1771273650/internship_applications/cv/evaluate','https://res.cloudinary.com/dg5e8w4b7/raw/upload/v1771273650/internship_applications/academic/graphics',NULL),(2,'BDU-ETS-1234',2,'2026-02-17','accepted','i am here for seeking an internship as a software developer','https://res.cloudinary.com/dg5e8w4b7/raw/upload/v1771273650/internship_applications/cv/evaluate','https://res.cloudinary.com/dg5e8w4b7/raw/upload/v1771273650/internship_applications/academic/graphics',NULL),(3,'BDU-ETS-1234',2,'2026-03-31','pending',NULL,'https://res.cloudinary.com/dg5e8w4b7/raw/upload/v1774962994/internship_applications/cv/Chapter%202%20cv%20and%20IP','https://res.cloudinary.com/dg5e8w4b7/raw/upload/v1774962995/internship_applications/academic/Chapter%203%20%282%29',NULL);
/*!40000 ALTER TABLE `application` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `company`
--

DROP TABLE IF EXISTS `company`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `company` (
  `company_id` int NOT NULL AUTO_INCREMENT,
  `company_name` varchar(200) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone_number` varchar(15) DEFAULT NULL,
  `status` varchar(15) DEFAULT NULL,
  `password` varchar(100) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `profile_pic` varchar(250) DEFAULT NULL,
  `company_type` varchar(100) DEFAULT NULL,
  `industry` varchar(100) DEFAULT NULL,
  `website` varchar(200) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `region` varchar(100) DEFAULT NULL,
  `license_url` varchar(300) DEFAULT NULL,
  `agreed` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`company_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `company`
--

LOCK TABLES `company` WRITE;
/*!40000 ALTER TABLE `company` DISABLE KEYS */;
INSERT INTO `company` VALUES (1,'EthioTech Solutions PLC','hr@ethiotech.com','+251911223344','pending','$2b$10$DL5SEH4t/1qI3XDhw46o.u622WOK67XQnBoiVZPaXsReSiybrLMzq',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'2026-02-27 06:19:07'),(2,'EthioTech Solutions PLC','hr@ethiotech.com','+251911223344','approved','$2b$10$MsDWLUiLN3d7mhDiCSBFw.2jpfi489A0FJ/Y6iDP4Cf3KaFmb1oyC',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'2026-02-27 06:19:07'),(3,'tele','lealemtesfazedo@gmail.com','+251962909852','approved','$2b$10$OX/jX/z2nOGh7V0IJRDdMOFUkSKzlFyj8dJulXKUl7E/UrXLjf51i','Bahir Dar University road',NULL,'Public','Telecommunications','','Bahir Dar','amhara',NULL,1,'2026-02-27 06:46:46'),(4,'alyah','lealemtezedo@gmail.com','+251962909852','approved','$2b$10$rEQpIGtMeHeYWjLxYruEOe/3zqZSq./OtZqcS3YCi1T/TotZB2uAu','Bahir Dar University road',NULL,'Private','Software Development','','Bahir Dar','amhara',NULL,1,'2026-02-27 07:09:37'),(5,'alyah','letesfazedo@gmail.com','+251962909852','pending','$2b$10$V.fviieQ8qbohZLkti7JIOIgNpjUT9wNRp7QHF5D4Tl1qMBWYFRo2','Bahir Dar University road','https://res.cloudinary.com/dg5e8w4b7/raw/upload/v1772176983/company/profile/okcsragnoae06bm2gzfe','Private','Telecommunications','','Bahir Dar','amhara','https://res.cloudinary.com/dg5e8w4b7/raw/upload/v1772176984/company/license/yfb8hxlhrdmzqoqnzs3h',1,'2026-02-27 07:23:02'),(6,'alyah','letesfazedo@gmail.com','+251962909852','rejected','$2b$10$8mRcihu/YZdoebmWgY5HSuBXN1BVnXZOcXtY4tERZhXsZc/.k0rr2','Bahir Dar University road','https://res.cloudinary.com/dg5e8w4b7/raw/upload/v1772176984/company/profile/ekerlwubnixhjcdnymwe','Private','Telecommunications','','Bahir Dar','amhara','https://res.cloudinary.com/dg5e8w4b7/raw/upload/v1772176985/company/license/gkhc14kesynomjc1oqtm',1,'2026-02-27 07:23:04'),(7,'xe software','xe@gmail.com','+251962909852','approved','$2b$10$/Y13k1c56LeytfyruKgmHencaSR5946EPHGrP0VMnBwV.u8SB.HKi','Bahir Dar University road','https://res.cloudinary.com/dg5e8w4b7/raw/upload/v1775047237/company/profile/jddztcn6ugd35wcljlwh','Private','Software Development','','Bahir Dar','addis ababa','https://res.cloudinary.com/dg5e8w4b7/raw/upload/v1775047238/company/license/awli4ipjsni9uqnd6yk2',1,'2026-04-01 12:40:37'),(8,'xe software','xe@gmail.com','+251962909852','approved','$2b$10$Qs5d5I8wTyIJhGjeyGsNbeWYkX7cWwm3ZBM4TyQPhrOMRMuEGOeQK','Bahir Dar University road','https://res.cloudinary.com/dg5e8w4b7/raw/upload/v1775047239/company/profile/yuxhm6wilbiigdjnpffa','Private','Software Development','','Bahir Dar','addis ababa','https://res.cloudinary.com/dg5e8w4b7/raw/upload/v1775047240/company/license/byyethtmnmmyq4xg8jb5',1,'2026-04-01 12:40:40'),(9,'ala software','siltanukelemwork@gmail.com','096765657','approved','$2b$10$W1igbNV.O3lY2lp9vG1gPeqtD3QoCkpnCBhXJR0o/04V.avsoRO/6','university road','https://res.cloudinary.com/dg5e8w4b7/raw/upload/v1775123203/company/profile/tya17dcnr5k83ug50dx2','Public','Software Development','','Bahir Dar','afar','https://res.cloudinary.com/dg5e8w4b7/raw/upload/v1775123204/company/license/ynaxstbcrmsg7vu5r71n',1,'2026-04-02 09:46:44'),(10,'kal manufacturing','siltanukelemwork@gmail.com','09346234572','approved','$2b$10$D7MTkyPFp5R5dGeMk0zpiub1xDWNPT5B2OFX/tii.1yfnBrDO0/Nm','university road','https://res.cloudinary.com/dg5e8w4b7/raw/upload/v1775123893/company/profile/z8fbijcugmqvcce5qsnj','Private','Manufacturing','','Bahir Dar','amhara','https://res.cloudinary.com/dg5e8w4b7/raw/upload/v1775123894/company/license/w19hfwikv4engbjawotc',1,'2026-04-02 09:58:14');
/*!40000 ALTER TABLE `company` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `company_mentor`
--

DROP TABLE IF EXISTS `company_mentor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `company_mentor` (
  `company_mentor_id` varchar(20) NOT NULL,
  `full_name` varchar(200) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone_number` varchar(15) DEFAULT NULL,
  `password` varchar(100) DEFAULT NULL,
  `must_change_password` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`company_mentor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `company_mentor`
--

LOCK TABLES `company_mentor` WRITE;
/*!40000 ALTER TABLE `company_mentor` DISABLE KEYS */;
INSERT INTO `company_mentor` VALUES ('CM-1001','Mekdes Alemu','mekdes.alemu@ethiotech.com','+251912889900','$2b$10$8GnsIg.aYBsi3ZrmzYYmPewhVv2WdxPqR7xi7vv/apkl53jywzTpO',0);
/*!40000 ALTER TABLE `company_mentor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `faculty`
--

DROP TABLE IF EXISTS `faculty`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faculty` (
  `faculty_id` varchar(20) NOT NULL,
  `faculty_name` varchar(200) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone_number` varchar(15) DEFAULT NULL,
  `password` varchar(100) DEFAULT NULL,
  `must_change_password` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`faculty_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `faculty`
--

LOCK TABLES `faculty` WRITE;
/*!40000 ALTER TABLE `faculty` DISABLE KEYS */;
INSERT INTO `faculty` VALUES ('FAC-11','Faculty of Computing','solomon.bekele@bdu.edu.et',NULL,'$2b$10$3D6P37hdFHQOZBNSw5LOlejNNjGOYWA/w8mwg6pWRqiuZZUx6PYz.',0);
/*!40000 ALTER TABLE `faculty` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `internship`
--

DROP TABLE IF EXISTS `internship`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `internship` (
  `internship_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) DEFAULT NULL,
  `description` text,
  `status` varchar(15) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `skills` text,
  `department` varchar(100) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `company_id` int DEFAULT NULL,
  `image` varchar(250) DEFAULT NULL,
  `duration` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`internship_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `internship_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `internship`
--

LOCK TABLES `internship` WRITE;
/*!40000 ALTER TABLE `internship` DISABLE KEYS */;
INSERT INTO `internship` VALUES (1,'Full Stack Web Development Internship','This internship focuses on building full-stack web applications using React, Node.js, Express, and MySQL. Interns will work on real-world projects under professional mentorship.',NULL,'2026-03-01','2026-06-30','JavaScript, React, Node.js, Express, MySQL',NULL,NULL,1,'https://res.cloudinary.com/demo/image/upload/v1700000000/internships/fullstack.png',NULL),(2,'frontend Web Development Internship','This internship focuses on building full-stack web applications using React, Node.js, Express, and MySQL. Interns will work on real-world projects under professional mentorship.','approved','2026-03-01','2026-06-30','JavaScript, React',NULL,NULL,1,'https://res.cloudinary.com/demo/image/upload/v1700000000/internships/fullstack.png',NULL);
/*!40000 ALTER TABLE `internship` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `internship_evaluation`
--

DROP TABLE IF EXISTS `internship_evaluation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `internship_evaluation` (
  `evaluation_id` int NOT NULL AUTO_INCREMENT,
  `student_id` varchar(20) DEFAULT NULL,
  `internship_id` int DEFAULT NULL,
  `assessment_pdf_url` varchar(255) DEFAULT NULL,
  `attendance_pdf_url` varchar(255) DEFAULT NULL,
  `total_mark` int DEFAULT NULL,
  `submitted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`evaluation_id`),
  KEY `student_id` (`student_id`),
  KEY `internship_id` (`internship_id`),
  CONSTRAINT `internship_evaluation_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`),
  CONSTRAINT `internship_evaluation_ibfk_2` FOREIGN KEY (`internship_id`) REFERENCES `internship` (`internship_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `internship_evaluation`
--

LOCK TABLES `internship_evaluation` WRITE;
/*!40000 ALTER TABLE `internship_evaluation` DISABLE KEYS */;
INSERT INTO `internship_evaluation` VALUES (1,'BDU-ETS-1234',2,'https://res.cloudinary.com/dg5e8w4b7/raw/upload/v1772005624/internship/assessment/BDU-ETS-1234_assessment','https://res.cloudinary.com/dg5e8w4b7/raw/upload/v1772005625/internship/attendance/BDU-ETS-1234_attendance',40,'2026-02-25 07:47:05'),(2,'BDU-ETS-1234',2,'https://res.cloudinary.com/dg5e8w4b7/raw/upload/v1772005979/internship/assessment/BDU-ETS-1234_assessment','https://res.cloudinary.com/dg5e8w4b7/raw/upload/v1772005980/internship/attendance/BDU-ETS-1234_attendance',40,'2026-02-25 07:53:00');
/*!40000 ALTER TABLE `internship_evaluation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `internship_report`
--

DROP TABLE IF EXISTS `internship_report`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `internship_report` (
  `report_id` int NOT NULL AUTO_INCREMENT,
  `student_id` varchar(20) DEFAULT NULL,
  `internship_id` int DEFAULT NULL,
  `report_url` varchar(255) DEFAULT NULL,
  `status` enum('submitted','signed','faculty_submitted') DEFAULT 'submitted',
  `submission_date` date DEFAULT NULL,
  `mentor_id` varchar(20) DEFAULT NULL,
  `faculty_submitted_at` datetime DEFAULT NULL,
  `signed_at` datetime DEFAULT NULL,
  `mentor_signed_url` varchar(250) DEFAULT NULL,
  PRIMARY KEY (`report_id`),
  KEY `student_id` (`student_id`),
  KEY `internship_id` (`internship_id`),
  KEY `mentor_id` (`mentor_id`),
  CONSTRAINT `internship_report_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`),
  CONSTRAINT `internship_report_ibfk_2` FOREIGN KEY (`internship_id`) REFERENCES `internship` (`internship_id`),
  CONSTRAINT `internship_report_ibfk_3` FOREIGN KEY (`mentor_id`) REFERENCES `mentor` (`mentor_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `internship_report`
--

LOCK TABLES `internship_report` WRITE;
/*!40000 ALTER TABLE `internship_report` DISABLE KEYS */;
INSERT INTO `internship_report` VALUES (1,'BDU-ETS-1234',2,'https://res.cloudinary.com/dg5e8w4b7/raw/upload/v1771958776/internship_reports/original/inter%20report%20for%20advisor','signed',NULL,'FM-2001',NULL,'2026-02-24 20:08:08','https://res.cloudinary.com/dg5e8w4b7/raw/upload/v1771963278/internship_reports/signed/MICROPROSESER_CS_B'),(2,'BDU-ETS-1234',2,'https://res.cloudinary.com/dg5e8w4b7/raw/upload/v1771958776/internship_reports/original/inter%20report%20for%20advisor','submitted',NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `internship_report` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mentor`
--

DROP TABLE IF EXISTS `mentor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mentor` (
  `mentor_id` varchar(20) NOT NULL,
  `full_name` varchar(200) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone_number` varchar(15) DEFAULT NULL,
  `password` varchar(100) DEFAULT NULL,
  `must_change_password` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`mentor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mentor`
--

LOCK TABLES `mentor` WRITE;
/*!40000 ALTER TABLE `mentor` DISABLE KEYS */;
INSERT INTO `mentor` VALUES ('FM-2001','Alemayehu Tesfaye','alemayehu.tesfaye@bdu.edu.et','+251913445566','$2b$10$cNQBVnkELQwQrNvkCaKHLOQwlFmJ9W3CkyilpT0ZVdz49pYMR/JWO',0);
/*!40000 ALTER TABLE `mentor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mentor_feedback`
--

DROP TABLE IF EXISTS `mentor_feedback`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mentor_feedback` (
  `feedback_id` int NOT NULL AUTO_INCREMENT,
  `student_id` varchar(20) NOT NULL,
  `internship_id` int NOT NULL,
  `company_mentor_id` varchar(20) DEFAULT NULL,
  `parent_feedback_id` int DEFAULT NULL,
  `feedback_type` enum('weekly','midterm','final','faculty') DEFAULT 'weekly',
  `rating` int DEFAULT NULL,
  `strengths` text,
  `weaknesses` text,
  `suggestions` text,
  `overall_comment` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`feedback_id`),
  KEY `student_id` (`student_id`),
  KEY `internship_id` (`internship_id`),
  KEY `company_mentor_id` (`company_mentor_id`),
  KEY `parent_feedback_id` (`parent_feedback_id`),
  CONSTRAINT `mentor_feedback_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`),
  CONSTRAINT `mentor_feedback_ibfk_2` FOREIGN KEY (`internship_id`) REFERENCES `internship` (`internship_id`),
  CONSTRAINT `mentor_feedback_ibfk_3` FOREIGN KEY (`company_mentor_id`) REFERENCES `company_mentor` (`company_mentor_id`),
  CONSTRAINT `mentor_feedback_chk_1` CHECK ((`rating` between 1 and 10))
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mentor_feedback`
--

LOCK TABLES `mentor_feedback` WRITE;
/*!40000 ALTER TABLE `mentor_feedback` DISABLE KEYS */;
INSERT INTO `mentor_feedback` VALUES (1,'BDU-ETS-1234',2,'CM-1001',NULL,'weekly',8,'Good communication skills','Needs improvement in time management','Practice daily task planning','Doing well overall','2026-02-17 19:14:15','2026-02-17 19:14:15'),(2,'BDU-ETS-1234',2,'CM-1001',NULL,'weekly',8,'Good communication skills','Needs improvement in time management','Practice daily task planning','Doing well overall','2026-02-24 18:08:15','2026-02-24 18:08:15');
/*!40000 ALTER TABLE `mentor_feedback` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `payment_id` int NOT NULL AUTO_INCREMENT,
  `student_id` varchar(20) NOT NULL,
  `bank_name` varchar(100) NOT NULL,
  `account_holder_name` varchar(150) NOT NULL,
  `account_number` varchar(50) NOT NULL,
  `submitted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`payment_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student`
--

DROP TABLE IF EXISTS `student`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student` (
  `student_id` varchar(20) NOT NULL,
  `full_name` varchar(200) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone_number` varchar(15) DEFAULT NULL,
  `profile_status` varchar(20) DEFAULT NULL,
  `skills` text,
  `preferred_location` varchar(100) DEFAULT NULL,
  `department` varchar(255) DEFAULT NULL,
  `assigned_mentor` varchar(20) DEFAULT NULL,
  `password` varchar(100) DEFAULT NULL,
  `faculty` varchar(100) DEFAULT NULL,
  `must_change_password` tinyint(1) DEFAULT '1',
  `technical_skills` json DEFAULT NULL,
  `soft_skills` json DEFAULT NULL,
  `languages` json DEFAULT NULL,
  `linkedin` varchar(255) DEFAULT NULL,
  `github` varchar(255) DEFAULT NULL,
  `portfolio` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`student_id`),
  KEY `fk_student_mentor` (`assigned_mentor`),
  CONSTRAINT `fk_student_mentor` FOREIGN KEY (`assigned_mentor`) REFERENCES `mentor` (`mentor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student`
--

LOCK TABLES `student` WRITE;
/*!40000 ALTER TABLE `student` DISABLE KEYS */;
INSERT INTO `student` VALUES ('BDU-E560u798T75363','Abebe Tesfaye','Abebe.tesfaye@student.bdu.edu.et','+251913395678','active',NULL,NULL,'Computer science','FM-2001','$2b$10$4dEKonhCQgRi6kWndMaiZOzSDoo.2o5mldOy9fm/HKOElumI1OZMW','Faculty of Computing',0,NULL,NULL,NULL,NULL,NULL,NULL),('BDU-ET795363','Kebede Tesfaye','Kebede.tesfaye@student.bdu.edu.et','+251913395678','active',NULL,NULL,'Computer science',NULL,'$2b$10$zAVRmVK1oMbMx1Y90tSIaeTgPd1PQA/kCLZJvuPgQKN7yRBANCf/S','Faculty of Computing',0,NULL,NULL,NULL,NULL,NULL,NULL),('BDU-ETC_8989','Kebebush Tesfaye','Kebebush.tesfaye@student.bdu.edu.et','+251913395678','active',NULL,NULL,'Computer science',NULL,'$2b$10$XKRkcUIiPQvjCgvscez2XuT6yKlGXN7V/N9iL7f/3MYAvZY2hOuOm','Faculty of Computing',0,NULL,NULL,NULL,NULL,NULL,NULL),('BDU-ETC_898989','Kebebush Tesfaye','Kebebush.tesfaye@student.bdu.edu.et','+251913395678','active',NULL,NULL,'Computer science',NULL,'$2b$10$.NzsgcYN5Nm/0fiTF3L7hOqXLjOYRujpNvRkHCY4.u99Vi/kPNHSu','Faculty of Computing',0,NULL,NULL,NULL,NULL,NULL,NULL),('BDU-ETC-222','Arebu Tesfaye','Arebu.tesfaye@student.bdu.edu.et','+251913395678','active',NULL,NULL,'Computer science',NULL,'$2b$10$ddnfkERpVYFzpuX.rTtjieKqH/yM86N7ucftd99r4ERzSU1V9GPoW','Faculty of Computing',0,NULL,NULL,NULL,NULL,NULL,NULL),('BDU-ETC-333','Abrham Tesfaye','Abrham.tesfaye@student.bdu.edu.et','+251913395678','active',NULL,NULL,'Computer science','FM-2001','$2b$10$2.OLD4ZOGWvWP8I7AUwS/eYFzf5PDKlbToOKsjVWh/E6PX3MKcw4C','Faculty of Computing',0,NULL,NULL,NULL,NULL,NULL,NULL),('BDU-ETC-3363','Newton Tesfaye','Newton.tesfaye@student.bdu.edu.et','+251913395678','active',NULL,NULL,'Computer science',NULL,'$2b$10$C7s7IAI6cUmSKaSN5dMGpeSt0nbE/zDtdSejvbZPZBowBN5sASBcq','Faculty of Computing',0,NULL,NULL,NULL,NULL,NULL,NULL),('BDU-ETC-35363','Simegn Tesfaye','Simegn.tesfaye@student.bdu.edu.et','+251913395678','active',NULL,NULL,'Computer science',NULL,'$2b$10$1oRsugC6BvzcjcO9pbTebepzr9YQHKw4m7xQ0BjvCV/xg0f38WxX2','Faculty of Computing',0,NULL,NULL,NULL,NULL,NULL,NULL),('BDU-ETC-3885363','Selam Tesfaye','Selam.tesfaye@student.bdu.edu.et','+251913395678','active',NULL,NULL,'Computer science',NULL,'$2b$10$LUpe1npw5XSSUrk1reFy8ueE1CotodC1NoYYpHjO9ocwVBs15C3A.','Faculty of Computing',0,NULL,NULL,NULL,NULL,NULL,NULL),('BDU-ETC-3889095363','abel Tesfaye','abel.tesfaye@student.bdu.edu.et','+251913395678','active',NULL,NULL,'Computer science',NULL,'$2b$10$LEV1JzgCf6PtKHtP5/UxneDdQbNRhg3j6012blZ1R.yreWWKGTt2K','Faculty of Computing',0,NULL,NULL,NULL,NULL,NULL,NULL),('BDU-ETC-444','Mesfin Tesfaye','Mesfin.tesfaye@student.bdu.edu.et','+251913395678','active',NULL,NULL,'computer Science',NULL,'$2b$10$soFB/wZLMJ0LzSZJfj9lVOsKJkqF4h43YeMf/6XTRsr0nT9G/HEe6','Faculty of Computing',0,NULL,NULL,NULL,NULL,NULL,NULL),('BDU-ETC-666','Welde Tesfaye','Welde.tesfaye@student.bdu.edu.et','+251913395678','active',NULL,NULL,'computer Science','FM-2001','$2b$10$dekl24kFZ1netZbE5rPrO.an64m3DjwvJkK5VEo77eIiVC0apSD0W','Faculty of Computing',0,NULL,NULL,NULL,NULL,NULL,NULL),('BDU-ETC-777','Siltanu Tesfaye','Siltanu.tesfaye@student.bdu.edu.et','+251913395678','active',NULL,NULL,'computer Science',NULL,'$2b$10$KNV37qBN8/CVL0klxyCpl.NL6bn8Wg79RzyU4BXKhJs0dPe2b7QZW','Faculty of Computing',0,NULL,NULL,NULL,NULL,NULL,NULL),('BDU-ETC-888','Haile Tesfaye','Haile.tesfaye@student.bdu.edu.et','+251913395678','active',NULL,NULL,'IT','FM-2001','$2b$10$X.ar1ADhykaVNGTCnhG32OSsBX4K935nEalWVmOauq4VSLUm3u7K2','Faculty of Computing',0,NULL,NULL,NULL,NULL,NULL,NULL),('BDU-ETC-999','Mele Tesfaye','Mele.tesfaye@student.bdu.edu.et','+251913395678','active',NULL,NULL,'Computer science',NULL,'$2b$10$wG9BouptuRGKPo8.UfzHyOuJWs8Jnh2nI/3yYJqc8KAzT2F/EANqi','Faculty of Computing',0,NULL,NULL,NULL,NULL,NULL,NULL),('BDU-ETS-1234','Abel Tesfaye','abel.tesfaye@student.bdu.edu.et','+251912345678','active',NULL,NULL,'Computer Science','FM-2001','$2b$10$nq7cpS5TrluSWpJVBIEDQeF2JidEaQLTleWvKzUcZQmBusJ0FvHXG','Faculty of Computing',0,'[\"react js\", \"node js\", \"css\"]','[\"communication\", \"team work\"]','[\"english\", \"amharic\", \"somali\"]','http://localhost:3000/login#/student/profile','http://localhost:3000/login#/student/profile','http://localhost:3000/login#/student/profile'),('BDU-MEC-1234','biniam Tesfaye','biniam.tesfaye@student.bdu.edu.et','+251912345678','active',NULL,NULL,'Mechanical',NULL,'$2b$10$izrhlSQ/s/PFe8GBH89FyudkeYhZDZabdVbjPvr84j4cjpS4BLHLW','Faculty of Mechanical',0,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `student` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_internship`
--

DROP TABLE IF EXISTS `student_internship`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_internship` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` varchar(20) DEFAULT NULL,
  `internship_id` int DEFAULT NULL,
  `company_id` int DEFAULT NULL,
  `status` varchar(20) DEFAULT 'in progress',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `performance` text,
  `evaluation_score` decimal(5,2) DEFAULT NULL,
  `company_mentor_id` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `internship_id` (`internship_id`),
  KEY `company_id` (`company_id`),
  KEY `fk_student_company_mentors` (`company_mentor_id`),
  CONSTRAINT `fk_student_company_mentors` FOREIGN KEY (`company_mentor_id`) REFERENCES `company_mentor` (`company_mentor_id`),
  CONSTRAINT `student_internship_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`),
  CONSTRAINT `student_internship_ibfk_2` FOREIGN KEY (`internship_id`) REFERENCES `internship` (`internship_id`),
  CONSTRAINT `student_internship_ibfk_3` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_internship`
--

LOCK TABLES `student_internship` WRITE;
/*!40000 ALTER TABLE `student_internship` DISABLE KEYS */;
INSERT INTO `student_internship` VALUES (1,'BDU-ETS-1234',2,1,'in progress','2026-02-17',NULL,NULL,NULL,'CM-1001'),(2,'BDU-ETS-1234',2,1,'in progress','2026-02-17',NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `student_internship` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_logs`
--

DROP TABLE IF EXISTS `system_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_logs` (
  `log_id` int NOT NULL AUTO_INCREMENT,
  `action` varchar(255) DEFAULT NULL,
  `user_role` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_logs`
--

LOCK TABLES `system_logs` WRITE;
/*!40000 ALTER TABLE `system_logs` DISABLE KEYS */;
INSERT INTO `system_logs` VALUES (1,'COMPANY_REGISTERED',NULL,'2026-04-02 09:58:14'),(2,'MAINTENANCE_MODE_UPDATED',NULL,'2026-04-02 10:01:30'),(3,'MAINTENANCE_MODE_UPDATED',NULL,'2026-04-02 10:01:51'),(4,'MAINTENANCE_MODE_UPDATED',NULL,'2026-04-02 10:02:00');
/*!40000 ALTER TABLE `system_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_settings`
--

DROP TABLE IF EXISTS `system_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` varchar(255) NOT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_settings`
--

LOCK TABLES `system_settings` WRITE;
/*!40000 ALTER TABLE `system_settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `system_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `uil`
--

DROP TABLE IF EXISTS `uil`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uil` (
  `uil_id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(200) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone_number` varchar(15) DEFAULT NULL,
  `password` varchar(100) DEFAULT NULL,
  `must_change_password` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`uil_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `uil`
--

LOCK TABLES `uil` WRITE;
/*!40000 ALTER TABLE `uil` DISABLE KEYS */;
INSERT INTO `uil` VALUES (1,'Yohannis belay','john@gmail.com','09788767','$2b$10$71L/mQY/Qm.m7bGXsh2xG./EWsp8UZtk7U/geJrvZBSmiuzS5DYue',0);
/*!40000 ALTER TABLE `uil` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-02 13:03:22
