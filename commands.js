import 'dotenv/config';
import { getRPSChoices } from './game.js';
import { capitalize, InstallGlobalCommands } from './utils.js';

// Get the game choices from game.js
function createCommandChoices() {
  const choices = getRPSChoices();
  const commandChoices = [];

  for (let choice of choices) {
    commandChoices.push({
      name: capitalize(choice),
      value: choice.toLowerCase(),
    });
  }

  return commandChoices;
}

function createPenguinChoices() {
  let penguins = [
    "Adelie",
    "African",
    "Chinstrap",
    "Emperor",
    "Erect-crested",
    "Fiordland",
    "Galapagos",
    "Gentoo",
    "Humboldt",
    "King",
    "Little",
    "Macaroni",
    "Magellanic",
    "Rockhopper",
    "Royal",
    "Snares",
    "Yellow-eyed"
  ];
  
  let commandChoices = [];
  
  for (let penguin of penguins) {
    commandChoices.push({
      name: penguin,
      value: penguin.toLowerCase(),
    });
  }

  return commandChoices;
}

// Simple test command
const PENGUIN_COMMAND = {
  name: 'penguin',
  description: 'Get information about a penguin species (Powered by OpenAI)',
  options: [
    {
      type: 3,
      name: 'species',
      description: 'Choose a penguin species',
      required: true,
      choices: createPenguinChoices(),
    },
  ],
  type: 1,
};

// Simple test command
const BALL_COMMAND = {
  name: '8-ball',
  description: 'Ask Penguin\'s 8-ball a question (Your question will remain confidential)',
  options: [
    {
      type: 3,
      name: 'question',
      description: 'Ask your question',
      required: true,
    },
  ],
  type: 1,
};

// Simple test command
const POPULATION_COMMAND = {
  name: 'population',
  description: 'Get the population of a penguin species',
  options: [
    {
      type: 3,
      name: 'species',
      description: 'Choose a penguin species',
      required: true,
      choices: createPenguinChoices(),
    },
  ],
  type: 1,
};

// Command containing options
const CHALLENGE_COMMAND = {
  name: 'challenge',
  description: 'Challenge to a match of rock paper scissors - Penguin Edition',
  options: [
    {
      type: 3,
      name: 'object',
      description: 'Pick your object',
      required: true,
      choices: createCommandChoices(),
    },
  ],
  type: 1,
};

// Command with a button
const BUTTON_COMMAND = {
  name: 'button',
  description: 'Penguin\'s button',
  type: 1,
};

const ALL_COMMANDS = [PENGUIN_COMMAND, POPULATION_COMMAND, BALL_COMMAND, CHALLENGE_COMMAND, BUTTON_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);