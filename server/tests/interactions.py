from api.film.interaction.like import like_film

print("Testing like_film function...")

def test_like_film():
    user_id = "user_2yVkqskvizjkB3htns1lnGpo7Xg"
    film_id = 15102

    result = like_film(user_id, film_id)

    assert isinstance(result, dict)
    assert "message" in result

if __name__ == "__main__":
    test_like_film()

