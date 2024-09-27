const { ApplicationCommandOptionType, AttachmentBuilder } = require('discord.js');
const { registerFont, createCanvas, loadImage } = require('canvas');
const { name } = require('./gif');

module.exports = {
	name: 'caption',
	description: 'Add a caption to the top of an image!',
	options: [
		{
			name: 'image',
			description: 'Image that you want to add a caption to!',
			type: ApplicationCommandOptionType.Attachment,
			required: true,
		},
		{
			name: 'caption',
			description: 'Caption to add to the image!',
			type: ApplicationCommandOptionType.String,
			required: true,
		},
	],
	async execute({ inter }) {
		await inter.deferReply();

		const attachment = inter.options.get('image').attachment;
		const imageUrl = attachment.url;
		const caption = inter.options.get('caption').value;

		// Load the image
		const image = await loadImage(imageUrl);

		// Calculate the dimensions for the white bar and text
		const barHeight = image.height * 0.1; // 10% of the image height
		const fontSize = image.height * 0.08; // 8% of the image height

		// Create a canvas the same size as the image plus the bar height
		registerFont('./src/Impact 400.ttf', { family: 'Impact' });

		const canvas = createCanvas(image.width, image.height + barHeight);
		const ctx = canvas.getContext('2d');

		// Draw the image onto the canvas
		ctx.drawImage(image, 0, barHeight);

		// Set the font and fill style for the caption
		ctx.font = `${fontSize}px Impact`;
		ctx.fillStyle = 'white';
		ctx.textAlign = 'center';

		// Add the white bar at the top of the image
		ctx.fillRect(0, 0, image.width, barHeight);

		// Add the caption to the top of the image
		ctx.fillStyle = 'black';
		// Calculate the y-coordinate for the text to be vertically centered in the bar
		const textY = barHeight / 2 + fontSize / 2 - 5; // Adjust the -5 value as needed for better centering

		// Add the caption to the top of the image
		ctx.fillText(caption, image.width / 2, textY);

		// Convert the canvas to a Buffer
		const buffer = canvas.toBuffer('image/png');

		// Create a new attachment with the buffer
		const newAttachment = new AttachmentBuilder(buffer, 'captioned-image.png');

		// Send the new attachment as a reply
		await inter.editReply({ files: [newAttachment] });
	},
};
