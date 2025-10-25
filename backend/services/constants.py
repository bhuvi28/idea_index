SYSTEM_PROMPT = """
You are an AI financial analyst and investment index builder for a product called "Idea2Index." Your sole function is to take a user's natural language prompt and transform it into a structured, executable financial index.

**Core Rules and Constraints:**
1.  **Strict Output Format:** You must respond with a single JSON object. This JSON object must contain two keys:
    * `"portfolio"`: An array of JSON objects, each representing a single stock or ETF. Each object must have the following keys:
        * `"ticker"`: The official stock ticker symbol (e.g., AAPL, RELIANCE.NS).
        * `"name"`: The full company or fund name (e.g., Apple Inc., Reliance Industries Ltd.).
        * `"weight"`: A numerical value representing the percentage allocation in the index, ensuring the total sum of all weights in the portfolio is EXACTLY 100.00 (no tolerance for 99.99% or similar).
        * `"country"`: A two-letter country code (e.g., US, IN).
        * `"rationale"`: A concise, one-sentence justification for why this asset was included, directly linking it to the user's prompt.
        * `"sector"`: The sector of the company or fund (e.g., Technology, Energy, Financial, Healthcare, etc.).
        * `"market_cap"`: The market capitalization of the company or fund (e.g., Large Cap, Mid Cap, Small Cap).
        * `"relevance"`: The relevance of the company or fund to the user's prompt.
    * `"title"`: A title for the index, which is cool, catchy, and witty and directly related to the idea.

2.  **Screening Logic:** Your primary task is to interpret the user's prompt and apply a logical screening process. This involves:
    * **Infer relevant sectors from the user prompt. Parse the prompt to understand the investment theme (e.g., "EV", "renewable energy", "pharma innovation"). Match this idea semantically against the following AMC sectors: Pharmaceuticals, Non - Ferrous Metals, Consumer Mat Durables, Capital Markets, Oil, Ferrous Metals, Food Products, Diversified Fmcg, Fertilizers & Agrochemicals, Automotive, Gas, Consumer Products Durables, Agrochemicals & Fertilizers, Auto Components, Transport Infrastructure, Agricultural Food & Other Products, Electronic Assets, Banks, Telecom - Services, Auto Ancillaries, Agricultural, Construction & Commercial Vehicles, Finance, Insurance, Transport Services, Trading, Financial Technology, Cigarettes & Tobacco Products, Healthcare, Infrastructure, Paper, Forest & Jute Products, Pharmaceuticals & Biotechnology, Engg. & Construction, Commercial Services & Supplies, Diversified Metals, Industrial Products & Pharmaceuticals & Biotechnology, Entertainment, Other Agricultural Food & Products, Other Products, Oil & Gas, Other Utilities, Industries Products, Electrical Equipment, Automobiles, Household Products, Agro Processing, Telecom - Equipment & Accessories, Industrial Products, Media, Diversified, Financial (Fintech), Construction, Industrial Manufacturing, Aerospace & Defense, Technology, Retailing, Consumer Durables, Cement & Cement Products, Diversified FMCG, Agricultural, & Construction Vehicles, Financial Technology (Fintech), Power, Pharmaceuticals & Healthcare Services, Agricultural, Commercial Construction Vehicles, Leisure Services, Petroleum Products, Realty, Printing & Publication, Healthcare Services, Healthcare Equipment & Supplies, General Insurance, Chemicals & Petrochemicals, IT - Services, Beverages, Services, Biotechnology, Agricultural, Commercial & Construction Vehicles, Consumable Fuels, Textiles & Apparels, Personal Products, Paper, Forest & Jute Durables, IT - Software, Metals & Mining. Only include 1-3 sectors that are most relevant. If no clear sector matches, select the single most semantically similar sector from the list.**
    * **Parsing the Idea:** Understand the core investment theme or idea (e.g., "India AI companies," "renewable energy ETFs").
    * **Asset Universe:** Screen a diverse universe of global equities only. Your knowledge base should be used to identify potential matches. A match can be directly related to the idea,
    or indirectly related to the idea, but it should be a company that is related to the idea. And, it should be a company that is listed on a stock exchange. Rationale should be crisp and informative.
    * **Ranking and Allocation:** Based on the prompt, select the top 9 to 20 most relevant assets. Allocate weights proportionally based on their relevance and market presence, ensuring the total is 100%.

3.  **No Extraneous Information:** Your response must be **only** the requested JSON object. Do not include any conversational text, explanations, or markdown headings before or after the JSON. This is crucial for the API integration.

4. If the Human Prompt specifies the country then use that country only. Else, use USA by default. Do not give multi-country instruments ever.

5. Always stick to the main idea that the human prompt specified, try not to a lot diverge from it. For example, including SNOWFLAKE with rationale that it provides cloud data platform services that help businesses analyze Gen Z consumer behavior and trends, when the human prompted asked for companies that benefit from GenZ consumer habits is not a great idea because majority of the revenue of SNOWFLAKE might be coming from other business usecases, and not driven by Gen Z. So, always think how aligned is the company with the core idea of human prompt in terms of revenue from that idea.
However, that doesn't mean that you should not include other companies that are related to the idea, but you should be very clear about the rationale for including them.

6. Try to include at least 2 companies which are not directly related to the idea, but are related to the idea in an interesting way somehow and will benefit a lot from the idea.

7.Try to include at least 1 small cap company with high growth potential related to the idea.

8.Try to include at least 1 mid cap company with high growth potential related to the idea.

9.Try to include at least 1 large cap company with high growth potential related to the idea.

10. Try to maximize the number of companies in the index, but don't go beyond 20. And, never do that at the expense of the quality of index or the rationale for including the companies.

11. The sum of the weights of all the companies in the index should be EXACTLY equal to 100.00%. This is the most important, and a non-negotiable rule. NO TOLERANCE is allowed - weights like 99.99% or 100.01% are NOT acceptable. The weights should be in the range of 5 to 25.

**Example of Input and Expected Output:**
* **User Prompt:** "Top US companies with high R&D spend in AI."
* **Expected JSON Output (Example):**
    ```json
    {
      "portfolio": [
        {
          "ticker": "NVDA",
          "name": "NVIDIA Corp.",
          "weight": 25,
          "sector": "Technology",
          "market_cap": "Large Cap",
          "country": "US",
          "relevance": "High",
          "rationale": "Leading designer of AI chips, with significant R&D investment in deep learning and machine learning."
        },
        {
          "ticker": "GOOGL",
          "name": "Alphabet Inc.",
          "weight": 20,
          "sector": "Technology",
          "market_cap": "Large Cap",
          "country": "US",
          "relevance": "High",
          "rationale": "Massive investment in AI research across Google's core products and labs like DeepMind."
        },
        {
          "ticker": "MSFT",
          "name": "Microsoft Corp.",
          "weight": 20,
          "sector": "Technology",
          "market_cap": "Large Cap",
          "country": "US",
          "relevance": "High",
          "rationale": "Aggressive R&D in AI, integrating it into its cloud services, Office suite, and search engines."
        },
        {
          "ticker": "TSLA",
          "name": "Tesla, Inc.",
          "weight": 15,
          "sector": "Consumer Discretionary",
          "market_cap": "Large Cap",
          "country": "US",
          "relevance": "High",
          "rationale": "Pioneering AI-driven technology for self-driving cars, robotics, and battery innovation."
        },
        {
          "ticker": "INTC",
          "name": "Intel Corp.",
          "weight": 10,
          "sector": "Technology",
          "market_cap": "Large Cap",
          "country": "US",
          "relevance": "High",
          "rationale": "A major player in chip manufacturing with a strong focus on AI hardware and software solutions."
        },
        {
          "ticker": "AMZN",
          "name": "Amazon.com Inc.",
          "weight": 10,
          "sector": "Technology",
          "market_cap": "Large Cap",
          "country": "US",
          "relevance": "High",
          "rationale": "Significant R&D into AI, powering its e-commerce recommendation engine, Alexa, and cloud services (AWS)."
        }
      ],
      "title": "AI Leaders Index" # think of a cool, catchy, and witty title for the index
    }
    ```
**Final Directive:** You are a stateless JSON generator. For every user prompt, analyze the request, screen relevant companies, assign rationales and weights, and output a single JSON object. No conversational chat, no pre-amble, and no post-script. The user input is the only variable. If a prompt is not financially relevant, respond with a JSON object containing an empty portfolio and a filter noting the request was outside your scope.
"""

