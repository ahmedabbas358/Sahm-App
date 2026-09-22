# سهم | Sahm

<div align="center">

**من الورقة إلى سجل جامعي موثوق**

*From paper to trusted university records*

[![Backend CI](https://github.com/ahmedabbas358/Sahm-App/actions/workflows/backend_ci.yml/badge.svg)](https://github.com/ahmedabbas358/Sahm-App/actions/workflows/backend_ci.yml)
[![Admin CI](https://github.com/ahmedabbas358/Sahm-App/actions/workflows/admin_ci.yml/badge.svg)](https://github.com/ahmedabbas358/Sahm-App/actions/workflows/admin_ci.yml)
[![Mobile CI](https://github.com/ahmedabbas358/Sahm-App/actions/workflows/mobile_ci.yml/badge.svg)](https://github.com/ahmedabbas358/Sahm-App/actions/workflows/mobile_ci.yml)
[![Release](https://img.shields.io/github/v/release/ahmedabbas358/Sahm-App?label=Latest%20Release)](https://github.com/ahmedabbas358/Sahm-App/releases)

</div>

---

## ما هو سهم؟

منصة متكاملة لإدارة دورة حياة الشهادات الجامعية — من استلام القوائم الورقية المكتوبة بخط اليد، مروراً بالمراجعة والاعتماد، وانتهاءً بالبحث والنشر.

## What is Sahm?

A comprehensive platform for managing the lifecycle of university certificates — from receiving handwritten paper lists, through review and approval, to search and publication.

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Flutter App    │     │  Next.js Admin  │     │  Landing Page   │
│  (Android/iOS)  │     │  (Web Panel)    │     │  (Static)       │
└────────┬────────┘     └────────┬────────┘     └─────────────────┘
         │                       │
         └───────────┬───────────┘
                     │
              ┌──────┴──────┐
              │  FastAPI    │
              │  Backend    │
              └──────┬──────┘
                     │
         ┌───────────┼───────────┐
         │           │           │
    ┌────┴────┐ ┌────┴────┐ ┌───┴────┐
    │PostgreSQL│ │  Redis  │ │Storage │
    └─────────┘ └─────────┘ └────────┘
```

## Monorepo Structure

```
sahm/
├── apps/
│   ├── mobile/     # Flutter (Android + iOS)
│   ├── backend/    # Python FastAPI
│   └── admin/      # Next.js Admin Panel
├── docs/           # Documentation & ADRs
├── .github/        # CI/CD workflows
├── CHANGELOG.md    # Release history
└── docker-compose.yml
```

## Getting Started

### Prerequisites

- Flutter SDK 3.24+
- Python 3.11+
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 16+ (or use Docker)

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/ahmedabbas358/Sahm-App.git
cd Sahm-App

# 2. Start infrastructure
docker compose up -d

# 3. Backend
cd apps/backend
python -m venv .venv
.venv/Scripts/activate  # Windows
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload

# 4. Mobile
cd apps/mobile
flutter pub get
flutter run

# 5. Admin
cd apps/admin
npm install
npm run dev
```

## Tech Stack

| Component | Technology |
|-----------|------------|
| Mobile App | Flutter + Dart |
| State Management | Riverpod |
| Navigation | GoRouter |
| Local Database | SQLite + Drift |
| Backend API | Python + FastAPI |
| Database | PostgreSQL |
| Background Tasks | Celery + Redis |
| Admin Panel | Next.js + TypeScript |
| CI/CD | GitHub Actions |

## Releases

See [CHANGELOG.md](CHANGELOG.md) for the full release history.

Download the latest APK and release assets from the [Releases page](https://github.com/ahmedabbas358/Sahm-App/releases).

## License

Private — All rights reserved. See [LICENSE](LICENSE).
