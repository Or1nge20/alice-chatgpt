const OPENAI_URL = "https://api.openai.com/v1/responses";

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
          text: "Я получила ваш запрос, но не услышала вопрос.",
          end_session: false
        },
        version: "1.0"
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error("OPENAI_API_KEY отсутствует");
      return res.status(200).json({
        response: {
          text: "API ключ OpenAI не найден.",
          end_session: false
        },
        version: "1.0"
      });
    }

    const openai = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        input: text,
        max_output_tokens: 300
      })
    });

    const data = await openai.json();

    console.log("OPENAI STATUS:", openai.status);

    if (!openai.ok) {
      console.error("OPENAI ERROR:", data);
      return res.status(200).json({
        response: {
          text: "OpenAI не смог обработать запрос.",
          end_session: false
        },
        version: "1.0"
      });
    }

    const answer =
      data.output_text ||
      "OpenAI не вернул текст.";

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
        text: "Произошла ошибка на сервере.",
        end_session: false
      },
      version: "1.0"
    });
  }
}
