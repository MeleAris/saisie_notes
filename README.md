# Projet Saisie Notes

## Prérequis

- Node.js installé
- npm installé

## Installation

### Backend

1. Accédez au dossier du backend :
    ```bash
    cd back
    ```

2. Installez les dépendances :
    ```bash
    npm install
    ```

3. Lancez le serveur backend :
    ```bash
    node pg-server.js
    ```
    ou
    ```bash
    node mysql-server.js
    ```

### Frontend

1. Accédez au dossier du frontend :
    ```bash
    cd ui
    ```

2. Installez les dépendances :
    ```bash
    npm install
    ```

3. Lancez l'application frontend :
    ```bash
    npm start
    ```

## Utilisation

1. Ouvrez votre navigateur et accédez à `http://localhost:3000` pour voir l'application frontend.
2. Le serveur backend devrait être accessible sur `http://localhost:5001` (ou le port configuré).

## Structure du Projet

- `back/` - Contient le code du serveur Node.js
- `ui/` - Contient le code de l'application React

## Contribuer

1. Fork le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Commitez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Poussez votre branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request
