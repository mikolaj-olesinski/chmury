#!/bin/bash
# user_data.sh - Skrypt automatycznej instalacji aplikacji

# Logowanie do pliku
exec > >(tee /var/log/user-data.log) 2>&1
echo "$(date): Rozpoczęcie skryptu user-data"

# Aktualizacja systemu
echo "$(date): Aktualizacja systemu..."
apt-get update -y
apt-get upgrade -y

# Instalacja podstawowych narzędzi
echo "$(date): Instalacja git, nginx, curl..."
apt-get install -y git nginx curl unzip

# Instalacja Node.js 20.x
echo "$(date): Instalacja Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Sprawdzenie wersji
echo "$(date): Sprawdzenie wersji..."
node --version
npm --version
nginx -v

# Klonowanie repozytorium
echo "$(date): Klonowanie repozytorium..."
cd /home/ubuntu
git clone ${github_repo} app
cd app

# Przejście do folderu z aplikacją React
cd interaktywny-odtwarzacz-radiowy

# Instalacja zależności
echo "$(date): Instalacja zależności npm..."
npm install

# Budowanie aplikacji
echo "$(date): Budowanie aplikacji React..."
npm run build

# Konfiguracja Nginx
echo "$(date): Konfiguracja Nginx..."
rm -rf /var/www/html/*
cp -r build/* /var/www/html/

# Konfiguracja Nginx dla React SPA
cat > /etc/nginx/sites-available/default <<EOL
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    
    server_name _;
    root /var/www/html;
    index index.html;
    
    # Obsługa React Router
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # Cachowanie statycznych plików
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Kompresja gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
EOL

# Test konfiguracji Nginx
echo "$(date): Test konfiguracji Nginx..."
nginx -t

# Restart i włączenie Nginx
echo "$(date): Restart Nginx..."
systemctl restart nginx
systemctl enable nginx

# Sprawdzenie statusu
systemctl status nginx --no-pager

# Ustawienie uprawnień
chown -R ubuntu:ubuntu /home/ubuntu/app

# Informacje końcowe
echo "$(date): Instalacja zakończona!"
echo "$(date): Aplikacja dostępna na porcie 80"
echo "$(date): Logi nginx: /var/log/nginx/"
echo "$(date): Zawartość /var/www/html/:"
ls -la /var/www/html/

# Sprawdzenie czy aplikacja działa
echo "$(date): Test lokalny aplikacji..."
curl -I http://localhost/ || echo "Błąd: Aplikacja nie odpowiada lokalnie"

echo "$(date): Skrypt user-data zakończony"