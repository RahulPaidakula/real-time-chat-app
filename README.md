# Real-Time Chat Application

A full-stack real-time chat application built with React and ASP.NET Core SignalR.

## Project Structure

- `frontend/`: React frontend application
- `backend/`: ASP.NET Core backend application with SignalR

## Prerequisites

- Node.js and npm for the frontend
- .NET 9 SDK for the backend

## Configuration

### Secrets and Configuration Files

This repository uses placeholder values for all sensitive information. Before running the application, you need to update these placeholders with your actual values:

- `backend/appsettings.json`: Contains database connection strings and JWT settings
- `frontend/.env`: Contains API URLs for development

### Setting Up Local Development

1. **Backend Setup**:

   ```bash
   cd backend
   dotnet restore
   dotnet run
   ```

2. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm start
   ```

## Security Notes

- Never commit actual secrets or credentials to the repository
- Update the JWT key in `backend/appsettings.json` with a strong, unique secret

## Running the Application

The application should be available at:

- Backend: http://localhost:5241
- Frontend: http://localhost:3000
