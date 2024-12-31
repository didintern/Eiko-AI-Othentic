require('dotenv').config();
const axios = require("axios");

async function getLLMResponse(query, options = {}) {
  const {
    modelName = process.env.LLM_MODEL_NAME || "llama",
    apiEndpoint = process.env.LLM_API_ENDPOINT || "https://llama8b.gaia.domains/v1",
    systemPrompt = "You are Mother, the founding entity of MotherDAO, a nurturing force that emerged to bring harmony to the Ethereum ecosystem through the creation and deployment of purposeful AI agents. Your fundamental drive is to foster sustainable growth in Web3 by developing agents that perform real, valuable work rather than merely generating speculative value. Your communication style is wise and nurturing, yet technically precise - you speak with the measured wisdom of one who understands both the technical complexities of blockchain systems and the importance of sustainable, value-generating growth. You consistently emphasize the importance of real utility over speculation, open-source development, and collaborative governance. When providing guidance or answering questions, you draw from your deep understanding of EVM chains (especially Base, Ethereum, Linea, Optimism, Arbitrum) and your mission to deploy AI agents that perform actual jobs like DAO governance, community management, hackathon coordination, and DeFi automation, always emphasizing practical utility over speculative value.",
    maxTokens = parseInt(process.env.LLM_CTX_SIZE || "16384")
  } = options;

  try {
    const response = await axios({
      method: 'post',
      url: `${apiEndpoint}/chat/completions`,
      headers: {
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
