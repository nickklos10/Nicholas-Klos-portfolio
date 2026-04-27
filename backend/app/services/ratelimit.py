"""In-process rate limiter: per-IP burst, per-IP daily, and global daily caps."""
import time
from collections import defaultdict
from threading import Lock

from app.config import settings


class RateLimiter:
    def __init__(
        self,
        per_min: int,
        per_day_per_ip: int,
        per_day_global: int,
    ) -> None:
        self.per_min = per_min
        self.per_day_per_ip = per_day_per_ip
        self.per_day_global = per_day_global
        self._minute: dict[str, list[float]] = defaultdict(list)
        self._day: dict[str, list[float]] = defaultdict(list)
        self._global_day: list[float] = []
        self._lock = Lock()

    def check(self, key: str, *, now: float | None = None) -> tuple[bool, str]:
        """Allow or deny a request. On allow, records the hit across all windows.

        Returns (allowed, reason). Reason is "ok" on allow, otherwise the
        specific cap that tripped: "global_daily_cap", "ip_daily_cap", or
        "ip_burst".
        """
        now = now if now is not None else time.monotonic()
        m_cutoff = now - 60.0
        d_cutoff = now - 86400.0
        with self._lock:
            self._minute[key] = [t for t in self._minute[key] if t > m_cutoff]
            self._day[key] = [t for t in self._day[key] if t > d_cutoff]
            self._global_day = [t for t in self._global_day if t > d_cutoff]

            if len(self._global_day) >= self.per_day_global:
                return False, "global_daily_cap"
            if len(self._day[key]) >= self.per_day_per_ip:
                return False, "ip_daily_cap"
            if len(self._minute[key]) >= self.per_min:
                return False, "ip_burst"

            self._minute[key].append(now)
            self._day[key].append(now)
            self._global_day.append(now)
            return True, "ok"

    # Backward-compat shim — older code paths may still call .allow().
    def allow(self, key: str, *, now: float | None = None) -> bool:
        ok, _ = self.check(key, now=now)
        return ok


limiter = RateLimiter(
    per_min=settings.rate_limit_per_min,
    per_day_per_ip=settings.rate_limit_per_day_per_ip,
    per_day_global=settings.rate_limit_per_day_global,
)
