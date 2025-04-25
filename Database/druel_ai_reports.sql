-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: druel
-- ------------------------------------------------------
-- Server version	8.0.40

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `ai_reports`
--

DROP TABLE IF EXISTS `ai_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ai_reports` (
  `report_id` int NOT NULL AUTO_INCREMENT,
  `scan_id` int NOT NULL,
  `report_generated_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `primary_findings` text,
  `confidence_score` decimal(5,2) DEFAULT NULL,
  `image_quality` enum('Poor','Fair','Good','Excellent') DEFAULT NULL,
  `is_normal` tinyint(1) DEFAULT NULL,
  `num_abnormalities_detected` int DEFAULT '0',
  `processing_time` decimal(10,3) DEFAULT NULL,
  PRIMARY KEY (`report_id`),
  KEY `scan_id` (`scan_id`),
  CONSTRAINT `ai_reports_ibfk_1` FOREIGN KEY (`scan_id`) REFERENCES `scans` (`scan_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ai_reports`
--

LOCK TABLES `ai_reports` WRITE;
/*!40000 ALTER TABLE `ai_reports` DISABLE KEYS */;
INSERT INTO `ai_reports` VALUES (1,1,'2025-04-14 14:25:32','No significant abnormalities detected',98.50,'Good',1,0,3.421),(2,19,'2025-04-18 14:58:07','Both BPD and HC measurements are abnormal.',95.00,'Good',0,1,3.151),(3,20,'2025-04-18 15:00:40','Both BPD and HC measurements are abnormal.',95.00,'Good',0,1,1.481),(4,22,'2025-04-18 15:06:23','Both BPD and HC measurements are abnormal.',95.00,'Good',0,1,1.973),(5,24,'2025-04-18 15:14:02','TCD abnormal',95.00,'Good',1,0,3.335),(6,25,'2025-04-18 18:48:18','Both BPD and HC measurements are abnormal.',95.00,'Good',0,1,2.446),(7,27,'2025-04-19 06:21:18','Both BPD and HC measurements are abnormal.',95.00,'Good',0,1,4.945),(8,28,'2025-04-19 08:11:07','Both BPD and HC measurements are abnormal.',95.00,'Good',0,1,2.702),(9,30,'2025-04-19 09:28:51','Both BPD and HC measurements are abnormal.',95.00,'Good',0,1,3.719),(10,32,'2025-04-19 09:49:32','HC measurement is abnormal while BPD is normal.',95.00,'Good',0,1,3.026),(11,33,'2025-04-19 09:55:19','Both BPD and HC measurements are abnormal.',95.00,'Good',0,1,2.645),(12,34,'2025-04-19 09:55:52','LVW measurement was abnormal',95.00,'Good',0,1,2.403),(13,35,'2025-04-19 09:57:05','TCD abnormal',95.00,'Good',1,0,2.318),(14,36,'2025-04-19 10:47:53','Both BPD and HC measurements are abnormal.',95.00,'Good',0,1,2.869),(15,37,'2025-04-19 10:49:15','LVW measurement was abnormal',95.00,'Good',0,1,4.200),(16,38,'2025-04-19 10:50:15','TCD abnormal',95.00,'Good',1,0,3.742),(17,39,'2025-04-19 10:59:35','HC measurement is abnormal while BPD is normal.',95.00,'Good',0,1,2.549),(18,40,'2025-04-19 19:42:13','TCD normal',95.00,'Good',1,0,4.017),(19,41,'2025-04-19 19:51:40','TCD abnormal',95.00,'Good',1,0,1.419),(20,42,'2025-04-20 05:16:22','Both BPD and HC measurements are abnormal.',95.00,'Good',0,1,3.647),(21,43,'2025-04-20 16:39:14','Both BPD and HC measurements are abnormal.',95.00,'Good',0,1,3.217),(22,45,'2025-04-21 09:05:32','Both BPD and HC measurements are abnormal.',95.00,'Good',0,1,4.346),(23,46,'2025-04-21 09:07:03','TCD abnormal',95.00,'Good',1,0,2.793),(24,47,'2025-04-21 09:08:20','LVW measurement was abnormal',95.00,'Good',0,1,3.252),(25,48,'2025-04-23 14:16:43','Both BPD and HC measurements are abnormal.',95.00,'Good',0,1,2.867),(26,49,'2025-04-25 16:59:40','Both BPD and HC measurements are abnormal.',95.00,'Good',0,1,2.657);
/*!40000 ALTER TABLE `ai_reports` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-25 20:21:30
