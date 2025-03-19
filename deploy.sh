#!/bin/bash

git pull origin main

composer install --no-dev --optimize-autoloader

npm ci
npm run build

php artisan migrate --force

php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

sudo supervisorctl restart all

echo "✅ Deploy success!"

