# ROAD — Rent On A Dress

A complete luxury party, evening, cocktail, and formal dress rental platform built with **pure HTML5, CSS3, and Vanilla JavaScript (ES Modules)** and powered by **Supabase (PostgreSQL + Auth + Storage)**.

---

## 📁 Folder Structure

```text
road-dress-rental/
├── index.html              # Home page (Hero, Categories, Featured Dresses, How It Works, CTA)
├── shop.html               # Collection / Shop page (Search, Category/Size/Color/Price filters, Sort)
├── dress.html              # Dress Detail page (Multi-image gallery, Size selector, Availability Inquiry Modal)
├── how-it-works.html       # 4-Step rental guide, hygiene standards & FAQs
├── about.html              # Brand story, circular fashion philosophy & metrics
├── contact.html            # Showroom details & general/booking inquiry form
├── admin.html              # Protected Admin Panel (Supabase Auth, Dresses CRUD + Multi-Image Upload, Categories, Inquiries)
├── css/
│   ├── variables.css       # Design tokens (Champagne Gold, Soft Blush Pink, Warm Cream, Typography)
│   ├── global.css          # Reset, Header, Mobile Drawer, Dress Cards, Modals, Toasts, Footer
│   ├── public.css          # Styles for Home, Shop, Dress Detail, How It Works, About, Contact
│   └── admin.css           # Styles for Admin Login, Dashboard, Tables, and Upload Dropzone
├── js/
│   ├── config.js           # Pre-configured with your Supabase URL & Anon Key + PKR currency formatter
│   ├── seed-data.js        # Initial luxury dresses & categories fallback
│   ├── supabase-client.js  # Official @supabase/supabase-js v2 service layer (CRUD, Auth, Storage)
│   ├── ui.js               # Shared navbar, footer, dress card renderer, skeleton loaders, toasts
│   ├── home.js             # Home page controller
│   ├── shop.js             # Shop filtering, search, sorting & URL query sync
│   ├── dress.js            # Dress detail gallery, rental price calculator & reservation modal
│   ├── contact.js          # Contact / inquiry submission controller
│   └── admin.js            # Full Admin Dashboard controller
├── supabase/
│   └── schema.sql          # Complete PostgreSQL schema, RLS policies, Storage bucket & initial seed data
└── README.md               # Setup & deployment guide
```

---

## 🚀 Step-by-Step Supabase Setup

Your frontend in `js/config.js` is **already pre-configured** with your Supabase Project:
- **Project URL:** `https://scwazamgkrcznvvesebb.supabase.co`
- **Anon Key:** Configured in `js/config.js`

To complete your database, RLS policies, storage bucket, and first Admin user inside Supabase, follow these 3 quick steps:

### Step 1: Run the SQL Schema & Seed Data
1. Open your [Supabase Dashboard](https://supabase.com/dashboard/project/scwazamgkrcznvvesebb).
2. In the left sidebar, click **SQL Editor** &rarr; **New query**.
3. Copy the entire contents of [`supabase/schema.sql`](./supabase/schema.sql) and paste it into the SQL Editor.
4. Click **Run** (or press `Ctrl + Enter`).
   - This automatically creates:
     - `public.categories`, `public.dresses`, and `public.inquiries` tables
     - All **Row Level Security (RLS)** policies (public read for dresses/categories, public insert for inquiries, full CRUD for authenticated admins)
     - The public **Storage bucket** `dress-images` and its Storage RLS policies
     - Initial luxury categories and 8 couture dresses priced in **PKR (Rs.)**

### Step 2: Create Your First Admin User
1. In your Supabase Dashboard sidebar, go to **Authentication** &rarr; **Users**.
2. Click **Add user** &rarr; **Create new user**.
3. Enter your desired Admin Email (e.g., `admin@rentonadress.com`) and a strong Password.
4. Make sure **Auto Confirm User** is checked, then click **Create user**.
5. Open `/admin.html` on your website and sign in with that email and password!

### Step 3: Verify Storage Bucket (`dress-images`)
- Running `supabase/schema.sql` in Step 1 automatically creates the public bucket named `dress-images` and attaches the required upload/read policies.
- If you ever want to inspect uploaded photos manually, visit **Storage** &rarr; **`dress-images`** in your Supabase Dashboard.

---

## 💻 Running Locally

Because the project uses standard ES Modules (`<script type="module">`), serve the folder over a local HTTP server. A zero-dependency Windows PowerShell server ([`server.ps1`](./server.ps1)) is included so you don't need Python or Node.js installed:

```powershell
# Built-in Windows PowerShell Server (No Python or Node required)
powershell -ExecutionPolicy Bypass -File server.ps1
```

Then open **http://localhost:8080** in your browser.
