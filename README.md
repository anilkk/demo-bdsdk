# Bright Data Web Scraping Example

This project demonstrates how to use the Bright Data SDK to scrape web content and save the results.

## Prerequisites

- Node.js installed (v14 or higher)
- A Bright Data API key
- A Bright Data Dataset ID

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd <repository-name>
```

2. Install dependencies:
```bash
npm install
```

3. Configure your API key and Dataset ID:
   - Open `script.js`
   - Update the config object with your credentials:
   ```javascript
   const config = {
     apiKey: "your-api-key",
     datasetId: "your-dataset-id"
   };
   ```

## Running the Script

Run the script using Node.js:
```bash
node script.js
```

The script will:
1. Start a collection using Bright Data
2. Monitor the progress (with up to 10 retries, checking every 30 seconds)
3. Save the results to the `output` folder when complete

## Output

Results will be saved in the `output` directory with timestamped filenames:
- Format: `results-YYYY-MM-DDTHH-mm-ss-mmmZ.json`
- Example: `results-2025-05-04T06-45-12-000Z.json`

Note: The `output` directory is excluded from git to avoid committing large data files.

## Error Handling

- The script will retry up to 10 times if the collection is still running
- Error messages will be displayed in the console if any issues occur
- The script will exit with status code 1 if an error occurs

## Dependencies

- akbdsdk: Bright Data SDK for web scraping
