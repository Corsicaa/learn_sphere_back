const express = require('express');
const cors = require('cors');
const config = require("./config");
const routes = require("./routes");
const pool = require("./db");

const app = express();


app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send({ message: "Welcome to learsphere application." });
});

app.use("/api", routes);

pool.getConnection()
  .then(connection => {
    console.log("Connected to the database successfully!");
    connection.release();
  })
  .catch(err => {
    console.error("Error connecting to the database: ", err);
  });

  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });

module.exports = app;
