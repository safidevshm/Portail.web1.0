# Supabase Configuration Guide

## ✅ Current Status
Your Supabase credentials are already configured in the `.env` file:

```
SUPABASE_URL=https://hwglhastcmqgrvvxmaae.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_URL=https://hwglhastcmqgrvvxmaae.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🔧 How to Ensure Variables Are Loaded

### For Development (Vite + Express Server)
The dev server automatically loads `.env` when you run:
```bash
pnpm dev
```

The server reads the `.env` file via `dotenv/config` in `server/index.ts`.

### If You Still See "Placeholder" Values

This means the dev server needs to be restarted to pick up the `.env` file. 

**Solution**: Restart your dev server using the UI button (usually at the top-right of the preview).

### Diagnostic Endpoint
Once the server has restarted with proper credentials, test the connection:

```
GET /api/diagnostics/supabase
```

This will return:
```json
{
  "status": "success",
  "message": "Supabase connection is working",
  "config": {
    "url": "https://hwglhastcmqgrvvxmaae.supabase.co",
    "hasServiceRoleKey": true,
    "hasAnonKey": true
  }
}
```

## 📊 How It Works

### Backend (Node.js/Express)
1. Reads `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from environment
2. Creates a Supabase client in `server/lib/supabase.ts`
3. Uses this client for all database operations (registration, login, etc.)
4. All auth routes (`/api/auth/*`) use this configured client

### Frontend (React/Vite)
1. Reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
2. These can be used for client-side Supabase operations if needed
3. Currently, frontend uses backend API routes for auth

## 🔐 Security Notes

- **Service Role Key**: Never expose in frontend code. Used only on server.
- **Anon Key**: Safe for frontend use, restricted to public operations.
- **Environment Variables**: Loaded from `.env`, never committed to Git.

## ✅ API Endpoints Configured

All these endpoints now use the real Supabase configuration:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/verify-identity` - Password recovery verification
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/save-documents` - Save PDF and QR code URLs

## 🚀 Next Steps

1. **Restart the dev server** to load `.env` variables
2. **Test registration** - Try creating a new user account
3. **Test login** - Login with the created account
4. **Check database** - View created users in your Supabase dashboard

## 📝 Notes

- Phone numbers are automatically normalized to `0XXXXXXXXX` format
- All text fields are automatically trimmed (spaces removed from start/end)
- Database tables must exist in your Supabase project:
  - `users` table with required columns

---

For more information, visit: https://supabase.io/docs
