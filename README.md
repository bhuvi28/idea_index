<div align="center">

# 🚀 Idea2Index
### *by Team Artificial Ignorance*

[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2.16-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Python](https://img.shields.io/badge/Python-3.8+-3776ab?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)

### ✨ *From shower thoughts to stock portfolios in seconds* ✨

</div>

---

<div align="center">

## 🍻 **Ever wondered which companies sell things people buy when drunk?** 

### 🎯 **[Try it now →](http://mohtam-rh8.toa.des.co:3000)** 

*Transform your wildest investment ideas into real portfolios!*

</div>

---

## 📋 Table of Contents

- [🚀 Features](#-features)
- [🎯 Overview](#-overview)
- [✨ Installation](#-installation)
- [📖 Usage](#-usage)
- [⚙️ Configuration](#️-configuration)
- [🔌 API Reference](#-api-reference)
- [🤝 Contributing](#-contributing)
- [🧪 Tests](#-tests)
- [🙏 Acknowledgments](#-acknowledgments)
- [📬 Contact/Support](#-contactsupport)

---

## 🚀 Features

- **🧠 AI-Powered Index Generation:** Transform natural language investment ideas into structured portfolios using advanced AI
- **🎯 Smart Benchmark Comparison:** Automatically benchmark your index against the most appropriate market index - NIKKEI for Japan, NIFTY for India, S&P 500 for US markets
- **⏱️ Multi-Timeframe Analysis:** Compare performance across multiple time periods - 1 month, 3 months, 6 months, 1 year, 3 years, and 5 years
- **🎭 Witty Index Naming:** AI generates creative and memorable titles for your custom indices with personality and flair
- **🏆 Comprehensive Index Scoring:** Calculate various performance scores including Sharpe ratio, volatility metrics, risk-adjusted returns, and alpha generation to evaluate index quality
- **⚖️ Real-Time Weight Rebalancing:** Dynamically adjust portfolio weights with instant updates to normalized index values, key metrics, and visualizations
- **🧐 Stock Selection Rationale:** Detailed explanations for every stock inclusion - discover surprising connections like how Castrol India benefits from India's data center growth
- **🎨 Beautiful Interactive UI:** Modern, responsive interface with dynamic hover effects and smooth animations
- **📊 Comprehensive Portfolio Analysis:** Detailed holdings breakdown with sector allocation and market cap distribution
- **🌍 Global Market Coverage:** Support for international markets with proper country and sector classification
- **📈 Historical Performance Tracking:** 12+ months of historical data with customizable time ranges
- **📱 Mobile-First Design:** Fully responsive design optimized for all devices
- **🚀 High Performance:** Built with FastAPI backend for blazing-fast API responses
- **🔒 Robust Error Handling:** Comprehensive exception handling with detailed logging

---

## 🎯 Overview

Idea2Index is an innovative fintech application built during **Infinity Hacks**, the premier hackathon at D.E. Shaw India. This project bridges the gap between investment ideas and actionable portfolios, transforming natural language concepts like "AI companies with high R&D spend" or "sustainable energy leaders in emerging markets" into professionally structured investment indices.

The application combines a sleek Next.js frontend with a powerful FastAPI backend, leveraging advanced language models to analyze investment themes, screen relevant securities, and generate optimized portfolios with detailed rationale for each holding.

**Perfect for:**
- 📊 Financial analysts and portfolio managers
- 🎓 Investment research and education
- 💡 Rapid prototyping of investment strategies
- 🔬 Market research and thematic analysis
- 🏆 Hackathon projects and proof-of-concepts

### 🎬 Live Demo

<div align="center">

![Idea2Index Demo](demo1.gif)

*Watch the magic happen: From "drunk shopping companies" to a diversified portfolio in seconds!*

</div>

---

## ✨ Installation

<div align="center">

### 🛠️ Prerequisites

</div>

| Requirement | Version | Purpose |
|-------------|---------|---------|
| 🐍 **Python** | 3.8+ | Backend API & AI processing |
| 📦 **Node.js** | 18+ | Frontend development |
| 🔧 **Git** | Latest | Version control |

---

### 🚀 Quick Start

<div align="center">

*Get up and running in less than 5 minutes!*

</div>

#### 1️⃣ **Clone the Repository**
```bash
git clone https://github.deshaw.com/hackathon2025/Artificial_Ignorance.git
cd Artificial_Ignorance
```

#### 2️⃣ **Backend Setup**
```bash
# Install Python dependencies
pip install -r backend/requirements.txt
```

#### 3️⃣ **Frontend Setup**
```bash
# Install Node.js dependencies
npm install
# or if you prefer pnpm
pnpm install
```

#### 4️⃣ **Environment Configuration** *(Optional - for future extensibility)*
```bash
# Create environment file for backend
cp backend/.env.example backend/.env
# Edit the .env file with your configuration
```

#### 5️⃣ **Launch Backend Server**
```bash
# Start FastAPI server (add --verbose for detailed logs)
python start_backend.py
```

#### 6️⃣ **Launch Frontend**
```bash
# Start development server
npm run dev
```

<div align="center">

🎉 **That's it! Your app is ready at** [http://mohtam-rh8.toa.des.co:3000](http://mohtam-rh8.toa.des.co:3000)

</div>
---

## 📖 Usage

### Starting the Application

#### Development Mode

**Start the Backend Server:**
```bash
# Using the startup script (recommended)
python start_backend.py

# With verbose logging for debugging
python start_backend.py --verbose

# Alternative: Direct uvicorn command
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

**Start the Frontend:**
```bash
# Development server
npm run dev
# or
pnpm dev
```

The application will be available at:
- **Frontend:** http://mohtam-rh8.toa.des.co:3000
- **Backend API:** http://mohtam-rh8.toa.des.co:8000
- **API Documentation:** http://mohtam-rh8.toa.des.co:8000/docs

#### Production Mode

**Backend:**
```bash
gunicorn backend.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

**Frontend:**
```bash
npm run build
npm start
```

### 🎯 Creating Your First Index

<div align="center">

*Transform any investment idea into a professional portfolio*

</div>

#### 🌟 **Example Prompts That Work Like Magic:**

*Emotion-driven investing has never been this fun!*

<table>
<tr>
<td align="center">😊</td>
<td><strong>"Companies that make people genuinely happy - theme parks, ice cream, and puppy videos"</strong></td>
</tr>
<tr>
<td align="center">😢</td>
<td><strong>"Businesses that profit from our tears - tissue companies, comfort food, and streaming services"</strong></td>
</tr>
<tr>
<td align="center">😡</td>
<td><strong>"Companies people love to hate but can't live without - airlines, telecom, and parking meters"</strong></td>
</tr>
<tr>
<td align="center">😰</td>
<td><strong>"Fear-driven industries - security systems, insurance, and bunker manufacturers"</strong></td>
</tr>
<tr>
<td align="center">😲</td>
<td><strong>"Surprise me! Companies with the most unexpected business models that actually work"</strong></td>
</tr>
<tr>
<td align="center">🤢</td>
<td><strong>"Disgusting but necessary - waste management, pest control, and porta-potty rentals"</strong></td>
</tr>
<tr>
<td align="center">💕</td>
<td><strong>"Love economy winners - dating apps, wedding planners, and divorce lawyers"</strong></td>
</tr>
<tr>
<td align="center">💔</td>
<td><strong>"Hate-spending essentials - DMV alternatives, tax software, and root canal specialists"</strong></td>
</tr>
<tr>
<td align="center">😳</td>
<td><strong>"Shame-driven purchases - gym memberships, self-help books, and teeth whitening"</strong></td>
</tr>
<tr>
<td align="center">🦚</td>
<td><strong>"Pride and status symbols - luxury brands, sports cars, and overpriced coffee"</strong></td>
</tr>
<tr>
<td align="center">😔</td>
<td><strong>"Guilt-relief industries - carbon offsets, charity platforms, and organic everything"</strong></td>
</tr>
<tr>
<td align="center">👀</td>
<td><strong>"Keeping up with the Joneses - home improvement, fashion trends, and social media tools"</strong></td>
</tr>
<tr>
<td align="center">💚</td>
<td><strong>"Green with envy - companies that make everyone else jealous of their success"</strong></td>
</tr>
<tr>
<td align="center">🙏</td>
<td><strong>"Gratitude economy - thank you card companies, gift services, and appreciation platforms"</strong></td>
</tr>
<tr>
<td align="center">🌈</td>
<td><strong>"Hope sellers - lottery companies, motivational speakers, and miracle cure peddlers"</strong></td>
</tr>
<tr>
<td align="center">😅</td>
<td><strong>"Anxiety capitalism - meditation apps, stress balls, and therapy platforms"</strong></td>
</tr>
<tr>
<td align="center">🤗</td>
<td><strong>"Compassion commerce - animal shelters, humanitarian organizations, and hug delivery services"</strong></td>
</tr>
<tr>
<td align="center">😌</td>
<td><strong>"Contentment creators - hammock manufacturers, tea companies, and sunset cruise operators"</strong></td>
</tr>
<tr>
<td align="center">🏝️</td>
<td><strong>"Loneliness busters - pet stores, social clubs, and imaginary friend consultants"</strong></td>
</tr>
<tr>
<td align="center">🎉</td>
<td><strong>"Excitement merchants - roller coaster builders, fireworks companies, and energy drink makers"</strong></td>
</tr>
</table>

#### 📝 **Step-by-Step Guide:**

1. **🌐 Navigate:** Open [http://mohtam-rh8.toa.des.co:3000](http://mohtam-rh8.toa.des.co:3000)
2. **💭 Brainstorm:** Enter your wildest investment idea
3. **⚡ Generate:** Click "Generate Index" and watch AI work its magic
4. **📊 Analyze:** Dive deep into your custom portfolio analytics

### API Usage Examples

**Generate an Index:**
```bash
curl -X POST "http://mohtam-rh8.toa.des.co:8000/api/v1/generate-index" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Top US companies with high R&D spend in AI"
  }'
```

**Response:**
```json
{
  "index_name": "AI R&D Leaders Index",
  "original_prompt": "Top US companies with high R&D spend in AI",
  "holdings": [
    {
      "ticker": "NVDA",
      "security_name": "NVIDIA Corporation",
      "country": "US",
      "sector": "Technology",
      "market_cap": "Large Cap",
      "weight": 25.5,
      "selection_rationale": "Leading designer of AI chips with massive R&D investment"
    }
  ]
}
```

---

## ⚙️ Configuration

### Backend Configuration

Environment variables can be set in `backend/.env`:

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `APP_NAME` | `string` | `"Idea2Index API"` | Application name |
| `APP_VERSION` | `string` | `"1.0.0"` | API version |
| `DEBUG` | `boolean` | `false` | Enable debug mode |
| `HOST` | `string` | `"0.0.0.0"` | Server host address |
| `PORT` | `integer` | `8000` | Server port |
| `MAX_HOLDINGS` | `integer` | `50` | Maximum holdings per index |
| `DEFAULT_TRADING_DAYS` | `integer` | `252` | Trading days for calculations |
| `MOCK_DATA_ENABLED` | `boolean` | `true` | Enable mock data fallback |

### Frontend Configuration

Configuration is handled through `next.config.mjs`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: true
  }
}
```

---

## 🔌 API Reference

### Core Endpoints

#### Health Check
- **GET** `/` - Root health check
- **GET** `/health` - Detailed health status

#### Index Generation
- **POST** `/api/v1/generate-index` - Generate investment index

**Request Body:**
```typescript
{
  prompt: string;           // Investment idea description
  max_holdings?: number;    // Maximum number of holdings (default: 20)
  country_filter?: string;  // ISO country code filter
}
```

**Response:**
```typescript
{
  index_name: string;
  original_prompt: string;
  holdings: Array<{
    ticker: string;
    security_name: string;
    country: string;
    sector: string;
    market_cap: string;
    weight: number;
    selection_rationale: string;
  }>;
  performance_data: {
    dates: string[];
    index_values: number[];
    benchmark_values: number[];
    benchmark_name: string;
  };
  stats: {
    total_return: number;
    max_drawdown: number;
    sharpe_ratio: number;
  };
}
```

#### Portfolio Management
- **PUT** `/api/v1/update-holdings` - Update portfolio holdings
- **GET** `/api/v1/performance` - Get performance data

### Error Responses

All endpoints return consistent error responses:

```json
{
  "detail": "Error message",
  "error_type": "ValidationError",
  "message": "Detailed error description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (validation errors)
- `422` - Unprocessable Entity
- `500` - Internal Server Error

---

## 🤝 Contributing

This was built as a part of infinity hacks. However, if one wishes to run this locally / contribute, they can do that using the details below.

### Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Artificial_Ignorance.git
   cd Artificial_Ignorance
   ```
3. **Create a feature branch:**
   ```bash
   git checkout -b feature/amazing-feature
   ```
4. **Set up development environment:**
   ```bash
   # Backend dependencies
   pip install -r backend/requirements.txt
   
   # Frontend dependencies
   npm install

5. **Run the application, ensure their are no failures**
   
   ```

### Making Changes

1. **Write your code** following our style guidelines
2. **Add tests** for new functionality
3. **Update documentation** as needed
4. **Test your changes:**
   ```bash
   # Run backend tests
   pytest backend/tests/
   
   # Run frontend tests
   npm test
   
   # Run linting
   npm run lint
   ```

### Submitting Changes

1. **Commit your changes:**
   ```bash
   git commit -m "feat: add amazing new feature"
   ```
2. **Push to your fork:**
   ```bash
   git push origin feature/amazing-feature
   ```
3. **Create a Pull Request** with a clear description of your changes

### Code Style Guidelines

- **Backend:** Follow PEP 8 for Python code
- **Frontend:** Use Prettier and ESLint configurations
- **Commits:** Follow conventional commit format
- **Documentation:** Update relevant documentation for any API changes

---

## 🧪 Tests

### Running Tests

**Backend Tests:**
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=backend

# Run specific test file
pytest backend/tests/test_index_generator.py

# Run with verbose output
pytest -v
```

**Frontend Tests:**
```bash
# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### Test Structure

```
backend/tests/
├── test_api/
│   ├── test_health_routes.py
│   ├── test_index_routes.py
│   └── test_portfolio_routes.py
├── test_services/
│   ├── test_index_generator.py
│   └── test_performance_service.py
└── conftest.py

__tests__/
├── components/
├── pages/
└── utils/
```

---

## 🙏 Acknowledgments

- **🚀 FastAPI** - For the incredible backend framework that makes building APIs a joy
- **⚛️ Next.js & React** - For the powerful frontend framework and component library
- **🎨 Tailwind CSS** - For the utility-first CSS framework that makes styling effortless
- **📊 Radix UI** - For the accessible and customizable UI components
- **🤖 OpenAI/Anthropic** - For the language models that power our AI analysis
- **📈 Yahoo Finance API** - For providing reliable market data
- **💡 Infinity Hacks at D.E. Shaw India** - For the opportunity to build this innovative solution during the premier hackathon
- **🏆 Team Artificial Ignorance** - For the collaborative effort and creative vision during the hackathon

Special thanks to all the open-source contributors whose libraries and tools made this project possible.

---

## 📬 Contact/Support

### Getting Help

- **📋 GitHub Issues:** [Report bugs or request features](https://github.deshaw.com/hackathon2025/Artificial_Ignorance/issues)
- **💬 Discussions:** Join our [GitHub Discussions](https://github.deshaw.com/hackathon2025/Artificial_Ignorance/discussions) for questions and community support
- **📧 Email:** For private inquiries, contact the development team
- **📖 Documentation:** Comprehensive API docs available at `/docs` when running the server

### Reporting Issues

When reporting issues, please include:
- **Environment details** (OS, Python/Node versions)
- **Steps to reproduce** the problem
- **Expected vs actual behavior**
- **Error messages** or logs
- **Screenshots** if applicable

### Feature Requests

We love hearing your ideas! When suggesting features:
- **Describe the use case** and problem it solves
- **Provide examples** of how it would work
- **Consider the impact** on existing functionality
- **Check existing issues** to avoid duplicates

---

<div align="center">

## ⚠️ **Important Disclaimer**

*This application is for research and educational purposes only.*  
*It does not constitute investment advice.*  
*Always consult with qualified financial professionals before making investment decisions.*

---

### 🏆 **Made with ❤️ by Team Artificial Ignorance**

<table align="center">
<tr>
<td align="center">
<img src="https://img.shields.io/badge/🎯-Infinity_Hacks-FF6B6B?style=for-the-badge&labelColor=4ECDC4&color=FF6B6B" alt="Infinity Hacks"/>
</td>
</tr>
<tr>
<td align="center">
<img src="https://img.shields.io/badge/🏢-D.E._Shaw_India-1A1A2E?style=for-the-badge&labelColor=16213E&color=0F3460" alt="D.E. Shaw India"/>
</td>
</tr>
</table>

### ✨ *"Transforming ideas into indices, one prompt at a time."* ✨

---

<img src="https://img.shields.io/badge/🚀-From_Shower_Thoughts_to_Stock_Portfolios-FF9F43?style=for-the-badge&labelColor=FF6B35&color=F7931E" alt="Tagline"/>

</div>
