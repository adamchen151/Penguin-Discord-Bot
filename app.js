import 'dotenv/config';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
} from 'discord-interactions';
import { VerifyDiscordRequest, getRandomEmoji, DiscordRequest, getRandomResponse, getPopulation, capitalize, getUserCount } from './utils.js';
import { getShuffledOptions, getResult } from './game.js';
import { createRequire } from 'node:module'; // For OpenAI

const require = createRequire(import.meta.url);
const axios = require('axios');

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));




// Store for in-progress games. In production, you'd want to use a DB
const activeGames = {};

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 */
app.post('/interactions', async function (req, res) {
  // Interaction type and data
  const { type, id, data } = req.body;

  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    // "penguin" command
    if (name === 'penguin' && id) {
      // User's species choice
      const species = req.body.data.options[0].value; 
      
      // Get text because my function isn't working for some reason
      const prompt = 'Write 2-3 sentences about ' + species + ' penguins';
      const response = await axios.post('https://api.openai.com/v1/engines/text-davinci-003/completions', {
          prompt: prompt,
          max_tokens: 250,
      }, {
          headers: {
              'Authorization': `Bearer ` + process.env.OPENAI_API_KEY,
              'Content-Type': 'application/json'
          }
      });
      const text = response.data.choices[0].text.trim();
      
      // Send a message into the channel where command was triggered from
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: '## __' + capitalize(species) + ' Penguins__\n' + text + ' 🐧',
        },
      });
    }
    
    // "population" command
    if (name === 'population' && id) {
      // User's species choice 
      const species = req.body.data.options[0].value; 
      // Send a message into the channel where command was triggered from
      let population = getPopulation(species);
      
      let comparison = (population / 4500).toFixed(1) + ' times the amount of tigers left in the wild or '+ (population / 3000000).toFixed(4) + ' times the number of people in Toronto'
      
      // Send a message into the channel where command was triggered from
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'The population of ' + capitalize(species) + ' penguins is ' + population + ', which is ' + comparison,
        },
      });
    }
    
    // "8-ball" command
    if (name === '8-ball' && id) {
      // User's object choice
      const objectName = req.body.data.options[0].value;

      // Send a message into the channel where command was triggered from
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'Penguin thinks: ' + getRandomResponse(),
        },
      });
    }
    
    // "challenge" command
    if (name === 'challenge' && id) {
        const userId = req.body.member.user.id;
        // User's object choice
        const objectName = req.body.data.options[0].value;

        // Create active game using message ID as the game ID
        activeGames[id] = {
            id: userId,
            objectName,
        };

        return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
            content: `Rock papers scissors challenge from <@${userId}>`,
            components: [
            {
                type: MessageComponentTypes.ACTION_ROW,
                components: [
                {
                    type: MessageComponentTypes.BUTTON,
                    // Append the game ID to use later on
                    custom_id: `accept_button_${req.body.id}`,
                    label: 'Accept',
                    style: ButtonStyleTypes.PRIMARY,
                },
                ],
            },
            ],
        },
        });
    }
    
    // "button" command
    if (data.name === 'button' && id) {
      // Send a message with a button
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'Penguin button',
          // Buttons are inside of action rows
          components: [
            {
              type: MessageComponentTypes.ACTION_ROW,
              components: [
                {
                  type: MessageComponentTypes.BUTTON,
                  // Value for your app to identify the button
                  custom_id: 'my_button',
                  label: '🐧',
                  style: ButtonStyleTypes.PRIMARY,
                },
              ],
            },
          ],
        },
      });
    }
    
    // "vote" command
    if (data.name === 'vote') {
      
    }
  }
  
  if (type === InteractionType.MESSAGE_COMPONENT) {
    // custom_id set in payload when sending message component
    const componentId = data.custom_id;
   
    
    if (componentId === 'my_button') {
      // user who clicked button
      const userId = req.body.member.user.id;
      
      let user_count = 0;
      // example usage
      getUserCount('some_user_id')
        .then(count => {
          user_count = count;
        
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: `<@${userId}> clicked the penguin button 🐧. <@${userId}> has clicked the penguin button ` + user_count + ' times.'},
          });
        
        })
        .catch(err => {
          console.error(err);
        });
      
      //console.log(req.body);
    }

    if (componentId.startsWith('accept_button_')) {
      // get the associated game ID
      const gameId = componentId.replace('accept_button_', '');
      // Delete message with token in request body
      const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/${req.body.message.id}`;
      try {
        await res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            // Fetches a random emoji to send from a helper function
            content: 'What is your object of choice?',
            // Indicates it'll be an ephemeral message
            flags: InteractionResponseFlags.EPHEMERAL,
            components: [
              {
                type: MessageComponentTypes.ACTION_ROW,
                components: [
                  {
                    type: MessageComponentTypes.STRING_SELECT,
                    // Append game ID
                    custom_id: `select_choice_${gameId}`,
                    options: getShuffledOptions(),
                  },
                ],
              },
            ],
          },
        });
        // Delete previous message
        await DiscordRequest(endpoint, { method: 'DELETE' });
      } catch (err) {
        console.error('Error sending message:', err);
      }
    } else if (componentId.startsWith('select_choice_')) {
      // get the associated game ID
      const gameId = componentId.replace('select_choice_', '');

      if (activeGames[gameId]) {
        // Get user ID and object choice for responding user
        const userId = req.body.member.user.id;
        const objectName = data.values[0];
        // Calculate result from helper function
        const resultStr = getResult(activeGames[gameId], {
          id: userId,
          objectName,
        });

        // Remove game from storage
        delete activeGames[gameId];
        // Update message with token in request body
        const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/${req.body.message.id}`;

        try {
          // Send results
          await res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: resultStr },
          });
          // Update ephemeral message
          await DiscordRequest(endpoint, {
            method: 'PATCH',
            body: {
              content: 'Nice choice 🐧', //  + getRandomEmoji()
              components: []
            }
          });
        } catch (err) {
          console.error('Error sending message:', err);
        }
      }
    }
  }
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
