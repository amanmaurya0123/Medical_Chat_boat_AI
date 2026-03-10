# Medical Chatbot Dashboard

Responsive React dashboard for the Medical Chatbot. Built with Vite + React.

## Run locally

1. **Start the API** (from project root):
   ```bash
   uvicorn api:app --reload --port 8000
   ```

2. **Install and run the dashboard**:
   ```bash
   npm install
   npm run dev
   ```

3. Open **http://localhost:5173**. The app proxies `/api` to the backend.

## Build for production

```bash
npm run build
```

Serve the `dist` folder with any static host. Set `VITE_API_URL` to your API base URL (e.g. `https://api.example.com`) when the API is on a different origin.
