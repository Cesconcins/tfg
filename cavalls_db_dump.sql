/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.6.22-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: cavalls_db
-- ------------------------------------------------------
-- Server version	10.6.22-MariaDB-0ubuntu0.22.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `anunci_disciplina`
--

DROP TABLE IF EXISTS `anunci_disciplina`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `anunci_disciplina` (
  `anunci_id` int(11) NOT NULL,
  `disciplina_id` int(11) NOT NULL,
  PRIMARY KEY (`anunci_id`,`disciplina_id`),
  KEY `disciplina_id` (`disciplina_id`),
  CONSTRAINT `anunci_disciplina_ibfk_1` FOREIGN KEY (`anunci_id`) REFERENCES `anuncis` (`anunci_id`) ON DELETE CASCADE,
  CONSTRAINT `anunci_disciplina_ibfk_2` FOREIGN KEY (`disciplina_id`) REFERENCES `disciplines` (`disciplina_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `anunci_disciplina`
--

LOCK TABLES `anunci_disciplina` WRITE;
/*!40000 ALTER TABLE `anunci_disciplina` DISABLE KEYS */;
INSERT INTO `anunci_disciplina` VALUES (1,12),(2,14),(3,13),(4,22),(5,24),(6,16),(7,11),(8,18),(9,13),(9,14),(10,15),(10,23),(25,13),(25,24),(27,15);
/*!40000 ALTER TABLE `anunci_disciplina` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `anuncis`
--

DROP TABLE IF EXISTS `anuncis`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `anuncis` (
  `anunci_id` int(11) NOT NULL AUTO_INCREMENT,
  `usuari_id` int(11) NOT NULL,
  `nom` varchar(50) NOT NULL,
  `raca` varchar(50) NOT NULL,
  `preu` decimal(10,2) NOT NULL,
  `data_naixement` date NOT NULL,
  `capa` varchar(50) NOT NULL,
  `alcada` decimal(5,2) NOT NULL,
  `pes` decimal(5,2) NOT NULL,
  `sexe` enum('mascle','femella','mascle castrat') NOT NULL,
  `lat` decimal(9,6) NOT NULL,
  `lon` decimal(9,6) NOT NULL,
  `destacat` tinyint(1) NOT NULL DEFAULT 0,
  `estat` enum('pendent','validat','rebutjat') NOT NULL DEFAULT 'pendent',
  `descripcio` text DEFAULT NULL,
  `creat_el` timestamp NOT NULL DEFAULT current_timestamp(),
  `actualitzat_el` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`anunci_id`),
  KEY `usuari_id` (`usuari_id`),
  CONSTRAINT `anuncis_ibfk_1` FOREIGN KEY (`usuari_id`) REFERENCES `usuaris` (`usuari_id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `anuncis`
--

LOCK TABLES `anuncis` WRITE;
/*!40000 ALTER TABLE `anuncis` DISABLE KEYS */;
INSERT INTO `anuncis` VALUES (1,1,'Estrella','Pura sang',15000.00,'2015-06-12','tord',1.65,550.00,'femella',41.385100,2.173400,0,'validat','Cursa de pura sang amb bones prestacions.','2025-06-19 22:59:44','2025-06-19 22:59:44'),(2,1,'Rayo','Àrab',12000.00,'2016-03-20','castany',1.60,500.00,'mascle',41.387900,2.169900,0,'validat','Àrab altament resistent, ideal per raids.','2025-06-19 22:59:44','2025-10-10 11:14:40'),(3,1,'Luna','Lusità',18000.00,'2014-11-05','negre',1.62,530.00,'femella',41.388800,2.174000,1,'validat','Excel·lent per doma clàssica i exhibicions.','2025-06-19 22:59:44','2025-10-11 18:28:48'),(4,1,'Trueno','Frís',10000.00,'2017-07-15','tord',1.70,600.00,'mascle castrat',41.386500,2.176000,0,'validat','Frís tranquil, perfecte per passejos de trail.','2025-06-19 22:59:44','2025-10-02 13:03:46'),(5,1,'Sol','Quarter',9000.00,'2018-01-22','castany',1.55,480.00,'femella',41.389000,2.170500,0,'validat','Ideal per competicions western.','2025-06-19 22:59:44','2025-10-10 11:46:26'),(6,1,'Brisa','Andalús',20000.00,'2013-05-30','tord',1.63,540.00,'femella',41.384000,2.175000,1,'rebutjat','Perfecte per voltaig i doma.','2025-06-19 22:59:44','2025-10-02 13:03:48'),(7,1,'Fortuna','Selle Français',14000.00,'2016-09-10','negre',1.68,580.00,'femella',41.386000,2.172000,0,'validat','Ideal per salt d’obstacles.','2025-06-19 22:59:44','2025-10-10 11:47:08'),(8,1,'Trufa','German Sport',13000.00,'2017-12-01','castany',1.66,560.00,'femella',41.387000,2.171000,0,'validat','Molts moviments de doma.','2025-06-19 22:59:44','2025-10-02 13:03:45'),(9,1,'Argos','Pura sang',16000.00,'2015-02-18','tord',1.64,540.00,'mascle',41.385500,2.174500,0,'validat','Espècie única combinant resistència i salt.','2025-06-19 22:59:44','2025-06-19 22:59:44'),(10,1,'Echo','Quarter',11000.00,'2018-08-08','castany',1.57,500.00,'mascle castrat',41.388200,2.169000,0,'rebutjat','Ideal per passejos de trail i raids curts.','2025-06-19 22:59:44','2025-10-10 11:47:48'),(12,1,'Cavall prova direcció OK','Pura sangre',12000.00,'2016-11-24','castany',1.68,540.00,'mascle',41.455060,2.254155,0,'validat','cavall de prova direcció funciona?','2025-09-24 15:18:22','2025-10-10 11:15:18'),(13,1,'cavall jordi','Pura sangre',10004.00,'2020-02-20','Castaño',1.42,489.00,'mascle',41.480742,2.225085,0,'validat','prova jordi','2025-10-02 13:10:00','2025-10-10 10:48:04'),(22,1,'Cavall amb imatge','Arabe',5000.00,'2022-06-23','Castaño',1.52,489.00,'mascle',41.234321,1.696637,0,'validat',NULL,'2025-10-14 01:23:26','2025-10-14 01:23:56'),(25,1,'problema disciplines','Frison',12300.00,'2021-12-02','negro',1.72,568.00,'mascle',41.652488,2.517140,0,'validat',NULL,'2025-10-14 09:57:22','2025-10-14 09:57:50'),(27,1,'prova imatges','prova',1.00,'2025-10-14','Castaño',1.00,1.00,'femella',41.455060,2.254155,0,'validat',NULL,'2025-10-14 10:16:06','2025-10-14 10:16:12');
/*!40000 ALTER TABLE `anuncis` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `disciplines`
--

DROP TABLE IF EXISTS `disciplines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `disciplines` (
  `disciplina_id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(50) NOT NULL,
  PRIMARY KEY (`disciplina_id`),
  UNIQUE KEY `nom` (`nom`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `disciplines`
--

LOCK TABLES `disciplines` WRITE;
/*!40000 ALTER TABLE `disciplines` DISABLE KEYS */;
INSERT INTO `disciplines` VALUES (13,'concurso completo'),(12,'doma clásica'),(18,'doma vaquera'),(15,'enganche'),(24,'equitación de trabajo'),(17,'horseball'),(20,'paraecuestre'),(19,'ponis'),(14,'raid'),(21,'reining'),(11,'salto de obstáculos'),(22,'trec'),(23,'turismo ecuestre'),(16,'volteo');
/*!40000 ALTER TABLE `disciplines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `imatge_anunci`
--

DROP TABLE IF EXISTS `imatge_anunci`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `imatge_anunci` (
  `imatge_id` int(11) NOT NULL AUTO_INCREMENT,
  `anunci_id` int(11) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `ordre` int(11) NOT NULL DEFAULT 0,
  `creat_el` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`imatge_id`),
  KEY `idx_img_anunci` (`anunci_id`),
  KEY `idx_img_ordre` (`anunci_id`,`ordre`),
  CONSTRAINT `fk_img_anunci` FOREIGN KEY (`anunci_id`) REFERENCES `anuncis` (`anunci_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `imatge_anunci`
--

LOCK TABLES `imatge_anunci` WRITE;
/*!40000 ALTER TABLE `imatge_anunci` DISABLE KEYS */;
INSERT INTO `imatge_anunci` VALUES (2,22,'2b9754fd-5392-41cd-8a6c-83ba35f72c89.webp',0,'2025-10-14 03:23:26'),(4,25,'8e124d32-90c7-4113-8320-ba18a594bb5d.jpg',0,'2025-10-14 11:57:22'),(5,27,'319515cb-c22b-4c38-a5e1-0e75d6f4e85c.jpg',0,'2025-10-14 12:16:06'),(6,27,'e7a0a2da-2323-4b93-aef6-c3b6eb2aefa7.webp',1,'2025-10-14 12:16:06');
/*!40000 ALTER TABLE `imatge_anunci` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `revisio_anunci`
--

DROP TABLE IF EXISTS `revisio_anunci`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `revisio_anunci` (
  `revisio_id` int(11) NOT NULL AUTO_INCREMENT,
  `anunci_id` int(11) NOT NULL,
  `usuari_id` int(11) NOT NULL,
  `motiu` text DEFAULT NULL,
  `creat_el` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`revisio_id`),
  KEY `idx_rev_anunci` (`anunci_id`),
  KEY `idx_rev_usuari` (`usuari_id`),
  KEY `idx_rev_creat` (`creat_el`),
  CONSTRAINT `fk_rev_anunci` FOREIGN KEY (`anunci_id`) REFERENCES `anuncis` (`anunci_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rev_usuari` FOREIGN KEY (`usuari_id`) REFERENCES `usuaris` (`usuari_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `revisio_anunci`
--

LOCK TABLES `revisio_anunci` WRITE;
/*!40000 ALTER TABLE `revisio_anunci` DISABLE KEYS */;
INSERT INTO `revisio_anunci` VALUES (1,2,1,NULL,'2025-10-10 13:14:40'),(2,12,1,NULL,'2025-10-10 13:15:18'),(3,5,1,NULL,'2025-10-10 13:46:26'),(4,7,1,NULL,'2025-10-10 13:47:08'),(5,10,1,'No cumple con las normas de la plataforma','2025-10-10 13:47:48'),(6,3,1,NULL,'2025-10-11 20:28:48'),(10,22,1,NULL,'2025-10-14 03:23:56'),(12,25,1,NULL,'2025-10-14 11:57:50'),(13,27,1,NULL,'2025-10-14 12:16:12');
/*!40000 ALTER TABLE `revisio_anunci` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `sessio_id` char(36) NOT NULL,
  `usuari_id` int(11) NOT NULL,
  `creat_el` timestamp NOT NULL DEFAULT current_timestamp(),
  `expira_el` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`sessio_id`),
  KEY `usuari_id` (`usuari_id`),
  KEY `expira_el` (`expira_el`),
  CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`usuari_id`) REFERENCES `usuaris` (`usuari_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('0d8829a6-88fb-4614-ab61-399d77efa582',1,'2025-09-11 11:55:29','2025-09-18 11:55:29'),('258bcde6-e074-4dcf-b688-f93b930490cd',1,'2025-10-10 13:07:32','2025-10-17 13:07:32'),('3bf87c3e-6177-499b-9f1a-d6dc1d25ed2f',1,'2025-09-19 16:06:10','2025-09-26 16:06:10'),('5653eb95-a113-4c6c-8379-13e031eb84b7',1,'2025-09-19 16:06:19','2025-09-26 16:06:19'),('56b9e3b7-c85d-4251-82ab-5ded62d8dc45',1,'2025-09-22 07:52:09','2025-09-29 07:52:09'),('5774746a-5e1f-41c1-96e5-1f99bb3aa18b',1,'2025-09-19 16:32:51','2025-09-26 16:32:51'),('9d4ec219-c3ee-4b3a-817d-e63b034e0350',1,'2025-09-08 11:45:27','2025-09-15 11:45:27'),('ad50e4fc-3feb-41e9-854f-55b21eef0a6d',1,'2025-09-19 16:32:10','2025-09-26 16:32:10'),('fa673c76-a640-45b0-8f57-d884fa2094ea',1,'2025-09-19 16:32:20','2025-09-26 16:32:20'),('ffde651d-c540-4e50-a451-40e4e3f5a471',1,'2025-10-14 13:26:32','2025-10-21 13:26:32');
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuaris`
--

DROP TABLE IF EXISTS `usuaris`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuaris` (
  `usuari_id` int(11) NOT NULL AUTO_INCREMENT,
  `administrador` tinyint(1) DEFAULT 0,
  `actiu` tinyint(1) NOT NULL DEFAULT 1,
  `nom` varchar(50) NOT NULL,
  `cognom` varchar(50) NOT NULL,
  `telefon` varchar(20) DEFAULT NULL,
  `correu_electronic` varchar(100) NOT NULL,
  `contrassenya` varchar(255) NOT NULL,
  `creat_el` timestamp NOT NULL DEFAULT current_timestamp(),
  `actualitzat_el` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`usuari_id`),
  UNIQUE KEY `correu_electronic` (`correu_electronic`),
  UNIQUE KEY `uq_telefon` (`telefon`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuaris`
--

LOCK TABLES `usuaris` WRITE;
/*!40000 ALTER TABLE `usuaris` DISABLE KEYS */;
INSERT INTO `usuaris` VALUES (1,1,1,'Admin','Admin','999999999','admin@root.com','admin','2025-05-22 18:31:39','2025-10-10 13:06:02'),(3,0,1,'francesco','oncins spedo','644324461','francesco@gmail.com','2134','2025-09-11 10:45:05','2025-09-12 14:32:05'),(11,0,0,'prova2','prova','123123123','prova2@gmail.com','prova','2025-09-11 11:05:02','2025-10-14 14:35:33');
/*!40000 ALTER TABLE `usuaris` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'cavalls_db'
--

--
-- Dumping routines for database 'cavalls_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-16 16:54:56
