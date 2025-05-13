# Application Flow - *referai*
This document outlines the general user flow through the application, from register to prediction. It is intended to provide a clear explanation for understanding and documenting the interface and logic of each step.

## 1. Authentication Page - Login
### Purpose
Allow users to log in with their email and password or navigate to the registration page in case they don't have an account.
### Actions
- **Login with email and password**.
- **Navigate to registration page**.
### UI Elements
- Input fields:
    - `Email`
    - `Password`
- Buttons:
    - `Log in`
    - `Sign up`
### Notes
- On successful login:
    - The user is redirected to the `/upload` page.
- If login fails:
    - `401 Unauthorized`: Displays `"Incorrect email or password"`.
    - `5xx`: Displays a general server error message.
    - Any other error: Displays the backend’s `detail` message or a generic fallback.

## 2. Registration Page - Register
### Purpose
Allow users to register with their email and password or return to the login page if they already have one.
### Actions
- **Register with email and password**.
- **Navigate to login page**.
### UI Elements
- Input fields:
    - `Email`
    - `Password`
    - `Confirm Password`
- Buttons:
    - `Create Account`
    - `Log in`
### Notes
- Password requirements:
    - Minimum length: 8 characters.
    - Maximum length: 30 characters.
    - Must contain at least:
        - One uppercase letter.
        - One lowercase letter.
        - One number.
    - `password` and `confirm_password` must match. Otherwise, raises `"Passwords do not match"` error.
- On successful registration:
    - The user is redirected to the `/login` page.
- If registration fails:
    - `422 Unprocessable Entity`: Displays each validation error message returned by the backend (e.g., invalid email, password mismatch).
    - Any error with `detail`: Displays the provided error message.
    - Otherwise: Displays a generic fallback message `"Registration failed. Please try again."`.

## 3. Upload Page - Clip Upload or Action Selection
### Purpose
Allow users to either continue working on a previously created action or upload 2 to 4 new clips to create a new action.
### Actions
- **Upload new clips** (2 to 4).
- **Select previous action**.
- **Create new action**.
### UI Elements
- `Upload field for new video clips`
- `Last action picker`
- `"Continue" button`
- `"Logout" button`
### Notes
- Clip Upload Logic:
    - Users can select between **2 and 4 video clips**.
    - File input is restricted to video files (`accept="video/*"`).
    - A maximum of **4 files** are allowed at once — only the first 4 files are used.
    - Selected clips are previewed and can be removed individually.
    - Temporary object URLs are used for previews and revoked when new videos are selected.

- Continue Action:
    - If 2–4 clips are selected:
        - The clips are uploaded to the backend using the stored JWT token.
        - On success:
            - The returned `action_id` is stored in localStorage under the key `last_action_id`.
            - The user is redirected to the `main page`.
    - If fewer than 2 or more than 4 clips are selected:
        - The "Continue" button is disabled.
        - Clicking it manually will still show a validation error toast.
- Authentication:
    - A valid JWT token must be present in `localStorage` to upload clips.
    - If the token is missing or malformed, an error is shown and upload is aborted.
- Last Action Panel:
    - On page load, the app fetches the user's last action (if authenticated).
    - If available:
        - Shows preview of previously uploaded clips as base64-encoded videos.
        - Clicking the panel saves the `action_id` in `localStorage` and navigates to the home page.

- Error Handling:
    - If upload fails, an error message is shown using the `Toast` component.
    - Server error details are displayed when available; otherwise, a generic fallback message is shown.

## 4. Main Page - Action Visualization & Prediction
### Purpose
Display the clips of the current action, allow synchronized visualization, and offer prediction functionality.
### Actions
- **Visualize all clips of the selected action**.
- **Run prediction** (foul detection and severity classification).
- **View prediction results**.
- **Navigate back to upload page**.
### UI Elements
- `Video grid (synchronized)`
- `Video timeline bar`
- `"Play" button`
- `"Run prediction" button`
- `"Logout" button`
- `"Upload Page" button`
### Prediction Output
- `Foul Prediction (result and percentages)`
- `Severity (result and percentages)`
- `Foul Model Results (prediction for each model)`
- `Severity Model Results (prediction for each model)`
### Notes
- **Loading State**:
    - The page should display a loading spinner or progress indicator when fetching the clips or running the prediction.
    - The UI must prevent interaction (e.g., disabling buttons) when data is being loaded or predictions are being processed.
  
- **Prediction Logic**:
    - When the "Run prediction" button is clicked, a request is made to the backend API to analyze the current action’s clips.
    - If the prediction is successful, the results are displayed immediately, showing whether a foul was detected and its severity classification.
    - If the prediction fails (e.g., due to server issues or missing clips), an error message should be shown in a toast notification.

- **Synchronized Video Playback**:
    - The videos in the grid should be synchronized based on the timeline, meaning when one video reaches a certain timestamp, all other videos should reflect that timestamp to maintain consistent playback across all clips.
    - If one video reaches its end, the others should stop as well, providing a consistent viewing experience.

- **Error Handling**:
    - In case of any errors (e.g., server failure during prediction or video playback issues), a toast message should notify the user with a description of the problem.
    - It should be clear whether the issue is due to a backend failure, a prediction error, or a clip-related problem (such as a missing video).

- **Accessibility**:
    - Ensure that video controls are keyboard-accessible.
    - Add ARIA labels and descriptions for interactive elements like buttons, video timelines, and the "Run prediction" button to support screen readers.

- **Toast Notifications**:
    - Display toast messages for important actions like successful prediction results, errors during prediction, or any other relevant system status.
    - These toasts should automatically disappear after a few seconds or can be manually closed by the user.

- **Performance Considerations**:
    - Ensure that videos are loaded and rendered efficiently to avoid delays during playback, especially when using multiple clips.
    - Use proper video file compression to minimize loading times and prevent performance bottlenecks, especially on slower networks.

- **Security Considerations**:
    - Since the app relies on JWT tokens for authentication, ensure the token is securely stored and managed.
    - Any sensitive information (like prediction results or user data) should be handled according to best security practices.

## 6. Logout Behavior
### Purpose
Ensure users can safely log out and clear any session data to protect privacy.
### Actions
- **Clear JWT token**: Remove the token from `localStorage` to invalidate the session.
- **Redirect to login page**: After logging out, users are redirected to the login page.
### UI Elements
- `"Logout" button`
- **Behavior**:
    - When clicked, it clears the JWT token from `localStorage` and redirects the user to the `/login` page.
    - A confirmation dialog may appear to prevent accidental logouts.
### Notes
- Ensure that **no sensitive information** is retained after the user logs out, such as session data, uploaded clips, or action states.
- Upon logout, any active session or unsaved progress should be cleared automatically.

---
For more detailed information, troubleshooting, or if you need to go back to the main documentation, please refer to the [README.md](../README.md).