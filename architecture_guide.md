
# AcademyOS Architecture Strategy

## 1. Multi-Tenant Infrastructure
- **Core Strategy**: Shared Database, Isolated Schema.
- **Identification**: Every record in the database includes a `business_id` UUID.
- **Middleware**: Backend API intercepts all requests to inject a tenant filter based on the API key or Auth Token.

## 2. Dynamic Theming Logic (White-Label)
- The mobile app requests a `/branding` endpoint on boot.
- It receives a JSON blob containing hex codes, asset URLs, and component style preferences.
- A **React Context Provider** (or Flutter Theme Extension) applies these values globally.

## 3. AI Capabilities Integration
- **Gemini 3 Flash**: Used for rapid FAQ responses and student engagement.
- **Gemini 3 Pro**: Used for high-level business analytics, automated scheduling optimization, and content generation.
- **Grounding**: Each tenant can upload an `FAQ.pdf` or `Handbook.md`. This is converted into a vector embedding (or provided as system instruction) to ensure the AI speaks only for that specific business.

## 4. Data Model (MVP)
| Entity | Description |
|--------|-------------|
| **Tenant** | Stores branding configs, API keys, and owner details. |
| **Profile** | Unified user record with a `role` flag (Owner, Coach, Student). |
| **Session** | Individual class instances with time, capacity, and instructor ID. |
| **Enrollment** | Linking students to sessions with attendance status. |
| **AI_Thread** | History of interactions between students and the tenant's AI. |

## 5. Recommended Next Steps
1. **Initialize Supabase/Firebase**: Setup Auth and the initial table structure.
2. **Branding Suite Build-out**: Finish the dashboard you see here to allow owners to "Create" their app.
3. **Gemini Training**: Fine-tune system prompts for different studio niches (e.g., Yoga vs MMA).
4. **Stripe Connect**: Implement multi-tenant payments where owners can link their own Stripe accounts.
