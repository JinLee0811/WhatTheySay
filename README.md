# WhatTheySay

A restaurant review analysis application that helps users understand customer feedback using AI.

## About

WhatTheySay is an innovative restaurant review analysis tool that leverages artificial intelligence to help users make informed dining decisions. The application provides comprehensive insights by analyzing Google Maps reviews for restaurants in Sydney.

### Key Features

- **Smart Restaurant Search**: Easily find restaurants in Sydney using Google Maps integration
- **AI-Powered Review Analysis**: Utilizes Google's Gemini AI to analyze customer reviews
- **Sentiment Analysis**: Understand the overall customer sentiment about the restaurant
- **Menu Recommendations**: Get insights about popular dishes and recommended menu items
- **Keyword Extraction**: Identify key positive and negative aspects mentioned in reviews
- **User-Friendly Interface**: Clean and intuitive design for seamless user experience

## Author

Created by Jin Lee

For inquiries or support, please contact:

- Email: jinlee811811@gmail.com

## Environment Setup

1. Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

2. Set up your environment variables in `.env.local`:

- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Your Google Maps API key for Places API
- `GOOGLE_GEMINI_API_KEY`: Your Google Gemini API key for AI analysis

## Security Notes

- Never commit your `.env.local` file or any other files containing API keys
- Keep your API keys secure and rotate them regularly
- Use environment variables for all sensitive information

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## How It Works

1. **Restaurant Search**: Users can search for restaurants in Sydney using the integrated Google Maps search functionality
2. **Review Collection**: The application automatically collects and processes reviews from Google Maps
3. **AI Analysis**: Using Google's Gemini AI, the application analyzes:
   - Overall sentiment of reviews
   - Frequently mentioned menu items
   - Popular dishes and recommendations
   - Key positive and negative aspects
4. **Results Display**: Users receive a comprehensive analysis including:
   - Sentiment analysis with positive/negative breakdown
   - Menu recommendations based on customer feedback
   - Key highlights and areas for improvement
   - Specific menu items frequently mentioned in reviews

## Technologies Used

- Next.js for the frontend framework
- Google Maps Places API for restaurant search
- Google Gemini AI for review analysis
- TypeScript for type-safe code
- Tailwind CSS for styling

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
