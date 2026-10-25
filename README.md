# Dealership Inventory

## Seeding

Start the development database, then run `npm run db:seed` from `backend`. The seed uses the development `DATABASE_URL` only and refuses the test database. It creates demo inventory only when the vehicle table is empty; use `SEED_RESET=true npm run db:seed` to replace existing vehicles.

- Admin: `admin@dealer.com` / `Admin@12345`
- Customer: `customer@dealer.com` / `Customer@12345`
