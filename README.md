# User Management Dashboard

A full-stack user management dashboard built with Next.js, Express, MongoDB, and TypeScript. This application provides a modern interface for managing users with features like authentication, user profiles, and role-based access control.

## Tech Stack

### Frontend

- **Next.js 14** - React framework for server-side rendering
- **TypeScript** - Type-safe JavaScript
- **TailwindCSS** - Utility-first CSS framework
- **React Hook Form** - Form handling with validation
- **Zod** - Schema validation
- **Axios** - HTTP client
- **React Hot Toast** - Toast notifications

### Backend

- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **TypeScript** - Type-safe JavaScript
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload handling

## Prerequisites

- Node.js (v18 or higher)
- MongoDB
- npm or yarn

## Project Structure

```
user-management-dashboard/
├── frontend/           # Next.js frontend application
├── src/               # Backend source code
├── package.json       # Backend dependencies
├── tsconfig.json      # TypeScript configuration
└── nodemon.json       # Nodemon configuration
```

## Getting Started

### Backend Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory with the following variables:

   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env.local` file with:

   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Features

- User authentication (login/register)
- User profile management
- Role-based access control
- File upload functionality
- Responsive design
- Form validation
- Toast notifications
- Protected routes

## Development

- Backend runs on `http://localhost:5000`
- Frontend runs on `http://localhost:3000`

## Deployment

The application can be deployed on platforms like:

- Render
- Vercel
- Heroku

Make sure to set up the appropriate environment variables in your deployment platform.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.
