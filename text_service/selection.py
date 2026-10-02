"""Validate a model selection without rendering generated prose or links."""
import json
import re


def token_choices(sequences, eos):
    """Build the finite JSON grammar; the actual model chooses among its tokens."""
    choices = {}
    for sequence in sequences:
        if not sequence or len(sequence) >= 96:
            raise ValueError("Invalid constrained candidate")
        for index, token in enumerate(sequence):
            choices.setdefault(tuple(sequence[:index]), set()).add(token)
        choices.setdefault(tuple(sequence), set()).add(eos)

    def allowed(prefix):
        result = choices.get(tuple(prefix))
        if not result:
            raise ValueError("Generation escaped the constrained grammar")
        return sorted(result)
    return allowed, max(map(len, sequences)) + 1


def parse_selection(generated, allowed):
    # A JSON code fence is formatting, not permission to extract JSON from prose.
    fence = re.fullmatch(r"```(?:json)?\s*\n([\s\S]*?)\n```", generated.strip())
    candidate = fence.group(1) if fence else generated.strip()
    try:
        result = json.loads(candidate)
    except (ValueError, TypeError) as error:
        raise ValueError("invalid_json") from error
    if not isinstance(result, dict) or set(result) != {"cardIds"}:
        raise ValueError("invalid_shape")
    ids = result["cardIds"]
    if not isinstance(ids, list) or len(ids) > 1 or any(not isinstance(i, str) or i not in allowed for i in ids):
        raise ValueError("invalid_ids")
    return ids
