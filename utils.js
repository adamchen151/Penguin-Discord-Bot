import 'dotenv/config';
import fetch from 'node-fetch';
import { verifyKey } from 'discord-interactions';
import { createRequire } from 'node:module'; // For MySQL connection
const require = createRequire(import.meta.url);

const sqlite3 = require('sqlite3').verbose();

export function VerifyDiscordRequest(clientKey) {
  return function (req, res, buf, encoding) {
    const signature = req.get('X-Signature-Ed25519');
    const timestamp = req.get('X-Signature-Timestamp');

    const isValidRequest = verifyKey(buf, signature, timestamp, clientKey);
    if (!isValidRequest) {
      res.status(401).send('Bad request signature');
      throw new Error('Bad request signature');
    }
  };
}

export async function DiscordRequest(endpoint, options) {
  // append endpoint to root API URL
  const url = 'https://discord.com/api/v10/' + endpoint;
  // Stringify payloads
  if (options.body) options.body = JSON.stringify(options.body);
  // Use node-fetch to make requests
  const res = await fetch(url, {
    headers: {
      Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'User-Agent': 'DiscordBot (https://github.com/discord/discord-example-app, 1.0.0)',
    },
    ...options
  });
  // throw API errors
  if (!res.ok) {
    const data = await res.json();
    console.log(res.status);
    throw new Error(JSON.stringify(data));
  }
  // return original response
  return res;
}

export async function InstallGlobalCommands(appId, commands) {
  // API endpoint to overwrite global commands
  const endpoint = `applications/${appId}/commands`;

  try {
    // This is calling the bulk overwrite endpoint: https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands
    await DiscordRequest(endpoint, { method: 'PUT', body: commands });
  } catch (err) {
    console.error(err);
  }
}

// Simple method that returns a random emoji from list
export function getRandomEmoji() {
  const emojiList = ['😭','😄','😌','🤓','😎','😤','🤖','😶‍🌫️','🌏','📸','💿','👋','🌊','✨'];
  return emojiList[Math.floor(Math.random() * emojiList.length)];
}

