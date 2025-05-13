# Testing Guide for *referai*

This document explains how to run the tests for both the frontend and backend of the project. Please follow the steps below based on the part of the project you wish to test.


## Frontend Tests ([vitest](https://vitest.dev/))

The frontend tests are configured to run using `pnpm`. To execute these tests, follow these steps:

1. Ensure you are in the `frontend/` directory of the project.

   ```bash
   cd frontend
   ```

2. Run the tests using the following command:

   ```bash
   pnpm test
   ```

   This command will execute all defined frontend tests and output the results in the terminal.

## Backend Tests ([pytest](https://docs.pytest.org/en/stable/))

The backend tests are defined using `pytest` with coverage reporting enabled. To execute these tests, follow these steps:

1. Navigate to the `backend` directory.

   ```bash
   cd backend
   ```

2. Run the tests with the following command:

   ```bash
   pytest --cov=app --cov-report=term-missing --cov-report=html:./tests/coverage_report
   ```
    With this, you will run all tests and generate a **coverage report** in `backend/tests/coverage_report/` directory.

3. To open the HTML coverage report in your browser for a detailed breakdown of the test coverage:

   ```bash
   open ./tests/coverage_report/index.html
   ```

## Notes

- Ensure all necessary dependencies are installed before running the tests. Refer to the [Installation Guide](./INSTALLATION.md) for setup instructions.
- If you encounter any issues, please review the error messages carefully or consult the documentation for the respective testing tools (`pnpm` and `pytest`).

---
For more detailed information, troubleshooting, or if you need to go back to the main documentation, please refer to the [README.md](../README.md).