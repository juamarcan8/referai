# Installation Guide for *referai*

## 0. Prerequisites
Before you begin, make sure the following are installed on your system:
- [Node.js](https://nodejs.org/es) (Recommended version 22.x or higher)
- [pnpm](https://pnpm.io/es/) - package manager
- [Python](https://www.python.org/) (Recommended version 3.x or higher)

## 1. Clone the Repository
First, clone the [repository](https://github.com/RefereeAI/referai) to your local machine:
```bash
git clone https://github.com/RefereeAI/referai.git
cd referai
```

## 2. Installing Dependencies
This projects follows a **monorepo structure** with two main parts:
- `frontend/`: [React](https://es.react.dev/) + [Vite](https://vite.dev/) application, built with [Node.js](https://nodejs.org/es).
- `backend/`: [FastAPI](https://fastapi.tiangolo.com/), built with [Python](https://www.python.org/).

### Frontend (Node.js + pnpm)
Access the `frontend/` directory and install the dependencies using `pnpm`:
```bash
cd frontend
pnpm install
```
>⚠️ This project uses [pnpm](https://pnpm.io/es/) as its package manager. Using npm or yarn may result in inconsistent dependency resolution.

### Backend (FastAPI + pip)
Access the `backend/` directory and create a virtual environment. Then install the required Python packages using [pip](https://pypi.org/project/pip/):
```bash
cd backend
python -m venv venv
python -m pip install --upgrade pip # On Windows: py -m pip install --upgrade pip
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```
>💡 Make sure you're using Python 3.x, and that your virtual environment is activated before installing dependencies.

## 3. Environment Configuration
In the root directory of the project, you will find a `.env.example` file. To configure your environment variables, just copy this example file and create a new `.env` file. Run the following command to do that by the command prompt:
```bash
cp .env.example .env
```
>💡 Make sure you are in the root directory before running this command.

Then, edit the `.env` file with the required values. 

## 4. Running the Application

### Frontend
Start the frontend development server, run the following command in the `frontend/` directory:
```bash
pnpm run dev
```
This will launch the frontend server. In the command prompt, you will see the address where the frontend will be accessible.

### Backend
To start the backend API, navigate to the `backend/` directory and run the following command inside the virtual environment:
```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8080
```
>💡 If you need to change the host or port values, update them according to your project requirements or local environment.

In case you want to access the API documentation, you can do so at [http://127.0.0.1:8080/docs](http://127.0.0.1:8080/docs). 

Please note that the exact URL will depend on the values you set for the `host` and `port` when running the backend server. For example, if you changed the host to `0.0.0.0` or used a different port, the URL will reflect those changes (e.g., `http://localhost:<custom-port>/docs`).

> 💡 To access the API documentation, make sure the backend server is running. If the server is not up, the documentation page will not be available.

## Conclusion
After following the previous steps, the application will be correctly installed and running on your local machine. The frontend and backend should now be properly linked. You should now be able to:
- Access the frontend correctly.
- Access the API documentation at [http://127.0.0.1:8080/docs](http://127.0.0.1:8080/docs) (or the appropriate URL based on your configuration).

You're all set to start using and testing the application! If you encounter any issues, feel free to refer back to the relevant sections of the documentation or check the error messages for guidance.

---

For more detailed information, troubleshooting, or if you need to go back to the main documentation, please refer to the [README.md](../README.md).