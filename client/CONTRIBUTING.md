# CONTRIBUTING.md

This document outlines our conventions and guidelines for contributing to the **React + Vite frontend**.

---

## Getting Started

1.  Clone the repository:

    ```bash
    git clone <repo-url>
    cd repo-name
    ```

2.  Install dependencies:

    ```bash
    npm install
    ```

3.  Start the dev server:

    ```bash
    npm run dev
    ```

---

## Making a Contribution

1.  Create a branch:

    ```bash
    git checkout -b feature/your-feature
    ```

2.  Write commits:

    ```bash
    git commit -m "feat: implement user login form"
    ```

3.  Push:

    ```bash
    git push origin feature/your-feature
    ```

4.  Open a pull request

---

## Branch Naming Convention

- Use `feature/`, `bugfix/`, `hotfix/`, `chore/`, or `docs/`
- Use kebab-case
- Keep it scoped and descriptive

**Examples:**

- `feature/user-onboarding`
- `bugfix/modal-close-issue`
- `hotfix/critical-api-error`
- `docs/update-component-guidelines`

---

## Pull Request Guidelines

- Pull requests must target the **`development`** branch.
- **One task per branch and pull request.**
- **Link related issue:** `Closes #issue-number`
- Add **screenshots or GIFs** for UI changes.
- Use **meaningful commit messages.**
- Use the **[Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md)**.
- **Pass all tests and linter checks** before requesting a review.
- **Ask for review.**
- **Do not merge your own PR.**

---

### PR Title Examples

- PR: Implement user authentication flow
- PR: Fix responsiveness issue on dashboard
- PR: Refactor reusable button component

---

### Squash Commit Message Format

When squashing and merging a pull request, format the commit message like this:

`PR: Implement user authentication flow`

This keeps the Git history clean, readable, and directly tied to the purpose of the PR.

---

## Code Quality

Before opening a PR, make sure the following pass:

```bash
npm run lint
npm run test
npm run build
```

---

## After Merge

Delete remote branch:

```bash
git push origin --delete feature/your-feature
```

Pull latest development:

```bash
git checkout development
git pull origin development
```

---

## Development Guide

### 1\. Folder Naming – kebab-case

Use lowercase and hyphens (-) for all folders.

```css
src/
├── components/
│   ├── ui-kit/
│   ├── common/
├── pages/
│   ├── auth/
│   ├── dashboard/
```

### 2\. File Naming

- Use PascalCase for React components (`UserCard.jsx`)
- Use kebab-case for non-component files (`auth-api.js`, `format-date.js`)

### 3\. Quotes – Single Quotes Only

```js
const name = "Jane";
```

### 4\. Semicolons – Always Use

```js
const user = { name: "Jane" };
```

### 5\. API Response Format

To match backend standards, all HTTP responses are shaped like:

#### Success – Single Object

```json
{
  "success": true,
  "message": "User created successfully.",
  "data": {
    "id": "123",
    "name": "Jane"
  }
}
```

#### Success – Array

```json
{
  "success": true,
  "message": "Users fetched successfully.",
  "data": [
    {
      "id": "123",
      "name": "Jane"
    },
    {
      "id": "124",
      "name": "John"
    }
  ]
}
```

#### Error – Validation / Auth / Server

```json
{
  "success": false,
  "message": "Validation error.",
  "error": [
    {
      "field": "email",
      "issue": "email must be a valid email",
      "value": "not-an-email"
    },
    {
      "field": "password",
      "issue": "password is required"
    }
  ]
}
```

### 6\. Axios Client Example

```js
// services/api-client.js
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => {
    if (response.data?.success === false) {
      return Promise.reject(response.data);
    }

    return response.data; // return only the payload
  },
  (error) => {
    const fallback = {
      success: false,
      message: "Unexpected server error",
      error: null,
    };

    if (error.response?.data) {
      return Promise.reject(error.response.data);
    }

    return Promise.reject(fallback);
  }
);

export default api;
```

### 7\. Axios Usage in Components

```js
// pages/RegisterPage.jsx
import api from "../services/api-client";
import { useState } from "react";

const RegisterPage = () => {
  const [error, setError] = useState(null);

  const handleRegister = async (formData) => {
    try {
      const res = await api.post("/users", formData);
      alert(res.message);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <button onClick={() => handleRegister({ email: "a@b.com" })}>
        Submit
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default RegisterPage;
```

### 8\. Axios vs. TanStack Query (Optional)

Use Axios when:

- You want low-level control
- Form submissions (e.g., login/register)
- You prefer imperative calls

Use TanStack Query when:

- Fetching remote data (e.g., lists, user profile)
- Need built-in caching, retry, stale revalidation
- Want declarative data flow

---

Please follow these standards to keep the codebase clean and collaborative.
Questions or improvements? Open a PR to this file.
