# Folo Actions Webhook Receiver

This project is a simple Express.js application designed to receive and handle webhooks from Folo Actions. It is configured for easy deployment on Vercel.

## Project Structure

- `api/index.js`: The main Express application file. It handles incoming webhook requests.
- `package.json`: Defines the project's dependencies and scripts.
- `vercel.json`: Configuration file for Vercel deployment.

## How It Works

The server listens for POST requests on the `/api/webhook` endpoint. When a webhook is received from Folo Actions, the server logs the payload to the console. You can add your custom logic inside this endpoint to process the data as needed.

## Local Development & Testing

1.  **Install dependencies:**

    ```bash
    npm install
    ```

2.  **Run the development server:**

    ```bash
    npm start
    ```

    The server will start, and you'll see a message like `Server is running on http://localhost:3000`.

3.  **Open the viewer page:**

    Open your web browser and navigate to `http://localhost:3000`. You should see the "Folo Webhook Real-time Viewer" page, and it will connect to the WebSocket server.

4.  **Simulate a webhook:**

    To test the webhook functionality, you need to send a POST request to the webhook endpoint. You can use a tool like `curl` or a GUI API client like Postman.

    **Using `curl`:**

    Open a new terminal window and run the following command:

    ```bash
    curl -X POST -H "Content-Type: application/json" -d '{"event":"test_event","payload":{"message":"Hello from local test!"}}' http://localhost:3000/api/webhook
    ```

5.  **Observe the result:**

    After running the `curl` command, you should see the JSON payload appear instantly on the viewer page in your browser. You will also see the log output in the terminal where your server is running.

## Deployment to Vercel

This project is ready to be deployed to Vercel.

1.  Push this code to a Git repository (e.g., GitHub, GitLab, Bitbucket).
2.  Import the repository into your Vercel account.
3.  Vercel will automatically detect the `vercel.json` file and deploy the application.
4.  Once deployed, Vercel will provide you with a public URL. Use the `/api/webhook` endpoint of this URL as the destination for your Folo Actions webhooks.

    For example: `https://your-deployment-url.vercel.app/api/webhook`