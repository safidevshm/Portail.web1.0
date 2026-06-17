#!/bin/bash

# Supabase Configuration Setup
# This script configures environment variables for Supabase

echo "🔧 Setting up Supabase configuration..."

# Load values from .env file
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
  echo "✅ Environment variables loaded from .env"
else
  echo "❌ .env file not found"
  exit 1
fi

# Verify variables are loaded
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "❌ Supabase credentials not found in .env"
  exit 1
fi

echo "✅ Supabase Configuration:"
echo "   - SUPABASE_URL: $SUPABASE_URL"
echo "   - SUPABASE_SERVICE_ROLE_KEY: [configured]"
echo "   - VITE_SUPABASE_URL: $VITE_SUPABASE_URL"
echo "   - VITE_SUPABASE_ANON_KEY: [configured]"
echo ""
echo "ℹ️  To use these variables, run:"
echo "   source scripts/setup-supabase.sh && pnpm dev"
