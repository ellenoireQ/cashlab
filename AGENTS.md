# Cashlab — Agents Rules & Coding Guidelines

Purpose
-------
This file describes how automated agents, contributors, and pair-programming assistants should behave when making changes to the Cashlab repository. It focuses on the backend (FastAPI) and overall coding style rules used across the project.

Agent behaviour (must follow)
----------------------------
- Always learning important codebase before writing the code, example:
	- backend/
	- src/components/layout
	- src/components/ui
	- src/components/dashboard
	- src/components/auth
	- src/components/chats
	- src/components/settings
	- src/components/tasks
	- src/components/users
	- src/components/lib
	- src/components/routes
	- src/components/styles
- Do not always generate Markdown "How to use ..." or relevant.
- Ask clarifying questions before making ambiguous or large changes.
- Make small, well-scoped edits and open a draft PR for larger work.
- Never add secrets, credentials, or environment values to the repo. Use environment variables or secret stores.
- Run the project's linters and tests locally before pushing changes.
- Provide a short summary of changes and rationale in the PR description and commit message.

Project overview (quick)
------------------------
- Frontend: TypeScript + React (pnpm workspace; ESLint configured).
- Backend: FastAPI application under `backend/` (see `backend/main.py`).
- Data work uses `pandas` in the backend; APIs should return JSON-serializable objects.

Backend rules (FastAPI)
-----------------------
- Use FastAPI `APIRouter` for modular routes (see `backend/routers`).
- Use Pydantic models for request and response bodies. Prefer explicit models over raw dicts.
- Prefer async endpoints when performing I/O-bound work; otherwise sync endpoints are acceptable.
- Keep business logic outside route handlers (move to service/helper modules) so handlers stay thin.
- Validate inputs early and raise `fastapi.HTTPException` with appropriate status codes.
- Avoid heavy work at import time; initialize expensive resources in startup events or on demand.
- Add route `summary` and `description` metadata for public endpoints where useful.
- Ensure all responses are JSON-serializable; convert pandas objects to native types (lists/dicts) before returning.
- Use `uvicorn` for local development: `uvicorn backend.main:app --reload`.

Python coding style & tooling
---------------------------
- Follow PEP 8 and use `black` for formatting and `isort` for imports.
- Use a linter (e.g., `ruff` or `flake8`) and enable typing checks where practical.
- Prefer explicit type hints on public functions and API handlers.
- Keep functions small and single-responsibility; prefer composable helpers.
- Tests: use `pytest` for backend tests. Keep tests deterministic and fast.
- Virtual environments: create a venv and install dependencies from `backend/requirements.txt`.

Frontend (TypeScript/React) style
--------------------------------
- Follow existing ESLint and TypeScript config in the repo.
- Use descriptive component names and `props` interfaces.
- Prefer functional components and React hooks; keep hooks extracted for re-use.
- Keep styles in `styles/` or component-level files as the project convention.

Git, branches & PRs
--------------------
- Branch names: `feature/<short-desc>`, `fix/<short-desc>`, or `chore/<short-desc>`.
- Use Conventional Commit style in commit messages (brief header, optional body).
- Make each PR self-contained and include tests where applicable.
- Link PRs to issues when relevant and describe how to test the change locally.

CI, formatting & commands
-------------------------
- Backend setup (Windows example):

	python -m venv .venv
	.venv\Scripts\activate
	pip install -r backend/requirements.txt

- Run backend locally:

	uvicorn backend.main:app --reload

- Format and lint (Python):

	black .
	isort .
	ruff check .

- Frontend (pnpm):

	pnpm install
	pnpm run dev
	pnpm run lint

Security & data handling
------------------------
- Never commit API keys, credentials, or dataset files. Use `.env` or CI secret stores.
- When handling user or production data, minimize what is logged and avoid sensitive fields.

When an agent edits code
------------------------
- Add a clear PR description explaining why the change is needed and how it was tested.
- Run unit tests and linters before opening the PR.
- If the change touches the backend API shape, include migration notes and update any affected frontend code.

Where to ask questions
----------------------
- Open an issue in the repository for design discussions; reference the issue from PRs.

Maintainers may update these rules as the project evolves. If you propose changes to coding conventions, include rationale and a migration plan.

