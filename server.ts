import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON body parser with increased limit for base64 images
  app.use(express.json({ limit: "20mb" }));

  // Lazy Gemini client initialization
  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI | null {
    if (!aiClient && process.env.GEMINI_API_KEY) {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return aiClient;
  }

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  // Multimodal Gemini endpoint for Barista Mission
  app.post("/api/gemini/analyze-barista", async (req, res) => {
    try {
      const { imageBase64, mimeType = "image/jpeg", studentNickname = "멋진 학생" } = req.body;

      if (!imageBase64) {
        res.status(400).json({ error: "이미지 데이터가 필요합니다." });
        return;
      }

      const client = getGeminiClient();

      if (!client) {
        // Fallback response if GEMINI_API_KEY is not configured yet
        const defaultFeedbacks = [
          `우와, ${studentNickname} 친구! 컵과 빨대, 냅킨까지 완벽하게 준비했네요! 최고예요! ⭐`,
          `정말 멋져요! 손님들이 향긋하고 맛있는 음료를 마시며 활짝 웃을 것 같아요! ⭐`,
          `참 잘했어요! 트레이에 물건들을 가지런히 놓은 모습이 진짜 멋진 바리스타 같아요! ⭐`,
        ];
        const randomFeedback = defaultFeedbacks[Math.floor(Math.random() * defaultFeedbacks.length)];
        res.json({
          feedback: randomFeedback,
          isDemo: true,
          badge: "특급 바리스타",
        });
        return;
      }

      // Format clean base64 data (strip data:image/...;base64, if present)
      const cleanData = imageBase64.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, "");

      const prompt = `당신은 특수교육(기본교육과정) 고등학생을 지도하는 한없이 따뜻하고 친절한 특수학급 바리스타 선생님입니다.
학생('${studentNickname}')이 카페 음료 서빙 준비 실습(컵, 뚜껑, 빨대, 냅킨, 슬리브, 트레이 등)을 하고 찍은 사진입니다.
사진 속의 물건(컵, 빨대, 냅킨 등)을 세심하게 살펴보고, 글을 잘 모르는 학생도 귀로 들었을 때 바로 이해하고 큰 자신감을 얻을 수 있도록 다음 원칙을 반드시 지켜 답변하세요:
1. 초등학교 1학년 수준의 매우 쉽고 다정한 한국어 구어체로 1~2문장 이내로 작성합니다.
2. 예: "우와, ${studentNickname} 친구! 컵과 냅킨을 아주 가지런히 잘 놓았네요! 정말 멋진 바리스타예요! ⭐"
3. 학생의 작은 노력도 무조건 크게 칭찬하고 응원해주세요.
4. 긴 설명이나 어려운 단어는 절대 사용하지 마세요.`;

      const response = await client.models.generateContent({
        model: "gemini-3.8-flash",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType || "image/jpeg",
                data: cleanData,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      });

      const feedback = response.text?.trim() || `우와! 바리스타 준비를 아주 멋지게 해냈어요! 정말 최고예요! ⭐`;

      res.json({
        feedback,
        isDemo: false,
        badge: "특급 바리스타",
      });
    } catch (err: any) {
      console.error("Gemini API call failed:", err);
      // Fallback graceful degradation
      res.json({
        feedback: `우와! 컵과 냅킨을 아주 꼼꼼하게 잘 챙겼어요! 훌륭한 바리스타예요! ⭐`,
        isDemo: true,
        error: err?.message,
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
