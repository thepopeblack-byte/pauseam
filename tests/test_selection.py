import unittest
from text_service.selection import parse_selection, token_choices


class SelectionContract(unittest.TestCase):
    def test_generation_cannot_leave_candidates(self):
        candidates=['{"cardIds":[]}','{"cardIds":["supplier"]}','{"cardIds":["school"]}']
        sequences=[list(text.encode()) for text in candidates]
        allowed, limit=token_choices(sequences, 0)
        self.assertEqual(limit,max(map(len,sequences))+1)
        for sequence in sequences:
            for index, token in enumerate(sequence): self.assertIn(token,allowed(sequence[:index]))
            self.assertEqual(allowed(sequence),[0])
        with self.assertRaises(ValueError): allowed(list(b'Call this invented contact'))

    def test_oversized_grammar_fails_closed(self):
        with self.assertRaises(ValueError): token_choices([[1]*96],0)

    def test_exact_json_and_fence(self):
        for text in ('{"cardIds":["supplier"]}', '```json\n{"cardIds":["supplier"]}\n```'):
            self.assertEqual(parse_selection(text, ['supplier']), ['supplier'])

    def test_abstention(self):
        self.assertEqual(parse_selection('{"cardIds":[]}', ['supplier']), [])

    def test_prose_and_extras_rejected(self):
        for text in ('Here is the answer: {"cardIds":["supplier"]}', '{"cardIds":["supplier"],"contact":"invented"}', '[]', 'null'):
            with self.assertRaises(ValueError): parse_selection(text, ['supplier'])

    def test_untrusted_ids_rejected(self):
        for ids in ('["unknown"]', '["supplier","supplier"]', '[{}]', '"supplier"'):
            with self.assertRaises(ValueError): parse_selection('{"cardIds":'+ids+'}', ['supplier'])
