# 🧠 Sentiment Hub
a central hub for sentiment data analysis

**Sentiment Hub** is a full-stack web application that takes a CSV file of text data with sentiment scores, processes it through an API, and groups the analysis into meaningful categories for easy visualization and insights.

---

## 🚀 Features

- 📂 **CSV Upload** – Import your sentiment analysis data easily.
- 🧮 **Automated Grouping** – Automatically groups data by sentiment (positive, negative, neutral).
- 📊 **Interactive Dashboard** – View summaries, charts, and insights.
- 🌐 **Full-Stack App** – Bundled **Frontend**, **Backend**, and **API** for a complete solution.
- 🔧 **Customizable** – Extend to work with different sentiment models or custom categories.

---

## 🛠️ Tech Stack

| Layer | Technology |
|------|-------------|
| **Frontend** | React + Tailwind CSS |
| **Backend** | Node.js + Express |
| **API** | REST API for sentiment data processing |
| **Data** | CSV Parsing with `csv-parser` / `pandas` |
| **Optional ML** | Python (for preprocessing / custom ML) |

---

## 📂 Project Structure

```bash
sentiment-hub/
├── frontend/           # React UI for uploading CSV & displaying results
├── backend/            # Node.js/Express server
├── api/                # API endpoints for processing CSV data
├── data/               # Sample CSV files (for testing)
├── scripts/            # Optional Python scripts for advanced analysis
└── README.md           # Project documentation
