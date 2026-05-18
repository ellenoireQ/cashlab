"""
Quick test script for development mode
Run this to verify dev mode is working correctly
"""

import os
from services.ai.gemini_service import GeminiService

# Sample financial data
sample_data = [
    {"Date": "2024-01-01", "Product": "Widget A", "Amount": 150.00, "Quantity": 5},
    {"Date": "2024-01-02", "Product": "Widget B", "Amount": 200.00, "Quantity": 3},
    {"Date": "2024-01-03", "Product": "Widget A", "Amount": -50.00, "Quantity": 1},  # Negative (refund)
    {"Date": "2024-01-04", "Product": "Widget C", "Amount": 5000.00, "Quantity": 10},  # Outlier
    {"Date": "2024-01-05", "Product": "Widget B", "Amount": 180.00, "Quantity": 4},
]

headers = ["Date", "Product", "Amount", "Quantity"]


def test_dev_mode():
    """Test development mode functionality"""
    print("=" * 60)
    print("Testing Development Mode")
    print("=" * 60)
    
    # Check environment
    dev_mode = os.getenv("DEVELOPMENT_MODE", "false").lower() == "true"
    print(f"\n✓ DEVELOPMENT_MODE from env: {dev_mode}")
    
    # Initialize service
    try:
        gemini = GeminiService()
        print(f"✓ GeminiService initialized with dev_mode: {gemini.dev_mode}")
    except Exception as e:
        print(f"✗ Failed to initialize GeminiService: {e}")
        return
    
    # Test 1: General Analysis
    print("\n" + "-" * 60)
    print("Test 1: General Analysis")
    print("-" * 60)
    result = gemini.analyze_data(sample_data, headers, "general")
    print(f"Success: {result.get('success')}")
    print(f"Dev Mode: {result.get('dev_mode', False)}")
    if result.get('success'):
        insights = result.get('insights', {})
        print(f"Key Insights: {len(insights.get('key_insights', []))} items")
        for insight in insights.get('key_insights', [])[:3]:
            print(f"  - {insight}")
    
    # Test 2: Anomaly Detection
    print("\n" + "-" * 60)
    print("Test 2: Anomaly Detection")
    print("-" * 60)
    result = gemini.analyze_data(sample_data, headers, "anomaly")
    print(f"Success: {result.get('success')}")
    print(f"Dev Mode: {result.get('dev_mode', False)}")
    if result.get('success'):
        anomalies = result.get('insights', {}).get('anomalies', [])
        print(f"Anomalies Found: {len(anomalies)}")
        for anomaly in anomalies:
            print(f"  - [{anomaly['severity'].upper()}] {anomaly['column']}: {anomaly['description']}")
    
    # Test 3: Trend Analysis
    print("\n" + "-" * 60)
    print("Test 3: Trend Analysis")
    print("-" * 60)
    result = gemini.analyze_data(sample_data, headers, "trend")
    print(f"Success: {result.get('success')}")
    print(f"Dev Mode: {result.get('dev_mode', False)}")
    if result.get('success'):
        insights = result.get('insights', {})
        trends = insights.get('trends', [])
        print(f"Trends Found: {len(trends)}")
        for trend in trends[:2]:
            print(f"  - [{trend['type']}] {trend['column']}: {trend['description']}")
    
    # Test 4: Summary Generation
    print("\n" + "-" * 60)
    print("Test 4: Summary Generation")
    print("-" * 60)
    summary = gemini.generate_summary(sample_data, headers)
    print(f"Summary: {summary}")
    
    print("\n" + "=" * 60)
    print("All tests completed!")
    print("=" * 60)


if __name__ == "__main__":
    test_dev_mode()