// Create 8-ball responses array
export function getRandomResponse() {
  const responses = [
  'It is certain.',
  'It is decidedly so.',
  'Without a doubt.',
  'Yes - definitely.',
  'You may rely on it.',
  'As I see it, yes.',
  'Most likely.',
  'Outlook good.',
  'Yes.',
  'Signs point to yes.',
  'Reply hazy, try again.',
  'Ask again later.',
  'Better not tell you now.',
  'Cannot predict now.',
  'Concentrate and ask again.',
  'Don\'t count on it.',
  'My reply is no.',
  'My sources say no.',
  'Outlook not so good.',
  'Very doubtful.'
];
  return responses[Math.floor(Math.random() * responses.length)];
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/*
export function getPenguinText(str) {
  let text = {
    "adelie": "This penguin is known for the white ring surrounding its eyes and its black tail. They live along the coastline of Antarctica.",
    "african": "Also known as 'jackass penguins' because of their donkey-like braying call, these birds are found on the southwestern coast of Africa. They have pink glands above their eyes and a black stripe and spots on their chests.",
    "chinstrap": "Recognizable by the thin black band under their heads, Chinstrap penguins inhabit the islands of the Antarctic Ocean. They are one of the boldest and most aggressive types of penguins.",
    "emperor": "These are the largest species of penguins and can stand up to 48 inches tall. They live in Antarctica and are famous for their extensive child-rearing process.",
    "erect-crested": "This type of penguin has a distinguished yellow crest that stands up. They are found in New Zealand and are one of the most mysterious penguin species due to their remote habitat.",
    "fiordland": "These penguins are distinguished by the yellow crest that runs from their eye to the back of their heads. They are found in the South Island of New Zealand and are also known as 'Fiordland Crested Penguins'.",
    "galapagos": "The Galapagos penguin is the only penguin species found north of the equator, on the Galapagos Islands. They are one of the smallest species and have a black line under their chin.",
    "gentoo": "Gentoos are identifiable by the white patch on top of their heads. They are the third-largest penguin species and are found in the Antarctic Peninsula and sub-Antarctic islands.",
    "humboldt": "These penguins are found in South America along the coast of Peru and Chile. They are medium-sized and are distinguished by a black head with a white border running from behind the eye, around the black ear-coverts and chin, to join on the throat.",
    "king": "King Penguins are the second-largest penguin species and look similar to Emperor Penguins but are smaller. They inhabit the sub-Antarctic islands and the coasts of Antarctica.",
    "little": "Also known as Fairy Penguins, these are the smallest species of penguins. They are found along the coastlines of Southern Australia and New Zealand.",
    "macaroni": "Recognizable by their yellow and black crest, these penguins are found in the Subantarctic to the Antarctic Peninsula. They are one of six species of crested penguins.",
    "magellanic": "These medium-sized penguins are found along the coast of Argentina and Chile. They are known for the two black bands between the head and the breast.",
    "rockhopper": "Known for their spiky yellow and black plumes and red eyes, they are one of the smaller species of penguins. They inhabit the sub-Antarctic islands and can jump over the rocks with their strong legs, hence their name.",
    "royal": "These penguins are characterized by their orange beaks and the yellow feathers on their heads. They are found on the sub-Antarctic Macquarie Island and surrounding islands.",
    "snares": "Found in New Zealand's Snares Islands, these medium-sized penguins have a unique crest of yellow feathers on their foreheads. They also have a pink patch at the base of their bill and a black stripe on the underside.",
    "yellow-eyed": "Named for its yellow eyes and yellow band around the back of its head, this penguin is found on the South Island of New Zealand. It's one of the rarest species of penguins in the world."
  };
  return text[str];
}
*/

// Source: https://polarguidebook.com/why-are-penguins-endangered/
export function getPopulation(str) {
  let text = {
    "adelie": 10000000,
    "african": 41700,
    "chinstrap": 8000000,
    "emperor": 476680,
    "erect-crested": 150000,
    "fiordland": 30000, // 12500-50000
    "galapagos": 1200,
    "gentoo": 774000,
    "humboldt": 23800,
    "king": 3200000,
    "little": 469760,
    "macaroni": 26500,
    "magellanic": 2700000, // 2200000-3200000
    "rockhopper": 2900000, // Northern + Southern variant
    "royal": 1700000,
    "snares": 63000,
    "yellow-eyed": 3000 // 2600-3000
  };
  return text[str];
}



export function getUserCount(userId) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database('./database.db', (err) => {
      if (err) {
        console.error(err.message);
      }
      console.log('Connected to the database.');
    });
    
    // Create table
    db.run(`CREATE TABLE IF NOT EXISTS button (user_id TEXT PRIMARY KEY, count INTEGER)`, (err) => {
      if (err) {
        return console.log(err.message);
      }
      console.log('Table created.');
    });
    
    // Start transaction (this allows rollbacks; ensures nothing is commited prematurely)
    db.run('BEGIN TRANSACTION;');

    // Try to increment the count
    db.run(`UPDATE button SET count = count + 1 WHERE user_id = ?;`, [userId], function(err) {
      if (err) {
        reject(err);
        db.run('ROLLBACK;');
      } else if (this.changes === 0) {  // If no row exists with the user_id, insert one
        db.run(`INSERT INTO button(user_id, count) VALUES(?, 1);`, [userId], (err) => {
          if (err) {
            console.log('Error for some reason.');
            reject(err);
            db.run('ROLLBACK;');
          } else {
            console.log('Inserted row.');
          }
        });
      } else {
        console.log('Incremented count.');
      }
    });

    // Commit transaction
    db.run('COMMIT;');

    db.get(`SELECT count FROM button WHERE user_id = ?`, [userId], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row ? row.count : 1); // Like return
      }
    });

    db.close((err) => {
      if (err) {
        console.error(err.message);
      }
      console.log('Closed the database connection.');
    });
  });
}


