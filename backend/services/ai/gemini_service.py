"""
Google Gemini AI Service
Provides AI-powered insights for financial data analysis
"""

import os
from typing import List, Dict, Any, Optional
import json


class GeminiService:
    """Service for interacting with Google Gemini AI"""

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize Gemini service
        
        Args:
            api_key: Google AI Studio API key. If not provided, reads from env.
        """
        self.api_key = api_key or os.getenv("GOOGLE_AI_API_KEY")
        if not self.api_key:
            raise ValueError("GOOGLE_AI_API_KEY not found in environment variables")
        
        # Import here to avoid dependency issues if not installed
        try:
            import google.generativeai as genai
            self.genai = genai
            self.genai.configure(api_key=self.api_key)
            self.model = self.genai.GenerativeModel('gemini-2.5-flash')
        except ImportError:
            raise ImportError(
                "google-generativeai package not installed. "
                "Install with: pip install google-generativeai"
            )

    def analyze_data(
        self,
        data: List[Dict[str, Any]],
        headers: List[str],
        analysis_type: str = "general"
    ) -> Dict[str, Any]:
        """
        Analyze CSV data and generate insights
        
        Args:
            data: List of data rows (dicts)
            headers: List of column headers
            analysis_type: Type of analysis (general, anomaly, trend)
            
        Returns:
            Dict with insights, anomalies, and trends
        """
        # Prepare data summary for AI
        data_summary = self._prepare_data_summary(data, headers)
        
        # Build prompt based on analysis type
        prompt = self._build_prompt(data_summary, headers, analysis_type)
        
        try:
            # Generate insights using Gemini
            response = self.model.generate_content(prompt)
            
            # Parse response
            insights = self._parse_response(response.text, analysis_type)
            
            return {
                "success": True,
                "insights": insights,
                "analysis_type": analysis_type,
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "analysis_type": analysis_type,
            }

    def _prepare_data_summary(
        self,
        data: List[Dict[str, Any]],
        headers: List[str]
    ) -> Dict[str, Any]:
        """Prepare a summary of the data for AI analysis"""
        if not data:
            return {"row_count": 0, "columns": []}
        
        summary = {
            "row_count": len(data),
            "columns": [],
            "sample_rows": data[:5] if len(data) > 5 else data,
        }
        
        # Analyze each column
        for header in headers:
            col_data = [row.get(header) for row in data if row.get(header) is not None]
            
            col_info = {
                "name": header,
                "non_null_count": len(col_data),
                "null_count": len(data) - len(col_data),
            }
            
            # Try to detect numeric columns
            numeric_values = []
            for val in col_data:
                try:
                    # Remove currency symbols and commas
                    cleaned = str(val).replace('$', '').replace(',', '').replace(' ', '').strip()
                    numeric_values.append(float(cleaned))
                except (ValueError, AttributeError):
                    pass
            
            if numeric_values and len(numeric_values) / len(col_data) > 0.5:
                col_info["type"] = "numeric"
                col_info["min"] = min(numeric_values)
                col_info["max"] = max(numeric_values)
                col_info["avg"] = sum(numeric_values) / len(numeric_values)
                col_info["sum"] = sum(numeric_values)
            else:
                col_info["type"] = "text"
                col_info["unique_count"] = len(set(str(v) for v in col_data))
            
            summary["columns"].append(col_info)
        
        return summary

    def _build_prompt(
        self,
        data_summary: Dict[str, Any],
        headers: List[str],
        analysis_type: str
    ) -> str:
        """Build prompt for Gemini based on analysis type"""
        
        base_context = f"""
You are a financial data analyst. Analyze the following dataset:

Dataset Summary:
- Total Rows: {data_summary['row_count']}
- Columns: {', '.join(headers)}

Column Details:
{json.dumps(data_summary['columns'], indent=2)}

Sample Data:
{json.dumps(data_summary['sample_rows'], indent=2)}
"""
        
        if analysis_type == "general":
            prompt = base_context + """

Provide a FINANCIAL ANALYSIS focused on business insights:

**Context:** This is financial/business data for a company. Focus on actionable insights.

**Analysis Requirements:**
1. **Key Insights** (3-5 bullet points): 
   - Focus on financial trends, patterns, and business metrics
   - Highlight revenue, expenses, profitability, or cost patterns
   - Identify opportunities or risks
   - Be specific with numbers and percentages

2. **Data Quality**: 
   - Check completeness of financial data
   - Identify missing critical financial information
   - Note any data consistency issues in financial columns

3. **Recommendations**: 
   - Actionable business recommendations
   - Cost optimization opportunities
   - Revenue improvement suggestions
   - Risk mitigation strategies

**What to focus on:**
- Financial metrics (revenue, profit, costs, margins)
- Transaction patterns and trends
- Budget vs actual comparisons
- Pricing strategies
- Customer/product profitability
- Cash flow indicators

**What to avoid:**
- Generic data quality comments about non-financial fields
- Technical/developer insights
- Obvious observations without business value

Format your response as JSON:
{
  "key_insights": ["insight 1 with specific numbers", "insight 2", ...],
  "data_quality": "Focus on financial data completeness and accuracy",
  "recommendations": ["actionable recommendation 1", "recommendation 2", ...]
}
"""
        
        elif analysis_type == "anomaly":
            prompt = base_context + """

