// server.js

const express = require('express');
const app = express();
const port = 3000;
const host = 'localhost';

const TelegramBot = require('node-telegram-bot-api');

// replace the value below with the Telegram token you receive from @BotFather
const token = '';

// Create a bot instance
const bot = new TelegramBot(token, { polling: false });

// Replace chatId with the chat ID of the user or group you want to send the message to
const chatId = '';
const chatId1 = '';



const { Client } = require('pg');
const client = new Client({
  user: 'postgres',
  password: '12345',
  port: 5432,
  database: 'monitoring',
  client_encoding: 'UTF8'
});

client.connect();


const os = require('os');

function getMemoryLoad() {
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  const usedMemoryPercentage = (100 * usedMemory / totalMemory);
  if (usedMemoryPercentage > 70) {
    bot.sendMessage(chatId, 'Больше 70%');
    bot.sendMessage(chatId1, 'Больше 70%');
  };
  return usedMemoryPercentage;
}

  // Выполнить SQL запрос на добавление данных в таблицу monitoring
function writeDataToDB() {


  const query = {
    text: 'INSERT INTO data (time, value) VALUES (to_timestamp($1/1000.0), $2*1.0)',
    values: [Date.now(), getMemoryLoad()],
  };

  client.query(query, (err, res) => {
    if (err) {
      console.error(err);
    } else {
      console.log('Data has been added to monitoring table');
    }
  });
};

// Установить интервал для записи данных в базу данных с периодичностью в 10 секунд
setInterval(writeDataToDB, 1000);

// Подключиться к базе данных
client.connect((err) => {
  if (err) {
    console.error('Connection error', err.stack);
  } else {
    console.log('Connected to PostgreSQL database');
  }
});

app.get('/data', (req, res) => {
  client.query('SELECT * FROM data', (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error retrieving data from the database');
    } else {
      res.json(result.rows);
    }
  });
});


  app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
  }); 

app.listen(port, function () {
  console.log(`Server running at http://${host}:${port}/`);
});
