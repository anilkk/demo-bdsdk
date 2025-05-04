const { BrightDataClient } = require('akbdsdk');
const fs = require('fs');
const path = require('path');

/**
 * Example usage of the Bright Data SDK
 * 
 * This example demonstrates how to:
 * 1. Initialize the client
 * 2. Trigger a collection
 * 3. Monitor progress
 * 4. Download results
 * 
 * Usage:
 * 1. Set environment variables:
 *    export BRIGHTDATA_API_KEY='your-api-key'
 *    export BRIGHTDATA_DATASET_ID='your-dataset-id'
 * 2. Run: node example.js
 */

// Configuration
const config = {
  apiKey: process.env.BRIGHTDATA_API_KEY,
  datasetId: process.env.BRIGHTDATA_DATASET_ID
};

// Validate configuration
if (!config.apiKey) {
  console.error('Error: BRIGHTDATA_API_KEY environment variable is not set');
  process.exit(1);
}

if (!config.datasetId) {
  console.error('Error: BRIGHTDATA_DATASET_ID environment variable is not set');
  process.exit(1);
}

// Initialize client
const client = new BrightDataClient({
  apiKey: config.apiKey
});

/**
 * Main function to demonstrate SDK usage
 */
async function main() {
  try {
    console.log('Starting Bright Data collection...');

    // Step 1: Trigger collection
    const triggerResponse = await client.triggerCollection({
      dataset_id: config.datasetId,
      urls: [{
        // Replace these values with your target website and requirements
        url: "https://www.perplexity.ai",
        prompt: "Automation",
        country: "US",
      }]
    });

    console.log('Collection triggered successfully');
    console.log('Snapshot ID:', triggerResponse.snapshot_id);

    // Step 2: Wait for completion with retries
    console.log('Waiting for collection to complete...');
    let attempts = 0;
    let status;
    
    do {
      status = await client.waitForSnapshot(triggerResponse.snapshot_id, {
        maxAttempts: 1,
        delayMs: 0,
        onProgress: (status) => {
          console.log('Progress:', {
            status: status.status,
            pages_crawled: status.progress?.pages_crawled || 0,
            pages_extracted: status.progress?.pages_extracted || 0
          });
        }
      });

      attempts++;
      
      if (status.status === 'running') {
        console.log(`Attempt ${attempts}/10: Still running, checking again in 30 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 30000));
      }
    } while (status.status === 'running' && attempts < 10);

    // Only proceed with download if status is ready
    if (status.status !== 'ready') {
      throw new Error(`Collection did not complete successfully after ${attempts} attempts. Final status: ${status.status}`);
    }

    console.log('Collection completed successfully');
    console.log('Final status:', status.status);

    // Step 3: Download results only when status is ready
    console.log('Downloading results...');
    const downloadResponse = await client.downloadSnapshot({
      job_id: triggerResponse.snapshot_id,
      format: 'json'
    });

    // Create output directory if it doesn't exist
    const outputDir = path.join(__dirname, 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    // Save results to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputFile = path.join(outputDir, `results-${timestamp}.json`);
    fs.writeFileSync(outputFile, JSON.stringify(downloadResponse, null, 2));

    console.log(`Results saved to: ${outputFile}`);

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('API Response:', error.response.data);
    }
    process.exit(1);
  }
}

// Run the example
main();