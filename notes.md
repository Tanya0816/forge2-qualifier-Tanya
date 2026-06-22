Problems I faced:

1. OpenClaw is working , SLack app is created but -
   On running "openclaw gateway" , it shows that SLACK_BOT_TOKEN is missing.

Note : The "socket mode connected: msg shows app token of slack is being used , while "invalid_auth" msg shows the bot token of slack is not being used properly.

2. Now the openclaw is working , apis are fine but when sending msg in #command in slack, the expected output is not there

3. OpenClaw knows I want to use "ollama.qwen2.5-coder:7b" but this model has not been registered in OpenClaw's model provider configuration. This was causing the system to not respond properly.
4. For openclaw, i chose gemini as the model but i'm unable to change the provider from openAi to google.