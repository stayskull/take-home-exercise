\c exercise
		
DO $$
DECLARE
    new_company_id INT;
BEGIN
    INSERT INTO company
        (name, industry, size, llm, llm_api_key, tags, created_by, changed_by, changed_during_version)
    VALUES
        ('CADI', 'Education Technology', 'Small', 'Groq', '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', 'Artificial Intelligence, Corporate Training, Sales Enablement, Customer Service Training, Learning & Development, Business Communications, SaaS, Employee Development, EdTech', 'jason', 'jason', '0.0.1')
    RETURNING id INTO new_company_id; -- This captures the auto-generated ID

    INSERT INTO persona
        (company_id, name, age, gender, location, job_title, interests, challenges, base_emotion_joy, base_emotion_trust, base_emotion_fear, base_emotion_surprise, base_emotion_sadness, base_emotion_disgust, base_emotion_anger, base_emotion_anticipation, created_by, changed_by, changed_during_version)
    VALUES
        (new_company_id, 'John Doe', 24, 'Non-binary', 'New York', 'Sales Associate', 'Sky diving, Base jumping, Reddit moderating', 'Bad street tacos last night, Misplaced sales contracts for Microsoft account', 'High', 'Moderate', 'Moderate', 'Low', 'Moderate', 'Very High', 'Very High', 'Very High', 'jason', 'jason', '0.0.1');
END $$;
