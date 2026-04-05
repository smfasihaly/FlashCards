FROM python:3.10-slim

WORKDIR /app

# Requirements install karo
COPY FlashCards/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pure app copy karo
COPY FlashCards/ .

# Port jo Back4App use karega
ENV PORT=5000

# Expose karo port 5000
EXPOSE 5000

# Flask ko production mode me start karo, 0.0.0.0 pe bind
CMD ["sh", "-c", "python app.py"]
