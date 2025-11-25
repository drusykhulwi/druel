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
-- Table structure for table `detected_features`
--

DROP TABLE IF EXISTS `detected_features`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detected_features` (
  `feature_id` int NOT NULL AUTO_INCREMENT,
  `report_id` int NOT NULL,
  `feature_name` varchar(255) NOT NULL,
  `feature_description` text,
  `confidence_score` decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`feature_id`),
  KEY `report_id` (`report_id`),
  CONSTRAINT `detected_features_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `ai_reports` (`report_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detected_features`
--

LOCK TABLES `detected_features` WRITE;
/*!40000 ALTER TABLE `detected_features` DISABLE KEYS */;
INSERT INTO `detected_features` VALUES (1,1,'Normal growth','Fetal measurements within normal range for gestational age',99.20),(2,5,'Normal scan','TCD was 11.09mm which is outside normal range for 19 weeks gestational age.',90.00),(3,12,'Abnormal finding','The LVW measurement was 38.4mm which is outside the normal range (<10mm) for gestational age 20 weeks, indicating moderate to severe ventriculomegaly.',90.00),(4,13,'Normal scan','TCD was 11.51mm which is outside normal range for 21 weeks gestational age.',90.00),(5,15,'Abnormal finding','The LVW measurement was 31.799999999999997mm which is outside the normal range (<10mm) for gestational age 22 weeks, indicating moderate to severe ventriculomegaly.',90.00),(6,16,'Normal scan','TCD was 36.47mm which is outside normal range for 21 weeks gestational age.',90.00),(7,18,'Normal scan','TCD was 19.83mm which is within the normal range for 18 weeks gestational age.',90.00),(8,19,'Normal scan','TCD was 14.1mm which is outside normal range for 23 weeks gestational age.',90.00),(9,23,'Normal scan','TCD was 26.53mm which is outside normal range for 24 weeks gestational age.',90.00),(10,24,'Abnormal finding','The LVW measurement was 36.0mm which is outside the normal range (<10mm) for gestational age 10 weeks, indicating moderate to severe ventriculomegaly.',90.00);
/*!40000 ALTER TABLE `detected_features` ENABLE KEYS */;
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
