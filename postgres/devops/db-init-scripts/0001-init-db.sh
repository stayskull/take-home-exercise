#!/bin/bash
set -e

DBS=("exercise")

for db in "${DBS[@]}"; do
  # Check if the database already exists
  if ! psql -U "$POSTGRES_USER" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$db'" | grep -q 1; then
    echo "Creating database: $db"
    # Create the database 
    createdb -U "$POSTGRES_USER" --encoding=UTF8 "$db"
  else
    echo "Database $db already exists"
  fi
done
