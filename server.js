import express from "express";
import cors from "cors";
import "dotenv/config";

import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";


//Custom route
import cartRouter from "./routes/cartRoute.js"
import gameRouter from "./routes/gameRoute.js"
// import newsRouter from "./routes/newsRoute.js"
// import orderRouter from "./routes/orderRoute.js"
import userRouter from "./routes/userRoute.js"

//AppConfig
const app = express();
const port = process.env.PORT || 4000;


//Service connection
connectDB();
connectCloudinary();


//Middleware
app.use(express.json());


// Define the list of allowed origin
const allowedOrigins = [
    "http://localhost:5173", // For local development
    "http://localhost:5174", // For local development
    "http://localhost:5175", // For local development
    "http://localhost:5176", // For local development
    "http://localhost:5177", // For local development
];

// Configure CORS
app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (e.g., mobile apps or curl)
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) {
                callback(null, true); // Allow the origin
            } else {
                callback(new Error("Not allowed by CORS")); // Block the origin
            }
        },
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true, // Allow cookies or Authorization headers
    })
);


//API endpoints
app.use("/api/cart", cartRouter);
app.use("/api/game", gameRouter);
// app.use("/news", newsRouter);
// app.use("/order", orderRouter);
app.use("/api/user", userRouter);


app.get("/", (req, res) => {
    res.send("API Working NaaJaa🍀");
});

app.listen(port, () =>
    console.log(`Server start on PORT: http://localhost:${port} Naajaa eiei za🌈`)
)