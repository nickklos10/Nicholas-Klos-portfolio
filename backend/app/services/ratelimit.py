"""Process-local IP token bucket. Adequate for a single Render instance."""
import time
from collections import defaultdict
from threading import Lock

from app.config import settings


class RateLimiter:
    def __init__(self, per_min: int):
        self.per_min = per_min
        self._buckets: dict[str, list[float]] = defaultdict(list)
        self._lock = Lock()

    def allow(self, key: str, *, now: float | None = None) -> bool:
        now = now if now is not None else time.monotonic()
        with self._lock:
            bucket = self._buckets[key]
            cutoff = now - 60.0
            self._buckets[key] = [t for t in bucket if t > cutoff]
            if len(self._buckets[key]) >= self.per_min:
                return False
            self._buckets[key].append(now)
            return True


limiter = RateLimiter(per_min=settings.rate_limit_per_min)
