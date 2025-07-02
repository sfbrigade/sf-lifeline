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

export async function recognizeMedication(image) {
  const imageBuffer = await image.toBuffer();
  const imageBase64 = imageBuffer.toString('base64');

  const payload = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: image.mimetype,
              data: imageBase64,
            },
          },
          {
            type: 'text',
            text: 'In one word, what is the name of the medication in this image?',
          },
        ],
      },
    ],
  };

  const command = new InvokeModelCommand({
    body: JSON.stringify(payload),
    modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
    accept: 'application/json',
    contentType: 'application/json',
  });

  try {
    const response = await bedrock.send(command);
    const result = JSON.parse(response.body.transformToString());
    const medicationName = result.content[0].text;
    return { name: medicationName };
  } catch (error) {
    console.error('Error recognizing medication:', error);
    throw new Error('Failed to recognize medication.');
  }
}
