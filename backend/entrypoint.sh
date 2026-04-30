#!/bin/sh

echo "Applying database migrations..."
python manage.py migrate --noinput

echo "Starting the Django Development Server..."
exec "$@"