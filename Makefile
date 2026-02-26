.PHONY: install dev build docker-up docker-down

install:
	npm install

dev:
	npm run dev

build:
	npm run build

docker-up:
	docker compose up -d --build

docker-down:
	docker compose down
