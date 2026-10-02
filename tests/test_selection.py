import unittest
from text_service.selection import parse_selection


class SelectionContract(unittest.TestCase):
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
