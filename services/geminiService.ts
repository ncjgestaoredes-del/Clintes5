
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getDebtStrategy = async (customer: any, transactions: any[]) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        Analyze this customer's debt profile and suggest a recovery strategy.
        Customer: ${customer.name}
        Total Debt: R$ ${customer.totalDebt}
        History: ${JSON.stringify(transactions)}
      `,
      config: {
        systemInstruction: "Você é um consultor financeiro especialista em recuperação de crédito amigável. Forneça conselhos em Português do Brasil.",
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Não foi possível gerar uma estratégia no momento.";
  }
};
