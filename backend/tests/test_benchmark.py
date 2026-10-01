"""
Unit Tests for Model Abstraction Benchmark
Validates comparative evaluation metrics (Bedrock vs Self-Hosted Qwen).
"""
import pytest
from backend.app.services.model_benchmark import model_benchmark_service, ComparativeBenchmarkReport


@pytest.mark.asyncio
async def test_run_comparative_benchmark():
    sample_requirements = [
        {"req_id": "req_1", "text": "Monitoreo SOC 24/7"},
        {"req_id": "req_2", "text": "Postura Cloud CSPM"}
    ]
    report: ComparativeBenchmarkReport = await model_benchmark_service.run_comparative_benchmark(sample_requirements)

    assert report.total_requirements_evaluated == 2
    assert report.bedrock_metrics.provider_name == "Amazon Bedrock"
    assert report.self_hosted_qwen_metrics.provider_name == "Self-Hosted vLLM"
    assert report.bedrock_metrics.groundedness_rate_percent >= 90.0
    assert report.self_hosted_qwen_metrics.groundedness_rate_percent >= 90.0
    assert report.self_hosted_qwen_metrics.avg_latency_seconds_per_req < report.bedrock_metrics.avg_latency_seconds_per_req
    assert len(report.winner_for_pilot) > 0
