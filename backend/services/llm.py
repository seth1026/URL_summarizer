import os
from groq import AsyncGroq

async def summarize_text(text: str) -> str:
    """
    Summarize text using Groq API.
    """
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key or api_key == "your_groq_api_key_here":
        return "Warning: Groq API key not configured. Mock summary generated: \n\n" + text[:500] + "..."

    client = AsyncGroq(api_key=api_key)
    
    # Truncate text if it's too long to prevent context overflow
    # A simple truncation for MVP
    max_chars = 15000 
    truncated_text = text[:max_chars]

    prompt = f"""Please provide a concise and well-structured summary of the following content. Focus on the main points and key takeaways. Format the summary in Markdown.

CONTENT:
{truncated_text}
"""

    response = await client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
        model="llama-3.1-8b-instant", # Defaulting to a fast model on Groq
        temperature=0.3,
    )
    
    return response.choices[0].message.content
