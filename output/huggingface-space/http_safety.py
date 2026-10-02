"""Small HTTP guards shared by model services; no model dependencies."""
import hmac


def valid_bearer(supplied, token):
    # compare_digest on strings throws for non-ASCII HTTP header values.
    if not isinstance(supplied, str) or len(supplied) > 4096 or not token:
        return False
    try:
        return hmac.compare_digest(supplied.encode("ascii"), ("Bearer " + token).encode("ascii"))
    except UnicodeEncodeError:
        return False


def append_bounded(buffer, chunk, limit):
    if len(buffer) + len(chunk) > limit:
        return False
    buffer.extend(chunk)
    return True
