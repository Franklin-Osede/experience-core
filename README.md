# Experience Core - Memory Management Scripts

This project includes a set of scripts to optimize memory usage by automating the installation and removal of dependencies (`node_modules`).

## Purpose

To save disk space and prevent "zombie" processes from consuming RAM when the project is not in active use. Dependencies are installed on start and removed on stop.

## Scripts

### Combined (Backend + Frontend)

- **`./dev-start.sh`**: Installs dependencies (if missing) and starts both Backend (port 3003) and Frontend (port 4200) in the background. Saves PIDs to `.backend.pid` and `.frontend.pid`.
- **`./dev-stop.sh`**: Stops both services using the saved PIDs and **deletes** `node_modules` folders to free up space.

### Backend Only

- **`./dev-start-backend.sh`**: Starts only the backend service.
- **`./dev-stop-backend.sh`**: Stops the backend service and cleans dependencies.

### Frontend Only

- **`./dev-start-frontend.sh`**: Starts only the frontend service.
- **`./dev-stop-frontend.sh`**: Stops the frontend service and cleans dependencies.

### Manual Cleanup

- **`./cleanup-all.sh`**: Manually removes all `node_modules` without checking for running processes. Use this if you stopped the servers manually or want to force a clean slate.

## Usage

1.  Make sure scripts are executable (already done via setup):
    ```bash
    chmod +x *.sh
    ```
2.  Start working:
    ```bash
    ./dev-start.sh
    ```
3.  Stop working:
    ```bash
    ./dev-stop.sh
    ```
