# Install Deepseek Locally

1. Clone repository:

```sh
git clone
```

2. Run the two apps from Docker Compose:

```sh
docker compose up -d
```

3. Install the Deepseek models: (This might take a few minutes)

```sh
docker compose exec ollama ollama pull deepseek-r1:1.5b
```

4. Run the website on http://localhost:3001