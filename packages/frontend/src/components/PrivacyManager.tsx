'use client';

import { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Lock, Users, Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';

export interface AllowlistEntry {
  address: string;
  addedAt: number;
  expiresAt?: number;
  status: 'active' | 'revoked' | 'expired';
  transferCount: number;
}

interface PrivacyManagerProps {
  stablecoinName: string;
  enabled: boolean;
  minAllowlistSize: number;
  entries: AllowlistEntry[];
  onAddAddress: (address: string) => Promise<void>;
  onRemoveAddress: (address: string) => Promise<void>;
}

export function PrivacyManager({
  stablecoinName,
  enabled,
  minAllowlistSize,
  entries,
  onAddAddress,
  onRemoveAddress,
}: PrivacyManagerProps) {
  const [newAddress, setNewAddress] = useState('');
  const [withExpiry, setWithExpiry] = useState(false);
  const [daysToExpire, setDaysToExpire] = useState(30);
  const [loading, setLoading] = useState(false);

  const handleAddAddress = async () => {
    if (!newAddress.trim()) {
      toast.error('Enter an address');
      return;
    }

    try {
      // Validate Solana address
      new PublicKey(newAddress);
    } catch {
      toast.error('Invalid Solana address');
      return;
    }

    setLoading(true);
    try {
      await onAddAddress(newAddress);
      toast.success('Address added to allowlist');
      setNewAddress('');
      setWithExpiry(false);
    } catch (error) {
      toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAddress = async (address: string) => {
    if (!confirm(`Remove ${address} from allowlist?`)) return;

    try {
      await onRemoveAddress(address);
      toast.success('Address removed from allowlist');
    } catch (error) {
      toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400';
      case 'revoked':
        return 'text-red-400';
      case 'expired':
        return 'text-yellow-400';
      default:
        return 'text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'revoked':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'expired':
        return <XCircle className="w-4 h-4 text-yellow-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Lock className="w-6 h-6 text-blue-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Privacy Manager</h2>
            <p className="text-sm text-slate-400">{stablecoinName}</p>
          </div>
        </div>
        <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
          enabled ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'
        }`}>
          {enabled ? 'Privacy Enabled' : 'Privacy Disabled'}
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-slate-800 border-slate-700 p-4">
          <p className="text-sm text-slate-400 mb-1">Active Entries</p>
          <p className="text-2xl font-bold text-white">
            {entries.filter(e => e.status === 'active').length}
          </p>
        </Card>
        <Card className="bg-slate-800 border-slate-700 p-4">
          <p className="text-sm text-slate-400 mb-1">Min. Required</p>
          <p className="text-2xl font-bold text-white">{minAllowlistSize}</p>
        </Card>
        <Card className="bg-slate-800 border-slate-700 p-4">
          <p className="text-sm text-slate-400 mb-1">Status</p>
          <p className={`text-2xl font-bold ${enabled && entries.length >= minAllowlistSize ? 'text-green-400' : 'text-yellow-400'}`}>
            {enabled && entries.length >= minAllowlistSize ? 'Ready' : 'Pending'}
          </p>
        </Card>
      </div>

      {/* Add Address */}
      {enabled && (
        <Card className="bg-slate-800 border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Add to Allowlist</h3>
          <div className="space-y-4">
            <Input
              placeholder="Solana address (e.g., 11111...)"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
            />

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={withExpiry}
                  onChange={(e) => setWithExpiry(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-700"
                />
                <span className="text-sm text-slate-300">Set expiration</span>
              </label>
              {withExpiry && (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    max="365"
                    value={daysToExpire}
                    onChange={(e) => setDaysToExpire(parseInt(e.target.value) || 30)}
                    className="w-20 bg-slate-700 border-slate-600 text-white"
                  />
                  <span className="text-sm text-slate-400">days</span>
                </div>
              )}
            </div>

            <Button
              onClick={handleAddAddress}
              disabled={loading || !newAddress.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              {loading ? 'Adding...' : 'Add Address'}
            </Button>
          </div>
        </Card>
      )}

      {/* Allowlist Entries */}
      <Card className="bg-slate-800 border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Allowlist ({entries.length})
          </h3>
        </div>

        {entries.length === 0 ? (
          <div className="p-6 text-center text-slate-400">
            No addresses on allowlist yet
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {entries.map((entry) => (
              <div key={entry.address} className="p-4 hover:bg-slate-700/30 transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(entry.status)}
                      <code className="text-sm font-mono text-slate-300 break-all">
                        {entry.address}
                      </code>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                      <span>Added: {formatDate(entry.addedAt)}</span>
                      {entry.expiresAt && (
                        <span>Expires: {formatDate(entry.expiresAt)}</span>
                      )}
                      <span>Transfers: {entry.transferCount}</span>
                      <span className={`font-semibold ${getStatusColor(entry.status)}`}>
                        {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {entry.status === 'active' && (
                    <button
                      onClick={() => handleRemoveAddress(entry.address)}
                      className="ml-4 p-2 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300 transition"
                      title="Remove from allowlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Warning if not ready */}
      {enabled && entries.filter(e => e.status === 'active').length < minAllowlistSize && (
        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 text-yellow-400 text-sm">
          Warning: At least {minAllowlistSize} active addresses required before privacy enforcement.
          Currently: {entries.filter(e => e.status === 'active').length}
        </div>
      )}
    </div>
  );
}
