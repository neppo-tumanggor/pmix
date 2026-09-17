# 📦 Product Seeding Guide

## 🚨 Common Issue: Products Not Showing in Frontend

**Problem**: You seeded 10,000 products but they don't appear in the frontend.

**Root Cause**: **Tenant Mismatch**
- Performance test seeds products with hardcoded `tenantId = 'perf-test-tenant'`
- When you login through frontend, you use your own tenant ID (from your user account)
- Products are filtered by tenant ID, so you only see products for YOUR tenant
- The 10,000 products are in `perf-test-tenant`, not your tenant

### Example:
```
Performance Test:  tenant_id = 'perf-test-tenant'  ← 10,000 products here
Your User:         tenant_id = 'default-tenant'     ← You're looking here
Result:            NO PRODUCTS FOUND ❌
```

---

## ✅ Solution: Seed Products for Your Tenant

### Step 1: Login to Frontend
1. Open http://localhost:1458
2. Login with your account (admin/manager)
3. Note your tenant ID (ask admin or check database)

### Step 2: Seed Products for Your Tenant

```bash
cd apps/backend

# Run the interactive seeding script
pnpm perf:seed
```

**What the script does:**
1. Shows all users with their tenant IDs
2. Asks you to enter the tenant ID you want to seed
3. Deletes existing products for that tenant
4. Creates 10,000 products and 20 categories for YOUR tenant

### Step 3: Refresh Frontend
- Go back to http://localhost:1458/products
- You should now see 10,000 products! 🎉

---

## 🔍 How to Find Your Tenant ID

### Option 1: Check Database Directly

```bash
# Using psql
psql -U pmix -d pmix_dev -c "SELECT id, email, tenant_id FROM users;"

# Using the script output
pnpm perf:seed  # Will show list of users
```

### Option 2: Check from Backend Logs

When you login, check the backend console logs:
```
[AuthService] User logged in: user@example.com (tenant: your-tenant-id)
```

### Option 3: Common Tenant IDs

- `default-tenant` - Default tenant for development
- `perf-test-tenant` - Used by performance tests
- Your custom tenant ID (check your user account)

---

## 🛠️ Advanced: Migrate Products Between Tenants

If you already have products in `perf-test-tenant` and want to move them to your tenant:

```bash
cd apps/backend

# Create migration script
pnpm db:seed
```

Or manually via SQL:
```sql
-- Update products from perf-test-tenant to your-tenant
UPDATE products 
SET tenant_id = 'your-tenant-id' 
WHERE tenant_id = 'perf-test-tenant';

-- Update categories too
UPDATE product_categories 
SET tenant_id = 'your-tenant-id' 
WHERE tenant_id = 'perf-test-tenant';
```

---

## 📊 Performance Test vs User Seed

| Script | Tenant ID | Purpose | When to Use |
|--------|-----------|---------|-------------|
| `perf:test` | `perf-test-tenant` (hardcoded) | Performance benchmarking | Testing performance only |
| `perf:seed` | Your choice (interactive) | Development/testing | When you need products for your tenant |

---

## 🎯 Quick Start

```bash
# 1. Start backend (already running on port 1457)
cd apps/backend
pnpm start:dev

# 2. Start frontend (already running on port 1458)
cd apps/frontend
pnpm dev

# 3. Seed products for your tenant
cd apps/backend
pnpm perf:seed
# Enter your tenant ID when prompted

# 4. Refresh browser
# Open http://localhost:1458/products
```

---

## ❓ Troubleshooting

### Still No Products?

1. **Check if backend is running**: http://localhost:1457/api/v1/products
2. **Check authentication**: Make sure you're logged in
3. **Check tenant ID**: Verify you entered the correct tenant ID
4. **Check browser console**: Look for API errors (F12 → Console)

### How to Check Your Current Tenant?

```bash
# Decode your JWT token (get it from browser localStorage)
# The payload contains your tenant ID
```

### Verify Products in Database

```bash
# Connect to PostgreSQL
psql -U pmix -d pmix_dev

# Count products by tenant
SELECT tenant_id, COUNT(*) 
FROM products 
GROUP BY tenant_id;

# Check your user's tenant
SELECT email, tenant_id FROM users WHERE email = 'your-email@example.com';
```

---

## 📚 Related Documentation

- [Products Module README](./README.md)
- [Database Setup Guide](../../../../DATABASE_SETUP.md)
- [Backend README](../../README.md)

---

## 🆘 Need Help?

If you still can't see products:
1. Check backend logs for errors
2. Verify tenant IDs match
3. Ensure you're authenticated (JWT token valid)
4. Try clearing browser cache and re-login
