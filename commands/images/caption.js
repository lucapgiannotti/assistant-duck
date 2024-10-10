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
		const fontSize = image.height * 0.08; // 8% of the image height

		// Create a canvas to measure the text
		registerFont('./src/Impact 400.ttf', { family: 'Impact' });
		const tempCanvas = createCanvas(image.width, image.height);
		const tempCtx = tempCanvas.getContext('2d');
		tempCtx.font = `${fontSize}px Impact`;

		// Function to wrap text and calculate the required height
		function wrapText(context, text, maxWidth, lineHeight) {
			const words = text.split(' ');
			let line = '';
			let lines = [];

			for (let n = 0; n < words.length; n++) {
				let testLine = line + words[n] + ' ';
				let metrics = context.measureText(testLine);
				let testWidth = metrics.width;
				if (testWidth > maxWidth && n > 0) {
					lines.push(line);
					line = words[n] + ' ';
				} else {
					line = testLine;
				}
			}
			lines.push(line);
			return lines;
		}

		const lines = wrapText(tempCtx, caption, image.width - 20, fontSize);
		const barHeight = (lines.length + .3) * fontSize; // Add an extra line height for padding

		// Create a canvas the same size as the image plus the bar height
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
		const textY = fontSize; // Start at the font size height

		// Draw the caption text
		lines.forEach((line, index) => {
			ctx.fillText(line, image.width / 2, textY + index * fontSize);
		});

		// Convert the canvas to a Buffer
		const buffer = canvas.toBuffer('image/png');

		// Create a new attachment with the buffer
		const newAttachment = new AttachmentBuilder(buffer, 'captioned-image.png');

		// Send the new attachment as a reply
		await inter.editReply({ files: [newAttachment] });
	},
};
