const os = require('os');
const Discord = require('discord.js');
const ws = require('ws');
const package = require('../../package.json');


module.exports = {
    name: 'status',
    description: "Get core information about the bot and the system hosting it!",
    async execute({ client, inter }) {
        const version = package.version;
		const processMemoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + ' MB';
		const totalMemoryUsage = (os.totalmem() / 1024 / 1024).toFixed(2) + ' MB';
		const botUptime = formatTime(client.uptime);
		function formatTime(milliseconds) {
			const seconds = Math.floor(milliseconds / 1000);
			const minutes = Math.floor(seconds / 60);
			const hours = Math.floor(minutes / 60);
			const days = Math.floor(hours / 24);

			return `${days} days, ${hours % 24} hours, ${minutes % 60} minutes, ${seconds % 60} seconds`;
		}

		const connectionUptime = formatTime(client.ws.ping);
		function formatTime(milliseconds) {
			const seconds = Math.floor(milliseconds / 1000);
			const minutes = Math.floor(seconds / 60);
			const hours = Math.floor(minutes / 60);
			const days = Math.floor(hours / 24);

			return `${days} days, ${hours % 24} hours, ${minutes % 60} minutes, ${seconds % 60} seconds`;
		}

        const host = os.hostname();
        const library = "discord.js" + package.dependencies['discord.js']
        const nodeVersion = process.version;
        const servers = client.guilds.cache.size;



		const embed = new Discord.EmbedBuilder()
					.setAuthor({ name: client.user.username + " ~ status", iconURL: client.user.avatarURL({ dynamic: true })})
					.setColor('#E67F1A')
					.setDescription(`This application is managed by **squidnugget77**!`)
					.addFields(
						{ name: `Version`, value: `${version}` },
						{ name: `Process Memory Usage`, value: `${processMemoryUsage}` },
						{ name: `Total Memory Usage`, value: `${totalMemoryUsage}` },
						{ name: `Bot Uptime`, value: `${botUptime}`},
						{ name: `Connection Uptime`, value: `${connectionUptime}`},
						{ name: `Host`, value: `${host}`},
						{ name: `Library`, value: `${library}`},
						{ name: `Node Version`, value: `${nodeVersion}`},
						{ name: `Servers`, value: `${servers}`}
						)
					.setTimestamp()


				inter.reply({ embeds: [embed]})
        // Send the information back, or do something with it
    },
};