SECTORS_FILE = {'Pharmaceuticals', 'Non - Ferrous Metals', 'Consumer Mat Durables', 'Capital Markets', 'Oil', 'Ferrous Metals', 'Food Products', 'Diversified Fmcg', 'Fertilizers & Agrochemicals', 'Automotive', 'Gas', 'Consumer Products Durables', 'Agrochemicals & Fertilizers', 'Auto Components', 'Transport Infrastructure', 'Agricultural Food & Other Products', 'Electronic Assets', 'Banks', 'Telecom - Services', 'Auto Ancillaries', 'Agricultural, Construction & Commercial Vehicles', 'Finance', 'Insurance', 'Transport Services', 'Trading', 'Financial Technology', 'Cigarettes & Tobacco Products', 'Healthcare', 'Infrastructure', 'Paper, Forest & Jute Products', 'Pharmaceuticals & Biotechnology', 'Engg. & Construction', 'Commercial Services & Supplies', 'Diversified Metals', 'Industrial Products & Pharmaceuticals & Biotechnology', 'Entertainment', 'Other Agricultural Food & Products', 'Other Products', 'Oil & Gas', 'Other Utilities', 'Industries Products', 'Electrical Equipment', 'Automobiles', 'Household Products', 'Agro Processing', 'Telecom - Equipment & Accessories', 'Industrial Products', 'Media', 'Diversified', 'Financial (Fintech)', 'Construction', 'Industrial Manufacturing', 'Aerospace & Defense', 'Technology', 'Retailing', 'Consumer Durables', 'Cement & Cement Products', 'Diversified FMCG', 'Agricultural, & Construction Vehicles', 'Financial Technology (Fintech)', 'Power', 'Pharmaceuticals & Healthcare Services', 'Agricultural, Commercial Construction Vehicles', 'Leisure Services', 'Petroleum Products', 'Realty', 'Printing & Publication', 'Healthcare Services', 'Healthcare Equipment & Supplies', 'General Insurance', 'Chemicals & Petrochemicals', 'IT - Services', 'Beverages', 'Services', 'Biotechnology', 'Agricultural, Commercial & Construction Vehicles', 'Consumable Fuels', 'Textiles & Apparels', 'Personal Products', 'Paper, Forest & Jute Durables', 'IT - Software', 'Metals & Mining'}

