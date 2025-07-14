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

3.  **Simulate a webhook:**

    To test the webhook functionality, you need to send a POST request to the webhook endpoint. You can use a tool like `curl` or a GUI API client like Postman.

    **Using `curl`:**

    Open a new terminal window and run the following command. This example simulates the data structure sent by Folo Actions.

    ```bash
    curl -X POST -H "Content-Type: application/json" -d '{"entry":{"title":"Example Title","url":"http://example.com/article","publishedAt":"2024-01-01T12:00:00Z","author":"John Doe"},"feed":{"title":"Example Feed"}}' http://localhost:3000/api/webhook
    ```

4.  **Observe the result:**

    After running the `curl` command, you will see the log output in the terminal where your server is running. The server will print the structured data from the webhook payload.

## Deployment to Vercel

This project is ready to be deployed to Vercel.

1.  Push this code to a Git repository (e.g., GitHub, GitLab, Bitbucket).
2.  Import the repository into your Vercel account.
3.  Vercel will automatically detect the `vercel.json` file and deploy the application.
4.  Once deployed, Vercel will provide you with a public URL. Use the `/api/webhook` endpoint of this URL as the destination for your Folo Actions webhooks.

    For example: `https://your-deployment-url.vercel.app/api/webhook`