Detect FINANCIAL ANOMALIES ONLY. Focus on business-critical financial data issues.

**IMPORTANT RULES:**
1. ONLY detect anomalies in financial/business data (amounts, revenue, expenses, transactions, prices, costs, budgets, sales)
2. IGNORE non-financial columns (names, emails, addresses, descriptions, categories, IDs, dates unless they affect financial calculations)
3. Focus on anomalies that impact business decisions and financial health
4. Prioritize high-severity issues that could indicate fraud, errors, or financial risks

**What to detect:**
- Unusual transaction amounts (outliers, suspiciously high/low values)
- Negative values where they shouldn't be (negative revenue, negative quantity)
- Missing or zero values in critical financial columns
- Duplicate transactions with same amount and date
- Values that don't match expected ranges (e.g., discount > 100%)
- Sudden spikes or drops in financial metrics
- Inconsistent pricing or cost patterns
- Budget overruns or unusual spending patterns

**What to IGNORE:**
- Typos in text fields (names, descriptions)
- Missing non-financial data (email, phone, address)
- Formatting issues in non-financial columns
- Developer/technical data (IDs, timestamps, metadata)
- Categorical variations (different category names)

**Severity Guidelines:**
- HIGH: Fraud indicators, major financial discrepancies, critical missing data
- MEDIUM: Unusual patterns, potential errors, moderate outliers
- LOW: Minor inconsistencies, edge cases

Format your response as JSON:
{
  "anomalies": [
    {
      "column": "column_name (MUST be financial column)",
      "description": "Clear explanation of the financial anomaly and its business impact",
      "severity": "high|medium|low",
      "affected_rows": "description or count"
    }
  ]
}

If NO financial anomalies found, return empty array: {"anomalies": []}
"""
        
        elif analysis_type == "trend":
            prompt = base_context + """

Identify FINANCIAL TRENDS and BUSINESS PATTERNS:

**Context:** Analyze financial/business trends that impact company performance.

**Analysis Requirements:**

1. **Trends** (Financial patterns over time or across categories):
   - Revenue/sales trends (increasing, decreasing, seasonal)
   - Cost and expense patterns
   - Profitability trends
   - Customer spending patterns
   - Product/service performance trends
   - Budget adherence trends

2. **Correlations** (Relationships between financial metrics):
   - Price vs volume relationships
   - Cost vs revenue correlations
   - Seasonal patterns in sales/expenses
   - Product mix impact on profitability

3. **Predictions** (Forward-looking insights):
   - Revenue forecasts based on trends
   - Cost projections
   - Potential risks or opportunities
   - Seasonal expectations

**Focus Areas:**
- Financial performance over time
- Business growth indicators
- Cost efficiency trends
- Profitability patterns
- Market/customer behavior

**Avoid:**
- Non-financial trends (user behavior, technical metrics)
- Obvious patterns without business insight
- Trends in non-critical data

Format your response as JSON:
{
  "trends": [
    {
      "type": "increasing|decreasing|stable|seasonal",
      "column": "financial_column_name",
      "description": "Business impact and specific numbers/percentages",
      "confidence": "low|medium|high"
    }
  ],
  "correlations": ["correlation 1 with business impact", "correlation 2", ...],
  "predictions": ["actionable prediction 1", "prediction 2", ...]
}
"""
        
        else:
            prompt = base_context + "\n\nProvide general insights about this data."
        
        return prompt

    def _parse_response(self, response_text: str, analysis_type: str) -> Dict[str, Any]:
        """Parse Gemini response into structured format"""
        try:
            # Try to extract JSON from response
            # Gemini might wrap JSON in markdown code blocks
            if "```json" in response_text:
                json_start = response_text.find("```json") + 7
                json_end = response_text.find("```", json_start)
                json_text = response_text[json_start:json_end].strip()
            elif "```" in response_text:
                json_start = response_text.find("```") + 3
                json_end = response_text.find("```", json_start)
                json_text = response_text[json_start:json_end].strip()
            else:
                json_text = response_text.strip()
            
            parsed = json.loads(json_text)
            return parsed
        except json.JSONDecodeError:
            # If JSON parsing fails, return raw text
            return {
                "raw_response": response_text,
                "parsed": False,
            }

    def generate_summary(self, data: List[Dict[str, Any]], headers: List[str]) -> str:
        """Generate a natural language summary of the data"""
        data_summary = self._prepare_data_summary(data, headers)
        
        prompt = f"""
Provide a brief BUSINESS-FOCUSED summary of this financial dataset in 2-3 sentences:

Dataset: {data_summary['row_count']} rows, {len(headers)} columns
Columns: {', '.join(headers)}

**Focus on:**
- What type of business/financial data this represents
- Key financial metrics present (revenue, costs, transactions, etc.)
- Time period or scope if identifiable
- Overall business context

**Avoid:**
- Technical details about data structure
- Non-financial column descriptions
- Generic statements

Example: "This dataset contains 150 sales transactions spanning Q1 2024, with total revenue of $45,000 across 5 product categories. The data includes pricing, quantities, and customer information for financial analysis."
"""
        
        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            return f"Unable to generate summary: {str(e)}"