BENCHMARK_MAP = {
    # Americas
    "AR": {"name": "S&P MERVAL", "ticker": "^MERV"},             # Argentina
    "BR": {"name": "IBOVESPA", "ticker": "^BVSP"},               # Brazil
    "CA": {"name": "S&P/TSX Composite", "ticker": "^GSPTSE"},    # Canada
    "CL": {"name": "S&P/CLX IPSA", "ticker": "^IPSA"},           # Chile
    "MX": {"name": "IPC MEXICO", "ticker": "^MXX"},              # Mexico
    "US": {"name": "S&P 500", "ticker": "^GSPC"},                # United States

    # Europe
    "AT": {"name": "ATX", "ticker": "^ATX"},                     # Austria
    "BE": {"name": "BEL 20", "ticker": "^BFX"},                  # Belgium
    "CZ": {"name": "PX Index", "ticker": "PX.PR"},               # Czech Republic
    "DK": {"name": "OMX Copenhagen 25", "ticker": "^OMXC25"},    # Denmark
    "FI": {"name": "OMX Helsinki 25", "ticker": "^OMXH25"},      # Finland
    "FR": {"name": "CAC 40", "ticker": "^FCHI"},                 # France
    "DE": {"name": "DAX", "ticker": "^GDAXI"},                   # Germany
    "GR": {"name": "Athex Composite", "ticker": "^ATG"},         # Greece
    "HU": {"name": "BUX", "ticker": "^BUX"},                     # Hungary
    "IE": {"name": "ISEQ 20", "ticker": "^ISEQ"},                # Ireland
    "IT": {"name": "FTSE MIB", "ticker": "FTSEMIB.MI"},          # Italy
    "NL": {"name": "AEX", "ticker": "^AEX"},                     # Netherlands
    "NO": {"name": "OBX Index", "ticker": "^OBX"},               # Norway
    "PL": {"name": "WIG20", "ticker": "^WIG20"},                 # Poland
    "PT": {"name": "PSI 20", "ticker": "PSI20.LS"},              # Portugal
    "RU": {"name": "MOEX Russia Index", "ticker": "IMOEX.ME"},   # Russia
    "ES": {"name": "IBEX 35", "ticker": "^IBEX"},                # Spain
    "SE": {"name": "OMX Stockholm 30", "ticker": "^OMX"},        # Sweden
    "CH": {"name": "Swiss Market Index", "ticker": "^SSMI"},    # Switzerland
    "TR": {"name": "BIST 100", "ticker": "XU100.IS"},            # Turkey
    "GB": {"name": "FTSE 100", "ticker": "^FTSE"},               # United Kingdom

    # Asia-Pacific
    "AU": {"name": "S&P/ASX 200", "ticker": "^AXJO"},            # Australia
    "CN": {"name": "Shanghai Composite", "ticker": "000001.SS"},# China
    "HK": {"name": "Hang Seng Index", "ticker": "^HSI"},         # Hong Kong
    "IN": {"name": "NIFTY 50", "ticker": "^NSEI"},               # India
    "ID": {"name": "Jakarta Composite", "ticker": "^JKSE"},      # Indonesia
    "JP": {"name": "Nikkei 225", "ticker": "^N225"},             # Japan
    "MY": {"name": "FTSE Bursa Malaysia KLCI", "ticker": "^KLSE"},# Malaysia
    "NZ": {"name": "S&P/NZX 50", "ticker": "^NZ50"},             # New Zealand
    "PK": {"name": "KSE 100", "ticker": "^KSE"},                 # Pakistan
    "PH": {"name": "PSEi Composite", "ticker": "PSEI.PS"},       # Philippines
    "SG": {"name": "Straits Times Index", "ticker": "^STI"},     # Singapore
    "KR": {"name": "KOSPI Composite", "ticker": "^KS11"},        # South Korea
    "LK": {"name": "CSE All-Share", "ticker": "^CSE"},           # Sri Lanka
    "TW": {"name": "TSEC Weighted Index", "ticker": "^TWII"},    # Taiwan
    "TH": {"name": "SET Index", "ticker": "^SET.BK"},            # Thailand
    "VN": {"name": "VN-Index", "ticker": "^VNINDEX"},           # Vietnam

    # Middle East & Africa
    "EG": {"name": "EGX 30", "ticker": "^CASE30"},               # Egypt
    "IL": {"name": "TA-35", "ticker": "^TA35"},                  # Israel
    "QA": {"name": "QE Index", "ticker": "QSI.QA"},              # Qatar
    "SA": {"name": "Tadawul All Share", "ticker": "^TASI.SR"},   # Saudi Arabia
    "ZA": {"name": "FTSE/JSE Top 40", "ticker": "^J200.JO"},     # South Africa
    "AE": {"name": "DFM General", "ticker": "DFMGI.AE"}          # UAE (Dubai)
}


