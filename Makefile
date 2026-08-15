.PHONY: help up down restart logs ps db-generate db-push db-studio db-seed dev build typecheck lint clean

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

up: ## Start local Postgres (Docker)
	docker compose up -d

down: ## Stop local Postgres (Docker)
	docker compose down

restart: down up ## Restart local Postgres

logs: ## Tail Postgres container logs
	docker compose logs -f db

ps: ## Show container status
	docker compose ps

db-generate: ## Regenerate the Prisma client
	pnpm db:generate

db-push: ## Push schema.prisma to the local database
	pnpm db:push

db-studio: ## Open Prisma Studio (local database)
	pnpm db:studio

db-seed: ## Run the seed script
	pnpm db:seed

dev: up ## Start Docker + the dev server
	pnpm dev

build: ## Production build (should work with Docker stopped)
	pnpm build

typecheck: ## Type-check the project
	pnpm typecheck

lint: ## Run ESLint (once configured — see audit item #5)
	pnpm lint

clean: ## Stop Docker AND remove the local database volume (DESTROYS local data)
	docker compose down -v