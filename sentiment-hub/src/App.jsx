import React, { useState } from "react";
import { Upload, FileText, BarChart3 } from "lucide-react";

// Hardcoded analyzed results (as would be returned by Gemini)
const hardCodedResults = [
  {
    sentiment:
      'Your products are excellent. I really love the quality! However, delivery to my location in Los Angeles was a bit slow. abbey@email.com',
    polarity: "Mixed (Positive for product, Negative for delivery)",
    subjectivity: "High",
    named_entities: [
      "Los Angeles (GPE)",
      "abbey@email.com (EMAIL)"
    ],
    category: "Product Quality & Delivery"
  },
  {
    sentiment:
      "The customer service team in New York was helpful in resolving my issue. I appreciate the assistance. brian@email.com",
    polarity: "Positive",
    subjectivity: "High",
    named_entities: [
      "New York (GPE)",
      "brian@email.com (EMAIL)"
    ],
    category: "Customer Service"
  },
  {
    sentiment:
      "The new features in the latest release are fantastic! They have greatly improved the user experience in San Francisco.",
    polarity: "Positive",
    subjectivity: "High",
    named_entities: [
      "San Francisco (GPE)"
    ],
    category: "Product Features / User Experience"
  },
  {
    sentiment:
      "The product didn't meet my expectations, and I'm disappointed. I hope you can address the issues in Chicago. My email address is emailme@email.com",
    polarity: "Negative",
    subjectivity: "High",
    named_entities: [
      "Chicago (GPE)",
      "emailme@email.com (EMAIL)"
    ],
    category: "Product Dissatisfaction"
  }
];

// Utility to auto-link emails in named entities
function linkify(text) {
  if (!text) return "";
  // Simple email matcher
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  return text.split(emailRegex).map((part, i) =>
    emailRegex.test(part) ? (
      <a href={`mailto:${part}`} key={i} className="text-blue-400 underline">{part}</a>
    ) : (
      part
    )
  );
}

const SentimentDetailList = ({ data }) => (
  <div className="bg-gray-900 text-gray-100 rounded-lg p-6 space-y-8 shadow">
    {data.map((row, idx) => (
      <div key={idx} className="mb-6">
        <div className="font-bold text-base mb-2">
          {idx + 1}.&nbsp;
          <span className="text-white">
            &quot;{linkify(row.sentiment)}&quot;
          </span>
        </div>
        <ul className="ml-6 space-y-1">
          <li>
            <span className="font-semibold">Polarity:</span>{" "}
            {row.polarity}
          </li>
          <li>
            <span className="font-semibold">Subjectivity:</span>{" "}
            {row.subjectivity}
          </li>
          <li>
            <span className="font-semibold">Named Entities:</span>{" "}
            {(row.named_entities && row.named_entities.length > 0)
              ? row.named_entities.map((ent, i) => (
                  <span key={i} className="mr-2">
                    {linkify(ent)}
                  </span>
                ))
              : <span className="text-gray-400">None</span>}
          </li>
          <li>
            <span className="font-semibold">Category:</span>{" "}
            {row.category || "N/A"}
          </li>
        </ul>
      </div>
    ))}
  </div>
);

const CSVUploader = ({ onUploadDone }) => {
  const [isLoading, setIsLoading] = useState(false);

  // Simulate upload and analysis with hardcoded data
  const handleFileInput = (e) => {
    setIsLoading(true);
    setTimeout(() => {
      onUploadDone(hardCodedResults);
      setIsLoading(false);
    }, 700); // quick fake "processing"
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="border-2 border-dashed rounded-lg p-8 text-center">
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">Upload CSV File</p>
        <p className="text-sm text-gray-500 mb-4">
          Drop your sentiment CSV here or click to browse
        </p>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileInput}
          className="hidden"
          id="csv-upload"
          disabled={isLoading}
        />
        <label
          htmlFor="csv-upload"
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? "Processing..." : "Choose File"}
        </label>
      </div>
    </div>
  );
};

const SentimentHub = () => {
  const [csvData, setCsvData] = useState(null);

  const handleDataParsed = (data) => {
    setCsvData(data);
  };

  const resetApp = () => {
    setCsvData(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">
                Sentiment Hub
              </h1>
            </div>
            {csvData && (
              <button
                onClick={resetApp}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Upload New File
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {!csvData ? (
            <div className="text-center">
              <div className="mb-8">
                <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Welcome to Sentiment Hub
                </h2>
                <p className="text-gray-600 max-w-md mx-auto">
                  Upload a CSV file containing sentiment data. For demo purposes,
                  you will see hardcoded analysis results.
                </p>
              </div>
              <CSVUploader onUploadDone={handleDataParsed} />
              <div className="mt-8 max-w-2xl mx-auto text-left">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Expected CSV Format
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>
                      <strong>sentiment/text</strong>: The actual text content
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <SentimentDetailList data={csvData} />
          )}
        </div>
      </main>
    </div>
  );
};

export default SentimentHub;