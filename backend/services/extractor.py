import httpx
from bs4 import BeautifulSoup
import fitz  # PyMuPDF
import io

async def fetch_url(url: str) -> tuple[bytes, str]:
    """
    Fetches the URL and returns the content bytes and content-type.
    """
    async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
        # User-agent to prevent simple blocks
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
        response = await client.get(url, headers=headers)
        response.raise_for_status()
        content_type = response.headers.get('Content-Type', '')
        return response.content, content_type

def extract_text(content: bytes, content_type: str) -> str:
    """
    Extracts text from HTML or PDF content.
    """
    if 'application/pdf' in content_type.lower():
        return _extract_from_pdf(content)
    else:
        # Default to HTML
        return _extract_from_html(content)

def _extract_from_html(content: bytes) -> str:
    soup = BeautifulSoup(content, 'html.parser')
    # Remove script and style elements
    for script_or_style in soup(['script', 'style', 'noscript', 'header', 'footer', 'nav']):
        script_or_style.decompose()
    
    # Get text
    text = soup.get_text(separator=' ')
    # Clean up whitespace
    lines = (line.strip() for line in text.splitlines())
    chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
    text = '\n'.join(chunk for chunk in chunks if chunk)
    return text

def _extract_from_pdf(content: bytes) -> str:
    doc = fitz.open(stream=content, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    return text
