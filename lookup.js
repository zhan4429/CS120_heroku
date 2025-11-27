const http = require("http");
const url = require("url");
const MongoClient = require("mongodb").MongoClient;
const dburl =
  "mongodb+srv://yzhang85:571798@cluster0.cwimjhw.mongodb.net/?appName=Cluster0";

let port = process.env.PORT || 3000;
// let port = 8080;

http
  .createServer(async function (req, res) {
    res.writeHead(200, { "Content-Type": "text/html" });
    let q = url.parse(req.url, true);
    // homepage
    if (q.pathname == "/") {
      s =
        "<h2>Enter name or zip for a place</h2>" +
        "<form action='/process' method='get'>" +
        "Place name or Zip: <input type='text' name='place'>" +
        "<input style='margin: 0 10px' type='submit'>" +
        "</form>";
      res.write(s);
      res.end();
      // process page
    } else if (q.pathname == "/process") {
      console.log("Processing request...");
      let userInput = q.query.place;
      const client = new MongoClient(dburl);
      try {
        await client.connect();
        console.log("Connected to MongoDB.");
        let dbo = client.db("assignment");
        let collection = dbo.collection("places");
        // determine if input is zip code or place name
        let result;
        if (!isNaN(userInput.charAt(0))) {
          result = await collection.findOne({ zips: userInput });
        } else {
          result = await collection.findOne({ place: userInput });
        }
        if (result) {
          res.write("<br>Found place: " + result.place);
          res.write("<br>Zip codes: " + result.zips.join(", "));
        } else {
          res.write("<br>No matching place found.");
        }
      } catch (err) {
        console.error("Error:", err);
        res.write("<br>Error occurred while processing your request.");
      } finally {
        client.close();
        res.end();
      }
    }
  })
  .listen(port);
