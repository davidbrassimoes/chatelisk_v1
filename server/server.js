const express = require("express")
const socketIO = require("socket.io")
const fs = require("fs")
const cors = require("cors")
const app = express()
const session = require("express-session")
const server = require("http").createServer(app)

// Create a new socket.io instance
const io = socketIO(server, {
  cors: {
    origin: "*", // Allow all origins
    methods: ["GET", "POST"],
  },
})

// Middleware
const sessionMiddleware = session({
  secret: "your secret key",
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: true, // set to true if your website uses HTTPS
    sameSite: "none", // 'lax' by default
  },
})

// Enable CORS
app.use(cors())

// Use the session middleware
app.use(sessionMiddleware)

// Serve the client files
app.use(express.static("../client"))

// Create a new user if one doesn't exist
app.use((req, res, next) => {
  if (!req.session.user) {
    req.session.user = createNewUser() // replace with your user creation function
  }
  next()
})

// Routes
app.get("/messages", (req, res) => {
  fs.readFile("chat.txt", "utf8", (err, data) => {
    if (err) {
      console.error(err)
      res.sendStatus(500)
    } else {
      res.send(data)
    }
  })
})
app.get("/delete", (req, res) => {
  fs.writeFile("chat.txt", "", (err) => {
    if (err) {
      console.error(err)
      res.sendStatus(500)
    } else {
      res.sendStatus(200)
    }
  })
})

// Socket.io
io.use((socket, next) => {
  sessionMiddleware(socket.request, socket.request.res || {}, next)
})
io.on("connection", (socket) => {
  socket.request.session.user = createNewUser()
  const username = socket.request.session.user.username
  const colour = socket.request.session.user.colour

  socket.on("message", (message) => {
    let timestamp = new Date()
    let logMessage = `<p><span class="username" style="color: ${colour};">${username}</span> <span class="timestamp">${formatTimestamp(
      timestamp
    )}</span> <span class="message">${message}</span></p>\n`
    addMessageToChat(logMessage)

    io.emit("message", logMessage)
  })
})

// Helper functions
function createNewUser() {
  return {
    username: getRandomName(),
    colour: getRandomColour(),
  }
}
function getRandomName() {
  // Read the names and numbers from the files
  const names = fs.readFileSync("names.txt", "utf8").split("\n")
  const numbers = fs.readFileSync("numbers.txt", "utf8").split("\n")

  // Select a random name and number
  const name = names[Math.floor(Math.random() * names.length)]
  const number = numbers[Math.floor(Math.random() * numbers.length)]

  let username = name + number
  return username
}
function getRandomColour() {
  return "#" + Math.floor(Math.random() * 16777215).toString(16)
}
function formatTimestamp(timestamp) {
  const date = new Date(timestamp)
  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0") // Months are 0-indexed in JavaScript
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  return `${day}/${month} - ${hours}:${minutes}`
}
function addMessageToChat(message) {
  fs.appendFile("chat.txt", message + "\n", (err) => {
    if (err) throw err
  })
}

// Start the server
server.listen(3000, () => {
  console.log("Server is running on port 3000")
})
