const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const express = require('express')
const AWS = require('aws-sdk');
const uuidv4 = require('uuid/v4');

const USERS_TABLE = process.env.USERS_TABLE;
const IS_OFFLINE = process.env.IS_OFFLINE;
let dynamoDb;

dynamoDb = IS_OFFLINE ?
  new AWS.DynamoDB.DocumentClient({
    region: 'localhost',
    endpoint: 'http://localhost:8000'
  })
 : new AWS.DynamoDB.DocumentClient();

const app = express()


app.use(bodyParser.json({ strict: false }));

app.get('/', function (req, res) {
  res.send('Dynamo Rocks!')
})

// Get user by id
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

// Get user by name via scan
app.get('/users', function (req, res) {

    const params = {
      TableName: USERS_TABLE,
      FilterExpression: '#n = :name',
      ExpressionAttributeValues: {':name' : req.query.name},
      ExpressionAttributeNames: {
        "#n": "name"
      }
    }
  
    dynamoDb.scan(params, (error, result) => {
      if (error) {
        console.log(error);
        res.status(400).json({ error: 'Could not get user' });
      }
      if (result) {
        res.json({ result });
      } else {
        res.status(404).json({ error: "User not found" });
      }
    });
  })

// Create user
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