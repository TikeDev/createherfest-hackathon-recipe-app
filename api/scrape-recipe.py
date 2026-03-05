import json
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse

import requests
from recipe_scrapers import scrape_html, WebsiteNotImplementedError, NoSchemaFoundInWildMode


CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

FETCH_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}


def _json_response(handler: BaseHTTPRequestHandler, status: int, body: dict) -> None:
    payload = json.dumps(body).encode("utf-8")
    handler.send_response(status)
    for k, v in CORS_HEADERS.items():
        handler.send_header(k, v)
    handler.send_header("Content-Type", "application/json")
    handler.send_header("Content-Length", str(len(payload)))
    handler.end_headers()
    handler.wfile.write(payload)


def _safe_call(fn, default=None):
    try:
        return fn()
    except Exception:
        return default


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(204)
        for k, v in CORS_HEADERS.items():
            self.send_header(k, v)
        self.end_headers()

    def do_POST(self):
        # Parse request body
        content_length = int(self.headers.get("Content-Length", 0))
        raw_body = self.rfile.read(content_length) if content_length > 0 else b""
        try:
            body = json.loads(raw_body)
        except (json.JSONDecodeError, ValueError):
            _json_response(self, 400, {"error": "Request body must be valid JSON."})
            return

        url = body.get("url")
        if not url or not isinstance(url, str):
            _json_response(self, 400, {"error": "Missing required field: url"})
            return

        # Validate protocol
        parsed = urlparse(url)
        if parsed.scheme not in ("http", "https"):
            _json_response(self, 400, {"error": "Only http and https URLs are allowed."})
            return

        # Fetch HTML
        try:
            resp = requests.get(url, headers=FETCH_HEADERS, timeout=15)
            resp.raise_for_status()
        except requests.exceptions.Timeout:
            _json_response(self, 502, {"error": "Timed out fetching the recipe page."})
            return
        except requests.exceptions.RequestException as e:
            _json_response(self, 502, {"error": f"Failed to fetch URL: {e}"})
            return

        html = resp.text

        # Parse with recipe-scrapers
        try:
            scraper = scrape_html(html, org_url=url, wild_mode=True)
        except (WebsiteNotImplementedError, NoSchemaFoundInWildMode):
            _json_response(
                self,
                422,
                {
                    "error": (
                        "Could not extract a recipe from this page. "
                        "Try pasting the recipe text directly."
                    )
                },
            )
            return
        except Exception as e:
            _json_response(self, 500, {"error": f"Recipe parsing failed: {e}"})
            return

        result = {
            "title": _safe_call(scraper.title, ""),
            "ingredients": _safe_call(scraper.ingredients, []),
            "instructions_list": _safe_call(scraper.instructions_list, []),
            "yields": _safe_call(scraper.yields, ""),
            "total_time": _safe_call(scraper.total_time, None),
            "prep_time": _safe_call(scraper.prep_time, None),
            "cook_time": _safe_call(scraper.cook_time, None),
            "image": _safe_call(scraper.image, ""),
            "host": _safe_call(scraper.host, ""),
            "language": _safe_call(scraper.language, ""),
            "description": _safe_call(scraper.description, ""),
        }

        _json_response(self, 200, result)

    def log_message(self, format, *args):  # noqa: A002
        pass  # Suppress default Vercel log noise
