#!/bin/sh 


# Bu script'in amacı, seed işleminin sadece container ilk defa oluşturulduğunda
# bir kez çalışmasını sağlamaktır.


set -e
INIT_FLAG_FILE="/app/db_initialized.flag"

echo "Running database migrations..."
npx prisma migrate deploy


if [ ! -f "$INIT_FLAG_FILE" ]; then
    
    echo "Database not seeded yet. Running seed script..."
    npx prisma db seed
    touch "$INIT_FLAG_FILE"
    echo "Seeding complete. Initialization flag created."
else
    echo "Database already seeded. Skipping seed script."
fi

echo "Starting application..."
exec "$@"

  