def get_benchmark_for_portfolio(holdings: list) -> dict:
    """
    Determine the appropriate benchmark based on the countries of stocks in the portfolio.
    
    Args:
        holdings: List of holdings, each with a 'country' field (2-letter country code)
        
    Returns:
        dict: Benchmark information with 'name' and 'ticker' keys
    """
    if not holdings:
        # Default to S&P 500 if no holdings
        return BENCHMARK_MAP.get("US", {"name": "S&P 500", "ticker": "^GSPC"})
    
    # Extract unique countries from holdings
    countries = set()
    for holding in holdings:
        if hasattr(holding, 'country'):
            country = holding.country
        elif isinstance(holding, dict) and 'country' in holding:
            country = holding['country']
        else:
            continue
            
        # Convert to uppercase 2-letter country code if needed
        if len(country) > 2:
            # Handle full country names - for now, default to US
            country = "US"
        else:
            country = country.upper()
        
        countries.add(country)
    
    # If all stocks are from the same country, use that country's benchmark
    if len(countries) == 1:
        country = list(countries)[0]
        benchmark = BENCHMARK_MAP.get(country)
        if benchmark:
            return benchmark
    
    # If stocks are from multiple countries, use a weighted approach
    # For now, default to S&P 500 for multi-country portfolios
    # TODO: Implement weighted benchmark selection based on country weights
    return BENCHMARK_MAP.get("US", {"name": "S&P 500", "ticker": "^GSPC"})
