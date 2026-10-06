import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/axiosConfig';
import Navbar from '../components/Navbar';
import {
  PlusCircle,
  Receipt,
  Trash2,
  Filter,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  CheckCircle2,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Download,
  FileSpreadsheet,
  FileJson,
  X,
  Sparkles,
  Layers,
} from 'lucide-react';
import {
  playHover,
  playClick,
  playSuccess,
  playError,
  playSecurityArm,
} from '../utils/soundEngine';

const COMMON_CATEGORIES = [
  'Salary & Wages',
  'Investments & Dividends',
  'Housing & Rent',
  'Food & Groceries',
  'Transportation & Fuel',
  'Utilities & Bills',
  'Healthcare',
  'Entertainment & Leisure',
  'Tech & Subscriptions',
  'Miscellaneous',
];

export const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    type: 'EXPENSE',
    amount: '',
    category: 'Food & Groceries',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/transactions?limit=100');
      setTransactions(res.data.transactions || []);
    } catch (err) {
      setError('Failed to fetch transactions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;
    transactions.forEach((tx) => {
      const amt = parseFloat(tx.amount) || 0;
      if (tx.type === 'INCOME') income += amt;
      else expense += amt;
    });
    return {
      income,
      expense,
      net: income - expense,
      totalCount: transactions.length,
    };
  }, [transactions]);

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    playClick();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        type: form.type,
        amount: parseFloat(form.amount),
        category: form.category,
        description: form.description || undefined,
        date: form.date ? new Date(form.date).toISOString() : new Date().toISOString(),
      };

      await api.post('/transactions', payload);
      playSuccess();
      setSuccess('Transaction recorded and cryptographically committed to ledger.');
      setShowAddModal(false);
      setForm({
        type: 'EXPENSE',
        amount: '',
        category: 'Food & Groceries',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
      fetchTransactions();
    } catch (err) {
      playError();
      setError(err.response?.data?.error || 'Failed to create transaction.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    playClick();
    if (!window.confirm('Are you sure you want to delete this transaction? This action is owner-scoped and irreversible.')) {
      return;
    }

    try {
      await api.delete(`/transactions/${id}`);
      playSecurityArm();
      setTransactions((prev) => prev.filter((tx) => tx.id !== id));
      setSuccess('Transaction deleted successfully.');
    } catch (err) {
      playError();
      setError(err.response?.data?.error || 'Failed to delete transaction.');
    }
  };

  const handleExport = (format) => {
    playClick();
    if (format === 'json') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(transactions, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `ledger_export_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      playSuccess();
    } else if (format === 'csv') {
      const headers = ['ID', 'Date', 'Type', 'Category', 'Description', 'Amount'];
      const rows = transactions.map((t) => [
        t.id,
        t.date,
        t.type,
        `"${(t.category || '').replace(/"/g, '""')}"`,
        `"${(t.description || '').replace(/"/g, '""')}"`,
        t.amount,
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `ledger_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      playSuccess();
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchesType = filterType === 'ALL' || tx.type === filterType;
    const matchesSearch =
      tx.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.description && tx.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesType && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col relative overflow-hidden">
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 bg-cyber-grid bg-[size:32px_32px] opacity-20 pointer-events-none"></div>
      <div className="absolute top-20 right-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <Receipt className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-extrabold tracking-tight text-white font-space">
                Ledger Operations
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Zero-Trust Encrypted Transactions • Strict Owner-Scoped Isolation
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleExport('csv')}
              onMouseEnter={() => playHover()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-medium transition-all"
              title="Export ledger as CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              onClick={() => {
                playClick();
                setShowAddModal(true);
              }}
              onMouseEnter={() => playHover()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Record Transaction</span>
            </button>
          </div>
        </div>

        {/* Financial Telemetry Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-mono uppercase font-semibold">Total Inflow</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-bold font-space text-emerald-400">
              +${stats.income.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-mono uppercase font-semibold">Total Outflow</span>
              <TrendingDown className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-xl font-bold font-space text-rose-400">
              -${stats.expense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-mono uppercase font-semibold">Net Vault Delta</span>
              <Activity className="w-4 h-4 text-cyan-400" />
            </div>
            <div className={`text-xl font-bold font-space ${stats.net >= 0 ? 'text-cyan-400' : 'text-rose-400'}`}>
              {stats.net >= 0 ? '+' : '-'}${Math.abs(stats.net).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-mono uppercase font-semibold">Audited Records</span>
              <Layers className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl font-bold font-space text-white">
              {stats.totalCount} <span className="text-xs text-slate-400 font-normal">Entries</span>
            </div>
          </div>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError('')} className="text-rose-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{success}</span>
            </div>
            <button onClick={() => setSuccess('')} className="text-emerald-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Filter Controls Bar */}
        <div className="glass-panel p-4 rounded-2xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search category or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass-input pl-9 pr-8 py-2 text-xs rounded-xl w-full"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
            {[
              { label: 'All Operations', value: 'ALL' },
              { label: 'Inflow Only', value: 'INCOME' },
              { label: 'Outflow Only', value: 'EXPENSE' },
            ].map((t) => (
              <button
                key={t.value}
                onMouseEnter={() => playHover()}
                onClick={() => {
                  playClick();
                  setFilterType(t.value);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  filterType === t.value
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                    : 'text-slate-400 hover:text-white bg-white/5 border border-white/5'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions Table */}
        <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] font-mono border-b border-white/5">
                <tr>
                  <th className="py-3.5 px-6">Timestamp</th>
                  <th className="py-3.5 px-6">Flow Type</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">Description / Memo</th>
                  <th className="py-3.5 px-6 text-right">Amount</th>
                  <th className="py-3.5 px-6 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="hover:bg-white/[0.03] transition-colors group"
                      onMouseEnter={() => playHover()}
                    >
                      <td className="py-3.5 px-6 text-slate-400 font-mono whitespace-nowrap">
                        {new Date(tx.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-6 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold font-mono ${
                            tx.type === 'INCOME'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {tx.type === 'INCOME' ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3" />
                          )}
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 font-medium text-white whitespace-nowrap">
                        {tx.category}
                      </td>
                      <td className="py-3.5 px-6 text-slate-300 max-w-sm truncate font-mono text-[11px]">
                        {tx.description || <span className="text-slate-600">—</span>}
                      </td>
                      <td
                        className={`py-3.5 px-6 text-right font-bold font-mono whitespace-nowrap ${
                          tx.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {tx.type === 'INCOME' ? '+' : '-'}${parseFloat(tx.amount).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-6 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all opacity-70 group-hover:opacity-100"
                          title="Delete transaction (Strict Owner-Scoped)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-16 text-slate-400 text-xs">
                      {loading ? (
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="w-6 h-6 border-2 border-emerald-400/20 border-t-emerald-400 rounded-full animate-spin"></div>
                          <span className="font-mono text-slate-400">Decrypting ledger entries...</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="font-mono text-slate-400">No matching transactions found in this view.</p>
                          <button
                            onClick={() => {
                              setFilterType('ALL');
                              setSearchTerm('');
                            }}
                            className="text-xs text-emerald-400 hover:underline"
                          >
                            Reset filters
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Transaction Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
            <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500"></div>

              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white font-space flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Record New Transaction
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddTransaction} className="space-y-4">
                {/* Type Selection */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono">
                    Transaction Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onMouseEnter={() => playHover()}
                      onClick={() => {
                        playClick();
                        setForm({ ...form, type: 'EXPENSE' });
                      }}
                      className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                        form.type === 'EXPENSE'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm shadow-rose-500/20'
                          : 'bg-white/5 text-slate-400 border-white/5'
                      }`}
                    >
                      Expense (Outflow)
                    </button>
                    <button
                      type="button"
                      onMouseEnter={() => playHover()}
                      onClick={() => {
                        playClick();
                        setForm({ ...form, type: 'INCOME' });
                      }}
                      className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                        form.type === 'INCOME'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                          : 'bg-white/5 text-slate-400 border-white/5'
                      }`}
                    >
                      Income (Inflow)
                    </button>
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                    Amount ($ USD)
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="number"
                      step="0.01"
                      required
                      min="0.01"
                      placeholder="0.00"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      className="glass-input pl-9 pr-4 py-2.5 text-sm rounded-xl w-full font-mono"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="glass-input px-3.5 py-2.5 text-sm rounded-xl w-full bg-[#111827]"
                  >
                    {COMMON_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-[#111827] text-white">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                    Description / Purpose (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Cloud Hosting, Retainer, or Hardware"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="glass-input px-3.5 py-2.5 text-sm rounded-xl w-full"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                    Transaction Date
                  </label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="glass-input px-3.5 py-2.5 text-sm rounded-xl w-full text-slate-200"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    onMouseEnter={() => playHover()}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-semibold shadow-md shadow-emerald-500/20 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {submitting ? 'Committing...' : 'Commit to Ledger'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Transactions;
