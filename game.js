import { capitalize } from './utils.js';

export function getResult(p1, p2) {
  let gameResult;
  if (RPSChoices[p1.objectName] && RPSChoices[p1.objectName][p2.objectName]) {
    // o1 wins
    gameResult = {
      win: p1,
      lose: p2,
      verb: RPSChoices[p1.objectName][p2.objectName],
    };
  } else if (
    RPSChoices[p2.objectName] &&
    RPSChoices[p2.objectName][p1.objectName]
  ) {
    // o2 wins
    gameResult = {
      win: p2,
      lose: p1,
      verb: RPSChoices[p2.objectName][p1.objectName],
    };
  } else {
    // tie -- win/lose don't
    gameResult = { win: p1, lose: p2, verb: 'tie' };
  }

  return formatResult(gameResult);
}

function formatResult(result) {
  const { win, lose, verb } = result;
  return verb === 'tie'
    ? `<@${win.id}> and <@${lose.id}> draw because they are lame.`
    : `<@${win.id}>'s **${win.objectName}** ${verb} <@${lose.id}>'s **${lose.objectName}**. <@${win.id}> wins!`;
}

// this is just to figure out winner + verb
const RPSChoices = {
  little: {
    description: 'the smallest',
    king: 'outwaits',
    computer: 'smashes',
    galapagos: 'outsmarts',
  },
  gentoo: {
    description: 'fastest swimmer',
    galapagos: 'swims in a cooler way than',
    wumpus: 'swims farther than',
    little: 'swims faster than',
  },
  galapagos: {
    description: 'fast molter',
    emperor: 'molts on',
    computer: 'cuts cord of',
    king: 'lives higher than',
  },
  king: {
    description: 'the king i guess',
    gentoo: 'asserts dominance over',
    computer: 'corrupts',
    wumpus: 'impresses',
  },
  computer: {
    description: 'an imposter penguin',
    gentoo: 'overwhelms',
    emperor: 'uninstalls firmware for',
    wumpus: 'deletes assets for',
  },
  wumpus: {
    description: 'the purple Discord fella (not a penguin)',
    emperor: 'draws picture on',
    little: 'paints cute face on',
    galapagos: 'admires own reflection with',
  },
  emperor: {
    description: 'the most famous',
    king: 'ignores',
    gentoo: 'is taller than',
    little: 'is bigger than',
  },
};

export function getRPSChoices() {
  return Object.keys(RPSChoices);
}

// Function to fetch shuffled options for select menu
export function getShuffledOptions() {
  const allChoices = getRPSChoices();
  const options = [];

  for (let c of allChoices) {
    // Formatted for select menus
    // https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-option-structure
    options.push({
      label: capitalize(c),
      value: c.toLowerCase(),
      description: RPSChoices[c]['description'],
    });
  }

  return options.sort(() => Math.random() - 0.5);
}
