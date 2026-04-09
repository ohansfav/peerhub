# Peerhub Client

## Project Overview

**Peerhub** is a proprietary peer-powered ed-tech platform designed to democratize access to quality education for Nigerian secondary school students. By connecting learners with vetted university undergraduates and recent graduates, Peerhub enables personalized, live one-on-one tutoring sessions focused on exam preparation for WAEC, NECO, and JAMB.

This repository contains the **client-side web application** for Peerhub. The frontend (client) and backend (server) are maintained as separate codebases.

---

## Mission

Empower Nigerian students with affordable, accessible, and high-quality academic support by leveraging a network of peer tutors and modern web technologies.

---

## Architecture Overview

- **Separation of Concerns:**

  - **Client:** Mobile-first React web application with modern UI/UX
  - **Server:** RESTful API (maintained in a separate repository)

- **Core Technologies:**
  - React 19, Vite, TailwindCSS, DaisyUI
  - React Router for navigation
  - React Query for data fetching and caching
  - Axios for HTTP requests
  - Stream Chat for messaging

---

## Key Features

- **Mobile-First Design:**  
  Responsive interface optimized for Nigerian students' device constraints

- **Student & Tutor Dashboards:**  
  Intuitive profile management and session tracking

- **Live Session Interface:**  
  Video calling, chat, and whiteboard functionality

- **Session Scheduling:**  
  Easy-to-use booking system with availability management

- **Real-Time Messaging:**  
  In-app chat powered by Stream Chat

- **Modern UI/UX:**  
  Clean, accessible interface built with TailwindCSS and DaisyUI

---

## System Requirements

- **Node.js:** v18 or higher
- **npm:** v9 or higher
- **Modern Browser:** Chrome, Firefox, Safari, or Edge
- **Operating System:** Windows, macOS, or Linux

---

## Installation & Setup

1. **Clone the Repository**

   ```sh
   git clone https://github.com/Peerhub/Peerhub-client.git
   cd Peerhub-client
   ```

2. **Install Dependencies**

   ```sh
   npm install
   ```

3. **Configure Environment Variables**

   - Copy `.env.example` to `.env` and update values as needed:

   ```sh
   cp .env.example .env
   ```

   - Set API URL, Stream API key, and other configuration options

4. **Start the Development Server**
   ```sh
   npm run dev
   ```

The application will be available at `http://localhost:5173`

---

## Build & Deployment

### Development

```sh
npm run dev
```

### Production Build

```sh
npm run build
```

### Preview Production Build

```sh
npm run preview
```

### Linting

```sh
npm run lint
```

---

## Configuration Options

All configuration is managed via environment variables. See `.env.example` for details.

| Variable                  | Description                         | Example Value             |
| ------------------------- | ----------------------------------- | ------------------------- |
| VITE_API_URL              | Backend API base URL                | http://localhost:3000/api |
| VITE_STREAM_API_KEY       | Stream Chat API key                 | your-stream-api-key       |
| VITE_DISABLE_ROUTE_GUARDS | Disable auth guards for development | true                      |

---

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components and routing
├── hooks/              # Custom React hooks
├── services/           # API service functions
├── utils/              # Utility functions
├── styles/             # Global styles and Tailwind config
└── assets/             # Static assets (images, icons, etc.)
```

---

## Key Dependencies

### Core Framework

- **React 19** - Modern React with latest features
- **Vite** - Fast build tool and dev server
- **React Router DOM** - Client-side routing

### UI & Styling

- **TailwindCSS** - Utility-first CSS framework
- **DaisyUI** - Tailwind component library
- **Lucide React** - Modern icon library

### Data Management

- **React Query** - Server state management and caching
- **Axios** - HTTP client for API requests
- **React Hot Toast** - Toast notifications

### Development

- **ESLint** - Code linting and formatting
- **TypeScript** - Type checking and IntelliSense

---

## Development Workflow

1. **Start the dev server:** `npm run dev`
2. **Make changes** to components, pages, or styles
3. **Hot reload** will automatically update the browser
4. **Run linting** with `npm run lint` before committing
5. **Build for production** with `npm run build`

---

## Deployment

The application is configured for deployment on **AWS Amplify**.

### Amplify Configuration

- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Node.js version:** 18

Environment variables must be configured in the Amplify console to match your production backend and Stream Chat configuration.

---

## API Integration

The client communicates with the Peerhub server API for:

- User authentication and profile management
- Tutor discovery and booking
- Session management
- Admin operations

All API calls are handled through the services layer with React Query for caching and error handling.

---

## Support & Contact

For technical support or business inquiries, please contact the Peerhub team via the official website.

---

## Academic Use — License & Disclaimer

### License

This project is licensed under the **Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0)** license. See the [LICENSE](LICENSE) file for details.

You may **view** and **reference** this code for educational purposes, but you may **not**:

- Use this project or its code for commercial purposes;
- Modify, fork, or redistribute this project;
- Claim this work as your own.

### Academic Disclaimer

This repository contains code developed as part of a school project. It is intended for educational use only. Unauthorized copying, reuse, or submission of this work without explicit permission is strictly prohibited and may be considered plagiarism.

