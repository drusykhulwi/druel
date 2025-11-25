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
-- Table structure for table `annotated_images`
--

DROP TABLE IF EXISTS `annotated_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `annotated_images` (
  `annotated_image_id` int NOT NULL AUTO_INCREMENT,
  `report_id` int NOT NULL,
  `original_image_id` int NOT NULL,
  `annotation_path` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`annotated_image_id`),
  KEY `report_id` (`report_id`),
  KEY `original_image_id` (`original_image_id`),
  CONSTRAINT `annotated_images_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `ai_reports` (`report_id`) ON DELETE CASCADE,
  CONSTRAINT `annotated_images_ibfk_2` FOREIGN KEY (`original_image_id`) REFERENCES `images` (`image_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `annotated_images`
--

LOCK TABLES `annotated_images` WRITE;
/*!40000 ALTER TABLE `annotated_images` DISABLE KEYS */;
INSERT INTO `annotated_images` VALUES (1,1,1,'/storage/annotations/PAT123456_20250410_1_annotated.jpg','2025-04-14 14:25:32'),(2,2,19,'/storage/scans/P-56428_1744988284244_annotated.jpg','2025-04-18 14:58:07'),(3,3,20,'/storage/scans/P-50241_1744988439261_annotated.jpg','2025-04-18 15:00:40'),(4,4,22,'/storage/scans/P-50241_1744988781629_annotated.jpg','2025-04-18 15:06:23'),(5,5,24,'/storage/scans/P-56428_1744989238765_annotated.jpg','2025-04-18 15:14:02'),(6,6,25,'/storage/scans/P-56428_1745002095946_annotated.jpg','2025-04-18 18:48:18'),(7,7,27,'/storage/scans/P-50241_1745043673041_annotated.jpg','2025-04-19 06:21:18'),(8,8,28,'/storage/scans/P-56520_1745050264320_annotated.jpg','2025-04-19 08:11:07'),(9,9,30,'/storage/scans/P-56428_1745054927580_annotated.jpg','2025-04-19 09:28:51'),(10,10,32,'/storage/scans/P-56520_1745056168948_annotated.jpg','2025-04-19 09:49:32'),(11,11,33,'/storage/scans/P-56428_1745056516440_annotated.jpg','2025-04-19 09:55:19'),(12,12,34,'/storage/scans/P-56428_1745056550305_annotated.jpg','2025-04-19 09:55:52'),(13,13,35,'/storage/scans/P-50241_1745056623129_annotated.jpg','2025-04-19 09:57:05'),(14,14,36,'/storage/scans/P-56520_1745059670629_annotated.jpg','2025-04-19 10:47:53'),(15,15,37,'/storage/scans/P-56520_1745059751292_annotated.jpg','2025-04-19 10:49:15'),(16,16,38,'/storage/scans/P-56520_1745059811742_annotated.jpg','2025-04-19 10:50:15'),(17,17,39,'/storage/scans/P-56520_1745060373244_annotated.jpg','2025-04-19 10:59:35'),(18,18,40,'/storage/scans/P-56428_1745091729525_annotated.jpg','2025-04-19 19:42:13'),(19,19,41,'/storage/scans/P-56428_1745092299409_annotated.jpg','2025-04-19 19:51:40'),(20,20,42,'/storage/scans/P-21618_1745126178783_annotated.jpg','2025-04-20 05:16:22'),(21,21,43,'/storage/scans/P-21618_1745167151374_annotated.jpg','2025-04-20 16:39:14'),(22,22,45,'/storage/scans/P-56428_1745226327685_annotated.jpg','2025-04-21 09:05:32'),(23,23,46,'/storage/scans/P-50241_1745226420803_annotated.jpg','2025-04-21 09:07:03'),(24,24,47,'/storage/scans/P-56428_1745226497472_annotated.jpg','2025-04-21 09:08:20'),(25,25,48,'/storage/scans/P-21618_1745417800865_annotated.jpg','2025-04-23 14:16:43'),(26,26,49,'/storage/scans/P-56520_1745600377999_annotated.jpg','2025-04-25 16:59:40');
/*!40000 ALTER TABLE `annotated_images` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-25 20:21:31
