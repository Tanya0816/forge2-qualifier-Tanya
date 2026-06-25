# forge2-qualifier-Tanya

## Overview

forge2-qualifier-Tanya is a multi-agent automation framework designed to execute specialized tasks through independent AI agents. Each agent operates with a dedicated responsibility while collaborating through a shared workspace and communication layer.

The system enables users to automate workflows, build apps , interact with external tools, and execute task-specific operations using configurable AI agents.

---

## Features

* Modular AI Agent Architecture
* Independent Agent Workspaces
* Slack Integration Support
* Memory Persistence
* Tool-Based Execution
* Extensible Agent Design
* Google Gemini Integration

---

## System Architecture

      User 
        |
     Hermes Agent
        |
     Openclaw for coding 
        |
     Openclaw gives the  code back to hermes
        |
    Hermes give the final output to user 


---

## Prerequisites

### Software Requirements

#### Operating System

Recommended:

* Ubuntu 22.04+
* Ubuntu WSL2 on Windows
* macOS 13+
* Linux Distributions

#### Required Software

| Software              | Version       |
| --------------------- | ------------- |
| Docker                | Latest Stable |
| Git                   | Latest Stable |
| Node.js               | 18+           |
| Python                | 3.10+         |
| Slack App Credentials | Required      |
| Gemini API Key        | Required      |

---

## Hardware Requirements

### Minimum Requirements

Suitable for testing and small workloads.

| Component | Requirement      |
| --------- | ---------------- |
| CPU       | 4 Cores          |
| RAM       | 8 GB             |
| Storage   | 20 GB Free SSD   |
| Internet  | Stable Broadband |

### Recommended Requirements

Suitable for running multiple agents smoothly.

| Component | Requirement           |
| --------- | --------------------- |
| CPU       | 8+ Cores              |
| RAM       | 16 GB or Higher       |
| Storage   | 50+ GB SSD            |
| GPU       | Optional              |
| Internet  | High-Speed Connection |

### Best Experience

For heavy multi-agent workflows.

| Component | Requirement                  |
| --------- | ---------------------------- |
| CPU       | Ryzen 7 / Intel i7 or better |
| RAM       | 32 GB                        |
| Storage   | NVMe SSD                     |
| GPU       | 8GB+ VRAM (Optional)         |
| Internet  | Fiber Connection             |

---

## Installation

### 1. Clone Repository

```bash
git clone <https://github.com/Tanya0816/forge2-qualifier-Tanya>
cd forge2-qualifier-Tanya
```

### 2. Configure Environment Variables

Create a `.env` file:

```env
GEMINI_API_KEY=your_api_key

SLACK_BOT_TOKEN=xoxb-xxxxxxxx
SLACK_APP_TOKEN=xapp-xxxxxxxx

WORKSPACE_PATH=./workspace
```

### 3. Installation

Use WSL terminal in Windows

1. Install hermes and openclaw

For Openclaw

1. Use 'npm install -g openclaw@latest
2. openclaw onboard
3. opneclaw doctor
4. At the time of configuration, opt `Slack` for the communication. 
5. Create an app in Slack and use the app-token and bot-token from slack in openclaw to connect the Openclaw from the Slack.

Clearly  define the model api you want to use and save it in the .env file.



In hermes

1. Run 'hermes model'
2. Choose 'Nous Portal' and click on the link given in the terminal to connect successfully. 
3. Once selected, select google(gemini) as the model.
4. 
