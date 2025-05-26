const http = require("http");
const url = require("url");
const { Pool } = require("pg");

// Quick and dirty high level user and version indicator, ideally pulled from user credentials for auditing and data mining
const currentUser = "web-user";
const currentVersion = "0.0.1";

const pool = new Pool({
  host: process.env.DB_HOST || "ExercisePostgres",
  port: 5432,
  user: process.env.DB_USER || "web_client",
  password: process.env.DB_PASS || "P@ssw0rd",
  database: process.env.DB_NAME || "exercise",
});

// Function to send data back to the frontend as JSON data
const sendJSON = (res, statusCode, data) => {
  // Set CORS headers otherwise things break
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  res.writeHead(statusCode, { "Content-Type": "application/json" });

  let outputData;
  if (typeof data === "string") {
    try {
      JSON.parse(data);

      // Use the original string since it was already JSON data
      outputData = data;
    } catch (e) {
      // Parsing failed, convert the regular string to JSON
      outputData = JSON.stringify(data);
    }
  } else {
    // Not a string, convert object to JSON
    outputData = JSON.stringify(data);
  }

  res.end(outputData);
};

// Handle preflight OPTIONS check requests
const handleOptionsRequest = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400"); // Cache response for 24 hours
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.writeHead(204); // No Content
  res.end();
};

const parseBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(err);
      }
    });
  });
};

// Data checks for table column data consistency
const validate = (table, data) => {
  const allowedSizes = ["Small", "Medium", "Large"];
  const allowedLLMs = ["ChatGPT", "Groq"];
  const allowedGenders = ["Male", "Female", "Non-binary", "Other"];
  const allowedEmotions = ["None", "Low", "Moderate", "High", "Very High"];
  const allowedStates = ["Pending", "Resolved", "Unresolved"];

  if (table === "company") {
    if (data.size && !allowedSizes.includes(data.size))
      throw new Error("Invalid company size");
    if (data.llm && !allowedLLMs.includes(data.llm))
      throw new Error("Invalid LLM");
    if (!data.name) throw new Error("Company name is required.");
    if (!data.industry) throw new Error("Industry is required.");
    if (!data.llm_api_key) throw new Error("LLM API Key is required.");
  }

  if (table === "persona") {
    if (!data.company_id)
      throw new Error("Company ID is required for persona.");
    if (!data.name) throw new Error("Persona name is required.");
    if (data.gender && !allowedGenders.includes(data.gender))
      throw new Error(`Invalid gender: ${data.gender}`);
    const emotionFields = [
      "base_emotion_joy",
      "base_emotion_trust",
      "base_emotion_fear",
      "base_emotion_surprise",
      "base_emotion_sadness",
      "base_emotion_disgust",
      "base_emotion_anger",
      "base_emotion_anticipation",
    ];
    emotionFields.forEach((e) => {
      if (data[e] && !allowedEmotions.includes(data[e]))
        throw new Error(`Invalid emotion for ${e}: ${data[e]}`);
    });
  }

  if (table === "conversation") {
    if (
      data.conversation_state &&
      !allowedStates.includes(data.conversation_state)
    )
      throw new Error("Invalid conversation state");
    if (!data.persona_id)
      throw new Error("Persona ID is required for conversation.");
  }
};

