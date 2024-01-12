import { name, version } from "../package.json";

// import discord.js
import { Client, Events, GatewayIntentBits } from "discord.js";

// message
console.info(`Starting (${name} - v${version})... `);

// methods
const isPunctuation = (message: string) => {
	if (
		message === "." ||
		message === "!" ||
		message === "?" ||
		message === "..."
	)
		return true;
	else return false;
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
		if (isPunctuation(message.content)) {
			// get punctuation
			let punctuation = message.content;

			// fetch up to 100 past messages in channel
			message.channel.messages.fetch({ limit: 100 }).then((messages) => {
				// init sentence
				let sentence: string[] = [];

				// create sentence using messages
				messages.some((word) => {
					// ignore latest period
					if (word.id === message.id) return false;

					// ignore bot messages
					if (word.author.bot) return false;

					// detected previous period
					if (isPunctuation(word.content)) return true;

					// add word to sentence
					sentence.unshift(word.content.trim());
				});

				// send completed sentence
				message.channel.send(sentence.join(" ") + punctuation);
			});
		}
	}
});

// login with the token from .env.local
client.login(process.env.DISCORD_TOKEN);
