from flask import Flask, request, jsonify
import google.generativeai as genai
from flask_cors import CORS, cross_origin
import pandas as pd
from prophet import Prophet
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import os
import requests
from groq import Groq 
from datetime import timedelta
import logging
import warnings
from nsetools import Nse
import yfinance as yf


app = Flask(__name__)
CORS(app)

file_path = os.path.join(os.path.dirname(__file__), 'NIFTY 50_minute.csv')
df = pd.read_csv(file_path)

GOOGLE_API_KEY = 'AIzaSyCHfXCqruaatQwfUp4sfYjCwJCOY7tnzRY'
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

news_KEY = '442d358a3397407f8ff1d93295f60848'
url = 'https://newsapi.org/v2/top-headlines'

params = {
    'apiKey': news_KEY,
    'category': 'business'
}


@app.route('/art_create', methods=['POST'])
def art_create():
    try:
        response = requests.get(url, params=params)
        data = response.json()

        title_list = [title.get('title', 'No title available') for title in data['articles']]
        details = []

        predef = (
            "Read the title carefully",
            "Give me a summary of how this will influence the price of various stocks",
            "Give ONLY that, in a paragraph format",
            "Specifically name the stocks"
        )

        for title in title_list[:5]:
            x = model.generate_content(f"{predef} {title}")
            details.append(x.text)

        return jsonify({"messagehead": title_list[:5], "messagebody": details})
    
    except Exception as e:
        
        print("exception raised", e)
        temp = ['a', 'b', 'c']
        return jsonify({"messagehead": title_list, "messagebody": temp})

@app.route('/generate-text', methods=['POST'])
def generate_text():
    prompt = request.json.get('prompt')

    if not prompt:
        return jsonify({'error': 'Prompt is required'}), 400

    try:
        response = model.generate_content(prompt)
        if hasattr(response, 'text'):
            generated_text = response.text
        elif 'text' in response:
            generated_text = response['text']
        else:
            generated_text = "No text generated" 
        return jsonify({'text': generated_text})

    except Exception as e:
        print(f"Error generating text: {e}")
        return jsonify({'error': 'Error generating text'}), 500

GORQ_API_KEY = "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"
# Optionally, you can also set it via environment variable:
# os.environ["GROQ_API_KEY"] = GORQ_API_KEY

@app.route('/art_create_gorq', methods=['POST'])
def art_create_gorq():
    try:
        # Fetch global news articles as before
        response = requests.get(url, params=params)
        data = response.json()
        title_list = [article.get('title', 'No title available') for article in data.get('articles', [])]
        details = []
        
        # Predefined prompt for summarization
        predef = (
            "Read the title carefully. ",
            "Give me a summary of how this will influence the price of various stocks. ",
            "Give ONLY that, in a paragraph format. ",
            "Specifically name the stocks."
        )
        prompt_base = " ".join(predef)
        
        # Create a Groq client using the gorq API key
        client = Groq(api_key=GORQ_API_KEY)
        
        for title in title_list[:5]:
            prompt = f"{prompt_base} {title}"
            # Use the Groq client to generate a summary.
            resp = client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama-3.3-70b-versatile"
            )
            # Extract the generated text
            summary = resp.choices[0].message.content
            details.append(summary)
            
        return jsonify({"messagehead": title_list[:5], "messagebody": details})
    
    except Exception as e:
        print("Exception in art_create_gorq:", e)
        fallback_titles = title_list if 'title_list' in locals() else ['No data']
        return jsonify({"messagehead": fallback_titles, "messagebody": ['Error generating details']}), 500

@app.route('/generate-text_gorq', methods=['POST'])
def generate_text_gorq():
    prompt = request.json.get('prompt')
    if not prompt:
        return jsonify({'error': 'Prompt is required'}), 400
    
    try:
        # Create a Groq client using the gorq API key
        client = Groq(api_key=GORQ_API_KEY)
        
        # Generate completion using the provided prompt
        resp = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile"
        )
        generated_text = resp.choices[0].message.content
        return jsonify({'text': generated_text})
    
    except Exception as e:
        print(f"Error in generate-text_gorq: {e}")
        return jsonify({'error': 'Error generating text'}), 500


logging.getLogger("cmdstanpy").setLevel(logging.WARNING)
warnings.filterwarnings("ignore", category=FutureWarning)


# Initialize NSE and get list of NSE tickers
nse = Nse()
nse_stock_list = nse.get_stock_codes()  # Returns a list of tickers
# Clean the list: remove empty entries and the header "SYMBOL"
nse_stock_set = set([s.strip().upper() for s in nse_stock_list if s.strip() and s.strip() != "SYMBOL"])

@app.route('/get-tickers', methods=['GET'])
def get_tickers():
    try:
        tickers = list(nse_stock_set)
        return jsonify({"tickers": tickers})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/generate-chart', methods=['POST'])
