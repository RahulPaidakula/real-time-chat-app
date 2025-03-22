# Real-Time Chat App Frontend

This is the frontend for a real-time chat application built with React 19, featuring:

- User authentication (login, register, password reset)
- Real-time messaging with SignalR
- Private and group chats
- Online/offline presence indicators

## Getting Started

1. Install dependencies:

```
npm install
```

2. Set environment variables:
   Create a `.env` file in the root directory with:

```
REACT_APP_API_URL=https://localhost:5001
```

3. Start the development server:

```
npm start
```

## Project Structure

- `src/components/` - Reusable UI components
- `src/pages/` - Main page components (Login, Register, Chat, etc.)
- `src/context/` - React Context for global state management
- `src/services/` - API and SignalR client services

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Runs the test suite
- `npm run build` - Builds the app for production

## Technologies Used

- React 19
- React Router v6
- SignalR Client (@microsoft/signalr)
- Axios for API requests
