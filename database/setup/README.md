# SelfDriveKaro.com - Database Setup Guide

## 📁 Backup Files

Located in `database/backups/`:
- `schema_backup_YYYYMMDD.sql` - Complete database schema
- `data_backup_YYYYMMDD.sql` - All data export

## 🚀 Fresh Installation

### Step 1: Set Environment Variables
```bash
export DATABASE_URL="your_postgresql_connection_string"
```

### Step 2: Create Database Schema
```bash
# Using Drizzle (Recommended)
npm run db:push

# OR using schema backup
psql $DATABASE_URL < database/backups/schema_backup_YYYYMMDD.sql
```

### Step 3: (Optional) Load Sample Data
```bash
psql $DATABASE_URL < database/setup/02_sample_data.sql
```

## 🔄 Restore from Backup

### Full Restore
```bash
# Restore schema
psql $DATABASE_URL < database/backups/schema_backup_YYYYMMDD.sql

# Restore data
psql $DATABASE_URL < database/backups/data_backup_YYYYMMDD.sql
```

## 📊 Vehicle Types & Categories

### Car Types
- Economy, Hatchback, Sedan, Prime Sedan
- Compact, SUV, XUV, MUV, Compact SUV
- Premium, Luxury, Luxury Sedan
- Super Cars, Sports Car, EV Car

### Bike Types
- Commuter Bike, Standard Bike, Sports Bike
- Cruiser Bike, Premium Bike
- Scooter, EV Bike, EV Scooter

See `database/setup/01_vehicle_types_categories.sql` for details.

## 🔐 Security Notes

1. **Never commit** actual user data or real passwords
2. **Change default passwords** immediately after setup
3. **Use environment variables** for sensitive data
4. **Enable SSL** for production database connections
5. **Regular backups** - automated daily backups recommended

## 📝 Default Configuration

- **Service Location**: Bhubaneswar, Odisha, India
- **Support Email**: support@selfdrivekaro.com
- **Support Phone**: +91 9337 912331
- **Platform Commission**: 30% (configurable)
- **Payment Settlement**: 7 business days

## 🛠️ Maintenance

### Create New Backup
```bash
# Schema only
pg_dump $DATABASE_URL --schema-only --no-owner --no-privileges > backup_schema.sql

# Data only
pg_dump $DATABASE_URL --data-only --no-owner --no-privileges > backup_data.sql

# Full backup
pg_dump $DATABASE_URL --no-owner --no-privileges > full_backup.sql
```

### Update Schema
```bash
# Make changes to shared/schema.ts
# Then push to database
npm run db:push --force
```

## 📞 Support

For setup issues, contact: support@selfdrivekaro.com
