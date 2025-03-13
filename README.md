# Portfolio Twitter-Style

Un portfolio moderne inspiré de l'interface de Twitter, développé avec Next.js, TypeScript et Tailwind CSS.

![Aperçu du Portfolio](https://cdn.sowamadou.com/portfolio-media/portfolio-twitter.png)

## 🌟 Fonctionnalités

- **Design Moderne** : Interface utilisateur inspirée de Twitter pour une expérience familière
- **Mode Sombre** : Design optimisé pour le mode sombre
- **Responsive** : S'adapte parfaitement à tous les appareils (mobile, tablette, desktop)
- **Authentification** : Connexion via GitHub grâce à NextAuth.js
- **Base de Données** : PostgreSQL avec Prisma comme ORM
- **Stockage Media** : Intégration avec MinIO pour le stockage des médias
- **Email** : Configuration SMTP pour les communications par email

## 🛠️ Technologies Utilisées

- **Frontend** :
  - Next.js 14
  - TypeScript
  - Tailwind CSS
  - React

- **Backend** :
  - Prisma (ORM)
  - PostgreSQL
  - NextAuth.js
  - MinIO

## 📦 Installation

1. **Cloner le repository**
```bash
git clone https://github.com/akumq/portfolio-twitter.git
cd portfolio-twitter
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration des variables d'environnement**
Créez un fichier `.env` à la racine du projet avec les variables suivantes :
```env
# Base de données
DATABASE_URL=votre_url_postgresql

# GitHub OAuth
GITHUB_ID=votre_github_id
GITHUB_SECRET=votre_github_secret
GITHUB_TOKEN=votre_github_token

# NextAuth
NEXTAUTH_SECRET=votre_secret
NEXTAUTH_URL=http://localhost:3000

# SMTP
SMTP_HOST=votre_smtp_host
SMTP_PORT=587
SMTP_USER=votre_email
SMTP_PASSWORD=votre_mot_de_passe
SMTP_FROM=votre_email_expediteur

# MinIO
MINIO_ENDPOINT=votre_endpoint
MINIO_PORT=443
MINIO_USE_SSL=true
MINIO_ACCESS_KEY=votre_access_key
MINIO_SECRET_KEY=votre_secret_key
MINIO_BUCKET_NAME=votre_bucket
MINIO_PUBLIC_URL=votre_url_public
```

4. **Initialiser la base de données**
```bash
npx prisma migrate dev
```

5. **Lancer le serveur de développement**
```bash
npm run dev
```

## 🚀 Déploiement

Le projet est configuré pour être déployé avec Docker. Utilisez les commandes suivantes :

```bash
# Construire l'image
docker build -t portfolio-twitter .

# Lancer le conteneur
docker run -p 3000:3000 portfolio-twitter
```

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👤 Contact

- GitHub : [@akumq](https://github.com/akumq)
- LinkedIn : [Sow Amadou](https://www.linkedin.com/in/sow-amadou1/)
- Email : madousow88@gmail.com
