#!/bin/bash

set -e

echo "📦 Pulling latest code..."
git pull origin main

echo "📦 Installing PHP deps..."
composer install --no-dev --optimize-autoloader

echo "🛠️ Building frontend (Vite)..."
npm ci && npm run build

echo "🧱 Running migrations..."
php artisan migrate --force

echo "🧹 Caching config/routes/views..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

echo "🔁 Restarting queue workers..."
php artisan horizon:terminate && sudo supervisorctl restart horizon

echo "🎉 Deploy complete!"

