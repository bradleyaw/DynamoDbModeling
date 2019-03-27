const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const express = require('express')
const AWS = require('aws-sdk');
const uuidv4 = require('uuid/v4');

const USERS_TABLE = process.env.USERS_TABLE;
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const app = express()


app.use(bodyParser.json({ strict: false }));

app.get('/', function (req, res) {
  res.send('Dynamo Rocks!')
})

// Get User endpoint
app.get('/users/:userId', function (req, res) {
  const params = {
    TableName: USERS_TABLE,
    Key: {
      userId: req.params.userId,
    },
  }

  dynamoDb.get(params, (error, result) => {
    if (error) {
      console.log(error);
      res.status(400).json({ error: 'Could not get user' });
    }
    if (result.Item) {
      const {userId, name} = result.Item;
      res.json({ userId, name });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });
})

// Create User endpoint
app.post('/users', function (req, res) {
  const userId = uuidv4();
  const { name } = req.body;
  if (typeof name !== 'string') {
    res.status(400).json({ error: 'Name must be a string' });
  }

  const params = {
    TableName: USERS_TABLE,
    Item: {
      userId,
      name
    },
  };

  dynamoDb.put(params, (error) => {
    if (error) {
      console.log(error);
      res.status(400).json({ error: 'Could not create user' });
    }
    res.json({ userId, name });
  });
})

module.exports.handler = serverless(app);