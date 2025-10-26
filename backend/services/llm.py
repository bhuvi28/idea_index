import logging
from ..services.constants import SYSTEM_PROMPT
import re
import json
import os
import time
from typing import Dict, List, Any
from functools import lru_cache
import google.generativeai as genai


logger = logging.getLogger(__name__)

# Retry configuration
MAX_RETRIES = 3
INITIAL_RETRY_DELAY = 20  # seconds
RETRY_BACKOFF_MULTIPLIER = 2

# Tried below:
# GPT-4.1-mini-1M: Was working good, sometimes output was not that great, but was fast (~2 seconds to think).
# GPT-5-400K: The OG, but is very slow. Spends time thinking (~25 seconds to think).
# Gemini-2.5-Flash-1M: Not that fast, but outputs are good.
# GPT-5-Nano-400K: Takes 25 seconds to think, so slow! (~25 seconds to think).
# GPT-4.1-1M: Good one. Decent output, fast enough (~7 seconds to think).

# Only run this block for Gemini Developer API
# GEMINI_API_KEY = "AIzaSyAtG4JTwiI8uTN8dwdGdotJUFYhq0DdZmg"  # : add your Gemini API key here
# genai.configure(api_key=GEMINI_API_KEY)   
# genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))   

# Cache to store LLM responses to avoid duplicate calls

@lru_cache(maxsize=100)
def _get_llm_response_cached(prompt: str) -> str:
    """
    Cache LLM responses to avoid duplicate API calls for the same prompt.
    Includes retry logic with exponential backoff for handling transient failures.
    """
    logger.debug("Invoking LLM client...")
    
    last_exception = None
    retry_delay = INITIAL_RETRY_DELAY
    
    for attempt in range(MAX_RETRIES):
        try:
            model = genai.GenerativeModel(
                "gemini-2.5-flash",
                system_instruction=SYSTEM_PROMPT
            )
            response = model.generate_content(prompt)
            logger.debug(f"LLM client invocation completed successfully on attempt {attempt + 1}")
            return response.text
            
        except Exception as e:
            last_exception = e
            logger.warning(f"LLM API call failed on attempt {attempt + 1}/{MAX_RETRIES}: {type(e).__name__}: {e}")
            
            # Don't retry on the last attempt
            if attempt < MAX_RETRIES - 1:
                logger.info(f"Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
                retry_delay *= RETRY_BACKOFF_MULTIPLIER
            else:
                logger.error(f"All {MAX_RETRIES} retry attempts failed for LLM API call")
    
    # If we get here, all retries failed
    raise Exception(f"LLM API call failed after {MAX_RETRIES} attempts: {last_exception}")

def get_index_data_for_prompt(prompt: str) -> Dict[str, Any]:
    """
    Get complete index data (portfolio + title) from LLM for a given prompt.
    This function replaces get_holdings_for_prompt and provides both portfolio and title.
    
    Returns:
        Dict containing 'portfolio' (list of holdings) and 'title' (string)
    """
    logger.debug(f"Getting complete index data for prompt: {prompt[:100]}...")
    
    def parse_ai_response(ai_content: str) -> Dict[str, Any]:
        """Parse AI response and extract both portfolio and title"""
        logger.debug(f"Processing AI response: {ai_content[:200]}...")
        
        # Extract JSON block using regex
        match = re.search(r'\{.*\}', ai_content, re.DOTALL)
        if match:
            json_str = match.group(0)
            logger.debug(f"Extracted JSON string: {json_str[:200]}...")
            try:
                data = json.loads(json_str)
                logger.debug("Successfully parsed JSON from AI response")
                
                # Validate required fields
                if "portfolio" not in data:
                    logger.error(f"No 'portfolio' key found in parsed data. Available keys: {list(data.keys())}")
                    raise ValueError("No 'portfolio' key found in AI response data")
                
                if "title" not in data:
                    logger.warning("No 'title' key found in AI response, using prompt as fallback")
                    data["title"] = f"{prompt.title()} Index"
                
                return data
                
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse JSON from AI response: {e}")
                logger.error(f"Raw JSON string: {json_str}")
                raise ValueError(f"Invalid JSON in AI response: {e}")
        else:
            logger.error("No JSON block found in AI response")
            logger.error(f"Full AI response: {ai_content}")
            raise ValueError("No JSON block found in AI response")

    try:
        # Use cached LLM response to avoid duplicate API calls
        ai_content = _get_llm_response_cached(prompt)
        
        # Parse the response to get both portfolio and title
        parsed_data = parse_ai_response(ai_content)
        
        portfolio = parsed_data["portfolio"]
        title = parsed_data["title"]
        
        logger.debug(f"Successfully extracted portfolio with {len(portfolio)} items and title: {title}")
        return {
            "portfolio": portfolio,
            "title": title
        }
        
    except Exception as e:
        logger.error(f"Error in get_index_data_for_prompt: {type(e).__name__}: {e}")
        raise

def get_holdings_for_prompt(prompt: str) -> List[Dict[str, Any]]:
    """
    Legacy function for backwards compatibility.
    Uses the new cached LLM service internally but only returns the portfolio.
    """
    logger.debug(f"Getting holdings for prompt (legacy function): {prompt[:100]}...")
    
    try:
        # Use the new cached function internally
        index_data = get_index_data_for_prompt(prompt)
        portfolio = index_data["portfolio"]
        
        logger.debug(f"Successfully extracted portfolio with {len(portfolio)} items")
        return portfolio
        
    except Exception as e:
        logger.error(f"Error in get_holdings_for_prompt: {type(e).__name__}: {e}")
        raise
