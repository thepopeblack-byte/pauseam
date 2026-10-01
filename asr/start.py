"""Honor the hosting provider's PORT without invoking a shell."""
import os
import uvicorn

if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8000"))
    if not 1 <= port <= 65535:
        raise ValueError("Invalid PORT")
    uvicorn.run("app:app", host="0.0.0.0", port=port,
                access_log=False, log_level="warning")

