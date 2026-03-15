'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

type PresetType = 'sss1' | 'sss2' | 'sss3';

export default function CreateStablecoinPage() {
  const wallet = useWallet();
  const [step, setStep] = useState<'preset' | 'details'>('preset');
  const [preset, setPreset] = useState<PresetType | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    uri: '',
    decimals: 6,
  });

  const presets = {
    sss1: {
      title: 'SSS-1 Minimal',
      description: 'Lightweight stablecoin with core functionality',
      features: ['Mint/Burn', 'Basic Roles', 'Compliance Blacklist'],
      cost: 'Lowest SOL cost',
    },
    sss2: {
      title: 'SSS-2 Compliant',
      description: 'Full compliance suite with transfer controls',
      features: ['All SSS-1 features', 'Permanent Delegate', 'Transfer Hooks', 'Frozen Accounts'],
      cost: 'Standard SOL cost',
    },
    sss3: {
      title: 'SSS-3 Private',
      description: 'Enterprise privacy with scoped allowlists',
      features: ['All SSS-2 features', 'Privacy Config', 'Confidential Transfers', 'Allowlist Management'],
      cost: 'Premium SOL cost',
    },
  };

  const handlePresetSelect = (p: PresetType) => {
    setPreset(p);
    setStep('details');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'decimals' ? parseInt(value) || 0 : value,
    }));
  };

  const handleCreateStablecoin = async () => {
    if (!wallet.connected) {
      toast.error('Connect your wallet first');
      return;
    }

    if (!formData.name || !formData.symbol) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      toast.success(`Creating ${preset} stablecoin... (demo mode)`);
      // In production, this would call the SDK
      setTimeout(() => {
        toast.success('Stablecoin created successfully!');
        setLoading(false);
      }, 2000);
    } catch (error) {
      toast.error('Failed to create stablecoin');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <Link href="/" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <h1 className="text-4xl font-bold text-white mb-2">Create Your Stablecoin</h1>
        <p className="text-slate-300 mb-8">Choose a configuration that fits your needs</p>

        {step === 'preset' ? (
          <div className="grid md:grid-cols-3 gap-6">
            {(Object.entries(presets) as [PresetType, typeof presets['sss1']][]).map(([key, data]) => (
              <Card key={key} className="bg-slate-800 border-slate-700 hover:border-blue-500/50 cursor-pointer transition overflow-hidden"
                onClick={() => handlePresetSelect(key)}>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{data.title}</h3>
                  <p className="text-slate-400 mb-4">{data.description}</p>
                  <ul className="space-y-2 mb-6">
                    {data.features.map((feature, i) => (
                      <li key={i} className="text-sm text-slate-300 flex items-center gap-2">
                        <span className="w-1 h-1 bg-blue-400 rounded-full" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="text-sm font-semibold text-blue-400">{data.cost}</div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <Card className="bg-slate-800 border-slate-700 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {presets[preset as PresetType].title} Configuration
                </h2>
                <button
                  onClick={() => setStep('preset')}
                  className="text-slate-400 hover:text-slate-200 underline text-sm"
                >
                  Change Preset
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Stablecoin Name
                  </label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., USD Coin"
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                    maxLength={32}
                  />
                  <p className="text-xs text-slate-500 mt-1">{formData.name.length}/32</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Symbol
                  </label>
                  <Input
                    name="symbol"
                    value={formData.symbol}
                    onChange={handleInputChange}
                    placeholder="e.g., USDC"
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                    maxLength={10}
                  />
                  <p className="text-xs text-slate-500 mt-1">{formData.symbol.length}/10</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Metadata URI
                  </label>
                  <Input
                    name="uri"
                    value={formData.uri}
                    onChange={handleInputChange}
                    placeholder="e.g., https://..."
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                    maxLength={200}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Decimals
                  </label>
                  <Input
                    name="decimals"
                    type="number"
                    value={formData.decimals}
                    onChange={handleInputChange}
                    min="0"
                    max="18"
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                  />
                </div>

                <div className="pt-6 border-t border-slate-600">
                  <Button
                    onClick={handleCreateStablecoin}
                    disabled={loading || !wallet.connected}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold"
                  >
                    {loading ? 'Creating...' : wallet.connected ? 'Create Stablecoin' : 'Connect Wallet'}
                  </Button>
                  {!wallet.connected && (
                    <p className="text-sm text-slate-400 mt-2">Please connect your wallet to continue</p>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