const handlers = {
  company: {
    insert: async (data) => {
      validate("company", data);
      const result = await pool.query(
        `INSERT INTO company (name, industry, size, llm, llm_api_key, tags, created_by, changed_by, changed_during_version)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [
          data.name,
          data.industry,
          data.size,
          data.llm,
          data.llm_api_key,
          data.tags || "",
          currentUser,
          currentUser,
          currentVersion,
        ]
      );
      return result.rows[0];
    },
    update: async (id, data) => {
      validate("company", data);
      const result = await pool.query(
        `UPDATE company SET name=$1, industry=$2, size=$3, llm=$4, llm_api_key=$5, tags=$6, changed_by=$7, changed_date=CURRENT_TIMESTAMP, changed_during_version=$8 WHERE id=$9 RETURNING *`,
        [
          data.name,
          data.industry,
          data.size,
          data.llm,
          data.llm_api_key,
          data.tags || "",
          currentUser,
          currentVersion,
          id,
        ]
      );
      return result.rows[0];
    },
  },
  persona: {
    insert: async (data) => {
      validate("persona", data);
      const result = await pool.query(
        `INSERT INTO persona (company_id, name, age, gender, location, job_title, interests, challenges,
          base_emotion_joy, base_emotion_trust, base_emotion_fear, base_emotion_surprise,
          base_emotion_sadness, base_emotion_disgust, base_emotion_anger, base_emotion_anticipation, created_by, changed_by, changed_during_version)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19) RETURNING *`,
        [
          data.company_id,
          data.name,
          data.age || 20,
          data.gender,
          data.location,
          data.job_title,
          data.interests,
          data.challenges,
          data.base_emotion_joy,
          data.base_emotion_trust,
          data.base_emotion_fear,
          data.base_emotion_surprise,
          data.base_emotion_sadness,
          data.base_emotion_disgust,
          data.base_emotion_anger,
          data.base_emotion_anticipation,
          currentUser,
          currentUser,
          currentVersion,
        ]
      );
      return result.rows[0];
    },
    update: async (id, data) => {
      validate("persona", data);
      const result = await pool.query(
        `UPDATE persona SET name=$1, age=$2, gender=$3, location=$4, job_title=$5, interests=$6,
          challenges=$7, base_emotion_joy=$8, base_emotion_trust=$9, base_emotion_fear=$10,
          base_emotion_surprise=$11, base_emotion_sadness=$12, base_emotion_disgust=$13,
          base_emotion_anger=$14, base_emotion_anticipation=$15, changed_by=$16, changed_date=CURRENT_TIMESTAMP, changed_during_version=$17 WHERE id=$18 RETURNING *`,
        [
          data.name,
          data.age || 20,
          data.gender,
          data.location,
          data.job_title,
          data.interests,
          data.challenges,
          data.base_emotion_joy,
          data.base_emotion_trust,
          data.base_emotion_fear,
          data.base_emotion_surprise,
          data.base_emotion_sadness,
          data.base_emotion_disgust,
          data.base_emotion_anger,
          data.base_emotion_anticipation,
          currentUser,
          currentVersion,
          id,
        ]
      );
      return result.rows[0];
    },
  },
  conversation: {
    insert: async (data) => {
      validate("conversation", data);
      const result = await pool.query(
        `INSERT INTO conversation (persona_id, name, conversation_state, conversation_summary,
         date_last_message, message_count, score, keywords, is_follow_up_needed, next_step, created_by, changed_by, changed_during_version)
         VALUES ($1,$2,$3,$4,now(),$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
        [
          data.persona_id,
          data.name,
          data.conversation_state,
          data.conversation_summary,
          data.message_count || 0,
          data.score,
          data.keywords,
          data.is_follow_up_needed || 0,
          data.next_step || "",
          currentUser,
          currentUser,
          currentVersion,
        ]
      );
      return result.rows[0];
    },
    update: async (id, data) => {
      validate("conversation", data);
      const result = await pool.query(
        `UPDATE conversation SET name=$1, conversation_state=$2, conversation_summary=$3,
         date_last_message=now(), message_count=$4, score=$5, keywords=$6,
         is_follow_up_needed=$7, next_step=$8, changed_by=$9, changed_date=CURRENT_TIMESTAMP, changed_during_version=$10 WHERE id=$11 RETURNING *`,
        [
          data.name,
          data.conversation_state,
          data.conversation_summary,
          data.message_count,
          data.score,
          data.keywords,
          data.is_follow_up_needed,
          data.next_step,
          currentUser,
          currentVersion,
          id,
        ]
      );
      return result.rows[0];
    },
  },
  conversation_log: {
    insert: async (data) => {
      const result = await pool.query(
        `INSERT INTO conversation_log (conversation_id, is_visible, is_persona_response,
         statement, disposition, emoji, raw_response, created_by, changed_by, changed_during_version)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
        [
          data.conversation_id,
          data.is_visible ?? 1,
          data.is_persona_response,
          data.statement,
          data.disposition,
          data.emoji,
          data.raw_response,
          currentUser,
          currentUser,
          currentVersion,
        ]
      );
      return result.rows[0];
    },
    update: async (id, data) => {
      const result = await pool.query(
        `UPDATE conversation_log SET is_visible=$1, is_persona_response=$2,
         statement=$3, disposition=$4, emoji=$5, raw_response=$6, changed_by=$7, changed_date=CURRENT_TIMESTAMP, changed_during_version=$8 WHERE id=$9 RETURNING *`,
        [
          data.is_visible ?? 1,
          data.is_persona_response,
          data.statement,
          data.disposition,
          data.emoji,
          data.raw_response,
          currentUser,
          currentVersion,
          id,
        ]
      );
      return result.rows[0];
    },
  },
};

const handleRequest = async (req, res) => {
  // Handle OPTIONS preflight requests
  if (req.method === "OPTIONS") {
    handleOptionsRequest(req, res);
    return;
  }

  const parsed = url.parse(req.url, true);
  const method = req.method;
  const path = parsed.pathname;
  const segments = path.split("/").filter(Boolean);
  const queryParams = parsed.query;

  try {
    const table = segments[0];
    const id = segments[1];

    if (!handlers[table] && table !== "chat") {
      // Handle chat endpoint separately
      return sendJSON(res, 400, { error: "Invalid table" });
    }

    // Chat enpoint operation
    if (method === "POST" && path === "/chat") {
      const body = await parseBody(req);
      const { persona_id, conversation_id, user_question } = body;
      if (!persona_id || !user_question) {
        return sendJSON(res, 400, {
          error: "Missing required fields: persona_id or user_question",
        });
      }

      // Get data company, persona and conversation data from DB
      const { rows: queryRows } = await pool.query(
        `
SELECT c.name company_name
		,c.industry
		,c.size
		,c.llm
		,c.llm_api_key
		,c.tags
		,p.name persona_name
		,p.age
		,p.gender
		,p.location
		,p.job_title
		,p.interests
		,p.challenges
		,p.base_emotion_joy
		,p.base_emotion_trust
		,p.base_emotion_fear
		,p.base_emotion_surprise
		,p.base_emotion_sadness
		,p.base_emotion_disgust
		,p.base_emotion_anger
		,p.base_emotion_anticipation
		,coalesce(co.disposition,'None') last_disposition
	FROM company c
		join persona p
			on c.id = p.company_id
		left outer join (
				select cov.persona_id
						,row_number() over (order by cl.id desc) row_num
						,cl.disposition
					from conversation cov
						join conversation_log cl
							on cov.id = cl.conversation_id
					where 1=1
						and cov.id = $1
						and cov.persona_id = $2
						and cov.is_deleted = 0
						and cl.is_deleted = 0
				) co
			on p.id = co.persona_id
				and co.row_num = 1
	where 1=1
		and c.is_deleted = 0
		and p.is_deleted = 0
		and p.id = $3`,
        [conversation_id, persona_id, persona_id]
      );
      const query = queryRows[0];
      if (!query) {
        return sendJSON(res, 404, {
          error: "Persona or company data not found for the given persona_id.",
        });
      }

      const { rows: historyRows } = await pool.query(
        `
SELECT *
	from (
		SELECT is_persona_response
				,statement
				,sort_order
				,id
			FROM conversation_log c
			where 1=1
				and c.conversation_id = $1
				and c.is_deleted = 0
			order by sort_order desc, id desc
			limit 20
		) core
	order by sort_order asc, id asc`,
        [conversation_id]
      );
      const historyQuery = historyRows;

      // Create conversation if not provided
      let currentConversationId = conversation_id;
      if (!currentConversationId) {
        const conversationRes = await handlers.conversation.insert({
          persona_id: persona_id,
          name: "",
          conversation_state: "Pending",
          conversation_summary: "",
          message_count: 1,
          score: 0,
          keywords: "",
          is_follow_up_needed: 0,
          next_step: "",
        });
        currentConversationId = conversationRes.id;
      }

      // Build system prompt
      const promptSystem = `You will ONLY respond with unformatted (no asterisks, ampersands or hyphens) text as a JSON response structured as {"response": "response to question", "disposition": "new one to three word disposition", "emoji": "disposition as an emoji"}.
Make certain the response is a valid JSON structure.
You will respond as ${query.persona_name}.
You work at the ${query.company_name} company which is a ${query.size} ${query.industry} company and involved in ${query.tags}.
You started the day having problems with ${query.challenges} but one or more might be resolved already.
You are ${query.gender} who works as a ${query.job_title} with the ${query.location} branch and your interests include ${query.interests}.
You can express a range of emotions and your emtional baseline to input is joy is ${query.base_emotion_joy}, trust is ${query.base_emotion_trust}, fear is ${query.base_emotion_fear}, surprise is ${query.base_emotion_surprise}, sadness is ${query.base_emotion_sadness}, disgust is ${query.base_emotion_disgust}, anger is ${query.base_emotion_anger}, and anticipation is ${query.base_emotion_anticipation}.
When expressing emotion, ensure it feels natural and proportionate to the situation described in the input as influced by your emtional baseline.`;

      // Build user prompt
      const promptUser = `
YOUR CURRENT DISPOSITION: ${query.last_disposition}
USER QUESTION: ${user_question}`;

      // Build conversation history
      let messagesObj = [];
      messagesObj.push({ role: "system", content: promptSystem });
      if (historyQuery) {
        historyQuery.forEach((row) => {
          messagesObj.push({
            role: row.is_persona_response ? "assistant" : "user",
            content: row.statement
          });
        });
      }
      messagesObj.push({ role: "user", content: promptUser });

      // Determine endpoint
      const llm = query.llm;
      const apiKey = query.llm_api_key;
      let endpoint, headers, payload;

      if (llm === "ChatGPT") {
        endpoint = "https://api.openai.com/v1/responses";
        headers = {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        };
        payload = JSON.stringify({
          model: "gpt-4o",
          input: messagesObj,
        });
      } else if (llm === "Groq") {
        endpoint = "https://api.groq.com/openai/v1/chat/completions";
        headers = {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        };
        payload = JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: messagesObj,
        });
      } else {
        return sendJSON(res, 400, { error: "Unsupported LLM type" });
      }

      try {
        const llmRes = await fetch(endpoint, {
          method: "POST",
          headers,
          body: payload,
        });
        const llmData = await llmRes.json();
        let responseText,
          responseJson,
          currentDisposition,
          currentEmoji,
          currentResponse;

        // Log user query to conversation_log
        await handlers.conversation_log.insert({
          conversation_id: currentConversationId,
          is_persona_response: 0,
          statement: user_question,
          disposition: "",
          emoji: "",
          raw_response: "",
        });

        if (llmData?.choices?.[0]?.message?.content) {
          // Get Groq response
          responseText = llmData.choices[0].message.content.trim();
        } else if (llmData?.output?.[0]?.content?.[0]?.text) {
          // Get ChatGPT response
          responseText = llmData.output[0].content[0].text.trim();
        } else {
          console.error(
            "LLM Response structure unexpected:",
            JSON.stringify(llmData, null, 2)
          );
          return sendJSON(res, 500, {
            error: "Unexpected LLM response structure",
            raw: llmData,
          });
        }

        // Clean up the JSON response from the LLM in case its bad
        try {
          responseJson = JSON.parse(responseText);
          currentDisposition = responseJson.disposition;
          currentEmoji = responseJson.emoji;
          currentResponse = responseJson.response;
        } catch (e) {
          // Hard srub response
          // Remove everything outside the outer {} brackets
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          let cleanedResponseText = "";
          if (jsonMatch) {
            cleanedResponseText = jsonMatch[0];
          } else {
            // If no curly braces found at all, it's not JSON
            return {
              error: `LLM response was not valid JSON and no curly braces found: ${e.message}`,
              raw: responseText,
            };
          }

          // Try to fix malformed JSON issues
          // Simple fix for quote unquoted keys and string values
          // This regex tries to find "word" characters that might be unquoted keys or values
          // and wraps them in double quotes if they are not already.
          let potentiallyFixedJson = cleanedResponseText;
          try {
            // This regex tries to find keys and string values that are not quoted
            // and wraps them in double quotes
            potentiallyFixedJson = potentiallyFixedJson.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":'); // Fix unquoted keys
            potentiallyFixedJson = potentiallyFixedJson.replace(/:(\s*)((?!true|false|null)\b[a-zA-Z0-9_]+\b)/g, ':$1"$2"'); // Fix unquoted string values (basic)

            // Handle trailing commas (common in human-generated JSON)
            potentiallyFixedJson = potentiallyFixedJson.replace(/,\s*([\]}])/g, '$1');

            responseJson = JSON.parse(potentiallyFixedJson);

            currentDisposition = responseJson.disposition;
            currentEmoji = responseJson.emoji;
            currentResponse = responseJson.response;
          } catch (innerError) {
            return {
              error: `LLM response was not valid JSON or missing expected fields after cleanup attempt: ${innerError.message}`,
              raw: responseText,
              cleaned: potentiallyFixedJson, // Include the cleaned version for debugging
            };
          }
        }



        // Log AI response to conversation_log
        await handlers.conversation_log.insert({
          conversation_id: currentConversationId,
          is_persona_response: 1,
          statement: currentResponse,
          disposition: currentDisposition,
          emoji: currentEmoji,
          raw_response: JSON.stringify(llmData),
        });

        // Send back data with conversation_id in case its new
        return sendJSON(res, 200, {
          conversation_id: currentConversationId,
          response: currentResponse,
          disposition: currentDisposition,
          emoji: currentEmoji, // Corrected key to 'emoji'
        });
      } catch (err) {
        console.error("Error communicating with LLM:", err);
        return sendJSON(res, 500, {
          error: "Error processing LLM request",
          detail: err.message,
        });
      }
    }

    // General CRUD operations
    if (method === "GET" && !id) {
      let queryText = `SELECT * FROM ${table} WHERE is_deleted = 0`;
      let queryArgs = [];

      // Special handling for fetching personas by company_id
      if (table === "persona" && queryParams.company_id) {
        queryText += ` AND company_id = $1`;
        queryArgs.push(queryParams.company_id);
      } else if (table === "conversation_log" && queryParams.conversation_id) {
        queryText += ` AND conversation_id = $1 AND is_visible = 1 `;
        queryArgs.push(queryParams.conversation_id);
      } else if (table === "conversation" && queryParams.persona_id) {
        queryText += ` AND persona_id = $1`;
        queryArgs.push(queryParams.persona_id);
      }
      queryText += ` ORDER BY sort_order asc, id asc`;

      const result = await pool.query(queryText, queryArgs);
      return sendJSON(res, 200, result.rows);
    }
    if (method === "GET" && id) {
      const result = await pool.query(
        `SELECT * FROM ${table} WHERE id = $1 AND is_deleted = 0`,
        [id]
      );
      return sendJSON(res, 200, result.rows[0]);
    }
    if (method === "POST") {
      const data = await parseBody(req);
      const record = await handlers[table].insert(data);
      return sendJSON(res, 201, record);
    }
    if (method === "PUT" && id) {
      const data = await parseBody(req);
      const record = await handlers[table].update(id, data);
      return sendJSON(res, 200, record);
    }
    if (method === "DELETE" && id) {
      await pool.query(
        `UPDATE ${table} SET is_deleted = 1, changed_by=$1, changed_date=CURRENT_TIMESTAMP, changed_during_version=$2 WHERE id = $3`,
        [currentUser, currentVersion, id]
      );
      return sendJSON(res, 204, {});
    }
    return sendJSON(res, 405, { error: "Method Not Allowed" });
  } catch (err) {
    // Log errors to console for debugging
    console.error("Backend request error:", err);
    return sendJSON(res, 500, { error: err.message });
  }
};

http
  .createServer(handleRequest)
  .listen(process.env.PORT || 3500, () =>
    console.log("Server running on port", process.env.PORT || 3500)
  );
