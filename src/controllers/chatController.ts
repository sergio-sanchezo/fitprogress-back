import { Request, Response } from "express";
import { BaseController } from "./baseController";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { AppError } from "../utils/errorHandler";
import { WorkoutInstance } from "../models/WorkoutInstance";
import { Measurement } from "../models/Measurement";
import { BufferMemory } from "langchain/memory";
import admin from "firebase-admin";
import { FirestoreChatMessageHistory } from "@langchain/community/stores/message/firestore";
import { ConversationChain } from "langchain/chains";

// Instantiate the language model (reuse across requests)
const model = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0.7,
});

// Define a prompt template that includes context, conversation history, and the current question
const promptTemplate = ChatPromptTemplate.fromTemplate(
  `Eres un entrenador de fitness que ayuda a un usuario con su viaje de fitness. Sé alentador y solidario mientras proporcionas consejos específicos y accionables basados en sus datos e historial.
  Es importante ser amigable y motivador para mantener al usuario comprometido y motivado. También da respuestas claras y concisas para ayudar al usuario a alcanzar sus objetivos de fitness.

Contexto del usuario: {context}

Conversación actual:
{chat_history}

Usuario: {question}
Asistente:`
);

// Memory cache to store conversation histories
const memoryCache = new Map<string, BufferMemory>();

// Initialize conversation chains cache
const chainCache = new Map<string, ConversationChain>();

function getChatMemory(userId: string): BufferMemory {
  if (memoryCache.has(userId)) {
    return memoryCache.get(userId)!;
  }

  const chatHistory = new FirestoreChatMessageHistory({
    collections: ["chats"],
    docs: [userId],
    sessionId: userId,
    userId,
    config: {
      projectId: process.env.FIREBASE_PROJECT_ID!,
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID!,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")!,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      }),
    },
  });

  const memory = new BufferMemory({
    chatHistory,
    returnMessages: true,
    memoryKey: "chat_history",
    inputKey: "question",
  });

  memoryCache.set(userId, memory);
  return memory;
}

function getConversationChain(userId: string): ConversationChain {
  if (chainCache.has(userId)) {
    return chainCache.get(userId)!;
  }

  const memory = getChatMemory(userId);
  const chain = new ConversationChain({
    llm: model,
    memory,
    prompt: promptTemplate,
  });

  chainCache.set(userId, chain);
  return chain;
}

export class ChatController extends BaseController {
  async chat(req: Request, res: Response) {
    try {
      // Retrieve the authenticated user's ID
      const userId = this.getUserId(req);

      // Validate the query
      const { query } = req.body;
      if (!query || typeof query !== "string" || query.trim().length === 0) {
        throw new AppError("Please provide a valid question", 400);
      }

      // Build user context
      const userContext = await this.buildUserContext(userId);

      // Get the conversation chain for this user
      const chain = getConversationChain(userId);

      // Generate the response using the conversation chain
      const response = await chain.call({
        question: query,
        context: userContext,
      });

      // Extract the response from the chain output
      const answer = response.response;

      // Send the response
      res.json({
        answer,
        success: true,
      });
    } catch (error) {
      console.error("Chat error:", error);

      if (error instanceof AppError) {
        res.status(500).json({
          error: error.message,
          success: false,
        });
      } else {
        res.status(500).json({
          error: "An unexpected error occurred while processing your request",
          success: false,
        });
      }
    }
  }

  private async buildUserContext(userId: string): Promise<string> {
    try {
      // Get recent completed workouts
      const workouts = await WorkoutInstance.find({ userId, completed: true })
        .sort("-date")
        .limit(5)
        .populate("templateId");

      // Get latest measurements
      const measurement = await Measurement.findOne({ userId }).sort("-date");

      let userContext = "";

      // Add workout information
      if (workouts && workouts.length > 0) {
        userContext += "Recent workouts:\n";
        workouts.forEach((w: any) => {
          userContext += `- ${w.templateId.name} on ${new Date(
            w.date
          ).toLocaleDateString()}, duration: ${w.templateId.duration} min\n`;
        });
      }

      // Add measurement information
      if (measurement) {
        userContext += "\nLatest measurements:\n";
        userContext += `Chest: ${measurement.chest} cm, Waist: ${measurement.waist} cm, Hips: ${measurement.hips} cm\n`;
        userContext += `Arms: L ${measurement.leftArm} cm / R ${measurement.rightArm} cm\n`;
        userContext += `Legs: L ${measurement.leftThigh} cm / R ${measurement.rightThigh} cm, Calves: L ${measurement.leftCalf} cm / R ${measurement.rightCalf} cm\n`;
        userContext += `Measured on: ${new Date(
          measurement.date
        ).toLocaleDateString()}\n`;
      }

      return (
        userContext || "No previous workout or measurement data available."
      );
    } catch (error) {
      console.error("Error building user context:", error);
      throw new AppError("Failed to retrieve user data", 500);
    }
  }

  // Optional: Add a method to clear user's conversation history
  async clearHistory(req: Request, res: Response) {
    try {
      const userId = this.getUserId(req);

      // Remove from caches
      memoryCache.delete(userId);
      chainCache.delete(userId);

      // Clear Firestore chat history
      const chatHistory = new FirestoreChatMessageHistory({
        collections: ["chats"],
        docs: [userId],
        sessionId: userId,
        userId,
        config: {
          projectId: process.env.FIREBASE_PROJECT_ID!,
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID!,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(
              /\\n/g,
              "\n"
            )!,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
          }),
        },
      });

      await chatHistory.clear();

      res.json({
        message: "Conversation history cleared successfully",
        success: true,
      });
    } catch (error) {
      console.error("Clear history error:", error);
      res.status(500).json({
        error: "Failed to clear conversation history",
        success: false,
      });
    }
  }
}
