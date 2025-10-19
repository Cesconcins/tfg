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
INSERT INTO `anunci_disciplina` VALUES (58,11),(59,14),(60,12),(60,18),(61,19),(63,11);
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
  `disponibilitat` enum('actiu','venut','baixa') NOT NULL DEFAULT 'actiu',
  `venut_el` datetime DEFAULT NULL,
  `descripcio` text DEFAULT NULL,
  `creat_el` timestamp NOT NULL DEFAULT current_timestamp(),
  `actualitzat_el` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`anunci_id`),
  KEY `usuari_id` (`usuari_id`),
  KEY `idx_anuncis_validacio` (`estat`),
  KEY `idx_anuncis_disponibilitat` (`disponibilitat`),
  CONSTRAINT `anuncis_ibfk_1` FOREIGN KEY (`usuari_id`) REFERENCES `usuaris` (`usuari_id`)
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `anuncis`
--

LOCK TABLES `anuncis` WRITE;
/*!40000 ALTER TABLE `anuncis` DISABLE KEYS */;
INSERT INTO `anuncis` VALUES (58,3,'Fulgor','Caballo de deporte español',14000.00,'2016-07-08','Castaño',1.68,560.00,'femella',41.455060,2.254155,1,'validat','actiu',NULL,'Yegua con muy buena actitud para salto. Facilita la mano y no mira obstáculos.','2025-10-19 03:15:09','2025-10-19 04:00:06'),(59,3,'Bendito','Cruzado',5000.00,'2014-09-14','Alazán',1.58,500.00,'mascle',41.656381,2.508041,0,'validat','actiu',NULL,'Caballo súper dócil, perfecto para rutas y iniciación. Vive en paddock, fácil de manejar y herrar.','2025-10-19 03:18:24','2025-10-19 03:29:18'),(60,3,'Nerón','Lusitano',9000.00,'2020-02-18','Negro',1.60,520.00,'mascle castrat',41.234782,1.678362,0,'validat','actiu',NULL,'Lusitano joven con muy buenas aptitudes, caminador y con buenos aires. Aún en trabajo de base.','2025-10-19 03:21:26','2025-10-19 03:29:20'),(61,15,'Miel','Poni shetland',1200.00,'2019-07-10','Palomino',1.05,180.00,'femella',41.258729,-0.799471,1,'validat','actiu',NULL,'Poni ideal para niños, muy tranquila. Acostumbrada a cepillado y paseos a la mano.','2025-10-19 03:23:52','2025-10-19 04:00:11'),(62,15,'Rayo','Anglo-árabe',8000.00,'2015-11-23','Castaño',1.66,540.00,'mascle castrat',37.250141,-3.549672,0,'validat','actiu',NULL,'Caballo rápido y valiente, experiencia en raid ligero y campo.','2025-10-19 03:26:18','2025-10-19 03:29:20'),(63,1,'Rayo','Pura sangre',9000.00,'2018-09-08','Castaño',1.64,515.00,'mascle castrat',42.122089,1.841814,0,'pendent','actiu',NULL,'Pura sangre para salto de obstáculos; valiente, ágil, respetuoso con el palo, manejable y competitivo.','2025-10-19 13:26:21','2025-10-19 13:26:21');
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
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `imatge_anunci`
--

LOCK TABLES `imatge_anunci` WRITE;
/*!40000 ALTER TABLE `imatge_anunci` DISABLE KEYS */;
INSERT INTO `imatge_anunci` VALUES (10,58,'9ade17ea-9fc7-44c9-9d3e-b8288c5e46d1.jpg',0,'2025-10-19 05:15:09'),(11,59,'0c1ad840-3b8f-4521-babc-098cb9a256f0.jpg',0,'2025-10-19 05:18:24'),(12,59,'b421b0e5-3802-4553-baf1-b9cadf1b130a.jpg',1,'2025-10-19 05:18:24'),(13,60,'130e1ba1-1a06-4c18-a69c-7b94c8ec9a91.jpg',0,'2025-10-19 05:21:26'),(14,61,'a5221c73-d099-417e-a2df-8d9ef3843a15.jpg',0,'2025-10-19 05:23:52'),(15,62,'7ae540bc-081b-4796-a5d3-ef9b10e367ba.jpg',0,'2025-10-19 05:26:18'),(16,63,'cb8dd3b7-2f45-4806-b59b-2b5cfab40cf3.jpg',0,'2025-10-19 15:26:21');
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
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `revisio_anunci`
--

LOCK TABLES `revisio_anunci` WRITE;
/*!40000 ALTER TABLE `revisio_anunci` DISABLE KEYS */;
INSERT INTO `revisio_anunci` VALUES (15,58,1,NULL,'2025-10-19 05:29:15'),(16,59,1,NULL,'2025-10-19 05:29:18'),(17,60,1,NULL,'2025-10-19 05:29:20'),(18,61,1,NULL,'2025-10-19 05:29:20'),(19,62,1,NULL,'2025-10-19 05:29:20');
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
INSERT INTO `sessions` VALUES ('0d8829a6-88fb-4614-ab61-399d77efa582',1,'2025-09-11 11:55:29','2025-09-18 11:55:29'),('258bcde6-e074-4dcf-b688-f93b930490cd',1,'2025-10-10 13:07:32','2025-10-17 13:07:32'),('3bf87c3e-6177-499b-9f1a-d6dc1d25ed2f',1,'2025-09-19 16:06:10','2025-09-26 16:06:10'),('5653eb95-a113-4c6c-8379-13e031eb84b7',1,'2025-09-19 16:06:19','2025-09-26 16:06:19'),('56b9e3b7-c85d-4251-82ab-5ded62d8dc45',1,'2025-09-22 07:52:09','2025-09-29 07:52:09'),('5774746a-5e1f-41c1-96e5-1f99bb3aa18b',1,'2025-09-19 16:32:51','2025-09-26 16:32:51'),('9d4ec219-c3ee-4b3a-817d-e63b034e0350',1,'2025-09-08 11:45:27','2025-09-15 11:45:27'),('ad50e4fc-3feb-41e9-854f-55b21eef0a6d',1,'2025-09-19 16:32:10','2025-09-26 16:32:10'),('c040f3bc-ae1e-4821-ba2d-0aae33b3c84a',1,'2025-10-19 13:26:56','2025-10-26 14:26:56'),('e70b2d8f-9244-4e8d-a59c-5bb4ab24fef3',14,'2025-10-16 18:18:34','2025-10-23 18:18:34'),('fa673c76-a640-45b0-8f57-d884fa2094ea',1,'2025-09-19 16:32:20','2025-09-26 16:32:20');
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
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuaris`
--

LOCK TABLES `usuaris` WRITE;
/*!40000 ALTER TABLE `usuaris` DISABLE KEYS */;
INSERT INTO `usuaris` VALUES (1,1,1,'Admin','Admin','999999999','admin@root.com','admin','2025-05-22 18:31:39','2025-10-10 13:06:02'),(3,0,1,'francesco','oncins spedo','644324461','francesco@gmail.com','2134','2025-09-11 10:45:05','2025-09-12 14:32:05'),(14,0,1,'Pau','Alcázar','121212121','pau@gmail.com','Pau123','2025-10-16 18:18:27','2025-10-19 03:30:54'),(15,0,1,'Jordi','Garcia','','jordi.garcia@upc.edu','1234','2025-10-19 02:31:15','2025-10-19 02:31:15');
/*!40000 ALTER TABLE `usuaris` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-19 16:12:54
