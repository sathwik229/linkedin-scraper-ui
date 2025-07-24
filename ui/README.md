# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

---

## 1. **Start Your Backend (Port 5000)**

Open a terminal in your project root and run:
```sh
npm start
```
Your backend will be running at:  
**http://localhost:5000**

---

## 2. **Serve Your Frontend Locally (Port 3000)**

### **A. If using the static HTML/JS/CSS in `frontend/`:**

1. Open a new terminal.
2. Go to your `frontend` folder:
   ```sh
   cd frontend
   ```
3. Start a static server (if you have Python 3):
   ```sh
   python -m http.server 3000
   ```
   Your frontend will be at: **http://localhost:3000**

---

### **B. If using the React app in `ui/`:**

1. Open a new terminal.
2. Go to your `ui` folder:
   ```sh
   cd ui
   ```
3. Install dependencies (if not done):
   ```sh
   npm install
   ```
4. Start the React app:
   ```sh
   npm start
   ```
   Your frontend will be at: **http://localhost:3000**

---

## 3. **Update Your Frontend Code to Use Local Backend**

### For `public/script.js` (static frontend):

Make sure your fetch call is:
```js
const backendBase = '';
// ...
const response = await fetch(`${backendBase}/scrape`, { ... });
```
This will call `http://localhost:3000/scrape` if you serve both on the same port, or you need to use the full backend URL if on different ports.

**If your frontend is on 3000 and backend on 5000, use:**
```js
const backendBase = 'http://localhost:5000';
```
So your fetch call becomes:
```js
const response = await fetch(`${backendBase}/scrape`, { ... });
```

---

## 4. **Handle CORS in Backend**

In your `server.js`, make sure you have:
```js
import cors from 'cors';
app.use(cors({ origin: 'http://localhost:3000' }));
```
This allows your frontend on port 3000 to access your backend on port 5000.

---

## 5. **Test the Flow**

- Open [http://localhost:3000](http://localhost:3000) in your browser.
- Enter a company and click "Start Scraping".
- It should work and show results.

---

## 6. **Summary Table**

| Step | What to Do |
|------|------------|
| 1    | Run backend: `npm start` (localhost:5000) |
| 2    | Run frontend: static server or React (`localhost:3000`) |
| 3    | Set fetch URL in frontend to `http://localhost:5000/scrape` |
| 4    | Set CORS in backend to allow `localhost:3000` |
| 5    | Test in browser at `localhost:3000` |

---

**If you want, I can generate the exact code for your `public/script.js` and `server.js` for this setup. Would you like me to do that?**
