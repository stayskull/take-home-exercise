\c exercise

CREATE TABLE company (
	id SERIAL PRIMARY KEY,
	sort_order INTEGER NOT NULL DEFAULT 999,
	is_deleted INTEGER NOT NULL DEFAULT 0,
	created_by VARCHAR(50) NOT NULL DEFAULT '',
	created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	changed_by VARCHAR(50) NOT NULL DEFAULT '',
	changed_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	changed_during_version VARCHAR(15) NOT NULL DEFAULT '0.0.1',
	name VARCHAR(255) NOT NULL DEFAULT '',
	industry VARCHAR(100) NOT NULL DEFAULT '',
	size VARCHAR(20) NOT NULL CHECK (size IN ('Small', 'Medium', 'Large')),
	llm VARCHAR(20) NOT NULL CHECK (llm IN ('ChatGPT', 'Groq')),
	llm_api_key VARCHAR(255) NOT NULL DEFAULT '',
	tags TEXT NOT NULL DEFAULT ''
);

-- Create an index on the name column for efficient lookup
CREATE INDEX idx_company_name ON company (name);

-- Create a unique constraint on the name column to prevent duplicates
ALTER TABLE company ADD CONSTRAINT uc_company_name UNIQUE (name);

CREATE TABLE persona (
	id SERIAL PRIMARY KEY,
	sort_order INTEGER NOT NULL DEFAULT 999,
	is_deleted INTEGER NOT NULL DEFAULT 0,
	created_by VARCHAR(50) NOT NULL DEFAULT '',
	created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	changed_by VARCHAR(50) NOT NULL DEFAULT '',
	changed_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	changed_during_version VARCHAR(15) NOT NULL DEFAULT '0.0.1',
	company_id INTEGER NOT NULL,
	name VARCHAR(255) NOT NULL DEFAULT '',
	age INTEGER DEFAULT 20,
	gender VARCHAR(20) NOT NULL CHECK (gender IN ('Male', 'Female', 'Non-binary', 'Other')),
	location VARCHAR(255) NOT NULL DEFAULT '',
	job_title VARCHAR(100) NOT NULL DEFAULT '',
	interests TEXT DEFAULT '',
	challenges TEXT DEFAULT '',
	base_emotion_joy VARCHAR(20) NOT NULL CHECK (base_emotion_joy IN ('None', 'Low', 'Moderate', 'High', 'Very High')),
	base_emotion_trust VARCHAR(20) NOT NULL CHECK (base_emotion_joy IN ('None', 'Low', 'Moderate', 'High', 'Very High')),
	base_emotion_fear VARCHAR(20) NOT NULL CHECK (base_emotion_joy IN ('None', 'Low', 'Moderate', 'High', 'Very High')),
	base_emotion_surprise VARCHAR(20) NOT NULL CHECK (base_emotion_joy IN ('None', 'Low', 'Moderate', 'High', 'Very High')),
	base_emotion_sadness VARCHAR(20) NOT NULL CHECK (base_emotion_joy IN ('None', 'Low', 'Moderate', 'High', 'Very High')),
	base_emotion_disgust VARCHAR(20) NOT NULL CHECK (base_emotion_joy IN ('None', 'Low', 'Moderate', 'High', 'Very High')),
	base_emotion_anger VARCHAR(20) NOT NULL CHECK (base_emotion_joy IN ('None', 'Low', 'Moderate', 'High', 'Very High')),
	base_emotion_anticipation VARCHAR(20) NOT NULL CHECK (base_emotion_joy IN ('None', 'Low', 'Moderate', 'High', 'Very High')),
	CONSTRAINT fk_persona_company_id FOREIGN KEY (company_id) REFERENCES company (id)
);

CREATE INDEX idx_persona_company_id ON persona (company_id);

CREATE TABLE conversation (
	id SERIAL PRIMARY KEY,
	sort_order INTEGER NOT NULL DEFAULT 999,
	is_deleted INTEGER NOT NULL DEFAULT 0,
	created_by VARCHAR(50) NOT NULL DEFAULT '',
	created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	changed_by VARCHAR(50) NOT NULL DEFAULT '',
	changed_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	changed_during_version VARCHAR(15) NOT NULL DEFAULT '0.0.1',
	persona_id INTEGER NOT NULL,
	name VARCHAR(255) NOT NULL DEFAULT '',
	conversation_state VARCHAR(30) NOT NULL CHECK (conversation_state IN ('Pending', 'Resolved', 'Unresolved')) DEFAULT 'Pending', 
	conversation_summary TEXT NOT NULL DEFAULT '',
	date_last_message TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	message_count INTEGER NOT NULL DEFAULT 0,
	score INTEGER,
	keywords TEXT,
	is_follow_up_needed INTEGER,
	next_step TEXT,
	CONSTRAINT fk_conversation_persona_id FOREIGN KEY (persona_id) REFERENCES persona (id)
);

CREATE INDEX idx_conversation_persona_id ON conversation (persona_id);

CREATE TABLE conversation_log (
	id SERIAL PRIMARY KEY,
	sort_order INTEGER NOT NULL DEFAULT 999,
	is_deleted INTEGER NOT NULL DEFAULT 0,
	created_by VARCHAR(50) NOT NULL DEFAULT '',
	created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	changed_by VARCHAR(50) NOT NULL DEFAULT '',
	changed_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	changed_during_version VARCHAR(15) NOT NULL DEFAULT '0.0.1',
	conversation_id INTEGER NOT NULL,
	is_visible INTEGER NOT NULL DEFAULT 1,
	is_persona_response INTEGER NOT NULL,
	statement TEXT NOT NULL,
	disposition VARCHAR(50) NOT NULL DEFAULT '',
	emoji VARCHAR(10) NOT NULL DEFAULT '',
	raw_response TEXT NOT NULL DEFAULT '',
	CONSTRAINT fk_conversation_log_conversation_id FOREIGN KEY (conversation_id) REFERENCES conversation (id)
);

CREATE INDEX idx_conversation_log_conversation_id ON conversation_log (conversation_id);
