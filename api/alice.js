const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export default async function handler(req, res) {
  try {
    const body = req.body || {};

    const text =
      body.request?.command ||
      body.request?.original_utterance ||
      "";

    console.log("ALICE TEXT:", text);

    if (!text.trim()) {
      return res.status(200).json({
        response: {
          text: "Скажите ваш вопрос.",
          end_session: false
        },
        version: "1.0"
      });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      console.error("OPENROUTER_API_KEY отсутствует");

      return res.status(200).json({
        response: {
          text: "Ключ OpenRouter не найден.",
          end_session: false
        },
        version: "1.0"
      });
    }

    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://alice-chatgpt-six.vercel.app",
        "X-Title": "Alice ChatGPT"
      },
      body: JSON.stringify({
        model: "openrouter/free",
        messages: [
          {
            role: "system",
            content:
              "Ты голосовой помощник Алисы. Отвечай по-русски, кратко и естественно для озвучивания. Не используй markdown."
          },
          {
            role: "user",
            content: text
          }
        ],
        max_tokens: 300
      })
    });

    const data = await response.json();

    console.log("OPENROUTER STATUS:", response.status);

    if (!response.ok) {
      console.error("OPENROUTER ERROR:", data);

      return res.status(200).json({
        response: {
          text: "Не удалось получить ответ от нейросети.",
          end_session: false
        },
        version: "1.0"
      });
    }

    const answer =
      data.choices?.[0]?.message?.content ||
      "Нейросеть не вернула ответ.";

    return res.status(200).json({
      response: {
        text: answer,
        tts: answer,
        end_session: false
      },
      version: "1.0"
    });

  } catch (error) {
    console.error("SERVER ERROR:", error);

    return res.status(200).json({
      response: {
        text: "Произошла ошибка. Попробуйте ещё раз.",
        end_session: false
      },
      version: "1.0"
    });
  }
}
