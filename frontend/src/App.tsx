import React, { useState } from 'react';
import { Sidebar } from './components/SideBar.tsx';
import { Header } from './components/Header.tsx';
import { Dashboard } from './pages/Dashboard.tsx';
import { Sales } from './pages/Sales.tsx';
import { Products } from './pages/Products.tsx';
import { Schools } from './pages/Schools.tsx';

import type {
  PageId,
  SalesTransaction,
  ProductItem,
  EducationalInstitution,
  AgentRun,
  AIAnalysisInsight,
  ChartDataPoint,
} from './types.ts';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('Q3 2026');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Pure UI state ready to be populated from backend endpoints
  const [transactions, setTransactions] = useState<SalesTransaction[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [institutions, setInstitutions] = useState<EducationalInstitution[]>([]);
  const [agentRuns, setAgentRuns] = useState<AgentRun[]>([]);
  const [insights, setInsights] = useState<AIAnalysisInsight[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // User can insert fetch('/api/sync') or query invalidation here
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    const filename = `cliniq-export-${currentPage}-${Date.now()}.csv`;

    if (currentPage === 'sales' || currentPage === 'dashboard') {
      csvContent += 'OrderNumber,Institution,DistrictCode,Amount,Category,Status,Date\n';
      transactions.forEach((tx) => {
        csvContent += `"${tx.orderNumber}","${tx.institutionName}","${tx.districtCode}",${tx.amount},"${tx.category}","${tx.status}","${tx.date}"\n`;
      });
    } else if (currentPage === 'products') {
      csvContent += 'SKU,Name,Category,StockLevel,ReorderPoint,BulkPrice,Status\n';
      products.forEach((p) => {
        csvContent += `"${p.sku}","${p.name}","${p.category}",${p.stockLevel},${p.reorderPoint},${p.institutionalBulkPrice},"${p.status}"\n`;
      });
    } else if (currentPage === 'schools') {
      csvContent += 'Code,DistrictName,State,Seats,ACV,RenewalStatus,ClinicalLead\n';
      institutions.forEach((inst) => {
        csvContent += `"${inst.institutionCode}","${inst.name}","${inst.state}",${inst.licensedSeats},${inst.annualContractValue},"${inst.renewalStatus}","${inst.clinicalLead}"\n`;
      });
    } else {
      csvContent += 'Timestamp,Page,ExportStatus\n';
      csvContent += `"${new Date().toISOString()}","${currentPage}","Verified Ledger"\n`;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
      {/* Sidebar for Desktop */}
      <div className="hidden md:flex h-full">
        <Sidebar
          currentPage={currentPage}
          onNavigate={(page) => {
            setCurrentPage(page);
            setSearchQuery('');
          }}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          activeAgentCount={agentRuns.filter((r) => r.executionStatus === 'Running').length}
        />
      </div>

      {/* Mobile Sidebar Overlay Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-72 h-full bg-white shadow-2xl">
            <Sidebar
              currentPage={currentPage}
              onNavigate={(page) => {
                setCurrentPage(page);
                setMobileMenuOpen(false);
                setSearchQuery('');
              }}
              collapsed={false}
              onToggleCollapse={() => setMobileMenuOpen(false)}
              activeAgentCount={agentRuns.filter((r) => r.executionStatus === 'Running').length}
            />
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <div className="flex flex-1 flex-col h-full overflow-hidden">
        {/* Top Header */}
        <Header
          currentPage={currentPage}
          onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedTimeframe={selectedTimeframe}
          onTimeframeChange={setSelectedTimeframe}
          isRefreshing={isRefreshing}
          onRefresh={handleRefresh}
          onExportCSV={handleExportCSV}
        />

        {/* Scrollable Viewport Area */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {currentPage === 'dashboard' && (
              <Dashboard
                onNavigate={(page) => {
                  setCurrentPage(page);
                  setSearchQuery('');
                }}
                searchQuery={searchQuery}
                transactions={transactions}
                agentRuns={agentRuns}
                insights={insights}
                chartData={chartData}
                isLoading={isLoading}
              />
            )}
            {currentPage === 'sales' && (
              <Sales
                searchQuery={searchQuery}
                transactions={transactions}
                onExportCSV={handleExportCSV}
                onCreateOrder={(order) => {
                  const newTx: SalesTransaction = {
                    ...order,
                    id: `tx-${Date.now()}`,
                    orderNumber: `ORD-${Date.now().toString().slice(-4)}`,
                    date: new Date().toISOString().split('T')[0],
                  };
                  setTransactions([newTx, ...transactions]);
                }}
                isLoading={isLoading}
              />
            )}
            {currentPage === 'products' && (
              <Products
                searchQuery={searchQuery}
                products={products}
                onAddProduct={(item) => {
                  const newProd: ProductItem = {
                    ...item,
                    id: `prod-${Date.now()}`,
                    lastQualityAudit: new Date().toISOString().split('T')[0],
                  };
                  setProducts([newProd, ...products]);
                }}
                onUpdateProductStock={(id, newStock) => {
                  setProducts(
                    products.map((p) =>
                      p.id === id ? { ...p, stockLevel: newStock } : p
                    )
                  );
                }}
                isLoading={isLoading}
              />
            )}
           {currentPage === "schools" && (
              <Schools />
            )}
            
          </div>
        </main>
      </div>
    </div>
  );
}
