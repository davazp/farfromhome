# Far From Home

An experimental game based on latency. Two players fight to defend their home planet and find a new one. The player that conquers the other player's home planet first wins.

## Setup

Requires Node to run. Install dependencies (from the top level directory):

```
yarn
```

then start the dev server:

```
yarn start
```

## Playing

Control the game with your mouse. Left click selects a planet, and right click (or shift-click) orders to send one spaceship to that planet.

Keep in mind that:

- You're sending messages from your home planet (green), and it will take some time for the message to arrive to the selected planet (unless you are sending ships from your home planet)
- Spaceships ping their position back to your home planet, which again takes time to arrive, so the further away a spaceship is from your home planet, the more inaccurate it's position is (or rather, you see the old position of that ship)
- Simply put: It's easier to control ships and respond to threats closer to your home planet, and much harder when you're moving further away.

The first player that conquers the other player's home planet wins (so make sure to defend yours properly).

## Team

**Development**

- David Vázquez Púa ([@davazp](https://github.com/davazp))
- Tijn Kersjes ([@tkers](https://github.com/tkers))
- Andrej Ristevski ([@andrejristevski](https://github.com/andrejristevski))

**Music**

- Tjerk van der Ham ([www.tjerkmuziek.nl](https://www.tjerkmuziek.nl))
