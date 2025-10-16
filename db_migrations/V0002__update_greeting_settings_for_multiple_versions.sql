ALTER TABLE greeting_settings DROP CONSTRAINT IF EXISTS greeting_settings_pkey;

ALTER TABLE greeting_settings ALTER COLUMN id TYPE TEXT;

ALTER TABLE greeting_settings ADD PRIMARY KEY (id);

INSERT INTO greeting_settings (id, message, image_url) 
VALUES ('default', 'Добро пожаловать!', 'https://cdn.poehali.dev/projects/5575572e-9552-4ad2-b010-e12c5cc8067f/files/75543a6c-c893-4198-a0ba-6b48e331eb86.jpg')
ON CONFLICT (id) DO NOTHING;