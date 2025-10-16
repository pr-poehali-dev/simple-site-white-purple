CREATE TABLE IF NOT EXISTS greeting_settings (
  id SERIAL PRIMARY KEY,
  message TEXT NOT NULL,
  image_url TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO greeting_settings (message, image_url) 
VALUES ('Добро пожаловать!', 'https://cdn.poehali.dev/projects/5575572e-9552-4ad2-b010-e12c5cc8067f/files/75543a6c-c893-4198-a0ba-6b48e331eb86.jpg')
ON CONFLICT DO NOTHING;