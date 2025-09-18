# E-Commerce Marketplace

**🔗 Live Demo:** [https://dcom.smartpon.dev/](https://dcom.smartpon.dev/)

A full-stack multi-seller marketplace built for portfolio and learning purposes, showcasing modern web development skills.

## 🛠️ Tech Stack

**Backend:** .NET 9, Entity Framework Core, SQL Server, JWT Auth  
**Frontend:** Next.js 15, TypeScript, Tailwind CSS, Radix UI  
**Storage:** Cloudflare R2, ImageKit CDN  
**Deployment:** Cloudflare Pages + Railway

## ✨ Features

- **Multi-seller marketplace** - Independent sellers with their own products and orders
- **Authentication** - JWT + Google OAuth with role-based access (Buyer/Seller)
- **Product management** - CRUD operations with image uploads and inventory tracking
- **Shopping cart** - Multi-seller cart with real-time stock validation
- **Order system** - Complete checkout flow with item-level tracking per seller
- **Multi-currency** - 8 currencies with live exchange rates
- **Seller dashboard** - Analytics, order management, and business metrics

## 🎯 Learning Objectives

This project demonstrates:
- **Full-stack development** with .NET and Next.js
- **Complex business logic** for multi-seller operations
- **Database design** with Entity Framework relationships
- **Authentication & authorization** implementation
- **API design** with comprehensive error handling
- **Modern frontend** patterns with TypeScript and state management
- **Cloud integration** for file storage and deployment

## 🚀 Quick Start

### Backend
```bash
cd backend
dotnet restore
dotnet ef database update
dotnet run
```

### Frontend
```bash
cd frontend
pnpm install
pnpm dev
```

## 📋 Project Scope & Limitations

**What's included:**
- Complete user registration and authentication
- Multi-seller product catalog with search and filtering
- Shopping cart and checkout simulation
- Order management and tracking
- Seller dashboard with basic analytics
- Multi-currency display with live rates

**Portfolio limitations:**
- No real payment processing (checkout is simulated)
- Simplified email workflows
- Basic image management (no advanced CDN features)
- Limited to demonstration purposes

## 🔧 Architecture

- **Clean Architecture** with separation of concerns
- **Repository pattern** for data access
- **JWT authentication** with refresh tokens
- **Role-based authorization** throughout the application
- **RESTful API** with OpenAPI documentation
- **Responsive design** with mobile-first approach


Built as a portfolio project to demonstrate full-stack development capabilities.

---

**Note:** This is a demonstration project created for learning and portfolio purposes. While it includes comprehensive e-commerce functionality, it's designed to showcase technical skills rather than process real transactions.