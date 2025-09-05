import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';

const bedrock = new BedrockRuntimeClient({
  region: process.env.AWS_BEDROCK_REGION,
  credentials: {
    accessKeyId: process.env.AWS_BEDROCK_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_BEDROCK_SECRET_ACCESS_KEY,
  },
});

export async function recognizeMedication (image) {
  const imageBuffer = await image.toBuffer();
  const imageBase64 = imageBuffer.toString('base64');
  let format = image.mimetype;
  if (format.startsWith('image/')) {
    format = format.slice(6);
  }
  const payload = {
    messages: [
      {
        role: 'user',
        content: [
          {
            image: {
              format,
              source: {
                bytes: imageBase64,
              },
            }
          },
          {
            text: 'Identify the medication name in the image. Your response must be only the medication name. Do not include any other words, explanations, or punctuation.',
          },
        ],
      },
    ],
  };

  const command = new InvokeModelCommand({
    body: JSON.stringify(payload),
    modelId: 'us.amazon.nova-lite-v1:0',
    accept: 'application/json',
    contentType: 'application/json',
  });

  try {
    const response = await bedrock.send(command);
    const result = JSON.parse(response.body.transformToString());
    const medicationName = result.output?.message?.content?.[0]?.text;
    return { name: medicationName };
  } catch (error) {
    console.error('Error recognizing medication:', error);
    throw new Error('Failed to recognize medication.');
  }
}
