const express = require("express");
const path = require("path");

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "templates"));
app.use(express.static(path.join(__dirname, "public")));

app.get("/send-email", (req, res) => {
  const message =
    "Hello, I would like more information about your services. Could you please send me more details?";
  const yourName = "John Doe";
  const yourEmail = "johndoe@example.com";
  const subject = "Inquiry about Services";

  res.render("contactFormEmail", {
    yourName,
    subject,
    yourEmail,
    message,
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
