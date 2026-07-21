import sys
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app import app


class LandingRouteTests(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_all_returns_empty_payload_when_tmdb_unavailable(self):
        with patch("api.landing.recent.tmdb.Movies") as movies_cls, patch(
            "api.landing.reviews.tmdb.Movies"
        ) as reviews_cls:
            movies_cls.return_value.now_playing.side_effect = Exception("boom")
            reviews_cls.return_value.reviews.side_effect = Exception("boom")

            response = self.client.get("/landing/all")

            self.assertEqual(response.status_code, 200)
            data = response.get_json()
            self.assertIsNone(data["trending_film"])
            self.assertEqual(data["top_6_recent_films"], [])
            self.assertEqual(data["recent_films"], [])
            self.assertEqual(data["recent_reviews"], [])


if __name__ == "__main__":
    unittest.main()
