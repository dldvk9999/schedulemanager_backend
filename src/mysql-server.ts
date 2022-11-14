const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");

const app = express();
app.use(fileUpload());

const PORT = process.env.PORT || 8080;

// Set CORS option
app.use(cors());
app.set("trust proxy", 1);

// Parse requests of content-type: application/json
app.use(bodyParser.json());

// Parse requests of content-type: application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());

// RESTful API route for DB
app.use("/", require("./app/mysql/route/route.ts"));

// DB Connection
const database = require("./app/mysql/model/index.ts");
database["sequelizeConfig"].sync();

// Default route for server status
app.get("/", (req, res) => {
    res.json({ message: `Server is running on port ${PORT}` });
});

// Set listen port for request
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
