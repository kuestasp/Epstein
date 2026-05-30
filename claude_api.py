"""
Claude Sonnet 4.6 — streaming + tool use + prompt caching
"""

import anthropic
import json

client = anthropic.Anthropic()

# ──────────────────────────────────────────────
# Tools
# ──────────────────────────────────────────────

tools = [
    {
        "name": "get_weather",
        "description": "Get current weather for a city.",
        "input_schema": {
            "type": "object",
            "properties": {
                "city": {"type": "string", "description": "City name"},
                "units": {"type": "string", "enum": ["celsius", "fahrenheit"], "description": "Temperature units"}
            },
            "required": ["city"]
        }
    },
    {
        "name": "web_search",
        "description": "Search the web for up-to-date information.",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Search query"}
            },
            "required": ["query"]
        }
    }
]

# ──────────────────────────────────────────────
# Tool execution (stub — wire in real logic here)
# ──────────────────────────────────────────────

def execute_tool(name: str, inputs: dict) -> str:
    if name == "get_weather":
        city = inputs["city"]
        units = inputs.get("units", "celsius")
        # Replace with real weather API call
        return json.dumps({"city": city, "temp": 22, "units": units, "condition": "partly cloudy"})

    if name == "web_search":
        query = inputs["query"]
        # Replace with real search call
        return json.dumps({"query": query, "results": ["Result 1", "Result 2", "Result 3"]})

    return json.dumps({"error": f"Unknown tool: {name}"})

# ──────────────────────────────────────────────
# System prompt — marked cacheable (large prompts benefit most)
# ──────────────────────────────────────────────

system = [
    {
        "type": "text",
        "text": (
            "You are a helpful assistant with access to weather and web search tools. "
            "Use them when the user asks about current events, weather, or anything that "
            "needs real-time data. Always be concise and accurate."
        ),
        "cache_control": {"type": "ephemeral"}   # cache this prefix
    }
]

# ──────────────────────────────────────────────
# Agentic loop — streams each turn, handles tool calls
# ──────────────────────────────────────────────

def chat(user_message: str) -> str:
    messages = [{"role": "user", "content": user_message}]

    while True:
        # Stream the response
        with client.messages.stream(
            model="claude-sonnet-4-6",
            max_tokens=4096,
            system=system,
            tools=tools,
            thinking={"type": "adaptive"},
            messages=messages,
        ) as stream:
            response = stream.get_final_message()

        # Append assistant turn to history
        messages.append({"role": "assistant", "content": response.content})

        # Check stop reason
        if response.stop_reason == "end_turn":
            # Extract final text
            for block in response.content:
                if block.type == "text":
                    return block.text
            return ""

        if response.stop_reason == "tool_use":
            tool_results = []
            for block in response.content:
                if block.type == "tool_use":
                    print(f"  [tool] {block.name}({block.input})")
                    result = execute_tool(block.name, block.input)
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": result
                    })

            # Feed results back
            messages.append({"role": "user", "content": tool_results})
            continue

        # Any other stop reason — return what we have
        for block in response.content:
            if block.type == "text":
                return block.text
        return ""

# ──────────────────────────────────────────────
# Quick demo
# ──────────────────────────────────────────────

if __name__ == "__main__":
    queries = [
        "What's the weather like in Istanbul right now?",
        "Search for the latest news on Claude AI models.",
        "What is 2 + 2?",  # no tool needed
    ]

    for q in queries:
        print(f"\nUser: {q}")
        answer = chat(q)
        print(f"Claude: {answer}")
