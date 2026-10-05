import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import Navbar from '../components/Navbar';
import AiAssistant from '../components/AiAssistant';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ShieldCheck,
  PlusCircle,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieIcon,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const COLORS = ['#10B981', '#06B6D4', '#6366F1', '#F43F5E', '#F59E0B', '#8B5CF6', '#EC4899'];

export const Dashboard = () => {
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, netBalance: 0 });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [summaryRes, txRes] = await Promise.all([
        api.get('/transactions/summary'),
        api.get('/transactions?limit=10'),
      ]);

      setSummary(summaryRes.data.summary || { totalIncome: 0, totalExpenses: 0, netBalance: 0 });
      const txList = txRes.data.transactions || [];
      setRecentTransactions(txList);

      // Process Category Breakdown for Recharts Pie
      const catMap = {};
      const dateMap = {};

      txList.forEach((tx) => {
        if (tx.type === 'EXPENSE') {
          catMap[tx.category] = (catMap[tx.category] || 0) + tx.amount;
        }

        const dateKey = new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (!dateMap[dateKey]) {
          dateMap[dateKey] = { date: dateKey, income: 0, expense: 0 };
        }
        if (tx.type === 'INCOME') {
          dateMap[dateKey].income += tx.amount;
        } else {
          dateMap[dateKey].expense += tx.amount;
        }
      });

      const pieData = Object.entries(catMap).map(([name, value]) => ({ name, value }));
      setCategoryData(pieData);

      const areaData = Object.values(dateMap).reverse();
      setTimelineData(areaData.length > 0 ? areaData : [
        { date: 'Initial', income: summaryRes.data.summary?.totalIncome || 0, expense: summaryRes.data.summary?.totalExpenses || 0 }
      ]);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const savingsRate = summary.totalIncome > 0
    ? ((summary.netBalance / summary.totalIncome) * 100).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Financial Overview & Telemetry
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Zero-Trust Owner-Scoped Data Isolation & Real-Time Encryption
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/transactions"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Record Transaction</span>
            </Link>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Net Balance Card */}
          <div className="glass-panel p-5 rounded-2xl border border-white/5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Net Balance</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className={`text-2xl font-extrabold ${summary.netBalance >= 0 ? 'text-white' : 'text-rose-400'}`}>
                ${summary.netBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
              <ShieldCheck className="w-3 h-3" />
              <span>Verified Ledger Balance</span>
            </div>
          </div>

          {/* Total Income */}
          <div className="glass-panel p-5 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Inflow</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-extrabold text-emerald-400">
                +${summary.totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3 text-emerald-400" />
              <span>Accumulated Income</span>
            </div>
          </div>

          {/* Total Expenses */}
          <div className="glass-panel p-5 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Outflow</span>
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-extrabold text-rose-400">
                -${summary.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
              <ArrowDownRight className="w-3 h-3 text-rose-400" />
              <span>Discretionary & Fixed Costs</span>
            </div>
          </div>

          {/* Savings Rate */}
          <div className="glass-panel p-5 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Savings Rate</span>
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                <PieIcon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-extrabold text-cyan-400">
                {savingsRate}%
              </span>
            </div>
            <div className="mt-2 text-[11px] text-slate-400">
              Target benchmark: &gt;20.0%
            </div>
          </div>
        </div>

        {/* AI Financial Assistant Widget */}
        <AiAssistant onRefreshData={fetchDashboardData} />

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Income vs Expense Timeline */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Cashflow Trajectory</h3>
                <p className="text-xs text-slate-400">Inflow vs. Outflow Distribution</p>
              </div>
              <span className="text-xs text-slate-400 font-mono bg-white/5 px-2.5 py-1 rounded-md">Live Telemetry</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', fontSize: '12px' }}
                    itemStyle={{ color: '#F3F4F6' }}
                  />
                  <Area type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#incomeGrad)" name="Income" />
                  <Area type="monotone" dataKey="expense" stroke="#F43F5E" strokeWidth={2} fillOpacity={1} fill="url(#expenseGrad)" name="Expense" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Expense by Category Pie Chart */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Expense Distribution</h3>
              <p className="text-xs text-slate-400">Category-Level Cost Breakdown</p>
            </div>

            <div className="h-56 w-full my-auto">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', fontSize: '12px' }}
                      formatter={(val) => [`$${Number(val).toFixed(2)}`, 'Spent']}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', color: '#94A3B8' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-center text-xs text-slate-400">
                  No expense records logged yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Recent Ledger Transactions</h3>
              <p className="text-xs text-slate-400">Owner-Scoped Cryptographic Records</p>
            </div>
            <Link
              to="/transactions"
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors flex items-center gap-1"
            >
              <span>View All History</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/50 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6">Category</th>
                  <th className="py-3 px-6">Description</th>
                  <th className="py-3 px-6">Type</th>
                  <th className="py-3 px-6 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-6 text-slate-300 whitespace-nowrap">
                        {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-3.5 px-6 font-medium text-white whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-200 border border-white/5">
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-slate-400 max-w-xs truncate">
                        {tx.description || '—'}
                      </td>
                      <td className="py-3.5 px-6 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          tx.type === 'INCOME' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className={`py-3.5 px-6 text-right font-semibold whitespace-nowrap ${
                        tx.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {tx.type === 'INCOME' ? '+' : '-'}${tx.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-slate-400 text-xs">
                      No transactions found. Click "Record Transaction" above to create your first entry.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