def generate_chart():
    try:
        data = request.get_json()
        input_ticker = data.get("ticker", "").strip().upper()
        if not input_ticker:
            return jsonify({"error": "Ticker is required"}), 400

        # Append .NS if not present and verify the ticker exists in the NSE list
        if not input_ticker.endswith(".NS"):
            if input_ticker in nse_stock_set:
                ticker = input_ticker + ".NS"
            else:
                return jsonify({"error": f"Ticker {input_ticker} not found in NSE"}), 404
        else:
            base_ticker = input_ticker[:-3]
            if base_ticker in nse_stock_set:
                ticker = input_ticker
            else:
                return jsonify({"error": f"Ticker {input_ticker} not found in NSE"}), 404

        # Try downloading data using yfinance.
        try:
            df = yf.download(ticker, period="8d", interval="1m")
        except Exception as download_error:
            return jsonify({"error": f"Failed to download data for ticker {ticker}: {download_error}"}), 404

        if df.empty:
            return jsonify({"error": f"No data found for ticker {ticker}. It might be temporarily unavailable."}), 404

        df.reset_index(inplace=True)
        if isinstance(df.columns, pd.MultiIndex):
            df.columns = df.columns.get_level_values(0)

        # Prepare data for Prophet.
        df_prophet = df[['Datetime', 'Close']].rename(columns={'Datetime': 'ds', 'Close': 'y'})
        df_prophet['ds'] = pd.to_datetime(df_prophet['ds']).dt.tz_localize(None)
        df_prophet['y'] = pd.to_numeric(df_prophet['y'], errors='coerce')

        # Use the latter portion of the historical data (one-third index here).
        half_index = len(df_prophet) // 3
        historical_data_second_half = df_prophet.iloc[half_index:]

        # Fit the Prophet model.
        model = Prophet(daily_seasonality=1, yearly_seasonality=8, weekly_seasonality=0)
        model.fit(df_prophet)

        # Forecast the next 2160 minutes (1.5 days).
        future = model.make_future_dataframe(periods=2160, freq='min')
        forecast = model.predict(future)

        # Filter predictions beyond the last training timestamp.
        last_actual_date = df_prophet['ds'].iloc[-1]
        predicted_data = forecast[forecast['ds'] > last_actual_date][['ds', 'yhat']]

        actual_data = historical_data_second_half[['ds', 'y']].rename(
            columns={'ds': 'date', 'y': 'close'}
        ).to_dict(orient='records')
        forecast_data = predicted_data.rename(
            columns={'ds': 'date', 'yhat': 'predicted'}
        ).to_dict(orient='records')

        return jsonify({
            'actual_data': actual_data,
            'forecast_data': forecast_data
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/get-news-summary', methods=['POST'])
def get_news_summary():
    ticker_symbol = request.json.get('ticker')
    if not ticker_symbol:
        return jsonify({'error': 'Ticker is required'}), 400

    # Automatically append ".NS" if not present
    if not ticker_symbol.strip().upper().endswith(".NS"):
        ticker_symbol = ticker_symbol.strip().upper() + ".NS"
    
    try:
        # Create a Ticker object from yfinance.
        ticker = yf.Ticker(ticker_symbol)
        news_items = ticker.news
        if not news_items:
            return jsonify({'error': 'No news found for this ticker'}), 404
        
        # Flatten news items (each item has an "id" and "content" dictionary)
        flat_news = []
        for item in news_items:
            flat_item = {}
            flat_item["id"] = item.get("id")
            content = item.get("content", {})
            flat_item.update(content)
            flat_news.append(flat_item)
        
        df_news = pd.DataFrame(flat_news)
        # For this example, if keys 'title' and 'pubDate' exist, pick the most recent article.
        if "title" in df_news.columns and "pubDate" in df_news.columns:
            article = df_news.sort_values("pubDate", ascending=False).iloc[0]
            article_text = (
                article.get('title', '') + "\n" +
                article.get('description', '') + "\n" +
                article.get('summary', '')
            )
        else:
            article_text = df_news.iloc[0].to_string()
        
        # Create a prompt for summarization that asks the model to summarize and indicate sentiment.
        prompt = f"Summarize the following news article and indicate if the sentiment is positive or negative:\n\n{article_text}"
        
        # Call your Groq API client to generate the summary.
        client = Groq(api_key=GORQ_API_KEY)
        resp = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile"
        )
        generated_text = resp.choices[0].message.content
        
        # Simple sentiment analysis based on generated text:
        lower_text = generated_text.lower()
        if "positive" in lower_text:
            sentiment = "green"
        elif "negative" in lower_text:
            sentiment = "red"
        else:
            sentiment = "neutral"
        
        return jsonify({'summary': generated_text, 'sentiment': sentiment})
    
    except Exception as e:
        print(f"Error in get_news_summary: {e}")
        return jsonify({'error': 'Error generating news summary'}), 500


if __name__ == '__main__':
    app.run(debug=True)