var socket = io("http://localhost:3000")
var messageInput = document.getElementById("messageInput")
var sendButton = document.getElementById("sendButton")

window.onload = function () {
  const messageInput = document.getElementById("messageInput")
  messageInput.focus()

  messageInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      // Add your message sending code here
      event.preventDefault()
      sendButton.click()
      // Refocus the input after the message is sent
      messageInput.focus()
    }
  })

  fetch("http://localhost:3000/messages")
    .then((response) => response.text())
    .then((data) => {
      var messages = document.getElementById("messages")
      var messageArray = data.split("\n")
      messageArray.forEach((msg) => {
        messages.innerHTML += msg
      })
    })
}

sendButton.onclick = function () {
  var message = messageInput.value
  socket.emit("message", message)
  messageInput.value = ""
}

socket.on("message", function (msg) {
  var messages = document.getElementById("messages")
  console.log(msg)
  messages.innerHTML += newMessage
})

document.getElementById("deleteButton").onclick = function () {
  fetch("http://localhost:3000/delete").then((response) => {
    if (response.ok) {
      document.getElementById("messages").innerHTML = ""
    } else {
      console.error("Failed to delete chat history")
    }
  })
}
