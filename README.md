<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1e5PBAQ5XlqYioUOZ_S717s4HpJXNHeWQ

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy med Docker (Portainer Stack)

**Prerequisites:** Docker og Portainer

1. Opret en `.env` fil i projektets rod med:
   ```
   GEMINI_API_KEY=din_api_key_her
   ```

2. I Portainer:
   - Gå til **Stacks**
   - Klik **Add stack**
   - Vælg **Web editor**
   - Indsæt indholdet fra `docker-compose.yml` (eller `docker-compose.simple.yml` hvis du ikke bruger Traefik)
   - Sæt environment variable `GEMINI_API_KEY` i Portainer's environment section
   - Klik **Deploy the stack**

3. Appen kører på port **3002** (internt port 80)

4. For at linke `skak.juhler.dk`:
   - Hvis du bruger Traefik: Labels i `docker-compose.yml` er allerede konfigureret
   - Hvis du bruger en anden reverse proxy: Konfigurer den til at pege på port 3002
