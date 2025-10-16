# Workshop Stats Update System

This document explains how the workshop statistics update system works and how to use it.

## Overview

Workshop statistics (ratings, reviews, completed jobs, etc.) are calculated from completed appointments and stored in the workshop documents. This endpoint updates these cached statistics to ensure they stay current.

## Endpoint

**POST** `/api/workshops/stats/update`

**GET** `/api/workshops/stats/update` (convenience method, same as POST)

## Features

The endpoint calculates and updates the following statistics:

1. **Average Rating** - Calculated from completed appointments with customer ratings
2. **Total Reviews** - Count of completed appointments with ratings
3. **Completed Jobs** - Total number of completed appointments
4. **Repeat Customers** - Number of customers who have visited more than once
5. **Response Time** - Average time (in hours) from quotation request to first quote submission

## Authentication

The endpoint can be protected with an API key for security:

1. Set the `STATS_UPDATE_API_KEY` environment variable:
   ```bash
   STATS_UPDATE_API_KEY=your-secret-key-here
   ```

2. Include the API key in your requests:
   ```
   POST /api/workshops/stats/update?apiKey=your-secret-key-here
   ```

## Usage

### Update All Workshops

```bash
# With API key
curl -X POST "http://localhost:3000/api/workshops/stats/update?apiKey=your-secret-key-here"

# Without API key (if STATS_UPDATE_API_KEY is not set)
curl -X POST "http://localhost:3000/api/workshops/stats/update"
```

### Update Specific Workshop

```bash
curl -X POST "http://localhost:3000/api/workshops/stats/update?workshopId=507f1f77bcf86cd799439011&apiKey=your-secret-key-here"
```

### Response Format

```json
{
  "success": true,
  "message": "Successfully updated stats for 3 workshop(s)",
  "updated": 3,
  "total": 5,
  "details": [
    {
      "workshopId": "507f1f77bcf86cd799439011",
      "businessName": "AutoFix Workshop",
      "modified": true,
      "stats": {
        "totalReviews": 15,
        "averageRating": 4.6,
        "completedJobs": 42,
        "repeatCustomers": 8,
        "responseTime": 12
      }
    }
  ]
}
```

## Scheduling Options

### Option 1: Vercel Cron Jobs (Recommended for Vercel deployments)

Create a file `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/workshops/stats/update?apiKey=your-secret-key-here",
      "schedule": "0 2 * * *"
    }
  ]
}
```

This runs the update daily at 2:00 AM UTC.

### Option 2: GitHub Actions (For any hosting)

Create `.github/workflows/update-workshop-stats.yml`:

```yaml
name: Update Workshop Stats

on:
  schedule:
    # Runs every 6 hours
    - cron: '0 */6 * * *'
  workflow_dispatch: # Allows manual triggering

jobs:
  update-stats:
    runs-on: ubuntu-latest
    steps:
      - name: Update Workshop Statistics
        run: |
          curl -X POST "${{ secrets.APP_URL }}/api/workshops/stats/update?apiKey=${{ secrets.STATS_UPDATE_API_KEY }}"
```

Set the following secrets in GitHub:
- `APP_URL`: Your application URL (e.g., `https://your-app.vercel.app`)
- `STATS_UPDATE_API_KEY`: Your API key

### Option 3: External Cron Service

Use services like:
- **cron-job.org**
- **EasyCron**
- **Cronitor**

Configure them to make a POST request to your endpoint periodically.

### Option 4: Manual Trigger

For development or testing, you can trigger the update manually:

1. Open your browser
2. Navigate to: `http://localhost:3000/api/workshops/stats/update`
3. Check the response

## Environment Variables

Add to your `.env.local` file:

```env
# Optional: API key for stats update endpoint
STATS_UPDATE_API_KEY=your-secret-key-here-change-in-production
```

## Monitoring

The endpoint provides detailed information about what was updated:

- **updated**: Number of workshops with modified stats
- **total**: Total number of workshops processed
- **details**: Array of workshop-specific update information

## Performance Considerations

1. **Execution Time**: Updates all workshops in parallel for better performance
2. **Database Load**: Uses aggregation pipelines for efficient calculation
3. **Frequency**: Recommended schedule:
   - **High traffic**: Every 1-2 hours
   - **Medium traffic**: Every 6 hours
   - **Low traffic**: Daily

## Troubleshooting

### Stats not updating

1. Check if the endpoint is being called successfully
2. Verify API key is correct (if using authentication)
3. Check server logs for errors
4. Ensure MongoDB connection is working

### Performance issues

1. Add indexes to appointments collection:
   ```javascript
   db.appointments.createIndex({ workshopId: 1, status: 1 })
   db.appointments.createIndex({ workshopId: 1, customerRating: 1 })
   ```

2. Add indexes to quotations collection:
   ```javascript
   db.quotations.createIndex({ 'quotes.workshopId': 1, 'quotes.submittedAt': 1 })
   ```

## Integration with Frontend

The stats update happens in the background. The frontend will automatically see updated stats when:

1. **Search page** - Always uses fresh calculations (real-time)
2. **Workshop profile** - Uses cached stats (updated by this endpoint)
3. **Individual workshop page** - Uses cached stats (updated by this endpoint)

## API Response Codes

- **200**: Success
- **401**: Invalid API key (if authentication is enabled)
- **500**: Server error (check logs for details)

## Development Testing

Test the endpoint locally:

```bash
# Start your development server
npm run dev

# In another terminal, trigger the update
curl -X POST "http://localhost:3000/api/workshops/stats/update"

# Or open in browser
open "http://localhost:3000/api/workshops/stats/update"
```

## Production Deployment

1. Set the `STATS_UPDATE_API_KEY` environment variable in your hosting platform
2. Configure your chosen scheduling method (Vercel Cron, GitHub Actions, etc.)
3. Test the endpoint with the production URL
4. Monitor the first few scheduled runs to ensure they complete successfully

## Notes

- The endpoint is idempotent - safe to run multiple times
- Running more frequently than needed won't cause issues but may increase costs
- Stats are calculated from actual appointment data, ensuring accuracy
- Only active workshops (`isActive: true`) are updated
