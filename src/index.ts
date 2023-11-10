import express from 'express';
import router from './routes';
import { JWTStrategy, TokenContext } from './helpers/JWTFactory';
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Use the router
app.use(router);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
const jwtStrategy = new JWTStrategy('mysecretkey');
const tokenContext = new TokenContext(jwtStrategy);

// Create a token
const token = tokenContext.createToken(1, 'fakeusername', '15m');
console.log(token);
