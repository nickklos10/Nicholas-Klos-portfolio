from app.services.ratelimit import RateLimiter


def test_under_limit_allows():
    rl = RateLimiter(per_min=3)
    now = 100.0
    assert rl.allow("a", now=now)
    assert rl.allow("a", now=now + 1)
    assert rl.allow("a", now=now + 2)


def test_over_limit_blocks():
    rl = RateLimiter(per_min=2)
    now = 100.0
    assert rl.allow("a", now=now)
    assert rl.allow("a", now=now + 1)
    assert not rl.allow("a", now=now + 2)


def test_old_entries_expire():
    rl = RateLimiter(per_min=2)
    now = 100.0
    assert rl.allow("a", now=now)
    assert rl.allow("a", now=now + 1)
    # 61s later, the old entries should be evicted
    assert rl.allow("a", now=now + 62)


def test_keys_are_independent():
    rl = RateLimiter(per_min=1)
    assert rl.allow("a", now=100.0)
    assert rl.allow("b", now=100.0)
    assert not rl.allow("a", now=100.5)
