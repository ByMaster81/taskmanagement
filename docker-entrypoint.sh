#!/bin/sh
set -e

INIT_FLAG_FILE="/app/data/db_initialized.flag"

echo "Waiting for database..."
until pg_isready -h db -p 5432 -U "${POSTGRES_USER}"; do
  echo "Database is unavailable - sleeping"
  sleep 1
done

echo "Database is ready!"
echo "Running database migrations..."
npx prisma migrate deploy

# Advisory lock
echo "Acquiring advisory lock to prevent race conditions..."
psql "$DATABASE_URL" -c "SELECT pg_advisory_lock(123456);"

if [ ! -f "$INIT_FLAG_FILE" ]; then
    echo "Database not seeded yet. Running seed script..."
    npx prisma db seed
    mkdir -p /app/data
    touch "$INIT_FLAG_FILE"
    echo "Seeding complete."
else
    echo "Database already seeded. Skipping."
fi

# Advisory unlock
psql "$DATABASE_URL" -c "SELECT pg_advisory_unlock(123456);"

echo "Starting application..."
exec "$@"
