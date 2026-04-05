FROM python:3.10-slim

WORKDIR /app

# Requirements install 
COPY FlashCards/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 
COPY FlashCards/ .

# 
ENV PORT=5000

#  0.0.0.0 pe bind
CMD ["sh", "-c", "python app.py"]
