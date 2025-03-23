# Real-Time Chat Application

A full-stack real-time chat application built with React and ASP.NET Core SignalR.

## Project Structure

- frontend/: React frontend application
- backend/: ASP.NET Core backend application with SignalR

## Prerequisites

- Node.js and npm for the frontend
- .NET 9 SDK for the backend

## Configuration

### Secrets and Configuration Files

This repository uses placeholder values for all sensitive information. Before running the application, you need to update these placeholders with your actual values:

- backend/appsettings.json: Contains database connection strings and JWT settings
- frontend/.env: Contains API URLs for development

### Setting Up Environment Variables

1. *Create a .env file in the frontend directory*:

   bash
   cd frontend
   touch .env
   

2. *Add the following content to the .env file*:
   
   REACT_APP_API_URL=http://localhost:5241
   

### Database Setup

The application uses Entity Framework Core with SQLite. You need to run migrations to set up the database before using the application:

1. *Apply database migrations*:

   bash
   cd backend
   dotnet ef database update
   

   This creates the required tables in the SQLite database.

2. *If you make changes to the data models*, generate and apply new migrations:

   bash
   dotnet ef migrations add YourMigrationName
   dotnet ef database update
   

### Setting Up Local Development

1. *Backend Setup*:

   bash
   cd backend
   dotnet restore
   dotnet run
   

2. *Frontend Setup*:
   bash
   cd frontend
   npm install
   npm start
   

## Troubleshooting

- *"No such table" errors*: Make sure you've run dotnet ef database update in the backend directory.
- *API connection issues*: Verify that the REACT_APP_API_URL in the frontend .env file matches the port your backend is running on (check launchSettings.json).
- *Port already in use*: If you get a port conflict, find and terminate the process using the port:
  bash
  lsof -i :5241 | grep LISTEN
  kill -9 <PID>
  

## Security Notes

- Never commit actual secrets or credentials to the repository
- Update the JWT key in backend/appsettings.json with a strong, unique secret

## Running the Application

The application should be available at:

- Backend: http://localhost:5241
- Frontend: http://localhost:3000