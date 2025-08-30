import React, { useState, useCallback } from 'react';
import { Upload, FileText, BarChart3, PieChart } from 'lucide-react';
import Papa from 'papaparse';
import _ from 'lodash';

// CSV Parser Component
const CSVUploader = ({ onDataParsed }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFile = useCallback((file) => {
    if (!file || file.type !== 'text/csv') {
      alert('Please upload a valid CSV file');
      return;
    }

    setIsLoading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      delimitersToGuess: [',', '\t', '|', ';'],
      complete: (results) => {
        // Clean headers by trimming whitespace
        const cleanedData = results.data.map(row => {
          const cleanedRow = {};
          Object.keys(row).forEach(key => {
            const cleanKey = key.trim();
            cleanedRow[cleanKey] = row[key];
          });
          return cleanedRow;
        });

        onDataParsed(cleanedData);
        setIsLoading(false);
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        alert('Error parsing CSV file');
        setIsLoading(false);
      }
    });
  }, [onDataParsed]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, [handleFile]);

  const handleFileInput = useCallback((e) => {
    const file = e.target.files[0];
    handleFile(file);
  }, [handleFile]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
      >
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
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Processing...' : 'Choose File'}
        </label>
      </div>
    </div>
  );
};

// Data Processing Component
const SentimentProcessor = ({ data }) => {
  // Group data by polarity and subjectivity ranges
  const processedData = React.useMemo(() => {
    if (!data || data.length === 0) return null;

    // Check if required columns exist
    const hasPolarity = data.some(row =>
      row.polarity !== undefined || row.Polarity !== undefined
    );
    const hasSubjectivity = data.some(row =>
      row.subjectivity !== undefined || row.Subjectivity !== undefined
    );

    if (!hasPolarity || !hasSubjectivity) {
      return { error: 'CSV must contain polarity and subjectivity columns' };
    }

    // Normalize column names and convert to numbers
    const normalizedData = data.map(row => ({
      ...row,
      polarity: Number(row.polarity || row.Polarity || 0),
      subjectivity: Number(row.subjectivity || row.Subjectivity || 0),
      sentiment: row.sentiment || row.Sentiment || row.text || row.Text || 'N/A'
    })).filter(row => !isNaN(row.polarity) && !isNaN(row.subjectivity));

    // Group by polarity ranges
    const polarityGroups = _.groupBy(normalizedData, (item) => {
      if (item.polarity > 0.1) return 'Positive';
      if (item.polarity < -0.1) return 'Negative';
      return 'Neutral';
    });

    // Group by subjectivity ranges
    const subjectivityGroups = _.groupBy(normalizedData, (item) => {
      if (item.subjectivity > 0.5) return 'Subjective';
      return 'Objective';
    });

    // Combined grouping
    const combinedGroups = _.groupBy(normalizedData, (item) => {
      const polarityLabel = item.polarity > 0.1 ? 'Positive' :
                           item.polarity < -0.1 ? 'Negative' : 'Neutral';
      const subjectivityLabel = item.subjectivity > 0.5 ? 'Subjective' : 'Objective';
      return `${polarityLabel} & ${subjectivityLabel}`;
    });

    return {
      total: normalizedData.length,
      polarityGroups,
      subjectivityGroups,
      combinedGroups,
      rawData: normalizedData
    };
  }, [data]);

  if (!processedData) return null;

  if (processedData.error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{processedData.error}</p>
        <p className="text-sm text-red-600 mt-2">
          Expected columns: polarity, subjectivity (and optionally sentiment/text)
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="mr-2" />
          Analysis Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {processedData.total}
            </div>
            <div className="text-sm text-gray-600">Total Entries</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {Object.keys(processedData.polarityGroups).length}
            </div>
            <div className="text-sm text-gray-600">Polarity Groups</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {Object.keys(processedData.combinedGroups).length}
            </div>
            <div className="text-sm text-gray-600">Combined Categories</div>
          </div>
        </div>
      </div>

      {/* Polarity Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Polarity Distribution
        </h3>
        <div className="space-y-3">
          {Object.entries(processedData.polarityGroups).map(([group, items]) => (
            <div key={group} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="font-medium">{group}</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{items.length} items</span>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      group === 'Positive' ? 'bg-green-500' :
                      group === 'Negative' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${(items.length / processedData.total) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium">
                  {((items.length / processedData.total) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subjectivity Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Subjectivity Distribution
        </h3>
        <div className="space-y-3">
          {Object.entries(processedData.subjectivityGroups).map(([group, items]) => (
            <div key={group} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="font-medium">{group}</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{items.length} items</span>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      group === 'Subjective' ? 'bg-purple-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${(items.length / processedData.total) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium">
                  {((items.length / processedData.total) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Combined Groups */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <PieChart className="mr-2" />
          Combined Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(processedData.combinedGroups).map(([group, items]) => (
            <div key={group} className="p-4 border rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">{group}</h4>
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {items.length}
              </div>
              <div className="text-sm text-gray-500 mb-2">
                {((items.length / processedData.total) * 100).toFixed(1)}% of total
              </div>
              <div className="text-xs text-gray-400">
                Avg Polarity: {(_.meanBy(items, 'polarity') || 0).toFixed(3)}
              </div>
              <div className="text-xs text-gray-400">
                Avg Subjectivity: {(_.meanBy(items, 'subjectivity') || 0).toFixed(3)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sample Data Preview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Sample Data Preview
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sentiment Text
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Polarity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subjectivity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {processedData.rawData.slice(0, 10).map((row, index) => {
                const polarityLabel = row.polarity > 0.1 ? 'Positive' :
                                    row.polarity < -0.1 ? 'Negative' : 'Neutral';
                const subjectivityLabel = row.subjectivity > 0.5 ? 'Subjective' : 'Objective';

                return (
                  <tr key={index}>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {row.sentiment}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        row.polarity > 0.1 ? 'bg-green-100 text-green-800' :
                        row.polarity < -0.1 ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {row.polarity.toFixed(3)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        row.subjectivity > 0.5 ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {row.subjectivity.toFixed(3)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {polarityLabel} & {subjectivityLabel}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {processedData.rawData.length > 10 && (
            <p className="text-sm text-gray-500 mt-2 text-center">
              Showing first 10 of {processedData.rawData.length} entries
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Main App Component
const SentimentHub = () => {
  const [csvData, setCsvData] = useState(null);
  const [activeTab, setActiveTab] = useState('upload');

  const handleDataParsed = useCallback((data) => {
    setCsvData(data);
    setActiveTab('analysis');
  }, []);

  const resetApp = () => {
    setCsvData(null);
    setActiveTab('upload');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">Sentiment Hub</h1>
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
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {!csvData ? (
            <div className="text-center">
              <div className="mb-8">
                <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Welcome to Sentiment Hub
                </h2>
                <p className="text-gray-600 max-w-md mx-auto">
                  Upload a CSV file containing sentiment data with polarity and subjectivity
                  columns to analyze and visualize your sentiment patterns.
                </p>
              </div>
              <CSVUploader onDataParsed={handleDataParsed} />

              {/* Expected Format Info */}
              <div className="mt-8 max-w-2xl mx-auto text-left">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Expected CSV Format
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 mb-2">
                    Your CSV should contain these columns:
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li><strong>polarity</strong>: Numeric value (-1 to 1, where -1 is negative, 1 is positive)</li>
                    <li><strong>subjectivity</strong>: Numeric value (0 to 1, where 0 is objective, 1 is subjective)</li>
                    <li><strong>sentiment/text</strong>: The actual text content (optional)</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <SentimentProcessor data={csvData} />
          )}
        </div>
      </main>
    </div>
  );
};

export default SentimentHub;