const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors")
const app = express();
require('dotenv').config()
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser")
const port = process.env.PORT || 3000

// middle setup
app.use(express.json({limit: "25mb"}))
app.use((express.urlencoded({limit: "25mb"})))
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extented: true}))
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true

}))

//routes
const authRoutes =require('./src/users/user.route');

app.use('/api/auth', authRoutes)


main().then(() =>console.log("mongodb is successfully connected"))
      .catch(err => console.log(err));
      
async function main() {
    await mongoose.connect(process.env.DB_URL);

}


app.get('/', (req, res) => {
  res.send('bigtems server is running!')
});



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})