# 🧩 DI Playground — Matheus Szoke

<p align="center">
  <img src="https://di-playground.mathszoke.com/assets/banner.png" alt="DI Playground Banner" width="800"/>
</p>

<p align="center">
  <b>An interactive .NET + React playground that visually demonstrates how Dependency Injection lifetimes work in practice.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/.NET-512BD4?style=for-the-badge&logo=dotnet&logoColor=white"/>
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
  <img src="https://img.shields.io/badge/Fluent%20UI-0078D4?style=for-the-badge&logo=microsoft&logoColor=white"/>
</p>

---

## 🧠 About the Project

DI Playground was created to teach and clarify Dependency Injection concepts in .NET through a fully visual and interactive experience.

Instead of explaining DI lifetimes only through theory, this project allows you to see exactly what happens when multiple users and requests interact with services registered as Transient, Scoped, and Singleton.

Each API request generates real backend resolutions, and the frontend reflects instance creation, sharing, and lifetime boundaries under concurrent access.

---

## ⚙️ Core Stack

| Layer | Technologies |
|:--|:--|
| Frontend | React (JavaScript) + Fluent UI |
| Backend | .NET 10 + Minimal APIs |
| Architecture | Stateless API with explicit DI lifetimes |
| Language | C# / JavaScript |

---

## 🧩 Project Structure

```
src/
  ├─ DI_Playground.Api/
  │     ├─ Program.cs
  │     ├─ Services/
  │     └─ Models/
  │     └─ Enum/
  │     └─ Hubs/
  │
  └─ di-playground-web/
        ├─ public/
        └─ src/
            ├─ components/
            └─ App.jsx
```

---

## 🌟 Key Features

- Visual simulation of Dependency Injection lifetimes
- Clear distinction between Transient, Scoped, and Singleton
- Multiple concurrent users per request
- Real-time instance creation visualization
- Fluent UI–based interface
- Optional Bug Mode for teaching incorrect DI usage

---

## 🚀 How to Run Locally

### Prerequisites
- .NET 10 SDK
- Node.js (v18+)

### Backend

```
dotnet run --project src/DI_Playground.AppHost/DI_Playground.AppHost
```

Or


```
dotnet run --project src/DI_Playground.Api/DI_Playground.Api
```

### Frontend

```
cd src/di_playground.web/di_playground.web
npm install
npm start
```

---

## 🌐 Live Demo

https://di-playground.mathszoke.com

---

## 📫 Contact

Email: matheusszoke@gmail.com  
LinkedIn: https://linkedin.com/in/matheusszoke  
Portfolio: https://portfolio.mathszoke.com

---

Made with 💚 by Matheus Szoke
