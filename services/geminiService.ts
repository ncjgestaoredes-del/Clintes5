
import { GoogleGenAI } from "@google/genai";

// Initialize with process.env.API_KEY as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getDebtStrategy = async (customer: any, transactions: any[]) => {
  // Check for API key existence (process.env.API_KEY is handled externally)
  if (!process.env.API_KEY) return "Análise de IA indisponível (Chave não configurada).";
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        Analyze this customer's debt profile and suggest a recovery strategy.
        Customer: ${customer.name}
        Total Debt: R$ ${customer.totalDebt}
        History: ${JSON.stringify(transactions)}
      `,
    });
    // Use .text property instead of .text()
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Não foi possível gerar uma estratégia no momento.";
  }
};
