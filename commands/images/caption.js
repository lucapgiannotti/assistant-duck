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

		// Create a canvas the same size as the image
		registerFont('./src/Impact 400.ttf', { family: 'Impact' })

		const canvas = createCanvas(image.width, image.height+60);
		const ctx = canvas.getContext('2d');

		// Draw the image onto the canvas
		ctx.drawImage(image, 0, 60);

		// Set the font and fill style for the caption
		ctx.font = '48px Impact';
		ctx.fillStyle = 'white';
		ctx.textAlign = 'center';

		// Add the white bar at the top of the image
		ctx.fillRect(0, 0, image.width, 60);

		// Add the caption to the top of the image
		ctx.fillStyle = 'black';

		ctx.fillText(caption, image.width / 2, 60 / 2 + 20); // The "+ 10" is to adjust the text position within the bar

		// Convert the canvas to a Buffer
		const buffer = canvas.toBuffer('image/png');

		// Create a new attachment with the buffer
		const newAttachment = new AttachmentBuilder(buffer, 'captioned-image.png');

		// Send the new attachment as a reply
		await inter.editReply({ files: [newAttachment] });
	},
};
