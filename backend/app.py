from flask import Flask, request, jsonify
# for chatbot
import google.generativeai as genai
from flask_cors import CORS
# for chart
import pandas as pd
from prophet import Prophet
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

from datetime import timedelta

app = Flask(__name__)
CORS(app)
df = pd.read_csv('NIFTY 50_minute.csv')

# Replace with your actual Gemini API key
GOOGLE_API_KEY = 'AIzaSyDGn6vr_hc_dPxSdGR73WlMAb5mA-oGp28'
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

@app.route('/generate-text', methods=['POST'])
def generate_text():
    prompt = request.json.get('prompt')

    if not prompt:
        return jsonify({'error': 'Prompt is required'}), 400

    try:
        # Generate content using the Google API
        response = model.generate_content(prompt)
        print(response.text)
        # Extract the generated text from the response object
        if hasattr(response, 'text'):  # If the response has a 'text' attribute
            generated_text = response.text
        elif 'text' in response:  # If response is a dict with a 'text' key
            generated_text = response['text']
        else:
            generated_text = "No text generated" 
        return jsonify({'text': generated_text})

    except Exception as e:
        print(f"Error generating text: {e}")
        return jsonify({'error': 'Error generating text'}), 500

@app.route('/generate-chart', methods=['POST'])
def generate_chart():
    try:
        # Get the received date from the frontend request
        
        data = request.get_json()
        
        received_date = pd.to_datetime(data['date'])     
        
        # Calculate the end date (1 month after the received date)
        end_date = received_date + timedelta(days=30)
        
        # Filter the data based on the received date and 1 month after it
        df_filtered = df[(df['date'] >= received_date.strftime('%Y-%m-%d')) & (df['date'] < end_date.strftime('%Y-%m-%d'))]
        
        # Prepare data for Prophet (Prophet expects 'ds' and 'y')
        df_filtered_prophet = df_filtered[['date', 'close']].rename(columns={'date': 'ds', 'close': 'y'})
        
        # Initialize the Prophet model
        model = Prophet(daily_seasonality=False, yearly_seasonality=False, weekly_seasonality=True)
        
        # Fit the model on the filtered data
        model.fit(df_filtered_prophet)

        # Create a dataframe to hold future dates (next 7 days after the end date)
        future_dates = model.make_future_dataframe(periods=7*24*60, freq='min')   # 7 days forecast
        
        # Make predictions for the next 7 days
        forecast = model.predict(future_dates)
        
        # Prepare the forecast for the next 7 days
        forecast_filtered = forecast[(forecast['ds'] >= end_date.strftime('%Y-%m-%d')) & (forecast['ds'] < (end_date+ timedelta(days=30)).strftime('%Y-%m-%d'))]
        print(forecast_filtered)
        print(f"Type of forecast_filtered['ds']: {type(forecast_filtered['ds'].iloc[0])}")
        print(f"Any NaN in forecast_filtered['yhat']? {forecast_filtered['yhat'].isna().any()}")

        # Generate the plot
        forecast_data = forecast_filtered[['ds', 'yhat']].rename(columns={'ds': 'date', 'yhat': 'predicted'}).to_dict(orient='records')
        actual_data = df_filtered[['date', 'close']].to_dict(orient='records')

        # Return the forecasted and actual data as JSON
        return jsonify({
            'actual_data': actual_data,
            'forecast_data': forecast_data
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 400


if __name__ == '__main__':
    app.run(debug=True)

