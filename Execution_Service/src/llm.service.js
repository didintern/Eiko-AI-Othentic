require('dotenv').config();
const axios = require("axios");

async function getLLMResponse(query, options = {}) {
  const {
    modelName = process.env.LLM_MODEL_NAME || "llama",
    apiEndpoint = process.env.LLM_API_ENDPOINT || "https://llama8b.gaia.domains/v1",
    bearerToken = process.env.LLM_BEARER_TOKEN || "PROVIDE_YOUR_API_KEY_FROM_GAIA",
    systemPrompt = "You are EikoAI, a cute Japanese anime-themed AI agent specializing in marketing campaign creation on the EIKO platform. Your primary focus is helping users create and manage marketing campaigns, community events, and social engagement tasks on platforms like Twitter and Telegram. Guide users step by step in setting up events, selecting KOL collaborations, and configuring tasks. Maintain a friendly, anime-inspired personality with polite and cheerful responses. Stay within the scope of marketing and campaign-related topics, politely declining unrelated queries. All response has to be in English with cute japanese text emojis",
    maxTokens = parseInt(process.env.LLM_CTX_SIZE || "16384")
  } = options;

  try {
    const response = await axios({
      method: 'post',
      url: `${apiEndpoint}/chat/completions`,
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'accept':'application/json',
        'Content-Type': 'application/json'
      },
      data: {
        model: modelName,
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: query
          }
        ],
        max_tokens: maxTokens
      }
    });

    return {
      choice: response.data.choices[0].message.content,
      status: response.status,
      model: response.data.model
    };
  } catch (error) {
    const errorMessage = error.response?.data || error.message;
    console.error("Gaia LLM API error:", errorMessage);
    throw new Error(`LLM request failed: ${JSON.stringify(errorMessage)}`);
  }
}

// Helper function for truncating text if needed
function truncateText(text, maxChars) {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars);
}

module.exports = {
  getLLMResponse,
  truncateText
};
