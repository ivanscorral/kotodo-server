import express from 'express';
import router from './routes';
import {FilterBuilder, SQLiteWrapper, FilterType, LogicalOperator, FilterCondition} from './db/sqlite_wrapper';


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
