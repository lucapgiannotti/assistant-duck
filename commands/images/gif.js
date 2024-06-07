const { ApplicationCommandOptionType, AttachmentBuilder } = require('discord.js');
const Canvas = require('canvas');
const GIFEncoder = require('gifencoder');
const fs = require('fs');

module.exports = {
	name: 'gif',
	description: 'Convert an image to a GIF',
	options: [
		{
			name: 'image',
			description: 'Image that you want to convert to a GIF!',
			type: ApplicationCommandOptionType.Attachment,
			required: true,
		}
	],
	async execute({ inter }) {
		var imageAttachment = inter.options.getAttachment('image')
		await inter.deferReply()

		if (!imageAttachment) {
			return inter.reply('Please provide a valid image attachment.');
		}

		try {
			// Load the image using Canvas
			const image = await Canvas.loadImage(imageAttachment.url);
			const width = image.width;
			const height = image.height;

			// Create a GIF encoder
			const encoder = new GIFEncoder(width, height);
			const tempFilePath = `./temp_${Date.now()}.gif`;

			// Stream the output to a file
			const stream = encoder.createReadStream().pipe(fs.createWriteStream(tempFilePath));

			encoder.start();
			encoder.setRepeat(0); // 0 for repeat, -1 for no-repeat
			encoder.setDelay(500); // frame delay in ms
			encoder.setQuality(10); // image quality, 10 is default

			const canvas = Canvas.createCanvas(width, height);
			const ctx = canvas.getContext('2d');

			// Add frames to the GIF
			for (let i = 0; i < 10; i++) { // Adjust the loop as necessary for your needs
				ctx.drawImage(image, 0, 0, width, height);
				encoder.addFrame(ctx);
			}

			encoder.finish();

			// Wait for the file to be fully written
			await new Promise((resolve, reject) => {
				stream.on('finish', resolve);
				stream.on('error', reject);
			});

			// Send the GIF as a reply
			const attachment = new AttachmentBuilder(tempFilePath);
			await inter.editReply({ files: [attachment] });

			// Remove the temp file
			fs.unlinkSync(tempFilePath);
		} catch (error) {
			console.error(error);
			inter.reply('There was an error processing your request.');
		}
	},
};
