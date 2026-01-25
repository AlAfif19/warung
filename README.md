# 📊 Warung HPP Calculator & Business Projection

A comprehensive web application for calculating HPP (Harga Pokok Production - Cost of Goods Sold) and business projections for SMEs (UMKM) in Indonesia.

## 🎯 Features

### Core Features

- **HPP Calculation**: Calculate Cost of Goods Sold per unit or per batch
- **Pricing Strategies**: 3-tier pricing suggestions (Competitive, Standard, Premium)
- **Business Projections**: Monthly sales targets, revenue, costs, and profit projections
- **KPI Metrics**: Gross Profit, Net Profit, Gross Margin, Net Margin, ROAS
- **Fixed Cost Allocation**: Proportional or manual allocation methods
- **Break-Even Analysis**: Calculate break-even point and revenue
- **Business Recommendations**: Automated recommendations based on calculated metrics

### Technical Features

- **Frontend**: Next.js 14 with App Router, React, TypeScript, TailwindCSS
- **Backend**: Python FastAPI with SQLAlchemy ORM
- **Database**: MySQL with comprehensive schema
- **API**: RESTful API with full CRUD operations
- **Export**: PDF and Excel report generation (planned)

## 🏗️ Architecture

```
warung/
├── frontend/              # Next.js frontend
│   ├── app/             # App Router pages
│   ├── lib/             # Utilities and API client
│   └── components/      # Reusable components
├── backend/              # Python FastAPI backend
│   ├── main.py          # FastAPI application
│   ├── models.py        # SQLAlchemy models
│   ├── schemas.py       # Pydantic schemas
│   ├── calculations.py   # Business logic
│   └── database.py     # Database configuration
└── database/            # SQL schema files
    └── schema.sql       # MySQL database schema
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- MySQL 8.0+

### Database Setup

1. Create MySQL database:

```bash
mysql -u root -p
```

2. Run the schema:

```sql
source database/schema.sql
```

### Backend Setup

1. Navigate to backend directory:

```bash
cd backend
```

2. Create virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Configure environment:

```bash
cp .env.example .env
# Edit .env with your database credentials
```

5. Run the server:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment:

```bash
cp .env.example .env
# Edit .env if needed
```

4. Run the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📚 API Documentation

Once the backend is running, visit:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Main Endpoints

#### Products

- `GET /api/products` - List all products
- `POST /api/products` - Create a new product
- `GET /api/products/{id}` - Get product details
- `PUT /api/products/{id}` - Update a product
- `DELETE /api/products/{id}` - Delete a product

#### Raw Materials

- `POST /api/products/{id}/raw-materials` - Add raw material to product

#### Fixed Costs

- `GET /api/fixed-costs` - List all fixed costs
- `POST /api/fixed-costs` - Create a fixed cost
- `GET /api/fixed-costs/{id}` - Get fixed cost details

#### Fixed Cost Allocations

- `POST /api/products/{id}/fixed-cost-allocations` - Add allocation to product

#### Business Projections

- `POST /api/business-projections` - Create a projection
- `GET /api/products/{id}/projections` - List product projections

#### Calculations

- `POST /api/calculate/hpp` - Calculate HPP (without saving)
- `POST /api/calculate/projection` - Calculate projection (without saving)

## 📊 Database Schema

### Tables

- `products` - Product information and HPP
- `raw_materials` - Raw materials for products
- `fixed_costs` - Fixed costs (rent, utilities, etc.)
- `product_fixed_cost_allocations` - Allocation of fixed costs to products
- `business_projections` - Business projection calculations
- `units_conversion` - Unit conversion factors
- `scenarios` - Calculation scenarios for comparison

## 🧮 Calculation Logic

### HPP Calculation

```
HPP per unit = (Total Raw Material Cost per unit) + (Fixed Cost Allocation per unit)
```

### Pricing Tiers

| Tier        | Margin | Formula    |
| ----------- | ------ | ---------- |
| Competitive | 15%    | HPP × 1.15 |
| Standard    | 30%    | HPP × 1.30 |
| Premium     | 50%    | HPP × 1.50 |

### Business Projection

```
Target Units = (Total Fixed Costs + Target Profit) / (Selling Price - HPP)
Daily Target = Monthly Target / 30
```

### KPI Metrics

- **Gross Profit** = Revenue - COGS
- **Net Profit** = Revenue - (COGS + Fixed Costs)
- **Gross Margin** = (Gross Profit / Revenue) × 100
- **Net Margin** = (Net Profit / Revenue) × 100
- **ROAS** = Revenue / Marketing Cost

### Break-Even Point

```
BEP (units) = Total Fixed Costs / (Selling Price - HPP)
BEP (revenue) = BEP (units) × Selling Price
```

## 🎨 UI Components

### Calculator Page

- Step-by-step wizard interface
- Dynamic form for raw materials
- Fixed cost allocation management
- Real-time HPP calculation
- Pricing tier selection
- Business projection results
- KPI dashboard cards
- Business recommendations

### Features

- Responsive design (mobile-first)
- Dark mode support (planned)
- Export to PDF/Excel (planned)
- Save and compare scenarios (planned)

## 🔧 Configuration

### Backend Environment Variables

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=warung_hpp
DB_USER=root
DB_PASSWORD=
APP_NAME=Warung HPP API
DEBUG=True
CORS_ORIGINS=http://localhost:3000
SECRET_KEY=your-secret-key
```

### Frontend Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=Warung HPP Calculator
```

## 📈 Roadmap

### Phase 1 (MVP) ✅

- [x] HPP calculation (per pcs/batch)
- [x] Fixed cost allocation
- [x] 3-tier pricing suggestions
- [x] Business projection calculator
- [x] KPI metrics (Gross/Net Profit, Margin, ROAS)
- [x] Basic UI with calculator

### Phase 2 (V2) 🚧

- [ ] Save and compare scenarios
- [ ] Export to PDF/Excel
- [ ] Product management dashboard
- [ ] Chart visualizations (Recharts)
- [ ] Multi-product support

### Phase 3 (V3) 📋

- [ ] Inventory integration
- [ ] Sensitivity analysis
- [ ] Historical data tracking
- [ ] User authentication
- [ ] Multi-language support

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- Kilo Code - Initial development

## 🙏 Acknowledgments

- Built with Next.js and FastAPI
- UI styled with TailwindCSS
- Icons from Lucide React
- Charts powered by Recharts

## 📞 Support

For support, please open an issue in the GitHub repository.
