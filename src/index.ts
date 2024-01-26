import { name, version } from "../package.json";

// import discord.js
import { Client, Events, GatewayIntentBits } from "discord.js";

// message
console.info(`Starting (${name} - v${version})... `);

// constants
const endPunctuation = [".", "...", "!", "?"];
const middlePunctuation = [",", "-", ":", ";", "—", "--"];

// methods
const isMiddlePunctuation = (message: string) => {
	let response = false;
	response = middlePunctuation.some((punctuation) => {
		if (punctuation === message) return true;
	});
	return response;
};
const isEndPunctuation = (message: string) => {
	let response = false;
	response = endPunctuation.some((punctuation) => {
		if (punctuation === message) return true;
	});
	return response;
};

// create a new Client instance
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
});

// listen for the client to be ready
client.once(Events.ClientReady, (client) => {
	console.log(`Discord Bot (${client.user.username}) Connected!`);
});

// listen for messages
client.on(Events.MessageCreate, (message) => {
	// ignore bot messages
	if (message.author.bot) return;

	// message is in correct channel
	if (message.channel.id === process.env.STORY_CHANNEL) {
		// detect period (full stop for EU-ers)
		if (isEndPunctuation(message.content)) {
			// get punctuation
			let punctuation = message.content;

			// fetch up to 100 past messages in channel
			message.channel.messages.fetch({ limit: 100 }).then((messages) => {
				// init sentence
				let words: string[] = [];

				// find words in sentence
				messages.some((word) => {
					// ignore latest period
					if (word.id === message.id) return false;

					// ignore bot messages
					if (word.author.bot) return false;

					// detected previous period
					if (isEndPunctuation(word.content)) return true;

					// add word to words list
					words.unshift(word.content.trim());
				});

				// create sentence
				let sentence = "";
				for (const word of words) {
					if (isMiddlePunctuation(word)) {
						sentence += word;
					} else sentence += " " + word;
				}

				// send completed sentence
				message.channel.send(sentence + punctuation);
			});
		}

		// word checks
		if (message.content.trim().includes(" ")) {
			message.author.send({
				content:
					"Please only send 1 word at a time in the one-word-stories channel...",
			});
			message.delete();
		}
	}
});

// login with the token from .env.local
client.login(process.env.DISCORD_TOKEN);
