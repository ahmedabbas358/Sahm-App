"""
Sahm Backend — Correlation & Observability Middleware
Prompt 24: Sections 71, 72, 206-209

Injects and propagates:
- X-Request-ID (unique per HTTP request)
- X-Correlation-ID (propagated across UI, API, Workers, and Audit logs)
- X-Response-Time-Ms (latency measurement)
"""
import time
import uuid
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response


class CorrelationMiddleware(BaseHTTPMiddleware):
    """
    Guarantees every request has a traceable Request-ID and Correlation-ID.
    Connects the whole institutional chain: User UI -> API -> Queue -> Worker -> DB -> Audit.
    """

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        # Extract or generate Request ID
        request_id = request.headers.get("X-Request-ID")
        if not request_id:
            request_id = f"req-{uuid.uuid4().hex[:12]}"

        # Extract or generate Correlation ID
        correlation_id = request.headers.get("X-Correlation-ID")
        if not correlation_id:
            correlation_id = f"corr-{uuid.uuid4().hex[:12]}"

        # Store on request state for access in endpoint handlers
        request.state.request_id = request_id
        request.state.correlation_id = correlation_id

        start_time = time.perf_counter()

        response = await call_next(request)

        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)

        # Inject into response headers
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Correlation-ID"] = correlation_id
        response.headers["X-Response-Time-Ms"] = str(duration_ms)

        return response
