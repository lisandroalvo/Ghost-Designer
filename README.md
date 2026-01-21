<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AcademyOS - White-Label AI SaaS Platform

A complete multi-tenant SaaS platform for academies, gyms, and training studios with AI-powered features.

## ✨ Features

- 🏢 **Multi-tenant architecture** - Each business gets isolated data
- 🔐 **Authentication & Authorization** - Role-based access (Owner, Instructor, Student)
- 🎨 **White-label branding** - Customize colors, logo, and theme
- 🤖 **AI-powered** - Marketing content generation, student chat assistant, feedback summarization
- 📊 **Analytics dashboard** - Track students, revenue, leads, and enrollments
- ⚡ **Marketing automation** - Email, WhatsApp, and push notifications
- 💳 **Payment tracking** - Revenue and payment history
- 📱 **Mobile preview** - Real-time preview of mobile app

## 🚀 Quick Start

**Prerequisites:** Node.js 18+ and a Supabase account

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Supabase backend:**
   - Read the complete [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed instructions
   - Create a Supabase project
   - Run the database migration from `supabase/migrations/001_initial_schema.sql`
   - Get your API credentials

3. **Configure environment variables:**

   Edit [.env.local](.env.local):
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the app:**
   ```bash
   npm run dev
   ```

5. **Create your account:**
   - Open http://localhost:5173
   - Sign up with your email
   - Start customizing your academy!

## 📚 Documentation

- [Complete Setup Guide](SETUP_GUIDE.md) - Step-by-step backend setup
- [Architecture Guide](architecture_guide.md) - System architecture overview

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, RLS)
- **AI:** Google Gemini API
- **Build:** Vite

## 📦 Project Structure

```
├── components/         # React components
├── contexts/          # React context providers
├── services/          # API and business logic
├── lib/              # Supabase client
├── supabase/         # Database migrations
├── types.ts          # TypeScript types
└── App.tsx           # Main application
```

## 🎯 Next Steps

- Add CRUD forms for classes and students
- Implement file uploads for knowledge base
- Integrate Stripe for payments
- Deploy to production

## 📄 License

MIT
# Trigger deploy
