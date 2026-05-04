# DravoHome Backend — Hostinger VPS Deployment Guide

> **Architecture**: Django API on Hostinger VPS · User & Admin frontends on Vercel
>
> **Server**: Hostinger KVM 2 — Ubuntu 24.04 LTS, 2 CPUs, 8GB RAM, 100GB SSD
>
> **API Domain**: api.dravohome.com · **IP**: 187.127.162.119
>
> **Vercel Domains**: dravohome.com · www.dravohome.com · admin.dravohome.com

---

## 1. Initial Server Setup

```bash
ssh root@187.127.162.119
```

### 1.1 Create a deploy user

```bash
adduser dravohome
usermod -aG sudo dravohome
```

### 1.2 Switch to the deploy user

```bash
su - dravohome
```

---

## 2. Install System Packages

```bash
sudo apt update && sudo apt upgrade -y

sudo apt install -y \
  python3 python3-pip python3-venv python3-dev \
  postgresql postgresql-contrib libpq-dev \
  nginx certbot python3-certbot-nginx \
  git curl ufw build-essential
```

---

## 3. Set Up PostgreSQL

```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE dravohome_db;
CREATE USER dravohome_user WITH PASSWORD 'YOUR_DB_PASSWORD';
ALTER ROLE dravohome_user SET client_encoding TO 'utf8';
ALTER ROLE dravohome_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE dravohome_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE dravohome_db TO dravohome_user;
GRANT ALL ON SCHEMA public TO dravohome_user;
ALTER DATABASE dravohome_db OWNER TO dravohome_user;
\q
```

> [!IMPORTANT]
> Replace `YOUR_DB_PASSWORD` with a real password. Generate: `openssl rand -base64 24`

---

## 4. Upload Your Project

```bash
cd /home/dravohome
git clone YOUR_REPO_URL dravohome
```

---

## 5. Python Virtual Environment & Dependencies

```bash
cd /home/dravohome/dravohome/server
python3 -m venv myenv
source myenv/bin/activate
pip install --upgrade pip
pip install -r requirements-prod.txt
```

---

## 6. Production `.env` File

```bash
nano /home/dravohome/dravohome/server/.env
```

```env
# Django Core
SECRET_KEY=REPLACE_WITH_GENERATED_KEY
DEBUG=False
ALLOWED_HOSTS=api.dravohome.com,187.127.162.119,localhost

# Database
DATABASE_URL=postgres://dravohome_user:YOUR_DB_PASSWORD@localhost:5432/dravohome_db
DB_NAME=dravohome_db
DB_USER=dravohome_user
DB_PASSWORD=YOUR_DB_PASSWORD
DB_HOST=localhost
DB_PORT=5432

# CORS
CORS_ALLOWED_ORIGINS=https://dravohome.com,https://www.dravohome.com,https://admin.dravohome.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=djlgcbpkq
CLOUDINARY_API_KEY=219563289589721
CLOUDINARY_API_SECRET=Gw5Y167WinKbAYIJOkiB6YufdpE

# WhatsApp Cloud API
WHATSAPP_API_TOKEN=EAA9UkjgxegMBP66uWFZC8vIZA6M56SzaCrnMiZBtrAZB90y6pp0tXrZCxwg0Ri59ZA6K2PZBbMfAiAB1xGly3vRaZCB8L9a73kMLwsl8gILV4rBZCWbKIY8og41nYQSf2nvIVVsASyKC9Vf0LQieyoHloZAu2Pd9amJ4qf2M3hKlEpjw7fbEiFoUnhBcKyKV0RvLUe8ai0ZBkjdlXpZAMh7vzrknYszQKsDg2ZBJ5XVjGYIHyzuE85G8RX4Y9f4kSNJNRVzZAZBoc4ORC2SaNp5mdAZD
WHATSAPP_PHONE_NUMBER_ID=790470374159475
WHATSAPP_BUSINESS_ACCOUNT_ID=1104676074877309

# Email (Gmail SMTP)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=shibilytuvvur@gmail.com
EMAIL_HOST_PASSWORD=dsyywfftwwqvkogf
DEFAULT_FROM_EMAIL=DravoHome <shibilytuvvur@gmail.com>
ADMIN_EMAIL=shibilytuvvur@gmail.com
```

Generate SECRET_KEY:
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(64))"
```

---

## 7. Initialize the Database

```bash
cd /home/dravohome/dravohome/server
source myenv/bin/activate

python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser
```

---

## 8. Gunicorn Systemd Service

```bash
sudo nano /etc/systemd/system/dravohome.service
```

```ini
[Unit]
Description=DravoHome Django API (Gunicorn)
After=network.target postgresql.service

[Service]
User=dravohome
Group=dravohome
WorkingDirectory=/home/dravohome/dravohome/server
EnvironmentFile=/home/dravohome/dravohome/server/.env
ExecStart=/home/dravohome/dravohome/server/myenv/bin/gunicorn \
    --config gunicorn.conf.py \
    dravohome_api.wsgi:application

Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable dravohome
sudo systemctl start dravohome
sudo systemctl status dravohome
```

> [!NOTE]
> **View logs**: `sudo journalctl -u dravohome -f`
> **Restart**: `sudo systemctl restart dravohome`

---

## 9. Nginx Reverse Proxy

```bash
sudo nano /etc/nginx/sites-available/dravohome
```

```nginx
server {
    listen 80;
    server_name api.dravohome.com 187.127.162.119;

    client_max_body_size 50M;

    location /static/ {
        alias /home/dravohome/dravohome/server/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location /media/ {
        alias /home/dravohome/dravohome/server/media/;
        expires 7d;
    }

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_read_timeout 120s;
        proxy_connect_timeout 10s;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/dravohome /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

---

## 10. SSL Certificate (Let's Encrypt)

> [!IMPORTANT]
> Point your API subdomain to VPS IP first: Add an A record for `api` → `187.127.162.119` in your DNS panel.

```bash
sudo certbot --nginx -d api.dravohome.com
```

Verify auto-renewal:
```bash
sudo certbot renew --dry-run
```

---

## 11. Firewall

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

---

## 12. Vercel Frontend Configuration

| App | Env Variable | Value |
|-----|-------------|-------|
| User (Next.js) | `NEXT_PUBLIC_API_URL` | `https://api.dravohome.com/api/v1` |
| Admin (Vite) | `VITE_API_URL` | `https://api.dravohome.com/api/v1` |

---

## 13. Quick Reference Commands

| Task | Command |
|------|---------|
| **Restart API** | `sudo systemctl restart dravohome` |
| **View API logs** | `sudo journalctl -u dravohome -f` |
| **Restart Nginx** | `sudo systemctl restart nginx` |
| **Check status** | `sudo systemctl status dravohome` |
| **Run migrations** | `cd /home/dravohome/dravohome/server && source myenv/bin/activate && python manage.py migrate` |
| **Collect static** | `python manage.py collectstatic --noinput` |
| **Django shell** | `python manage.py shell` |
| **DB shell** | `sudo -u postgres psql dravohome_db` |

---

## 14. Deploy Update Script

```bash
nano /home/dravohome/deploy.sh
```

```bash
#!/bin/bash
set -e

echo "🚀 Deploying DravoHome API..."

cd /home/dravohome/dravohome
git pull origin main

cd server
source myenv/bin/activate
pip install -r requirements-prod.txt
python manage.py migrate --noinput
python manage.py collectstatic --noinput

sudo systemctl restart dravohome
echo "✅ Deploy complete!"
```

```bash
chmod +x /home/dravohome/deploy.sh
```

Run: `./deploy.sh`
