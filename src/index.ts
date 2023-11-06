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
const token = tokenContext.createToken(123, '15s');
console.log(token);
const decoded = tokenContext.verifyToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywianRpIjoiZjk5NjA3OTktZmQzNi00NTAwLTkyMmEtMDkzY2M4MjMwZjkwIiwiaWF0IjoxNjk5Mjc0MDMyLCJleHAiOjE2OTkyNzQwNDd9.7OvVvWv_BJ4R6a9Dh2zmliT43glbUgcuGFkOVgzs0A4');
console.log(decoded);
const newDecoded = tokenContext.verifyToken(token);
console.log(newDecoded);
