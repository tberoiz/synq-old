<div align="center">
  <img src="./apps/web/public/brand/synq-icon.png" alt="Synq Logo" width="50" height="50"  />
</div>
<p align="center">| <a href="https://trysynq.com">Demo</a> | <a href="https://trysynq/docs">Documentation</a> |
<br />

Synq is a personal project developed to help individual online sellers manage their inventory and sales more efficiently. Born from the need to move beyond spreadsheet-based tracking, this tool aims to provide a simple yet powerful solution for small-scale e-commerce operations.

  <img src="./apps/web/public/brand/synq-eyecatcher.png" alt="Synq Logo" width="100%" height="100%"  />

## Project Goals

- 🎓 **Learning Experience**: A hands-on project to enhance full-stack development skills
- 🛍️ **Practical Solution**: Help individual sellers track inventory and sales without complex enterprise software
- 💡 **Technical Growth**: Implement modern web technologies and best practices
- 📊 **Data Management**: Create an intuitive system for managing product data and sales records

## Features

- 📦 **Simple Inventory Tracking** – Monitor stock levels and product details
- 📊 **Sales Overview** – Track sales across different platforms
- 💰 **Basic Profitability** – Calculate costs and revenue
- 🔄 **Data Import/Export** – Easy migration from spreadsheets
- 📈 **Basic Reports** – Generate simple financial insights

## Tech Stack

- **Frontend:**
  - Next.js 15 (App Router)
  - React 19
  - TypeScript 5.5
  - Tailwind CSS 3.4
  - Radix UI components
  - next-safe-action for server actions
  - React Query for data fetching
  - React Hook Form with Zod validation
  - Recharts for data visualization

- **Backend:**
  - Next.js API Routes
  - Supabase for authentication and database
  - Prisma ORM for database operations

- **Development:**
  - Turborepo for monorepo management
  - ESLint and Prettier for code quality
  - TypeScript for type safety

## Project Structure

```
synq/
├── apps/                    # Applications
│   ├── web/               # Next.js web application (port 3000)
│   └── desktop/           # Electron desktop application (port 3001)
├── packages/              # Shared packages
│   ├── ui/               # Shared UI components
│   ├── supabase/         # Supabase client and utilities
│   ├── eslint-config/    # Shared ESLint configuration
│   └── typescript-config/ # Shared TypeScript configuration
└── .github/              # GitHub workflows and templates
```

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- Yarn 1.22.19 or later
- Supabase account (free tier is sufficient)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/synq.git
   cd synq
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Set up environment variables:
   ```bash
   cp apps/web/.env.example apps/web/.env.local
   ```
   Fill in your Supabase credentials in `apps/web/.env.local`

4. Start the development server:
   ```bash
   yarn dev
   ```

The application will be available at `http://localhost:3000`

## Development

- `yarn dev` - Start development server
- `yarn build` - Build the application
- `yarn start` - Start production server
- `yarn lint` - Run ESLint
- `yarn type-check` - Run TypeScript type checking
- `yarn format` - Format code with Prettier

## Contributing

Feel free to open issues or submit pull requests if you have suggestions for improvements. This is a learning project, and any feedback is welcome!

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
