level?=patch

# Development
lint:
	@echo "Linting..."
	@npx eslint .
lint-fix:
	@echo "Fix linting..."
	@npx eslint --fix .
dev:
	@echo "Starting server..."
	@bun run dev
.PHONY: lint lint-fix dev

# Test
test: lint-fix
	@echo "Running test..."
	@npx jest
.PHONY: test

# Deployment
build:
	@echo "Building lib..."
	@bun run build
build-demo:
	@echo "Building demo..."
	@bun run build:demo
release:
	@echo "Release $(level)"
	@echo "Adding tag and modify the CHANGELOG"
	@npx standard-version --release-as $(level)
	@echo "Pushing to the github and trigger action for npm:publish"
	@git push --follow-tags origin main
.PHONY: build build-demo release
