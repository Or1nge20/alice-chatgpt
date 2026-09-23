const OPENAI_URL = "https://api.openai.com/v1/responses";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).json({
      response: {
        text: "Навык работает.",
        end_session: false
      },
      version: "1.0"
    });
  }

  try {
    const body = req.body || {};
    const text =
      body.request?.command ||
      body.request?.original_utterance ||
      "";

    if (!text.trim()) {
      return res.status(200).json({
        response: {
          text: "Скажите ваш вопрос.",
          end_session: false
        },
        version: "1.0"
      });
    }

    const response = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        input: [
          {
            role: "system",
            content:
              "Ты голосовой помощник Алисы. Отвечай по-русски, кратко и естественно для озвучивания."
          },
          {
            role: "user",
            content: text
          }
        ],
        max_output_tokens: 500
      })
    });

    const data = await response.json();

    const answer =
      data.output_text ||
      "Не удалось получить ответ.";

    return res.status(200).json({
      response: {
        text: answer,
        tts: answer,
        end_session: false
      },
      version: "1.0"
    });

  } catch (error) {
    console.error(error);

    return res.status(200).json({
      response: {
        text: "Произошла ошибка. Попробуйте ещё раз.",
        end_session: false
      },
      version: "1.0"
    });
  }
}
