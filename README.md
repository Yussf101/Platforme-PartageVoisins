# Partage Voisins

Projet encadre realise a l'Institut National de Statistique et d'Economie Appliquee (INSEA).

Plateforme web d'echange et de partage d'objets et de services de proximite entre voisins, integrant la geolocalisation et la messagerie instantanee.

---

## Auteurs

* **Youssef FATIMI**
* **Tarik AFTYS**

---

## Fonctionnalites

* **Gestion des comptes et securite :** Inscription, connexion, gestion des profils et controle d'acces via Spring Security et JWT.
* **Annonces et categories :** Publication d'annonces de pret d'objets et de services, recherche par categorie.
* **Geolocalisation et cartographie :** Visualisation des annonces a proximite via PostGIS et cartes interactives Leaflet.
* **Reservations :** Demandes d'emprunt, validation et suivi de disponibilite.
* **Messagerie en temps reel :** Chat instantane entre voisins base sur WebSockets (STOMP / SockJS).
* **Evaluations et avis :** Notation et retours d'experience apres echange.
* **Administration :** Moderation des contenus, gestion des signalements et utilisateurs.

---

## Technologies

### Backend
* **Langage :** Java 21
* **Framework :** Spring Boot
* **Securite :** Spring Security, JWT
* **Communication temps reel :** Spring WebSocket, STOMP
* **Persistance :** Spring Data JPA, Hibernate Spatial

### Frontend
* **Framework :** Next.js (React 19, TypeScript)
* **Styling :** Tailwind CSS
* **Cartographie :** Leaflet, React-Leaflet
* **Client WebSocket :** STOMP.js, SockJS

### Base de donnees & Infrastructure
* **SGBD :** PostgreSQL 15 avec extension spatiale PostGIS
* **Conteneurisation :** Docker, Docker Compose

---

## Structure du Projet

```text
coding/
├── backend/                  # Application Spring Boot (API REST & WebSocket)
│   ├── src/main/java/        # Code source Java (controllers, services, entities, etc.)
│   ├── src/main/resources/   # Configuration (application.yml)
│   └── pom.xml               # Configuration Maven
├── frontend/                 # Application Next.js
│   ├── src/                  # Composants React, pages et hooks
│   └── package.json          # Dependances npm
├── docker-compose.yml        # Service de base de donnees PostGIS
├── ProjetEncadre_TarikAFTYS_YoussefFATIMI.pdf  # Rapport technique du projet
└── README.md
```

---

## Prerequis

* **Docker** et **Docker Compose**
* **JDK 21**
* **Node.js** (version 20 ou superieure) et **npm**
* **Maven** (ou utiliser le wrapper `mvnw` inclus)

---

## Installation et Lancement

### 1. Base de donnees (PostGIS)

Demarrer le conteneur PostgreSQL/PostGIS avec Docker Compose :

```bash
docker compose up -d
```

La base est accessible sur `localhost:5432` :
* Base : `partagevoisins_db`
* Utilisateur : `postgres`
* Mot de passe : `postgres`

### 2. Backend (Spring Boot)

Naviguer dans le dossier backend et lancer l'application :

```bash
cd backend
./mvnw spring-boot:run
```

Sous Windows (PowerShell) :
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

L'API est accessible sur `http://localhost:8080`.

### 3. Frontend (Next.js)

Naviguer dans le dossier frontend, installer les dependances et demarrer le serveur de developpement :

```bash
cd frontend
npm install
npm run dev
```

L'application est accessible sur `http://localhost:3000`.

---

## Documentation

Le rapport detaille de conception et d'implementation est disponible dans le fichier :
* `ProjetEncadre_TarikAFTYS_YoussefFATIMI.pdf`
