# CarKaki 🚗

Welcome to CarKaki - A smart parking solution developed for NTU SC2006 Software Engineering Module. CarKaki helps Singapore drivers find, navigate to, and manage their parking experiences efficiently.

## Project Overview

CarKaki is built using the modern [T3 Stack](https://create.t3.gg/), implementing a robust, layered architecture that ensures scalability, type safety, and maintainable code. The application helps users locate available parking spaces, check parking rates, and navigate to their desired parking locations.

## System Architecture

Our application is built with a clear separation of concerns across five main layers:

1. **View Layer**
   - Built with Next.js for both Server-Side Rendering (SSR) and Static Site Generation (SSG)
   - Responsive user interfaces for landing page, home page, and car park details
   - Enhanced SEO through server-side rendering

2. **Router Layer**
   - Implements tRPC for type-safe API routes
   - Efficient request handling between client and server
   - Streamlined API development without REST/GraphQL complexity

3. **Service Layer**
   - Handles core business logic
   - Modular design for easy maintenance and testing
   - Includes services for users, car parks, and parking history

4. **Repository Layer**
   - Manages database operations using Drizzle ORM
   - Type-safe database queries
   - Efficient connection pooling with Neon.tech

5. **Model Layer**
   - Implements immutable data structures
   - Ensures data integrity and predictability
   - Thread-safe operations for concurrent requests

## Cross-Platform Compatibility

CarKaki is designed to work seamlessly across multiple platforms and devices using next-pwa and progressive web app capabilities:

### Desktop Applications
- **Windows**: Available as a standalone app through PWA installation
- **macOS**: Native-like experience through Safari or Chrome PWA support
- **Linux**: Compatible with major browsers supporting PWA

### Mobile Devices
- **iOS**: 
  - Installable PWA through Safari
  - Full integration with Apple CarPlay
  - Native-like experience with home screen installation
  - Optimized for all iPhone models
  
- **Android**:
  - Available through Play Store as TWA (Trusted Web Activity)
  - Android Auto integration for safe in-car usage
  - Full support for Android's PWA features
  - Adaptive layouts for various screen sizes

### Automotive Integration
- **Apple CarPlay**:
  - Simplified interface for driving mode
  - Voice-controlled parking search
  - Turn-by-turn navigation integration
  - Quick access to favorite parking locations
  
- **Android Auto**:
  - Distraction-minimized UI for driving
  - Voice command support
  - Seamless Google Maps integration
  - Real-time parking availability updates

### PWA Features
- Offline functionality for saved locations
- Responsive design adapting to all screen sizes
- App-like experience with smooth transitions
- Automatic updates without user intervention

## Tech Stack

- [Next.js](https://nextjs.org) - React framework with SSR/SSG capabilities
- [Clerk](https://clerk.com/) - Secure authentication with password leak detection
- [Drizzle](https://orm.drizzle.team/) - Type-safe ORM with migration support
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework
- [tRPC](https://trpc.io) - End-to-end typesafe API layer
- [Neon.tech](https://neon.tech) - Serverless PostgreSQL database
- [Vercel](https://vercel.com) - Serverless deployment platform
- [next-pwa](https://github.com/shadowwalker/next-pwa) - PWA support for Next.js

## External APIs

CarKaki integrates with several external APIs to provide its core functionalities:

### Urban Redevelopment Authority (URA) API
Used for real-time Singapore car park data and availability information.
- **Purpose**: 
  - Fetch real-time car park availability
  - Get parking rates
  - Retrieve car park information
- **Documentation**: [URA API Documentation](https://www.ura.gov.sg/maps/api/)
- **Setup**:
  1. Register at URA API Services portal
  2. Request for access key
  3. Add access key to `.env` as `URA_ACCESS_KEY`

### Google Maps Platform
Provides mapping, navigation, and geocoding services.
- **Purpose**:
  - Interactive map display
  - Turn-by-turn navigation
  - Address geocoding
  - Location search
- **Features Used**:
  - Maps JavaScript API
  - Geocoding API
  - Places API
  - Directions API
- **Documentation**: [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- **Setup**:
  1. Create project in Google Cloud Console
  2. Enable required APIs
  3. Create API key with appropriate restrictions
  4. Add to `.env` as:
     ```env
     GOOGLE_MAPS_API_KEY=your_server_key
     NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_client_key
     ```

### Data.gov.sg API
Provides Singapore public holiday data for parking rate calculations.
- **Purpose**:
  - Fetch public holiday information
  - Determine special parking rates
  - Holiday-specific business logic
- **Features Used**:
  - Public Holidays API
- **Documentation**: [Data.gov.sg Documentation](https://data.gov.sg/collections/691/view)
- **Endpoints**:
  - GET `/api/publicholidays` - List of public holidays
  - Query parameters:
    - `year`: Get holidays for specific year
- **No authentication required** - Public API

### Clerk Authentication
Handles user authentication and session management.
- **Purpose**:
  - User authentication
  - Session management
  - Profile management
  - Security features
- **Features Used**:
  - Email/password authentication
  - OAuth providers
  - Session management
  - User profiles
- **Documentation**: [Clerk Documentation](https://clerk.com/docs)
- **Setup**:
  1. Create account at Clerk
  2. Create new application
  3. Configure authentication methods
  4. Add to `.env`:
     ```env
     CLERK_WEBHOOK_SECRET=your_webhook_secret
     ```

## Getting Started

### Step 1: Installation

```bash
pnpm install
```

### Step 2: Environment Setup

Create a `.env` file in the root directory:

```env
# Database connection string
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# Development mode flag
IS_DEVELOPMENT="true"

# Google Maps API Keys
GOOGLE_MAPS_API_KEY="your_google_maps_api_key_here"
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your_public_google_maps_api_key_here"

# URA API Access Key
URA_ACCESS_KEY="your_ura_access_key_here"

# Clerk Authentication
CLERK_WEBHOOK_SECRET="your_clerk_webhook_secret_here"

# Node environment
NODE_ENV="development"
```

### Step 3: Launch the Application

```bash
pnpm dev
```

The application will automatically handle database migrations on startup.

## Key Features

- Real-time parking availability monitoring
- Interactive map interface with Google Maps integration
- Turn-by-turn navigation
- Dynamic parking rate information with holiday rate adjustments
- Secure user authentication via Clerk
- Favorite parking locations management
- Comprehensive search functionality
- Type-safe database operations
- Automatic scaling with serverless architecture
- Cross-platform compatibility with PWA support
- Apple CarPlay and Android Auto integration

## Deployment

CarKaki is deployed on Vercel's serverless platform, providing:
- Automatic scaling based on traffic
- Continuous deployment with GitHub integration
- Edge network distribution
- Zero-downtime deployments

The application utilizes Neon.tech for serverless PostgreSQL, offering:
- Automatic database scaling
- Built-in connection pooling
- Point-in-time recovery
- Branching for development

## Contributing

While this is primarily an academic project, we welcome contributions that could improve the application. Please feel free to submit issues and pull requests.

## Acknowledgments

- NTU College of Computing and Data Science
- Urban Redevelopment Authority (URA) for their API services
- Google Maps Platform for location services
- Data.gov.sg for public holiday data
- Vercel for hosting and deployment
- Neon.tech for database services